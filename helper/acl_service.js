const client = require('./connect_ioredis')
var acl = require('acl')

acl = new acl(new acl.redisBackend(client, '_acl'))

acl.allow([
    {
        roles: ['admin', 'author'],
        allows: [
            {
                resources: ['/v1/api/book/add', '/v1/api/order/confirm', '/v1/api/order/cancel'],
                permissions: ['post', 'put'],
            },
        ],
    },
    {
        roles: ['user'],
        allows: [
            {
                resources: ['/v1/api/order/add', '/v1/api/order/me'],
                permissions: ['post', 'get']
            }
        ]
    },
])

module.exports = acl