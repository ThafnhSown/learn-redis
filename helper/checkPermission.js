const acl = require('./acl_service');

const checkPermissions = (req, res, next) => {
    const userId = req.cookies.userId
    return  acl.middleware(2, userId)
}

module.exports = checkPermissions