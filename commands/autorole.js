const aws_utilities = require('../utils/aws_utilities.js');

module.exports = {
    name: 'autorole',
    description: 'Assigns a default role to a server, every person that joins will automatically be assigned this role',
    async execute(message, prefix, args, Discord) {
        let roleName = args.trim();

        if(!message.member.hasPermission('MANAGE_ROLES')){
            message.channel.send("You do not have sufficient permissions to use this command.");
        }
        else if(args === '' || args === 'help'){
            message.channel.send('To assign a default role to server members use the following command and format:\n`' + prefix + 'autorole roleName`')
        }
        else{
            let role = message.guild.roles.cache.find(role => role.name === args.trim());
            //checks if the role exists
            if(role){
                //if the server is already in the database, update the item
                let server = await aws_utilities.getItem(message.guild.id);
                if(server){
                    aws_utilities.updateItem(message.guild.id, ['default_role'], [roleName]);
                }
                //if the server is not in the database, write a new item
                else{
                    aws_utilities.writeItem(message.guild.id, '', '', '', roleName);
                }
                message.channel.send("The server's default role is now " + roleName + ", new members will now automatically be assigned this role");
            }
            //role does not exist, message back an error
            else{
                message.channel.send(roleName, ' does not exist, please try another');
            }
        }
    }
}