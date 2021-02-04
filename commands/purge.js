const utilities = require('../utils/utilities.js');

module.exports = {
    name: 'purge',
    description: 'deletes all the messages of a user within a given time span',
    async execute(message, prefix, args, Discord){
        args = args.trim();

        //check permissions
        if(!message.member.hasPermission('MANAGE_MESSAGES')){
            return message.channel.send('You have insufficient permissions to use this command');
        }
        //send a message on how to use this command
        else if(args === 'help'){
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Purge Messages')
                .addField('Description', 'Removes all messages from a user within a time span')
                .addField('Usage',
                    '`' + prefix + this.name + ' @user time[m/h/d]')
                .addField('Usage',
                    '`' + prefix + this.name + ' @user -a[all channels] time[m/h/d]')
                .addField('Example', 
                    '`' + prefix + this.name + ' @TOA5T 50m\n' +
                    '`' + prefix + this.name + ' @TOA5T 1d');
            return message.channel.send(embed);
        }
        //continue with the command
        else{
            //look for userMention
            const userMention = args.substring(args.indexOf('<'), args.indexOf('>') + 1);
            if(!utilities.isUserMention(userMention)){
                return message.channel.send('Invalid role mention, please make sure it is a user mention');
            }
            //look for time argument
            const time = args.match(/\s\d+[mhd]/g);
            console.log(time);
            if(!time || time.length !== 1){
                return message.channel.send('Incorrect time arguments, make sure you use `m` (minutes), `h` (hours), `d` (days) for time values');
            }

            //check for -a tag
            let allChannels = (args.indexOf('-a') > -1);

            let removals = [userMention, time[0]];
            if(allChannels) removals.push('-a');

            let trimmedArgs = utilities.removeFromString(args, removals);
            if(trimmedArgs.trim() !== ''){
                return message.channel.send('Invalid arguments taken: `' + trimmedArgs + '`');
            }


            //delete messages from channel(s)
            if(allChannels){
                const textChannels = message.guild.channels.cache.filter(channel => channel.type === 'text');

                console.log(textChannels[0].messages.cache);

            }
            else{
                utilities.fetchAllMessages(message.channel);

            }






        }



    }
}