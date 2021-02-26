const ytdl = require('ytdl-core-discord');
const aws_utilities = require('./aws_utilities.js');
const utilities = require('./utilities.js');

function generateServerQueue(voiceChannel){
    return {
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        prevSong: null,
        timer: null,
        volume: 30,
        loop: false,
        paused: false,
        stopped: false,
        disconnectTimer: null
    };
}

async function playQueue(message, guildId, songQueue, Discord){
    //look for the server's Queue
    const serverQueue = songQueue.get(guildId);
    if(!serverQueue) return console.log('no server queue');

    serverQueue.stopped = false;
    serverQueue.paused = false;
    
    //check if there are songs in the queue, if none then delete the serverQueue
    if(serverQueue.songs.length === 0) return;

    //create a dispatcher to play the stream, on song 'close' it will play the next or leave
    const dispatcher = serverQueue.connection.play(await ytdl(serverQueue.songs[0].url), {type: 'opus'})
        .on('start', () => {
            console.log('DISPATCHER START');
            //create a NOW PLAYING embed to be send
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
                    if(serverQueue.connection.dispatcher)
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
        .on('error', error => {
            if(error.code === 'EPIPE'){
                console.log('EPIPE write error')
            }
            else{
                console.log(error);
            }

            //skip the song that errored
            serverQueue.songs.shift();

            songQueue.set(message.guild.id, serverQueue);

            return message.channel.send('Something went wrong, please try another video');
        })
    dispatcher.setVolume(serverQueue.volume * 0.01);
}

//checks if the user has a specific permission, returns a promise which returns true or false
//only works if the user has one DJ role
async function checkMusicPermissions(message, permissions){

    return new Promise(async (resolve) => {
        let hasMusicPermissions = false;
        const server = await aws_utilities.fetchServer(message.guild.id);
        console.log(server);
        if(server && server.Item.music_roles){
            const serverMusicRoles = server.Item.music_roles;
            if(serverMusicRoles && serverMusicRoles !== []){
                for(role = 0; role < serverMusicRoles.length; role++){
    
                    const roleMention = serverMusicRoles[role].substring(0, serverMusicRoles[role].indexOf('>')+1);
                    const roleId = utilities.getRoleId(roleMention);
                    const rolePermissions = utilities.removeFromString(serverMusicRoles[role], [roleMention, ':']).split(/,\s/g);
    
                    const memberRole = message.member.roles.cache.get(roleId);
                    if(memberRole && rolePermissions.length > 1){
                        //permissions required for this command
                        for(perm = 0; perm < permissions.length; perm++){
                            if(rolePermissions.includes(permissions[perm])){
                                hasMusicPermissions = true;
                                
                            }
                        }
                    }
                }
            }
        }
        resolve(hasMusicPermissions);
    })
}

module.exports.generateServerQueue = generateServerQueue;
module.exports.playQueue = playQueue;
module.exports.checkMusicPermissions = checkMusicPermissions;