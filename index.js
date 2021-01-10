require('dotenv').config();

const Discord = require('discord.js');
const fs = require('fs');
const aws_reactionroles = require('./aws_reactionroles');

//various tokens to test and build
tokens = require('./tokens.js');

const client = new Discord.Client({partials: ["MESSAGE", "CHANNEL", "REACTION"]});
const prefix = '~';
client.commands = new Discord.Collection();

//read all commands from commands folder
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

let reactionPost;
let previousReactionArgs = '';

let getRoleChannel;
let guilds = client.guilds.cache;
let getRoleChannels = [];

//on startup
client.once('ready', () => {
    console.log('PixelBot, online!');

    aws_reactionroles.returnServers();


    
    //finds all servers with a 'get-role' channel
    guilds.each(guild => {
        guild.channels.cache.each(channel => {
            if(channel.name === 'get-role')
            getRoleChannels.push(channel);
        })
    })

    for(channel in getRoleChannels)
    {
        //look for reaction post in the get-role channel

        //read for roles and emojis

        //sync up post

    }
    
    // reactionPost = getRoleChannel.messages.cache.find((cachedMessage) => 
    //     cachedMessage.embeds[0].title === 'Pick a Role!');
    // previousArgs = reactionPost.fields.find(field => field.name === 'Roles');
    // console.log(previousArgs);
    //finds a previous reaction post from a past runtime and syncs up reactions and roles
    // rolesManager = () => {
    //     console.log("A");
    //     reactionPost = getRoleChannel.messages.cache.find((cachedMessage) => 
    //         cachedMessage.embeds[0].title === 'Pick a Role!');
    //     previousArgs = reactionPost.fields.find(field => field.name === 'Roles');
    //     console.log(previousArgs);
    // }
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
        client.commands.get('reactionrole').execute(message, args, getRoleChannel, Discord, client);
    //nonmodular reactionrole command - to be replaced by reactionrole DONE
    else if(command === 'reactionrole_destinyraiders')
        client.commands.get('reactionrole_destinyraiders').execute(message, args, Discord, client);
    //randomizer command, gives a random output based on the parameters NEED TO DO EMBEDS | ARGS SEPERATES SPACED ITEMS IN LIST (NEED TO GO OFF ENTIRE MESSAGE.CONTENT)
    else if(command === 'random')
        client.commands.get('random').execute(message, args, Discord)
    
});

//client.login(process.env.BOT_TOKEN);  //HEROKU PUBLIC BUILD 
//client.login(tokens.BOT_TOKEN);       //LOCAL PUBLIC BUILD
client.login(tokens.DEV_TOKEN);         //LOCAL DEV BUILD
