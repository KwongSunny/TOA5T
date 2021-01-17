const { Message } = require("discord.js")

module.exports = {
    name: 'help',
    description: 'provides a list of commands',
    execute(message, args){
        let embed = new Discord.MessageEmbed()
            .setColor('#f7c920')
            .setTitle('Commands List')
            .setDescription('');
                   

        if(args === ''){ //provides a list of commands
            embed.setDescription(
                '`random`: randomizer that can utilize integer ranges and lists\n' +
                '`reactionrole`: creates a post which people can react to to give out and take away roles\n' +
                ''
            );

        }
        else{


        }
    }
}