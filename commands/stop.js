const perm_utilities = require('../utils/perm_utilities.js');

module.exports = {
    name: 'stop',
    description: 'Stops the current song',
    async execute(param){
        const message = param.message;
        const prefix = param.prefix;
        let args = param.args;
        const songQueue = param.songQueue;
        const Discord = param.Discord;

        args = args.trim();

        const permission = 'play_music';
        const hasMusicPermissions = await perm_utilities.checkPermission(message, permission);

        //check for permissions
        if(!message.member.hasPermission('ADMINISTRATOR') && !hasMusicPermissions){
            return message.channel.send('You have insufficient permissions to use this command');
        }
        //provides help on how to use the command
        else if(args === 'help'){
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Stop Song')
                .addField('Description', 'Stops the current song')
                .addField('Usage', '`' + prefix + this.name + '`')
                .addField('Related Commands', '`Back`, `Clear`, `Join`, `Leave`, `Loop`, `Pause`, `Play`, `Resume`, `Skip`, `Stop`, `Volume`');
            return message.channel.send(embed);
        }
        //resume the playlist
        else if(args === ''){
            const serverQueue = songQueue.get(message.guild.id);
            if(serverQueue){
                //stop and pause
                serverQueue.stopped = true;
                serverQueue.paused = true;
                if(serverQueue.connection.dispatcher){
                    serverQueue.connection.dispatcher.end();
                }
                songQueue.set(message.guild.id, serverQueue);

                return message.channel.send('The queue has been stopped, use `' + prefix + 'play` to continue the queue');
            }
            else return message.channel.send('There is no music currently being played, use `' + prefix + 'play` to start listening');
        }
        //unknown arguments
        else return message.channel.send('Unknown arguments detected for the command');
    }
}