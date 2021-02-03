const aws_utilities = require('../utils/aws_utilities.js');
const music_utilities = require ('../utils/music_utilities.js');

module.exports = {
    name: 'pause',
    description: 'Pauses the music',
    async execute(message, prefix, args, songQueue, Discord){
        args = args.trim();

        const permissions = ['play_music'];
        let hasMusicPermissions = await music_utilities.checkMusicPermissions(message, permissions);

        //check for permissions
        if(!message.member.hasPermission('ADMINISTRATOR') && !hasMusicPermissions){
            return message.channel.send('You have insufficient permissions to use this command')
        }
        //send a message on how to use the command
        else if(args === 'help'){
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Pause Playlist')
                .addField('Description', 'Pauses the audio playlist')
                .addField('Usage', '`' + prefix + this.name + '`')
                .addField('Related Commands', '`Back`, `Clear`, `Join`, `Leave`, `Loop`, `Play`, `Queue`, `Resume`, `Skip`, `Stop`, `Volume`');
            return message.channel.send(embed);    
        }
        //pause the bot
        else if(args === ''){
            const serverQueue = songQueue.get(message.guild.id);
            if(serverQueue){
                let serverDispatcher = serverQueue.connection.dispatcher;
                if(serverDispatcher){
                    message.channel.send('The playlist has been put on pause');
                    serverQueue.paused = true;
                    serverDispatcher.pause();

                    //pause the timer
                    clearTimeout(serverQueue.timer);

                    songQueue.set(message.guild.id, serverQueue);
                }
            }
            else return message.channel.send('There is no music currently being played, use `' + prefix + 'play` to start listening');
        }
        //unnecessary arguments
        else{
            return message.channel.send('Unknown arguments detected for the command');
        }
    }
}