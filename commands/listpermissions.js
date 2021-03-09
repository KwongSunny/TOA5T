const aws_utilities = require('../utils/aws_utilities.js');
const utilities = require('../utils/utilities.js');

module.exports = {
    name: 'listpermissions',
    description: 'list all the permissions for the server',
    async execute(message, prefix, args, Discord){

        if(!message.member.hasPermission('ADMINISTRATOR')){
            return message.channel.send('You have insufficient permissions to use this command');
        }
        else if(args === 'help'){
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('List Permissions')
                .addField('Usage',
                    'To list all roles and their number of permissions use:\n' +
                    '`' + prefix + this.name + '`\n\n' +
                    'To list all permissions of a specific role use:\n' +
                    '`' + prefix + this.name + ' @role`'
                )
                .addField('Examples', 
                    '`' + prefix + this.name + '`\n' +
                    '`' + prefix + this.name + ' @guest`'
                )
                .addField('Aliases', '`listperm, listperms`')
                return message.channel.send(embed);
        }
        else if(args === ''){
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Roles and Permissions');

            let description = '```';

            const serverRoles = message.guild.roles.cache;

            //map all the roles and their TOA5T permissions from the database
            let server = await aws_utilities.fetchServer(message.guild.id);
            let roleMap = new Map();
            let rolePermissions = server.Item.role_permissions;
            if(rolePermissions){
                rolePermissions.forEach((role) => {
                    if(role.includes('@everyone'))
                        roleMap.set(role.split(':')[0], role.split(':')[1]);
                    else
                        roleMap.set(utilities.getRoleId(role), role.split(':')[1]);
                })
            }

            //for each role, list the number of Discord and TOA5T permissions
            serverRoles.forEach((role) => {
                let roleName = role.name;
                if(role.name === '@everyone')
                    roleName = 'everyone';

                if(!role.permissions.toArray().includes('ADMINISTRATOR'))
                    description += roleName + ': ' + role.permissions.toArray().length + ' Discord Permissions, ';
                else
                    description += roleName + ': ADMINISTRATOR, '; 

                if(roleMap.get(role.id)){
                    description += roleMap.get(role.id).split(',').length + ' TOA5T Permissions';
                }
                //take @everyone into account
                else if(roleMap.get('@everyone') && role.name === '@everyone'){
                    description += roleMap.get('@everyone').split(',').length + ' TOA5T Permissions';
                }

                description += '\n';
            });

            description += '```';

            embed.setDescription(description);
            return message.channel.send(embed);
        }
        else if(utilities.isRoleMention(args)){
            let role;
            let roleName;
            if(args === '@everyone'){
                role = message.guild.roles.everyone;
                roleName = 'everyone';
            }
            else{
                role = await message.guild.roles.fetch(utilities.getRoleId(args));
                roleName = role.name;
            }

            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle(roleName + "'s Permissions");

            let description = '```';

            //map all the roles and their TOA5T permissions from the database
            let server = await aws_utilities.fetchServer(message.guild.id);
            let roleMap = new Map();
            let rolePermissions = server.Item.role_permissions;
            if(rolePermissions){
                rolePermissions.forEach((role) => {
                    if(role.includes('@everyone'))
                        roleMap.set(role.split(':')[0], role.split(':')[1]);
                    else
                        roleMap.set(utilities.getRoleId(role), role.split(':')[1]);
                })
            }

            //add all Discord permissions to the description, if ADMIN then only show ADMIN
            let discordPerms = role.permissions.toArray();
            if(discordPerms.includes('ADMINISTRATOR'))
                description += 'ADMINISTRATOR';
            else{
                discordPerms.forEach((perm) => {
                    description += '\n' + perm;
                })
            }

            //add all TOA5T permissions to the description
            if(roleMap.get(role.id)){
                let toastPerms = roleMap.get(role.id).split(',');
                toastPerms.forEach((perm) => {
                    description += '\n' + perm.trim()
                })
            }
            //take @everyone into account
            else if(roleMap.get('@everyone') && role.name === '@everyone'){
                let toastPerms = roleMap.get('@everyone').split(',');
                toastPerms.forEach((perm) => {
                    description += '\n' + perm.trim()
                })
            }

            description += '```';
            embed.setDescription(description);
            return message.channel.send(embed);
        }
        else{
            return message.channel.send('Unknown arguments detected for the command.')
        }

    }
}