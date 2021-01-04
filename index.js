const token = require('./token.js')

const Discord = require('discord.js');

const client = new Discord.Client();

client.once('ready', () => {
    console.log('PixelBot, online!');
})






client.login(token.getToken());

