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

const addRole = async(userId ,roles) => {
    try {
        roles.map((role) => {
            client.lpush(`${userId}`, role)
        })
    } catch (error){
        console.error('Redis Error:', error.message);
    }
}

module.exports = {
    addDevice,
    checkDeviceId,
    addRole
}