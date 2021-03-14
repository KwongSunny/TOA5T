const music_utilities = require('../utils/music_utilities.js');
const perm_utilities = require('../utils/perm_utilities.js');

module.exports = {
    name: 'resume',
    description: 'resumes the playlist',
    async execute(message, prefix, args, songQueue, interactiveEmbeds, Discord){
        args = args.trim();

        const permission = 'play_music';
        const hasMusicPermissions = await perm_utilities.checkPermission(message, permission);

        //check for permissions
        if(!message.member.hasPermission('ADMINISTRATOR') && !hasMusicPermissions){
            return message.channel.send('You have insufficient permissions to use this command');
        }
        //send a message telling the user how to use this command
        else if(args === 'help'){
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Resume Playlist')
                .addField('Description', 'Resumes the audio playlist')
                .addField('Usage', '`' + prefix + this.name + '`')
                .addField('Related Commands', '`Back`, `Clear`, `Join`, `Leave`, `Loop`, `Play`, `Pause`, `Queue`, `Skip`, `Stop`, `Volume`');
            return message.channel.send(embed);   
        }
        //resume the playlist
        else if(args === ''){
            const serverQueue = songQueue.get(message.guild.id);
            if(serverQueue && serverQueue.songs.length > 0){
                let serverDispatcher = serverQueue.connection.dispatcher;
                if(serverDispatcher){
                    serverQueue.paused = false;
                    serverDispatcher.resume();

                    //resets the timer
                    serverQueue.timer = setTimeout(() => {
                        serverQueue.connection.dispatcher.end();
                    }, ((serverQueue.songs[0].lengthSeconds * 1000) - serverQueue.connection.dispatcher.streamTime));

                    songQueue.set(message.guild.id, serverQueue);
                }
                else{
                    serverQueue.paused = false;
                    songQueue.set(message.guild.id, serverQueue);
                    music_utilities.playQueue(message, message.guild.id, songQueue, interactiveEmbeds, Discord);
                }
                return message.channel.send('The playlist has been resumed');
            }
            else return message.channel.send('There is no music currently being played, use `' + prefix + 'play` to start listening');
        }
        //unknown arguments
        else{
            return message.channel.send('Unknown arguments detected for the command');
        }

    }
}