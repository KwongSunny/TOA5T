const utilities = require('../utils/utilities.js');
const perm_utilities = require('../utils/perm_utilities.js');

module.exports = {
    name: 'volume',
    description: 'Changes the volume of the bot',
    async execute(message, prefix, args, songQueue, Discord){
        args = args.trim();

        const permission = 'manage_music';
        const hasMusicPermissions = await perm_utilities.checkPermission(message, permission);

        //check for permissions
        if(!message.member.hasPermission('ADMINISTRATOR') && !hasMusicPermissions){
            return message.channel.send('You have insufficient permissions to use this command');
        }
        //sends a message on how to use the command
        else if(args === 'help'){
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Volume')
                .addField('Description', 'Changes the volume of the bot or gets the current volume')
                .addField('Usage', 
                    '`' + prefix + this.name + '`\n' + 
                    '`' + prefix + this.name + ' newVolume[0-200]`')
                .addField('Example', '`' + prefix + this.name + ' 70`')
                .addField('Related Commands', '`Back`, `Clear`, `Join`, `Leave`, `Loop`, `Pause`, `Play`, `Queue`, `Resume`, `Skip`, `Stop`');
            return message.channel.send(embed);
        }
        //sends a message on the current volume of the bot
        else if(args === ''){
            const serverQueue = songQueue.get(message.guild.id);
            if(serverQueue){
                const serverVolume = serverQueue.volume;
                return message.channel.send('Volume: `' + serverVolume + '`');
            }
            else return message.channel.send('There is no music currently being played, use `' + prefix + 'play` to start listening');
        }
        //user is changing the volume
        else if(utilities.isNumeric(args)){
            if(args > 200 || args < 0)
                return message.channel.send('Please make sure the volume is between 0 and 200');

            //retrieve the serverQueue
            let serverQueue = songQueue.get(message.guild.id);
            if(serverQueue){
                //sets the recorded value to args
                serverQueue.volume = args;
                songQueue.set(message.guild.id, serverQueue);
    
                //sets the volume to args
                const serverDispatcher = serverQueue.connection.dispatcher;
                if(serverDispatcher){
                    serverDispatcher.setVolume(args * 0.01);
                }
                return message.channel.send("The bot's volume has been set to `" + args + '`');
            }
            else return message.channel.send('There is no music currently being played, use `' + prefix + 'play` to start listening');
        }
        //unknown arguments
        else{
            return message.channel.send('Unknown arguments detected for the command');
        }


    }
}