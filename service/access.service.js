'use strict'

const UserService = require('./user.service')
const client = require("../helper/connect_ioredis")
const {userValidate} = require('../helper/validation')
const getInfoData = require("../utils/getInfoData");
const {signAccessToken, signRefreshToken, verifyRefreshToken} = require('../helper/jwt_service')
const { addDevice, checkDeviceId} = require('../helper/redis_service')
const createError = require('http-errors')
const acl = require('../helper/acl_service')
const { COOKIE_OPTIONS } = require('../constant/index')
const {
  BadRequestError,
  AuthFailureError,
} = require("../core/error.response");

class AccessService {
    static signUp = async(req, res) => {
        const { username, password, roles } = req.body
        const foundUser = await UserService.findByUsername({username})
        if(foundUser) {
            return createError.BadRequest("User is existed")
        }

        const newUser = await UserService.createUser({username, password, roles})
        const savedUser= await newUser.save()

        return savedUser
    }

    static logIn = async(req, res) => {
        const { username, password, deviceId } = req.body
        const { error } = userValidate(req.body)
        if(error) {
            throw new BadRequestError("Not validated")
        }

        const foundUser = await UserService.findByUsername({ username })
        if(!foundUser) {
            throw new AuthFailureError("User not found")
        }

        const userId = foundUser._id
        const roles = foundUser.roles

        acl.addUserRoles(userId.toString(), roles[0], err => {
            if(err) {
                console.log(err)
            }
            console.log("Added ", roles[0], ' role to user ', foundUser.username)
        })
      

        const check = await checkDeviceId(userId.toString(), deviceId)
        // const isValid = await foundUser.isCheckPassword(password)

        // if(!isValid) {
        //     return createError.BadRequest("Not validated")
        // }
        const numberOfDevice = await client.llen(`deviceId-${userId}`)
        
        if(!check) {
            if(numberOfDevice < 3 ) {
                await addDevice(userId, deviceId)
            } else {
                client.rpop(`deviceId-${userId}`)
                await addDevice(userId, deviceId)
            }
        }
        
        const accessToken = await signAccessToken(foundUser._id, roles)
        const refreshToken = await signRefreshToken(foundUser._id)
        req.session.refToken = refreshToken
        req.session.userId = foundUser._id
   
        res.cookie("userId", foundUser._id, COOKIE_OPTIONS)
        res.cookie("access_token", accessToken, COOKIE_OPTIONS)
        res.cookie("refresh_token", refreshToken, COOKIE_OPTIONS)
        
        return {
            user: getInfoData({
                object: foundUser,
                fields: ["_id", "username", "roles"]
            }),
            accessToken: accessToken
        }
    }

    static logOut = async(req, res) => {

        const refreshToken = req.cookies.refresh_token
        if(!refreshToken) {
            return createError.BadRequest("You have no refresh token")
        }
        const payload = await verifyRefreshToken(refreshToken)
        const userId = payload.userId
        const setTTL = await client.pipeline().ttl(userId.toString()).exec(function (err, result) {
            const ttl = result[0][1]
            client.lpush('token', refreshToken, ttl);
            console.log(ttl)

            res.clearCookie('userId')
            res.clearCookie('access_token')
            res.clearCookie('refresh_token')

            return res.status(200).json({
                'status': 200,
                'data': 'You are logged out',
            })
        })
    }

    static refreshToken = async(req, res) => {
        const deviceId = req.body
        const refreshToken = req.cookies.refresh_token
        if(!refreshToken) {
            return createError.BadRequest("You need to login")
        }
        const result = await client.lrange('token', 0, 99)
        if(result.indexOf(refreshToken) > -1 ) {
            return res.status(400).json({
                status: 400,
                error: 'Invalid Token'
            })
        }

        const payload = await verifyRefreshToken(refreshToken)
        const userId = payload.userId.toString()
        const check = await checkDeviceId(userId, deviceId)

        if(!check) {
        return createError.Unauthorized('You are not allowed to refresh token')
        }

        const accessToken = await signAccessToken(userId)
        const refToken = await signRefreshToken(userId)

        res.cookie("access_token", accessToken, COOKIE_OPTIONS)
        res.cookie("refresh_token", refToken, COOKIE_OPTIONS)
       
        return {
            accessToken: accessToken,
            refreshToken: refToken
        }

    }
}

module.exports = AccessService