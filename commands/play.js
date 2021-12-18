const ytdl = require('ytdl-core');
const yts = require('youtube-search');
const music_utilities = require('../utils/music_utilities.js');
const perm_utilities = require('../utils/perm_utilities.js');
const resume = require('./resume.js');

module.exports = {
    name: 'play',
    description: 'plays music from a youtube link',
    async execute(param) {
        const message = param.message;
        const prefix = param.prefix;
        let args = param.args;
        const songQueue = param.songQueue;
        const interactiveEmbeds = param.interactiveEmbeds;
        const Discord = param.Discord;

        args = args.trim();

        const permission = 'play_music';
        const hasMusicPermissions = await perm_utilities.checkPermission(message, permission);

        //check permissions
        if(!message.member.hasPermission('ADMINISTRATOR') && !hasMusicPermissions){
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
            const serverQueue = songQueue.get(message.guild.id);
            if(serverQueue){
                if(!serverQueue.paused && !serverQueue.stopped) message.channel.send('The playlist is already playing');
                else if(serverQueue.paused && !serverQueue.stopped) resume.execute(param);
                else if(serverQueue.stopped) music_utilities.playQueue(message, message.guild.id, songQueue, interactiveEmbeds, Discord);
                return;
            }
            else return message.channel.send("There doesn't appear to be any songs in your queue, use `" + prefix + "play youtubeLink` to add some songs");
        }
        //play a link
        else {
            //check if the user is in a voice channel
            const voiceChannel = message.member.voice.channel;
            if(!voiceChannel) return message.channel.send('You are not connected to any voice channels, please connect to one to play music');

            //check if the bot has permissions to join and speak in the channel
            const botPermissions = voiceChannel.permissionsFor(message.client.user);
            if(!botPermissions.has('CONNECT')) return message.channel.send('I have insufficient permissions to connect to your voice channel');
            if(!botPermissions.has('SPEAK')) return message.channel.send('I have insufficient permissions to speak in your voice channel');

            if(!music_utilities.isLink(args)){
                let search = await music_utilities.getYTSearch(args);
                args = search[0].link;
            }

            //creates a songItem to be added to the queue
            const songInfo = await ytdl.getInfo(args);
            
            const songItem = {
                title: songInfo.player_response.microformat.playerMicroformatRenderer.title.simpleText,
                url: args,
                lengthSeconds: songInfo.player_response.microformat.playerMicroformatRenderer.lengthSeconds,
                isLive: songInfo.formats[0].isLive,
                requester: message.author.tag
            }

            //check the bot for a serverQueue
            let serverQueue = songQueue.get(message.guild.id);
            if(!serverQueue){
                serverQueue = music_utilities.generateServerQueue(voiceChannel);
            }

            //add the songItem to the serverQueue
            serverQueue.songs.push(songItem);
            
            //join the server and add the connection to serverQueue
            let connection = await voiceChannel.join().catch(console.error);
            if(!connection) return message.channel.send('An error occured attempting to join the channel, please try again');
            serverQueue.connection = connection;

            //add the serverQueue to the bot's songQueue
            songQueue.set(message.guild.id, serverQueue);

            //play the queue if it's the first song added
            if(serverQueue.songs.length === 1)
                music_utilities.playQueue(message, message.guild.id, songQueue, interactiveEmbeds, Discord);
        }
    }
}