const jwt = require('jsonwebtoken');
const createError = require('http-errors')
// const client = require('./connection_redis');
const client = require("../helper/connect_ioredis")

const signAccessToken = async (userId, roles) => {
    return new Promise((resolve, reject) => {
        const payload = {
            userId,
            roles
        }
        const secret = process.env.ACCESS_TOKEN_SECRET
        const options = {
            expiresIn: "600s"
        }

        jwt.sign(payload, secret, options, (err, token) => {
            if (err) reject(err)
            resolve(token)
        })
    })
}

const verifyAccessToken = (req, res, next) => {
    const token = req.cookies.access_token
    if(!token) {
        return next(createError[404]("not have access token"))
    }
    //verify
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if(err) {
            if(err.name === "TokenExpiredError") {
               return next(createError.Unauthorized('Token Expired Error'))
            } else {
                return next(createError.Unauthorized('Invalid Token'))
            }    
        }
        req.payload = payload 
        next()
    })
}

const signRefreshToken = async (userId) => {
    return new Promise((resolve, reject) => {
        const payload = {
            userId
        }
        const secret = process.env.REFRESH_TOKEN_SECRET
        const options = {
            expiresIn: "1y"
        }

        jwt.sign(payload, secret, options, (err, token) => {
            if (err) reject(err)
            client.set(userId.toString(), token, 'EX', 365 * 24 * 60 * 60, (err, reply) => {
                if(err) {
                    return reject(err)
                }
            })
            resolve(token)
        })
    })
}

const verifyRefreshToken = async (refreshToken) => {
    return new Promise((resolve, reject) => {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
            if(err) {
                return reject(err)
            }
            resolve(payload)    
        })   
    })
}

module.exports = {
    signAccessToken,
    verifyAccessToken,
    signRefreshToken,
    verifyRefreshToken,
} 
