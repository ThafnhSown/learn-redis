const express = require('express');
const route = express.Router();
const user = require("../models/user.model")
const client = require("../helper/connection_redis")

const {userValidate} = require('../helper/validation')
const {signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken} = require('../helper/jwt_service')
const {
    BadRequestError,    
    ForbiddenError
} = require('../core/error.response')

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
        const { username, password } = req.body;
        const {error} = userValidate(req.body)
        if(error) {
            throw new BadRequestError("Not validated")
        }
        const foundUser = await user.findOne({username})
        if(!foundUser) {
            res.send("user not found")
        }
        const isValid = await foundUser.isCheckPassword(password)
        if(!isValid) {
            throw new BadRequestError("Not validated")
        }
        const accessToken = await signAccessToken(foundUser._id)
        const refreshToken = await signRefreshToken(foundUser._id)
    
        res.json({
            accessToken,
            refreshToken
        })
    } catch (error) {
        next(error)
    }   
})

route.get("/list", verifyAccessToken, (req, res, next) => {
    const listUser = [
        {
            username: "Matt"
        },
        {
            username: "Sonny"
        }
    ]

    res.json(listUser)
})
route.post("/refresh", async (req, res, next) => {
    const { refreshToken } = req.body
    if(!refreshToken) {
        return res.status(401).send({
            status: 401,
            error: "You need to Login"
        })
    }
    try {
        const result = await client.lRange('token', 0, 10)
        if(result.indexOf(refreshToken) > -1 ) {
            return res.status(400).json({
                status: 400,
                error: 'Invalid Token'
            })
        }

        const payload = await verifyRefreshToken(refreshToken)
        const userId = payload.userId
        const accessToken = await signAccessToken(userId)
        res.json({
            accessToken: accessToken,
            refreshToken: refreshToken,
        })
        res.json(payload)


    } catch (error) {
        res.status(501).json({
            status: 501,
            error: error.toString()
        })
    }
})

route.post('/logout', async (req, res, next) => {
    try {
        const { refreshToken } = req.body
        if(!refreshToken){
            throw new ForbiddenError("have no refresh token")
        }
        await client.LPUSH('token', refreshToken);
        return res.status(200).json({
            'status': 200,
          'data': 'You are logged out',
        })
              
    } catch (error) {
        return res.status(500).json({
            'status': 500,
            'error': error.toString()
        })
    }
})


module.exports = route