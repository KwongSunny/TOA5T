const aws_utilities = require('./aws_utilities.js');
const utilities = require('./utilities.js');

function checkPermission(message, permission){
    return new Promise(async (resolve) => {
        let server = await aws_utilities.fetchServer(message.guild.id);
        if(server){
            let rolePermissions = server.Item.role_permissions;
            if(!rolePermissions) resolve(false);
    
            let memberRoles = message.member.roles.cache.keyArray();

            rolePermissions.forEach((role) => {
                if(role.includes(permission)){
                    if(memberRoles.includes(utilities.getRoleId(role))) resolve(true);
                }
            });
        }
        resolve(false);
    })
}

module.exports.checkPermission = checkPermission;