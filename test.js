const acl = require('./helper/acl_service')

const test = async () => {
   acl.allow('admin', 'dashboard', 'view');

// Check permission
   acl.isAllowed('64df3c98f4f7ca9d7c8a9ec8', 'dashboard', 'view', function(err, res) {
    if(res){
        console.log("User is allowed to view the dashboard");
    } else {
        console.log("User is not allowed to view the dashboard");
    }
});
}

test()
