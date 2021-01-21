const aws_utilities = require('../utils/aws_utilities.js');
const utilities = require('../utils/utilities.js');

module.exports = {
    name: 'setmaxwarnings',
    description: "sets the server's maximum warnings that a user can get before getting banned",
    async execute(message, prefix, args){
        args = args.trim();

        //check for user permissions
        if(!message.member.hasPermission('ADMINISTRATOR')){
            message.channel.send("You do not have sufficient permissions to use this command.");
        }
        else if(args === '' || args === 'help'){
            message.channel.send('To use this command, use the format:\n\n`' + prefix + this.name + ' number`');
        }
        else if(utilities.isNumeric(args)){
            let server = await aws_utilities.getItem(message.guild.id);
            
            //server exists, update the item
            if(server){
                aws_utilities.updateItem(message.guild.id, ['max_warnings'], [args])
            }
            //server does not exist, write an item
            else{
                aws_utilities.writeItem(message.guild.id);
                aws_utilities.updateItem(message.guild.id, ['max_warnings'], [args])
            }

            message.channel.send("The server's maximum amount of warnings has been set to " + args);
        }
        
    }
}