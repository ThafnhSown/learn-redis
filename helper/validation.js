const Joi = require('joi'); 

const userValidate = data => {
    const userSchema = Joi.object({
        username: Joi.string(),
        password: Joi.string().min(4).max(32).required(),
        deviceId: Joi.string()
    })

    return userSchema.validate(data)
}

module.exports = { userValidate }