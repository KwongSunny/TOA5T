const aws_utilities = require('../utils/aws_utilities.js');
const utilities = require('../utils/utilities.js');

module.exports = {
    name: 'autorole',
    description: 'Assigns a default role to a server, every person that joins will automatically be assigned this role, takes a mention of the role or id',
    async execute(message, prefix, args, Discord) {
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
            if(utilities.isRoleMention(role))
                roleId = utilities.getRoleId(role);
            else if(utilities.isNumeric(role))
                roleId = role;

            if(roleId !== ''){
                let server = await aws_utilities.fetchServer(message.guild.id);
                //if the server is in the database, update the item
                if(server){
                    aws_utilities.updateItem(message.guild.id, ['default_role'], [roleId]);
                }
                //if the server is not in the database, write a new item
                else{
                    aws_utilities.writeItem(message.guild.id);
                    aws_utilities.updateItem(message.guild.id, ['default_role'], [roleId]);
                }
                message.channel.send("The server's default role is now " + role + ", new members will now automatically be assigned this role");
            }
            else{
                message.channel.send(roleName, ' does not exist, please try another');
            }
        }
    }
}