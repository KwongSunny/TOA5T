const aws_utilities = require('./aws_utilities.js');
const utilities = require('./utilities.js');

const toastPermissions = ['manage_music', 'play_music', 'manage_raffle'];

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

function isValidPermission(permission){
    return toastPermissions.includes(permission);
}

module.exports.checkPermission = checkPermission;
module.exports.isValidPermission = isValidPermission;