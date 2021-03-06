const aws_utilities = require('../utils/aws_utilities.js');
const utilities = require('../utils/utilities.js');

module.exports = {
    name: 'autorole',
    description: 'Assigns a default role to a server, every person that joins will automatically be assigned this role, takes a mention of the role or id',
    async execute(param) {
        const message = param.message;
        const prefix = param.prefix;
        let args = param.args;
        const Discord = param.Discord;

        let role = args.trim();

        if(!message.member.hasPermission('MANAGE_ROLES')){
            return message.channel.send("You do not have sufficient permissions to use this command.");
        }

        if(args === '' || args === 'help'){
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Autorole')
                .addField('Description', 'Sets a default role to the server, anyone who joins is automatically assigned this role')
                .addField('Usage', '`' + prefix + this.name + ' @role`')
                .addField('Related Commands', '`reactionrole`');
            return message.channel.send(embed);
        }
        else{
            
            let roleId = '';
            if(utilities.isRoleMention(role) && role !== '@everyone')
                roleId = utilities.getRoleId(role);
            else if(utilities.isNumeric(role))
                roleId = role;

            if(roleId !== ''){
                //check if the role has ADMINISTRATOR perm, return if so
                let serverRole = await message.guild.roles.fetch(roleId); 
                if(serverRole.permissions.has('ADMINISTRATOR'))
                    return message.channel.send('This role has ADMIN permissions and cannot be set as the default role');

                let server = await aws_utilities.fetchServer(message.guild.id);
                //if the server is in the database, update the item
                if(!server){
                    aws_utilities.writeItem(message.guild);
                }
                aws_utilities.updateItem(message.guild.id, ['default_role', 'server_name'], [roleId, message.guild.name]);
                message.channel.send("The server's default role is now " + role + ", new members will now automatically be assigned this role");
            }
            else{
                if(args.includes('@everyone'))
                    return message.channel.send('That is not a valid role');
                else return message.channel.send(args + ' does not exist, please try another');
            }
        }
    }
}