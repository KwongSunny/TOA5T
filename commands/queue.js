module.exports = {
    name: 'queue',
    description: 'retrieves the queue of youtube links to be played by the bot',
    async execute(message, prefix, args, songQueue, Discord){
        args = args.trim();

        if(args === 'help'){
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Music Queue')
                .addField('Description', 'Returns a queue of music to be played by the bot or add a song to the queue')
                .addField('Usage', '`' + prefix + this.name + '`')
                .addField('Related Commands', '`Back`, `Clear`, `Join`, `Leave`, `Loop`, `Pause`, `Play`, `Resume`, `Skip`, `Stop`, `Volume`')
        }
        //return the current queue
        else if(args === ''){
            console.log(songQueue);

            let serverQueue = songQueue.get(message.guild.id);
            if(serverQueue){
                let embed = new Discord.MessageEmbed()
                    .setColor('#f7c920')
                    .setTitle('Music Queue')
                    .setDescription('**Volume:** ' + serverQueue.volume + '\n```');
                
                for(song = 0; song < serverQueue.songs.length; song++){
                    embed.setDescription(
                        embed.description + 
                        (song+1) + ': ' + serverQueue.songs[song].title + '\n'
                    )
                }
                embed.setDescription(embed.description + '```');
                return message.channel.send(embed);
            }
            else{
                let embed = new Discord.MessageEmbed()
                    .setColor('#f7c920')
                    .setTitle('Music Queue')
                    .setDescription("```Your queue is empty! Use " + prefix + "play to add some songs```");
                return message.channel.send(embed);
            }
        }
    }
}