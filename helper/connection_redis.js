const redis = require('redis')
const client = redis.createClient({url: 'redis://127.0.0.1:6379'})
client.connect().then(() => {
    console.log('Connected Redis')
})

client.on('ready', function () {
    console.log("ready to go")
})
client.on('connect', function(error) {
    console.log("connected")
})
client.on("error", function(error) {
    console.log("error: " + error)
})

module.exports = client