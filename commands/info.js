const { Message } = require("discord.js")

module.exports = {
    name: 'info',
    description: 'Information about PixelBot',
    execute(message, Discord){
        let embed = new Discord.MessageEmbed()
            .setColor('#f7c920')
            .setTitle('PixelBot')
            .setDescription('PixelBot is a private Discord Bot owned and made by Sunny Kwong. I am capable of numerous different functions and serves as a private learning tool as well as a public use Bot.');
        message.channel.send(embed);
    }
}