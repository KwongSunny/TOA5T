module.exports = {
    name: 'loop',
    description: 'Toggles looping on the current song in the playlist',
    execute(message, prefix, args, songQueue, Discord){
        args = args.trim();

        //check permissions
        if(!message.member.hasPermission('ADMINISTRATOR')){
            return message.channel.send('You have insufficient permission to use this command');
        }
        //sends a message telling the user how to use this command
        else if(args === 'help'){
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Loop Song')
                .addField('Description', 'Toggles looping on the current song in the playlist')
                .addField('Usage', '`' + prefix + this.name + '`')
                .addField('Related Commands', '`Back`, `Clear`, `Join`, `Leave`, `Loop`, `Play`, `Pause`, `Queue`, `Resume`, `Stop`, `Volume`');
            return message.channel.send(embed);  
        }
        else if(args === ''){
            //check for serverQueue
            const serverQueue = songQueue.get(message.guild.id);
            if(serverQueue){
                //toggle the loop and update
                serverQueue.loop = !serverQueue.loop;
                songQueue.set(message.guild.id, serverQueue);
                return message.channel.send('Loop has been set to `' + serverQueue.loop + '`');
            }
            else return message.channel.send('There is no music currently being played, use `' + prefix + 'play` to start listening');
        }
        //unknown arguments
        else return message.channel.send('Unknown arguments detected for the command');
    }
}