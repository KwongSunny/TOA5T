const music_utilities = require('../utils/music_utilities.js');

module.exports = {
    name: 'back',
    description: 'Plays the previous song',
    async execute(message, prefix, args, songQueue, Discord){
        args = args.trim();

        const permissions = ['play_music'];
        const hasMusicPermissions = await music_utilities.checkMusicPermissions(message, permissions);

        //check permissions
        if(!message.member.hasPermission('ADMINISTRATOR') || !hasMusicPermissions){
            return message.channel.send('You have insufficient permissions to use this command');
        }
        //provides help on how to use the command
        if(args === 'help'){
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Back')
                .addField('Description', 'Plays the previous song')
                .addField('Usage', '`' + prefix + this.name + '`')
                .addField('Related Commands', '`Back`, `Clear`, `Join`, `Leave`, `Loop`, `Pause`, `Play`, `Resume`, `Skip`, `Stop`, `Volume`');
            return message.channel.send(embed);
        }
        //resume the playlist
        else if(args === ''){
            const serverQueue = songQueue.get(message.guild.id);
            if(serverQueue){
                //check if there is a previous song
                if(!serverQueue.prevSong) return message.channel.send('Could not find a previous song');

                //stop and pause the queue
                serverQueue.stopped = true;
                serverQueue.paused = true;
                if(serverQueue.connection.dispatcher){
                    serverQueue.connection.dispatcher.end();
                }
                //add back the previous song to the beginning of the queue
                serverQueue.songs.unshift(serverQueue.prevSong);
                songQueue.set(message.guild.id, serverQueue);

                //play the queue
                music_utilities.playQueue(message, message.guild.id, songQueue, Discord);
            }
            else return message.channel.send('There is no music currently being played, use `' + prefix + 'play` to start listening');
        }
        //unknown arguments
        else return message.channel.send('Unknown arguments detected for the command');
    }
}