const mongoose = require('mongoose')

const conn = mongoose.connect("mongodb://127.0.0.1:27017/redis")
.then((_) => {
    console.log("Connected ok")
}).catch((err) => {console.log(err)})

module.exports = conn