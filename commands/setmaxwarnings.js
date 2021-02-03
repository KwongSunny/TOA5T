const aws_utilities = require('../utils/aws_utilities.js');
const utilities = require('../utils/utilities.js');

module.exports = {
    name: 'setmaxwarnings',
    description: "sets the server's maximum warnings that a user can get before getting banned",
    async execute(message, prefix, args, Discord){
        args = args.trim();

        //check for user permissions
        if(!message.member.hasPermission('ADMINISTRATOR')){
            return message.channel.send("You do not have sufficient permissions to use this command.");
        }
        else if(args === '' || args === 'help'){
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Set Max Warnings')
                .addField('Description', "Sets the server's max amount of warnings before a user get's banned")
                .addField('Usage', '`' + prefix + this.name + ' number`')
                .addField('Example' , '`' + prefix + this.name + ' 3`')
                .addField('Related Commands', '`warn`')
            message.channel.send(embed);
        }
        else if(utilities.isNumeric(args)){
            let server = await aws_utilities.fetchServer(message.guild.id);
            
            //server exists, update the item
            if(!server){
                aws_utilities.writeItem(message.guild);
            }
            aws_utilities.updateItem(message.guild.id, ['max_warnings', 'server_name'], [args, message.guild.name])
            message.channel.send("The server's maximum amount of warnings has been set to " + args);
        }
        
    }
}