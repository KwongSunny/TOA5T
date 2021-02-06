const music_utilities = require('../utils/music_utilities.js');

module.exports = {
    name: 'join',
    description: 'Makes the bot join the channel',
    async execute(message, prefix, args, songQueue, Discord){
        args = args.trim();

        const permissions = ['manage_music'];
        const hasMusicPermissions = await music_utilities.checkMusicPermissions(message, permissions);

        //check permissions
        if(!message.member.hasPermission('ADMINISTRATOR') && !hasMusicPermissions){
            return message.channel.send('You have insufficient permissions to use this command');
        }
        //send a message on how to use the command
        else if(args === 'help'){
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Join Channel')
                .addField('Description', 'Makes the bot join your voice channel')
                .addField('Usage', '`' + prefix + this.name + '`')
                .addField('Related Commands', '`Back`, `Clear`, `Leave`, `Loop`, `Pause`, `Play`, `Queue`, `Resume`, `Skip`, `Stop`, `Volume`');
            return message.channel.send(embed);
        }
        //continue with the command
        else if(args === ''){

            //check if the user is in a voice channel
            const voiceChannel = message.member.voice.channel;
            if(!voiceChannel) return message.channel.send('You are not connected to any voice channels, please connect to one play music');

            //check if the bot has permissions to join and speak in the channel
            const botPermissions = voiceChannel.permissionsFor(message.client.user);
            if(!botPermissions.has('CONNECT')) return message.channel.send('I have insufficient permissions to connect to your voice channel');
            if(!botPermissions.has('SPEAK')) return message.channel.send('I have insufficient permissions to speak in your voice channel');

            //join the server and add the connection to serverQueue
            let connection = await voiceChannel.join().catch(console.error);
            if(!connection) return message.channel.send('An error occured attempting to join the channel, please try again');

            //check for existing serverQueue, if there is then update the voiceChannel
            let serverQueue = songQueue.get(message.guild.id);
            if(!serverQueue){
                serverQueue = music_utilities.generateServerQueue(voiceChannel);
            }
            serverQueue.connection = connection;
            return songQueue.set(message.guild.id, serverQueue);
        }
        //unknown arguments
        else return message.channel.send('Unknown arguments detected for the command');
    }
}