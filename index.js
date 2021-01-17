require('dotenv').config();

const Discord = require('discord.js');
const fs = require('fs');
const aws_utilities = require('./utils/aws_utilities');
const rr_utilities = require('./utils/reactionrole_utilities');

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
    
})

//persist while bot is alive
client.on('message', message => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    let args = '';
    if(message.content.includes(' ')) args = message.content.slice(message.content.search(" ")+1);
    const command = message.content.slice(prefix.length).split(/ +/).shift().toLowerCase();

    //assigns a default role to every new member DONE
    if(command === 'autorole')
        client.commands.get('autorole').execute(message, prefix, args, Discord);
    //provides a list of commands
    else if(command === 'help')
        client.commands.get('help').execute(message);
    //gives basic information about the bot
    else if(command === 'info')
        client.commands.get('info').execute(message, prefix, Discord);
    //test function DONE
    else if(command === 'ping')
        client.commands.get('ping').execute(message);
    //stops the bot DONE, only to be used by bot admins
    else if(command === 'kill')
        client.commands.get('kill').execute(message, client);
    //randomizer command, gives a random output based on the parameters NEED TO DO EMBEDS | ARGS SEPERATES SPACED ITEMS IN LIST (NEED TO GO OFF ENTIRE MESSAGE.CONTENT)
    else if(command === 'random')
        client.commands.get('random').execute(message, args, Discord)
    //modular reactionrole command ON STARTUP FIRST REACTION IS NOT READ, MESSAGE NEEDS TO BE CACHED ON STARTUP
    else if(command === 'reactionrole')
        client.commands.get('reactionrole').execute(prefix, message, args, Discord, client);
    
});

//read active reactions, and gives out roles
client.on('messageReactionAdd', async(reaction, user) => {
    if(reaction.message.partial) await reaction.message.fetch();
    if(reaction.partial) await reaction.fetch();
    if(user.bot) return;
    if(!reaction.message.guild) return;

    rr_utilities.addRoleFromReaction(reaction, user);
});

//read active reactions, and gives out roles
client.on('messageReactionRemove', async(reaction, user) => {
    if(reaction.message.partial) await reaction.message.fetch();
    if(reaction.partial) await reaction.fetch();
    if(user.bot) return;
    if(!reaction.message.guild) return;

    rr_utilities.removeRoleFromReaction(reaction, user);
});

client.on('guildMemberAdd', async(member) => {
    console.log(member.displayName + ' has joined server: ' + member.guild.name);
    console.log('default role: ' + aws_utilities.getItem(member.guild.id));
    if(aws_utilities.getItem(member.guild.id).default_role !== ''  && aws_utilities.getItem(member.guild.id).default_role !== undefined){
        member.roles.add(member.guild.roles.cache.find(role => role.name ===  aws_utilities.getItem(member.guild.id).default_role));
    }
});

let deploy = 'HEROKU';

if(deploy === 'HEROKU') client.login(process.env.BOT_TOKEN);  //HEROKU PUBLIC BUILD 
else{
    let tokens = require('./tokens.js');
    if(deploy === 'PUBLIC'){
        client.login(tokens.BOT_TOKEN);       //LOCAL PUBLIC BUILD
    } 
    if(deploy === 'LOCAL') {
        client.login(tokens.DEV_TOKEN);        //LOCAL DEV BUILD
    }     
}