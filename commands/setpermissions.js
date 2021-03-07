const aws_utilities = require('../utils/aws_utilities.js');
const utilities = require('../utils/utilities.js');

module.exports = {
    name:'setpermissions',
    description:'gives a role permissions for the bot' + 
                'permissions list: manage_music, play_music, manage_raffle',
    async execute(message, prefix, args){
        args = args.trim();

        if(!message.member.hasPermission('ADMINISTRATOR')){
            return message.channel.send('You have insufficient permissions to use this command');
        }
        else if(args === '' || args === 'help'){

        }
        else if(args.includes(':')){
            args = args.split(':');
            if(args.length !== 2) return message.channel.send('Incorrect usage of the command');

            let roleMention = args[0].trim();
            let permissions = args[1].trim();

            //check if the role is valid
            if(!utilities.isRoleMention(roleMention)) return message.channel.send('Given argument is not a role');
            if(!await message.guild.roles.fetch(utilities.getRoleId(roleMention))) return message.channel.send('Role does not exist in the server');
            
            //fetch the server from the database
            let server = await aws_utilities.fetchServer(message.guild.id);
            if(!server){
                aws_utilities.writeItem(message.guild.id);
            }

            let rolePermissions = server.Item.role_permissions;

            if(rolePermissions){
                for(let role = 0; role < rolePermissions.length; role++){
                    if(rolePermissions[role].includes(roleMention)){
                        rolePermissions[role] = roleMention + ':' + permissions;
                    }
                }
                rolePermissions.push(roleMention + ':' + permissions);
            } 
            else{
                rolePermissions = [roleMention + ':' + permissions];
            }

            let keys = ['role_permissions'];
            let values = [rolePermissions];

            aws_utilities.updateItem(message.guild.id, keys, values);

            return message.channel.send('You have succesfully set permissions for ' + roleMention);
        }
        else{
            return message.channel.send('Incorrect usage of the command');
        }
    }
}