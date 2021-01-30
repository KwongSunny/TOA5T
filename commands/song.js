const { length } = require("ffmpeg-static");

module.exports = {
    name: 'song',
    description: 'Retrieves information about the current song',
    execute(message, prefix, args, songQueue, Discord){
        args = args.trim();

        //check permissions
        if(!message.member.hasPermission('ADMINISTRATOR')){
            return message.channel.send('You have insufficient permissions to use this command');
        }
        //send a message on how to use this command
        else if(args === 'help'){
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

            if(serverQueue && serverQueue.songs.length > 0){
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
    
                let embed = new Discord.MessageEmbed()
                    .setColor('#f7c920')
                    .setTitle('Current Song')
                    .addField('Title', '```' + serverQueue.songs[0].title + '```')
                    .setDescription('`[' + progressBar + ']`');
    
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