const ytdl = require('ytdl-core');

function playQueue(message, guildId, songQueue, Discord){
    //look for the server's Queue
    const serverQueue = songQueue.get(guildId);
    if(!serverQueue) return console.log('no server queue');

    serverQueue.stopped = false;
    serverQueue.paused = false;
    
    //check if there are songs in the queue, if none then delete the serverQueue
    if(serverQueue.songs.length === 0) return songQueue.delete(guildId);
    
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

            //check if the song is live or not
            if(!serverQueue.songs[0].isLive){
                //force stop the audio when the song is over in case finish event doesn't fire
                serverQueue.timer = setTimeout(() => {
                    console.log('DISPATCHER FORCED STOPPED');
                    serverQueue.connection.dispatcher.end();
                }, ((serverQueue.songs[0].lengthSeconds * 1000) - serverQueue.connection.dispatcher.streamTime));
                songQueue.set(message.guild.id, serverQueue);
            }
        })
        .on('finish', () => {
            console.log('DISPATCHER FINISHED');
            //if !loop, play the next song and shift
            if(!serverQueue.loop && !serverQueue.stopped){
                serverQueue.prevSong = serverQueue.songs[0];
                serverQueue.songs.shift();
            }
            //end the timer
            clearTimeout(serverQueue.timer);

            songQueue.set(message.guild.id, serverQueue);

            //play the queue
            if(!serverQueue.stopped)
                playQueue(message, guildId, songQueue, Discord);
        })
        //NEED TO ADD A LISTENER WHICH FORCE ENDS THE DISPATCHER IF THE TIME ELAPSED > SONG.LENGTH INCLUDING PAUSES
        .on('speaking', ()=>{
            //console.log("A");
        })
        .on('error', error => {
            console.error(error);
        })
    dispatcher.setVolume(serverQueue.volume * 0.01);
}

//if the user puts in a title name instead of a link, the bot will search on youtube for that song and return the link
function getLinkFromTitle(){

}

module.exports.playQueue = playQueue;