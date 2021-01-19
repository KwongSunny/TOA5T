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
            embed.addField('Role Management', 
                '`~autorole`: sets a default role for the server, any new members will be granted this role\n' +
                '`reactionrole`: creates a post which people can react to to give out and take away roles\n' +
                ''
            );

            embed.addField('Miscellaneous',
                '`random`: randomizer that can utilize integer ranges and lists\n' +
                ''
            );
        }
        else{
            message.channel.send('');

        }
    }
}