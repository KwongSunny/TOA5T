module.exports = {
    name: 'clear',
    description: 'Empties the queue',
    execute(message, prefix, args, songQueue, Discord){
        args = args.trim();

        //check permissions
        if(!message.member.hasPermission('ADMINISTRATOR')){
            return message.channel.send('You have insufficient permissions to use this command');
        }
        //provides help on how to use the command
        else if(args === 'help'){
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Music Queue')
                .addField('Description', 'Returns a queue of music to be played by the bot or add a song to the queue')
                .addField('Usage', '`' + prefix + this.name + '`')
                .addField('Related Commands', '`Back`, `Clear`, `Join`, `Leave`, `Loop`, `Pause`, `Play`, `Resume`, `Skip`, `Stop`, `Volume`');
            return message.channel.send(embed);
        }
        //continue with the command
        else if(args === ''){
            //retrieves the serverQueue
            const serverQueue = songQueue.get(message.guild.id);
            if(serverQueue){
                if(serverQueue.songs.length > 1){
                    serverQueue.songs = [serverQueue.songs[0]];
                    songQueue.set(message.guild.id, serverQueue);
                    return message.channel.send('You have successfully cleared the queue');
                }
                if(serverQueue.songs.length <= 1){
                    if(serverQueue.playing)
                        return message.channel.send('You cannot clear an empty queue');
                    else{
                        serverQueue.songs = [serverQueue.songs[0]];
                        songQueue.set(message.guild.id, serverQueue);
                        return message.channel.send('You have successfully cleared the queue');
                    }
                }
            }
            else return message.channel.send('There is no music currently being played, use `' + prefix + 'play` to start listening');
        }
        //unknown arguments
        else return message.channel.send('Unknown arguments detected for the command');
    }
}