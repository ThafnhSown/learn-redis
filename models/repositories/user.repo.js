'use strict'

const user = require('../user.model')
const { getUnselectData } = require('../../utils/index')

const findOneUser = async ({userId, unSelect}) => {
    return await user.findById(userId).select(getUnselectData(unSelect))
}

module.exports = { findOneUser }