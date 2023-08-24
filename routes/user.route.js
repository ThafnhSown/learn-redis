const express = require('express');
const route = express.Router();
const user = require("../models/user.model")
// const client = require("../helper/connection_redis")
const client = require("../helper/connect_ioredis")
const {userValidate} = require('../helper/validation')
const {signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken} = require('../helper/jwt_service')
const { addDevice, checkDeviceId } = require('../helper/redis_service')
const {
    BadRequestError,    
    ForbiddenError
} = require('../core/error.response')
const createError = require('http-errors')
const { COOKIE_OPTIONS } = require('../constant/index')

route.post("/register", async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const {error} = userValidate(req.body)
        if(error) {
            throw new BadRequestError(error.details[0].message)
        }
        const isExist = await user.findOne({
            username: username, password
        })
        if(isExist) {
            throw new BadRequestError("User already exists")
        }
        const newUser = new user({
            username, 
            password
        })
        const savedUser = await newUser.save()
        const refreshToken = await signRefreshToken(savedUser._id)

        res.cookie("jwt", refreshToken, COOKIE_OPTIONS )
        res.cookie("userId", savedUser._id, COOKIE_OPTIONS)

        return res.json({
            status: "oke",
            elements: savedUser
        })
    } catch (error) {
        next(error)
    }
})

route.post("/login", async (req, res, next) => {
    try {
        const { username, password, deviceId } = req.body;
        const {error} = userValidate(req.body)
        if(error) {
            throw new BadRequestError("Not validated")
        }
        const foundUser = await user.findOne({username})
        if(!foundUser) {
            res.send("user not found")
        }
        const userId = foundUser._id
        const check = await checkDeviceId(userId.toString(), deviceId)

        const isValid = await foundUser.isCheckPassword(password)
        if(!isValid) {
            throw new BadRequestError("Not validated")
        }
        
        const numberOfDevice = await client.llen(`deviceId-${userId}`)
        
        if(!check) {
            if(numberOfDevice < 3 ) {
                await addDevice(userId, deviceId)
            } else {
                client.rpop(`deviceId-${userId}`)
                await addDevice(userId, deviceId)
            }
        }
        

        const accessToken = await signAccessToken(foundUser._id)
        const refreshToken = await signRefreshToken(foundUser._id)
        req.session.refToken = refreshToken
        req.session.userId = foundUser._id
   
        res.cookie("userId", foundUser._id, COOKIE_OPTIONS)
        res.cookie("access_token", accessToken, COOKIE_OPTIONS)
        res.cookie("refresh_token", refreshToken, COOKIE_OPTIONS)
        
        res.json({
            accessToken,
            refreshToken
        })
    } catch (error) {
        next(error)
    }   
})

route.get("/list",verifyAccessToken , (req, res, next) => {
   
    const listUser = [
        {
            username: "Matt"
        },
        {
            username: "Sonny"
        }
    ]
    res.send(listUser)
})
route.get("/refresh", async (req, res, next) => {
    const { deviceId } = req.body
    const refreshToken = req.cookies.refresh_token
    if(!refreshToken) {
        return res.status(401).send({
            status: 401,
            error: "You need to Login"
        })
    }
    try {
        const result = await client.lrange('token', 0, 99)
        if(result.indexOf(refreshToken) > -1 ) {
            return res.status(400).json({
                status: 400,
                error: 'Invalid Token'
            })
        }

        const payload = await verifyRefreshToken(refreshToken)
        const userId = payload.userId
        const check = await checkDeviceId(userId, deviceId)
        if(!check) {
        return next(createError.Unauthorized('You are not allowed to refresh token'))
        }
        const accessToken = await signAccessToken(userId)
        const refToken = await signRefreshToken(userId)

        res.cookie("access_token", accessToken, COOKIE_OPTIONS)
        res.cookie("refresh_token", refToken, COOKIE_OPTIONS)
       
        res.json({
            accessToken: accessToken,
            refreshToken: refToken
        })

    } catch (error) {
        res.status(501).json({
            status: 501,
            error: error.toString()
        })
    }
})

route.post('/logout', async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refresh_token
        if(!refreshToken){
            throw new ForbiddenError("have no refresh token")
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

    } catch (error) {
        return res.status(500).json({
            'status': 500,
            'error': error.toString()
        })
    }
})

route.post('/check', async (req, res) => {
    const ref = req.cookies.refresh_token
    console.log(ref)
    res.json(ref)
})

module.exports = route