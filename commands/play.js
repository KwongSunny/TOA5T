const ytdl = require('ytdl-core');
const music_utilities = require('../utils/music_utilities.js');
const resume = require('./resume.js');

module.exports = {
    name: 'play',
    description: 'plays music from a youtube link',
    async execute(message, prefix, args, songQueue, Discord) {
        args = args.trim();

        //check permissions
        if(!message.member.hasPermission('ADMINISTRATOR')){
            return message.channel.send('You have insufficient permissions to use this command');
        }
        //sends a message on how to use the command
        else if(args === 'help'){
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Play Audio')
                .addField('Description', 'Plays a youtube link in your voice channel')
                .addField('Usage', '`' + prefix + this.name + ' youtubeLink`')
                .addField('Related Commands', '`Back`, `Clear`, `Join`, `Leave`,`Loop` , `Pause`, `Queue`, `Resume`, `Skip`, `Stop`, `Volume`');
            return message.channel.send(embed);
        }
        //resume the playlist
        else if(args === ''){
            return resume.execute(message, prefix, args, songQueue, Discord);
        }
        else {
            //check if the user is in a voice channel
            const voiceChannel = message.member.voice.channel;
            if(!voiceChannel) return message.channel.send('You are not connected to any voice channels, please connect to one play music');

            //check if the bot has permissions to join and speak in the channel
            const botPermissions = voiceChannel.permissionsFor(message.client.user);
            if(!botPermissions.has('CONNECT')) return message.channel.send('I have insufficient permissions to connect to your voice channel');
            if(!botPermissions.has('SPEAK')) return message.channel.send('I have insufficient permissions to speak in your voice channel');

            //creates a songItem to be added to the queue
            const songInfo = await ytdl.getInfo(args);

            const songItem = {
                title: songInfo.player_response.microformat.playerMicroformatRenderer.title.simpleText,
                url: args
            }

            //check the bot for a serverQueue
            let serverQueue = songQueue.get(message.guild.id);
            if(!serverQueue){
                serverQueue = {
                    voiceChannel: voiceChannel,
                    connection: null,
                    songs: [],
                    volume: 50,
                    paused: false,
                    playing: false
                }
            }

            //add the songItem to the serverQueue
            serverQueue.songs.push(songItem);

            //join the server and add the connection to serverQueue
            let connection = await voiceChannel.join().catch(console.error);
            if(!connection) return message.channel.send('An error occured attempting to join the channel, please try again');
            serverQueue.connection = connection;

            //add the serverQueue to the bot's songQueue
            songQueue.set(message.guild.id, serverQueue);

            //play the queue
            if(!serverQueue.playing)
                music_utilities.playQueue(message, message.guild.id, songQueue, Discord);
        }
    }
}