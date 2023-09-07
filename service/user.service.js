'use strict'

const userModel = require("../models/user.model")

const selectOptions = {
    username: 1,
    password: 1,
    roles: 1,
  };
  

class UserService {
    static findByUsername = async({ username, select=selectOptions }) => {
        return await userModel.findOne({username}).select(select).lean().exec()
    }

    static findByUserId = async({ userId, select = selectOptions }) => {
        return await userModel.findOne( {_id: userId}).select(select).lean().exec()
    }

    static createUser = async({
        username, 
        password,
        roles
    }) => {
        return await userModel.create({
            username,
            password,
            roles
        })
    }
}

module.exports = UserService