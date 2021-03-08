const aws_utilities = require('../utils/aws_utilities.js');

module.exports = {
    name: 'listpermissions',
    description: 'list all the permissions for the server',
    async execute(message, prefix, args, Discord){
        
        if(!message.member.hasPermission('ADMINISTRATOR')){
            return message.channel.send('You have insufficient permissions to use this command');
        }
        else if(args === 'help'){

        }
        else{
            const server = await aws_utilities.fetchServer(message.guild.id);
        }

    }
}