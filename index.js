require('dotenv').config();

const Discord = require('discord.js');

const fs = require('fs');

const client = new Discord.Client({partials: ["MESSAGE", "CHANNEL", "REACTION"]});

const prefix = '~';

client.commands = new Discord.Collection();

//read all commands from commands folder
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

//on startup
client.once('ready', () => {
    console.log('PixelBot, online!');

    rolesManager();
})

//persist while bot is alive
client.on('message', message => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;
    
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    //gives basic information about the bot
    if(command === 'info')
        client.commands.get('info').execute(message);
    //test function DONE
    else if(command === 'ping')
        client.commands.get('ping').execute(message, args);
    //stops the bot DONE
    else if(command === 'kill')
        client.commands.get('kill').execute(message, client);
    //modular reactionrole command
    else if(command === 'reactionrole')
        client.commands.get('reactionrole').execute(message, args, Discord, client);
    //nonmodular reactionrole command - to be replaced by reactionrole DONE
    else if(command === 'reactionrole_destinyraiders')
        client.commands.get('reactionrole_destinyraiders').execute(message, args, Discord, client);
    //randomizer command, gives a random output based on the parameters NEED TO DO EMBEDS | ARGS SEPERATES SPACED ITEMS IN LIST (NEED TO GO OFF ENTIRE MESSAGE.CONTENT)
    else if(command === 'random')
        client.commands.get('random').execute(message, args, Discord)
    
});

//various tokens to test and build
tokens = require('./tokens.js');

//client.login(process.env.BOT_TOKEN);  //HEROKU PUBLIC BUILD 
//client.login(tokens.BOT_TOKEN);       //LOCAL PUBLIC BUILD
client.login(tokens.DEV_TOKEN);         //LOCAL DEV BUILD
