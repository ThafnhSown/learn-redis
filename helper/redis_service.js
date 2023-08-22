const client = require('./connect_ioredis')

const addDevice = async(userId, deviceId) => {
    try {
        await client.lpush(`deviceId-${userId}`, deviceId)
      } catch (error) {
        console.error('Redis Error:', error.message);
      }
}

const checkDeviceId = async (userId, deviceId) => {
    const result = await client.lrange(`deviceId-${userId}`, 0, 2);
    if(result.indexOf(deviceId) == -1 ) {
        return false
    }
    return true
};

module.exports = {
    addDevice,
    checkDeviceId
}