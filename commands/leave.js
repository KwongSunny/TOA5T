module.exports = {
    name: 'leave',
    description: 'Makes the bot leave their voice channel',
    execute(message, prefix, args, Discord, client){
        args = args.trim();

        //check permissions
        if(!message.member.hasPermission('ADMINISTRATOR')){
            return message.channel.send('You have insufficient permissions to use this command');
        }
        //provides help on how to use the command
        else if(args === 'help'){
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Leave Channel')
                .addField('Description', 'Makes the bot leave their voice channel')
                .addField('Usage', '`' + prefix + this.name + '`')
                .addField('Related Commands', '`Back`, `Clear`, `Join`, `Loop`, `Pause`, `Play`, `Resume`, `Skip`, `Stop`, `Volume`');
            return message.channel.send(embed);
        }
        //continue with the command
        else if(args === ''){
            console.log(client.voice.connections);
            const currentGuild = client.voice.connections.get(message.guild.id);
            if(currentGuild){
                const voiceChannel = currentGuild.channel;
                voiceChannel.leave();
                return message.channel.send('Til next time!');
            }
            else return message.channel.send('I am not currently in any voice channel');
        }
        //unknown arguments
        else return message.channel.send('Unknown arguments detected for the command');
    }
}