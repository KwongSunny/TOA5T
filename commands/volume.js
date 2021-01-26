const utilities = require('../utils/utilities.js');

module.exports = {
    name: 'volume',
    description: 'changes the volume of the music played in the queue',
    execute(message, prefix, args, songQueue, Discord){
        args = args.trim();

        //check for permissions
        if(!message.member.hasPermission('ADMINISTRATOR')){
            return message.channel.send('You have insufficient permissions to use this command');
        }
        //sends a message on the current volume of the bot
        else if(args === ''){
            const serverQueue = songQueue.get(message.guild.id);
            if(serverQueue){
                const serverVolume = serverQueue.volume;
                return message.channel.send('Volume: ' + serverVolume);
            }
            else return message.channel.send('There is no music being played currently');
        }
        //sends a message on how to use the command
        else if(args === 'help'){
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Volume')
                .addField('Description', 'Changes the volume of the bot or gets the current volume')
                .addField('Usage', 
                    '`' + prefix + this.name + '`\n' + 
                    '`' + prefix + this.name + ' newVolume[0-200]`')
                .addField('Example', '`' + prefix + this.name + ' 70`')
                .addField('Related Commands', '`Back`, `Clear`, `Join`, `Leave`, `Loop`, `Pause`, `Play`, `Queue`, `Resume`, `Skip`, `Stop`');
            return message.channel.send(embed);
        }
        //user is changing the volume
        else if(utilities.isNumeric(args)){
            if(args > 200 || args < 0)
                return message.channel.send('Please make sure the volume is between 0 and 200');

            let serverQueue = songQueue.get(message.guild.id);
            serverQueue.volume = args;
            songQueue.set(message.guild.id, serverQueue);

            if(serverQueue.connection.dispatcher)
                serverQueue.connection.dispatcher.setVolume(args * 0.01);
        }
        //unknown arguments
        else{
            return message.channel.send('Unknown arguments detected for volume command');
        }


    }
}