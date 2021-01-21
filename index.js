require('dotenv').config();
const Discord = require('discord.js');
const fs = require('fs');
const aws_utilities = require('./utils/aws_utilities');
const rr_utilities = require('./utils/reactionrole_utilities');
const index_helpers = require('./index_helpers.js');

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
    //a bot command is being used
    if(message.content.startsWith(prefix)){
        let args = '';
        if(message.content.includes(' ')) args = message.content.slice(message.content.search(" ")+1);
        const command = message.content.slice(prefix.length).split(/ +/).shift().toLowerCase();
    
        index_helpers.executeCommand(command, prefix, message, args, Discord, client);
    }
    //ignore messages from bots
    else if(message.author.bot){
        return;
    }
    //every other message sent by users
    else{

    }

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
    let server = await aws_utilities.getItem(member.guild.id);
    
    //checks if default_role exists and is not an empty string
    if(server.Item.default_role && server.Item.default_role !== ''){
        member.roles.add(member.guild.roles.cache.find(role => role.id === server.Item.default_role));
    }
    else{
        console.log('This role could not be given. Server: ' + server.Item.server_id);
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