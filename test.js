const { checkDeviceId } = require('./helper/redis_service')

const test = async () => {
    const userId = '64dce8f189e015c1ccc29d7a'
    const res = await checkDeviceId(userId, "43")

    console.log(res)
}

test()
 