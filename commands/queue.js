const music_utilities = require('../utils/music_utilities.js');

module.exports = {
    name: 'queue',
    description: 'retrieves the queue of youtube links to be played by the bot',
    async execute(param){
        const message = param.message;
        const prefix = param.prefix;
        let args = param.args;
        const songQueue = param.songQueue;
        const interactiveEmbeds = param.interactiveEmbeds;
        const Discord = param.Discord;

        args = args.trim();

        //provides help on how to use the command
        if(args === 'help'){
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Music Queue')
                .addField('Description', 'Returns a queue of music to be played by the bot or add a song to the queue')
                .addField('Usage', '`' + prefix + this.name + '`')
                .addField('Related Commands', '`Back`, `Clear`, `Join`, `Leave`, `Loop`, `Pause`, `Play`, `Resume`, `Skip`, `Stop`, `Volume`')
                .addField('Aliases', '`q`');
            return message.channel.send(embed);
        }
        //return the current queue
        else if(args === ''){
            let serverQueue = songQueue.get(message.guild.id);
            if(serverQueue && serverQueue.songs.length > 0){
                let status;
                if(serverQueue.stopped) status = 'Stopped';
                else if(serverQueue.paused) status = 'Paused';
                else status = 'Playing';

                let embed = new Discord.MessageEmbed()
                    .setColor('#f7c920')
                    .setTitle('Music Queue');

                let description = music_utilities.generateQueueDescription(1, status, serverQueue);
                embed.setDescription(description);

                let sentEmbed = await message.channel.send(embed);
                
                sentEmbed.react('⏪');
                sentEmbed.react('◀️');
                sentEmbed.react('▶️');
                sentEmbed.react('⏩');

                //if the server already has an active queue, delete it
                interactiveEmbeds.forEach((embed) => {
                    if(embed.type === 'queue' && embed.guildId === message.guild.id){
                        interactiveEmbeds.delete(embed.messageId);
                    }
                })

                interactiveEmbeds.set(sentEmbed.id, {type: 'queue', messageId: sentEmbed.id, guildId: sentEmbed.guild.id, channel: sentEmbed.channel.id, currentPage: '1'});
                return;
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