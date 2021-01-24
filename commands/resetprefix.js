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
                .setDescription(
                    '**Description:**\n' +
                    'Resets the custom prefix of the bot for the server to the default prefix: ' + defaultPrefix + '\n\n' +
                    '**Related Commands:**\n' +
                    '`' + prefix + 'setprefix`, `' + prefix + 'getprefix`'
                );
            message.channel.send(embed);
        }
        //check for uneccesary arguments
        else if(args !== ''){
            message.channel.send('Unecessary arguments in the command: ' + args);
        }
        else{
            //search for the previous prefix message
            let server = await aws_utilities.fetchServer(message.guild.id);
            let prevPrefixMessageId = server.Item.prefix_message_id;

            //look for and delete the previous pinned prefix message
            if(prevPrefixMessageId !== ''){

                let fetchedMessage;
                let channels = message.guild.channels.cache;
                channels.each(async channel => {
                    let messageManager = channel.messages;
                    if(messageManager){
                        try {
                            fetchedMessage = await channel.messages.fetch(prevPrefixMessageId);
                            if(fetchedMessage) fetchedMessage.delete();
                        }catch(e){
                            if(e.message !== 'Unknown Message')
                                console.log(e.message);
                        }
                    }
                });

                //let prevPrefixMessage = await aws_utilities.fetchMessageFromGuild(message.guild, prevPrefixMessageId).catch(console.error);
                //if(prevPrefixMessage) prevPrefixMessage.delete();
            }

            let newPrefixMessage = await message.channel.send("This bot's prefix has been reset to it's default: `" + defaultPrefix + '`');
            await newPrefixMessage.pin();

            //update the item
                let keys = ['custom_prefix', 'prefix_message_id'];
                let values = ['', newPrefixMessage.id];
                aws_utilities.updateItem(message.guild.id, keys, values);
        }
    }
    
}