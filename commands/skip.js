module.exports = {
    name: 'skip',
    description: 'skips the current song in the queue',
    execute(message, prefix, args, songQueue, Discord){ 

        args = args.trim();

        //check permissions
        if(!message.member.hasPermission('ADMINISTRATOR')){
            return message.channel.send('You have insufficient permission to use this command');
        }
        //sends a message telling the user how to use this command
        else if(args === 'help'){
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Skip Song')
                .addField('Description', 'Skips the current song in the queue')
                .addField('Usage', '`' + prefix + this.name + '`')
                .addField('Related Commands', '`Back`, `Clear`, `Join`, `Leave`, `Loop`, `Play`, `Pause`, `Queue`, `Resume`, `Stop`, `Volume`');
            return message.channel.send(embed);  
        }
        //skips the current video
        else if(args === ''){
            const serverQueue = songQueue.get(message.guild.id);
            if(serverQueue){
                //if there is a dispatcher, destroy it
                if(serverQueue.connection.dispatcher)
                    serverQueue.connection.dispatcher.destroy();
                //if there isn't then just shift the first song
                else
                    serverQueue.songs.shift();

                //turns off loop if loop is on
                serverQueue.loop = false;
                songQueue.set(message.guild.id, serverQueue);

                return message.channel.send('You have successfully skipped `' + serverQueue.songs[0].title + '`');
            }
            else return message.channel.send('There is no music currently being played, use `' + prefix + 'play` to start listening');
        }
        //unknown arguments
        else return message.channel.send('Unknown arguments detected for the command');
    }
}