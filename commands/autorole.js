const aws_utilities = require('../utils/aws_utilities.js');

module.exports = {
    name: 'autorole',
    description: 'Assigns a default role to a server, every person that joins will automatically be assigned this role',
    async execute(message, prefix, args, Discord) {
        let roleName = args.trim();
        if(args === ''){
            message.channel.send('To assign a default role to server members use the following command and format:\n`' + prefix + 'autorole roleName`')
        }
        else{
            let role = message.guild.roles.cache.find(role => role.name === args.trim());
            if(role){
                //if the server is already in the database, update the item
                if(aws_utilities.getItem(message.guild.id)){
                    aws_utilities.updateItem(message.guild.id, 'default_role', roleName);
                }
                //if the server is not in the database, write a new item
                else{
                    aws_utilities.writeItem(message.guild.id, '', '', '', roleName);
                }
            }
            else{
                message.channel.send(roleName, ' does not exist, please try another');
            }
        }
    }
}