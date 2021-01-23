const aws_utilities = require('../utils/aws_utilities.js');

module.exports = {
    name: 'setprefix',
    description: 'changes the default prefix to a custom one',
    async execute(message, prefix, args, Discord){
        args = args.trim();
        //checks for user permissions
        if(!message.member.hasPermission('ADMINISTRATOR')){
            message.channel.send('You do not have sufficient permissions to use this command');
        }
        //send a message on how to use the command
        else if(args === 'help' || args === ''){
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Set Prefix')
                .setDescription(
                    '**Description:**\n' +
                    'Change the bot prefix to a custom one\n\n' +
                    '**Usage:**\n' +
                    '`' + prefix + this.name + ' prefix`\n\n' + 
                    '**Example:**\n' +
                    '`' + prefix + this.name + ' ~`\n' + 
                    '`' + prefix + this.name + ' t/`' 
                );
                message.channel.send(embed);
        }
        //continue with command
        else{
            let prefixes = args.split(/\s/g);
            //check for only 1 prefix
            if(prefixes.length !== 1){
                message.channel.send('There are unecessary arguments or prefixes');
            }
            else{
                //pins a message letting users know the new prefix of the bot
                let prefixMessage = await message.channel.send("This bot's prefix has been set to `" + prefixes[0] + '`');
                await prefixMessage.pin();

                let prevPrefixMessageId = '';

                //check for a previous pinned prefix message in db as well as update the prefix
                let server = await aws_utilities.getItem(message.guild.id);
                //if the server is found update it
                if(server){
                    prevPrefixMessageId = server.Item.prefix_message_id;
                }
                //else write a new one
                else{
                    aws_utilities.writeItem(message.guild.id);
                }

                //update the item with custom_prefix
                let keys = ['custom_prefix', 'prefix_message_id'];
                let values = [prefixes[0], prefixMessage.id];
                aws_utilities.updateItem(message.guild.id, keys, values);
            
                //look for and delete the previous pinned prefix message
                if(prevPrefixMessageId !== ''){
                    let channels = message.guild.channels.cache;
                    channels.each(async channel => {
                        if(channel.messages){
                            let prevPrefixMessage = await channel.messages.fetch(prevPrefixMessageId);
                            if(prevPrefixMessage)
                                console.log(prevPrefixMessage);
                        }
                    })
                }
            }
        }
    }
}