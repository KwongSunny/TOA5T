const ytdl = require('ytdl-core');

function playQueue(message, guildId, songQueue, Discord){
    const serverQueue = songQueue.get(guildId);
    serverQueue.playing = true;
    
    //check if there are songs in the queue
    if(serverQueue.songs.length === 0){
        songQueue.delete(guildId);
        return;
    }
    
    //create a dispatcher to play the stream, on song 'close' it will play the next or leave
    const dispatcher = serverQueue.connection.play(ytdl(serverQueue.songs[0].url), {quality: 'highestaudio'})
        .on('start', () => {
            console.log('DISPATCHER START');
            if(!serverQueue.loop && serverQueue.songs[0]){
                let embed = new Discord.MessageEmbed()
                    .setColor('#f7c920')
                    .setTitle('Now Playing:')
                    .setDescription('```' + serverQueue.songs[0].title + '```');
                message.channel.send(embed);
            }
        })    
        .on('close', () => {
            //check if the playlist has been stopped or not
            console.log('DISPATCHER CLOSED');
            if(serverQueue.playing){
                //if !loop, go to the next song
                if(!serverQueue.loop){
                    serverQueue.prevSong = serverQueue.songs[0];
                    serverQueue.songs.shift();
                    songQueue.set(message.guild.id, serverQueue);
                }
    
                //play the queue
                playQueue(message, guildId, songQueue, Discord);
            }
            else{
                return console.log('The playlist has been stopped');
            }
        })
        .on('error', error => {
            //message.channel.send('There was an error playing the video, please ensure it is a valid link');
            console.error(error);
        })
    dispatcher.setVolume(serverQueue.volume * 0.01);
}

module.exports.playQueue = playQueue;