const { Schema, model } = require('mongoose')
const bcrypt = require('bcrypt')

const UserSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

UserSchema.pre('save', async function(next){
    try {
        console.log('called before save', this.username, this.password)
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(this.password, salt)
        this.password = hashPassword
        next()
    } catch (error) {
        next(error);
    }
})

UserSchema.methods.isCheckPassword = async function(password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        next(error)
    }
}

module.exports = model('user', UserSchema);