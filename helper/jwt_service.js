const jwt = require('jsonwebtoken');
const createError = require('http-errors')
// const client = require('./connection_redis');
const client = require("../helper/connect_ioredis")
const {
    BadRequestError,
    AuthFailureError,
    NotFoundError,
    ForbiddenError
} = require('../core/error.response')

const signAccessToken = async (userId) => {
    return new Promise((resolve, reject) => {
        const payload = {
            userId
        }
        const secret = process.env.ACCESS_TOKEN_SECRET
        const options = {
            expiresIn: "10s"
        }

        jwt.sign(payload, secret, options, (err, token) => {
            if (err) reject(err)
            resolve(token)
        })
    })
}

const verifyAccessToken = async (req, res, next) => {
    if(!req.headers['authorization']) {
        return next(createError[404]("not have access token"))
    }
    const authHeader = req.headers['authorization']
    const bearerToken = authHeader.split(' ');
    const token = bearerToken[1]
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
        const secret = 'ssh'
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
        jwt.verify(refreshToken, 'ssh', (err, decoded) => {
            if(err) {
                return reject(err)
            }
            resolve(decoded)    
        })   
    })

}

module.exports = {
    signAccessToken,
    verifyAccessToken,
    signRefreshToken,
    verifyRefreshToken,
} 