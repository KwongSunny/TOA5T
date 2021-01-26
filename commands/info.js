const { Message } = require("discord.js")

module.exports = {
    name: 'info',
    description: 'Information about PixelBot',
    execute(message, prefix, Discord){
        let embed = new Discord.MessageEmbed()
            .setColor('#f7c920')
            .setTitle('PixelBot')
            .setDescription("Hi! I'm PixelBot, I am capable of numerous different functions and serves as a private learning tool as well as a public use Bot. For assistance on how to use my commands use `" + prefix + "help`");
        return message.channel.send(embed);
    }
}