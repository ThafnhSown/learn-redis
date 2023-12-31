const express = require('express')
const app = express()
const createError = require('http-errors')
const cors = require('cors')
const session = require('express-session')
const cookieParser = require('cookie-parser')
require('./helper/connection_mongodb')
require("./helper/connect_ioredis")
require('dotenv').config()
const acl = require('./helper/acl_service')

const redisClient = require('./helper/connect_ioredis')

const RedisStore = require('connect-redis').default
let redisStore = new RedisStore({
    client: redisClient
})

app.get('/', (req, res, next) => {
    res.send('Home Page')
})

app.use(session({
    secret: 'secret key',
    resave: false,
    store: redisStore,
    saveUninitialized: true,
    cookie: { secure: false }
}))
app.use(express.json())
app.use(express.urlencoded())
app.use(cookieParser())
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))
app.use("/", require("./routes"))
app.use((req, res, next) => {
   next(createError.NotFound('This route does not exist'))
})

app.use((err, req, res, next) => {
    res.json({
        status: err.status,
        message: err.message
    })
})


const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
    console.log('server listening on port', PORT)
})