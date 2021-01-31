const utilities = require('../utils/utilities.js');
const aws_utilities = require('../utils/aws_utilities.js');

module.exports = {
    name: 'setmusicrole',
    description: "sets the server's music role (who can use the music commands)",
    async execute(message, prefix, args, Discord){
        args = args.trim();
        
        //check permissions
        if(!message.member.hasPermission('ADMINISTRATOR')){
            return message.channel.send('You have insufficient permissions to use this command');
        }
        //send a message on how to use the command
        else if(args === 'help' || args === ''){
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Set Music Role')
                .addField('Description', 'Creates a music role which lets users use music commands')
                .addField('Usage', '`' + prefix + this.name + '  @role`')
                .addField('Example', 
                    '`' + prefix + this.name + ' @DJ`')
                .addField('Related Commands', '`setmusicperms`');
            message.channel.send(embed);
        }
        //continue with command
        else{
            //check if the args is a roles mention
            if(utilities.isRoleMention(args)){
                const server = await aws_utilities.fetchServer(message.guild.id);
                if(!server)
                    aws_utilities.writeItem(message.guild);

                let keys = ['music_roles', 'server_name'];
                let values = [args + '[manage_music, play_music]', message.guild.name];

                aws_utilities.updateItem(message.guild.id, keys, values);
                return message.channel.send(args + ' is now set as a music role with the following permissions:\n' + '`manage_music`, `play_music`');
            }
            else{
                return message.channel.send('This role does not exist, please make sure you are using a mention to the role');
            }
        }
    }
}