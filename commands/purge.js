const utilities = require('../utils/utilities.js');

module.exports = {
    name: 'purge',
    description: 'deletes all the messages of a user in this channel within the past n amount of messages (default: 100 messages)',
    async execute(message, prefix, args, Discord){
        args = args.trim();

        //check permissions
        if(!message.member.hasPermission('ADMINISTRATOR')){
            return message.channel.send('You have insufficient permissions to use this command');
        }
        //send a message on how to use this command
        else if(args === 'help'){
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Purge Messages')
                .addField('Description', 'Removes all messages from a user in a channel within the past n amount of messages(default: 100 messages)')
                .addField('Usage',
                    '`' + prefix + this.name + ' @user numberOfMessages')
                .addField('Usage',
                    '`' + prefix + this.name + ' @user numberOfMessages')
                .addField('Example', 
                    '`' + prefix + this.name + ' @TOA5T\n' +
                    '`' + prefix + this.name + ' @TOA5T 53\n');
            return message.channel.send(embed);
        }
        //continue with the command
        else{
            //look for userMention
            const userMention = args.substring(args.indexOf('<'), args.indexOf('>') + 1);
            if(!utilities.isUserMention(userMention)){
                return message.channel.send('Invalid mention, please make sure it is a user mention');
            }

            let limit = args.match(/\s\d+(\s|$)/g);

            let removals = [userMention, limit];

            let trimmedArgs = utilities.removeFromString(args, removals);
            if(trimmedArgs.trim() !== ''){
                return message.channel.send('Invalid arguments taken: `' + trimmedArgs + '`');
            }

            if(!utilities.isNumeric(limit)) limit = 100;
            let messages = await message.channel.messages.fetch({limit: limit});
            messages = messages.filter(m => m.author.id === utilities.getUserId(userMention));
            console.log('Deleted: ' + messages.size);
            return await message.channel.bulkDelete(messages, true);
        }
    }
}