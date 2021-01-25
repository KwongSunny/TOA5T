const aws_utilities = require('../utils/aws_utilities.js');

module.exports = {
    name: 'resetprefix',
    description: 'resets the custom prefix for the server to the default prefix',
    async execute(message, prefix, defaultPrefix, args, Discord) {
        args = args.trim();

        //check for permissions
        if(!message.member.hasPermission('ADMINISTRATOR')){
            message.channel.send('You do not have sufficient permissions to use this command.');
        }
        //check for help argument
        else if(args === 'help'){
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Reset Prefix')
                .addField('Description', 'Resets the custom prefix of the bot for the server to the default prefix: `' + defaultPrefix + '`')
                .addField('Usage', '`' + prefix + this.name + '`')
                .addField('Related Commands', '`getprefix`, `setprefix`');
            message.channel.send(embed);
        }
        //check for uneccesary arguments
        else if(args !== ''){
            message.channel.send('Unecessary arguments in the command: `' + args + '`');
        }
        //continue with command
        else{
            //pins a message letting users know the new prefix of the bot 
                let newPrefixMessage = await message.channel.send("This bot's prefix has been reset to it's default: `" + defaultPrefix + '`');
                await newPrefixMessage.pin();

            //check for a previous pinned prefix message in db
                let prevPrefixMessageId = '';
                let server = await aws_utilities.fetchServer(message.guild.id);
                //if the server is found update it
                if(server){
                    prevPrefixMessageId = server.Item.prefix_message_id;
                }
                //else write a new one
                else{
                    aws_utilities.writeItem(message.guild.id);
                }

            //update the item
                let keys = ['custom_prefix', 'prefix_message_id'];
                let values = ['', newPrefixMessage.id];
                aws_utilities.updateItem(message.guild.id, keys, values);

            //look for and delete the previous pinned prefix message
                if(prevPrefixMessageId !== ''){
                    let fetchedMessage = await aws_utilities.fetchMessageFromGuild(message.guild, prevPrefixMessageId);
                    fetchedMessage.delete();
                }
        }
    }
}