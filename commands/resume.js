const music_utilities = require('../utils/music_utilities.js');

module.exports = {
    name: 'resume',
    description: 'resumes the playlist',
    execute(message, prefix, args, songQueue, Discord){
        args = args.trim();

        //check for permissions
        if(!message.member.hasPermission('ADMINISTRATOR')){
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
            if(serverQueue){
                let serverDispatcher = serverQueue.connection.dispatcher;
                console.log(serverDispatcher);
                if(serverDispatcher){
                    serverQueue.paused = false;
                    serverDispatcher.resume();
                    songQueue.set(message.guild.id, serverQueue);
                }
                else{
                    serverQueue.paused = false;
                    songQueue.set(message.guild.id, serverQueue);
                    music_utilities.playQueue(message, message.guild.id, songQueue, Discord);
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