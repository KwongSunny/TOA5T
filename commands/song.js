const utilities = require('../utils/utilities.js');

module.exports = {
    name: 'song',
    description: 'Retrieves information about the current song',
    execute(param){
        const message = param.message;
        const prefix = param.prefix;
        let args = param.args;
        const songQueue = param.songQueue;
        const Discord = param.Discord;

        args = args.trim();

        //send a message on how to use this command
        if(args === 'help'){
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Song Info')
                .addField('Description', 'Returns information on the current song in the queue')
                .addField('Usage', '`' + prefix + this.name + '`')
                .addField('Related Commands', '`Back`, `Clear`, `Join`, `Leave`, `Loop`, `Pause`, `Play`, `Resume`, `Skip`, `Stop`, `Volume`');
            return message.channel.send(embed);
        }
        //continue with the command
        else if(args === ''){
            const serverQueue = songQueue.get(message.guild.id);

            if(serverQueue && serverQueue.songs.length > 0 && !serverQueue.stopped){
                //establishes the progress bar
                    let progressBar = '';
                    
                    let lengthSeconds = serverQueue.songs[0].lengthSeconds;
                    let increment = lengthSeconds / 19;
                    let currentProgress = Math.round(serverQueue.connection.dispatcher.streamTime / (increment * 1000));

                    for(i = 0; i < 20; i++){
                        if(i === currentProgress)
                            progressBar += '●';
                        else progressBar += '-';
                    }

                    let timeStamp = ' ';

                    timeStamp += utilities.msToHoursMinutesSeconds(serverQueue.connection.dispatcher.streamTime) + ' / ' + utilities.msToHoursMinutesSeconds(lengthSeconds * 1000);
    
                let embed = new Discord.MessageEmbed()
                    .setColor('#f7c920')
                    .setTitle('Current Song')
                    .setDescription('**Title**\n```' + serverQueue.songs[0].title + '```\n' + '**Progress**\n`[' + progressBar + ']` ' + timeStamp + '\n\n**Requested by** `' + `${serverQueue.songs[0].requester}` + '`');
    
                return message.channel.send(embed);
            }
            else {
                return message.channel.send('There is currently no music being played');
            }
        }
        //unknown arguments
        else return message.channel.send('Unknown arguments detected for the command');
    }
}