require('dotenv').config();

const Discord = require('discord.js');

const fs = require('fs');

const client = new Discord.Client({partials: ["MESSAGE", "CHANNEL", "REACTION"]});

const prefix = '~';

client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log('PixelBot, online!');
})

client.on('message', message => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;
    
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if(command === 'ping')
        client.commands.get('ping').execute(message, args);

    else if(command === 'kill')
        client.commands.get('kill').execute(message, client);

    else if(command === 'reactionrole')
        client.commands.get('reactionrole').execute(message, args, Discord, client);

    else if(command === 'reactionrole_destinyraiders') //IF BOT GOES OFFLINE, PREVIOUS POSTS WILL BE USELESS
        client.commands.get('reactionrole_destinyraiders').execute(message, args, Discord, client);

    else if(command === 'random') // NOT DONE, NEED TO DO EMBEDS
        client.commands.get('random').execute(message, args, Discord)
    
});

//tokens = require('./tokens.js');
client.login(process.env.BOT_TOKEN);  //HEROKU PUBLIC BUILD 
//client.login(tokens.BOT_TOKEN);       //LOCAL PUBLIC BUILD
//client.login(tokens.DEV_TOKEN);         //LOCAL DEV BUILD
