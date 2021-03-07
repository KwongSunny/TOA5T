const music_utilities = require('../utils/music_utilities.js');
const perm_utilities = require('../utils/perm_utilities.js');

module.exports = {
    name: 'clear',
    description: 'Empties the queue',
    async execute(message, prefix, args, songQueue, Discord){
        args = args.trim();

        const permission = 'manage_music';
        const hasMusicPermissions = await perm_utilities.checkPermission(message, permission);

        //check permissions
        if(!message.member.hasPermission('ADMINISTRATOR') && !hasMusicPermissions){
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
                //if a song is playing, then clear all but that song
                if(!serverQueue.stopped && !serverQueue.paused){
                    serverQueue.songs = [serverQueue.songs[0]];
                    songQueue.set(message.guild.id, serverQueue);
                    return message.channel.send('You have successfully cleared the queue');
                }
                //if the bot is stopped or paused, delete everything
                else if(serverQueue.stopped || serverQueue.paused){
                    //if it's paused end the dispatcher
                    if(serverQueue.connection.dispatcher && serverQueue.paused)
                        serverQueue.connection.dispatcher.end();
                    serverQueue.songs = [];
                    songQueue.set(message.guild.id, serverQueue);
                    return message.channel.send('You have successfully cleared the queue');
                }
            }
            else return message.channel.send('There is no music currently being played, use `' + prefix + 'play` to start listening');
        }
        //unknown arguments
        else return message.channel.send('Unknown arguments detected for the command');
    }
}