module.exports = {
    name: 'queue',
    description: 'retrieves the queue of youtube links to be played by the bot',
    async execute(message, prefix, args, songQueue, Discord){
        args = args.trim();

        //provides help on how to use the command
        if(args === 'help'){
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Music Queue')
                .addField('Description', 'Returns a queue of music to be played by the bot or add a song to the queue')
                .addField('Usage', '`' + prefix + this.name + '`')
                .addField('Related Commands', '`Back`, `Clear`, `Join`, `Leave`, `Loop`, `Pause`, `Play`, `Resume`, `Skip`, `Stop`, `Volume`');
            return message.channel.send(embed);
        }
        //return the current queue
        else if(args === ''){
            console.log(songQueue);

            let serverQueue = songQueue.get(message.guild.id);
            if(serverQueue){
                let status;
                if(!serverQueue.playing) status = 'Stopped';
                else if(serverQueue.paused) status = 'Paused';
                else status = 'Playing';

                let embed = new Discord.MessageEmbed()
                    .setColor('#f7c920')
                    .setTitle('Music Queue')
                    .setDescription('| **Status:** `' + status + '` | **Volume:** `' + serverQueue.volume + '` | **Loop:** `' + serverQueue.loop + '` |\n\n**Now Playing**\n```');
                
                for(song = 0; song < 5; song++){
                    if(song === 0){
                        embed.setDescription(
                            embed.description + serverQueue.songs[song].title + '```\n**Up next**\n```'
                        )
                    }
                    else{
                        //this will be empty
                        if(song >= serverQueue.songs.length){
                            embed.setDescription(
                                embed.description + 
                                '[' + (song) + ']\n'
                            )
                        }
                        //display the song
                        else{
                            embed.setDescription(
                                embed.description + 
                                '[' + (song) + '] ' + serverQueue.songs[song].title + '\n'
                            )
                        }
                    }
                }

                //Math ceils the amount of pages of songs
                let pages = Math.ceil((serverQueue.songs.length-1)/4);
                if(pages === 0) pages++;
                
                embed.setDescription(embed.description + '```page 1/' + pages);
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
        //unknown arguments
        else return message.channel.send('Unknown arguments detected for the command');
    }
}