const { Message } = require("discord.js")

module.exports = {
    name: 'help',
    description: 'provides help on commands',
    execute(message, args){
        let embed = new Discord.MessageEmbed()
            .setColor('#f7c920')
            .setTitle('Commands List')
            .setDescription('');
                   

        if(args.length === 0){ //provides a list of commands


        }
        else{


        }
    }
}