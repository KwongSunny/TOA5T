require('dotenv').config();
const Discord = require('discord.js');
const fs = require('fs');
const CronJob = require('cron').CronJob;
const utilities = require('./utils/utilities.js');
const aws_utilities = require('./utils/aws_utilities');
const rr_utilities = require('./utils/reactionrole_utilities');
const raffle_utilities = require('./utils/raffle_utilities.js');
const index_helpers = require('./index_helpers.js');
const messageFilter = require('./utils/messageFilter.js');

const client = new Discord.Client({partials: ["MESSAGE", "CHANNEL", "REACTION"]});
const defaultPrefix = '~';
let prefix = '~';
client.commands = new Discord.Collection();
const songQueue = new Map();
let raffles = [];

//read all commands from commands folder
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

//on startup
client.once('ready', async () => {
    console.log('TOA5T is now online!');
    
    raffles = await aws_utilities.fetchRaffles();
    raffles = raffles.Items;
    console.log(raffles);

    //remove past due raffles (this will remove raffles that ended in between bot downtime)
    raffles = raffle_utilities.removePastDueRaffles(raffles);

    //activate raffles if they're ending within a day
    raffles = raffle_utilities.activateRaffles(raffles, client);

    //remove completed raffles, upon timer concluding, raffle.status will be set to 'complete'; remove all 'complete' raffles from the list
    raffles = raffle_utilities.removeCompletedRaffles(raffles);
})

//Check Raffles every 6th hour of every day
const job = new CronJob(
    '0 */6 * * *', 
    () => {
        console.log("Daily Raffle Check");
        console.log(raffles);

        //remove past due raffles (this will remove raffles that ended in between bot downtime)
        raffles = raffle_utilities.removePastDueRaffles(raffles);

        //activate raffles if they're ending within a day
        raffles = raffle_utilities.activateRaffles(raffles, client);

        //remove completed raffles, upon timer concluding, raffle.status will be set to 'complete'; remove all 'complete' raffles from the list
        raffles = raffle_utilities.removeCompletedRaffles(raffles);
    }
)
job.start();

//persist while bot is alive
client.on('message', async message => {

    //messages that appear in a server
    if(message.guild){
        //check for custom prefix
            let server = await aws_utilities.fetchServer(message.guild.id);
            let customPrefix = '';
            if(server && server.Item) customPrefix = server.Item.custom_prefix;
            //if the server has a custom prefix, use it
            if(customPrefix !== '') prefix = customPrefix;
            //if the server does not have a custom prefix, use the default prefix
            if(customPrefix === '' || !customPrefix) prefix = defaultPrefix;

        //split args and command
            let args = '';
            if(message.content.includes(' ')) args = message.content.slice(message.content.search(" ")+1);
            let command = '';

        //a bot command is being used
        if(message.content.startsWith(prefix)){
            command = message.content.slice(prefix.length).split(/ +/).shift().toLowerCase();

            index_helpers.executeCommand(command, prefix, defaultPrefix, message, args, songQueue, raffles, Discord, client);
        }
        //getprefix will always utilize the default prefix as well as the custom prefix
        else if(message.content.startsWith(defaultPrefix)){
        command = message.content.slice(defaultPrefix.length).split(/ +/).shift().toLowerCase();

        if(command === 'getprefix')
            client.commands.get('getprefix').execute(message, defaultPrefix, args, Discord);
        }
        //ignore messages from bots
        else if(message.author.bot){
            return;
        }
        //every other message sent by users
        else{
            messageFilter.filterMessage(message);
        }
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
    let server = await aws_utilities.fetchServer(member.guild.id);

    //gives new members, server default roles
    if(server.Item.default_role && server.Item.default_role !== ''){
        member.roles.add(member.guild.roles.cache.get(server.Item.default_role));
    }
    else{
        console.log('This role could not be given. Server: ' + server.Item.server_id);
    }
});

client.on('voiceStateUpdate', (voiceState) => {
    let serverQueue = songQueue.get(voiceState.guild.id);

    //disconnect after 1 minute if no one is in the channel
    if(serverQueue){
        if(serverQueue && serverQueue.voiceChannel.members.size === 1){
            let disconnectTimer = setTimeout(() => {songQueue.get(voiceState.guild.id).voiceChannel.leave()}, 60000);
            serverQueue.disconnectTimer = disconnectTimer;
        }
        else if(serverQueue && serverQueue.voiceChannel.members.size > 1){
            clearTimeout(songQueue.get(voiceState.guild.id).disconnectTimer);
        }
        songQueue.set(voiceState.guild.id, serverQueue);
    }

    //if bot leaves, delete the server's song queue
    if(voiceState.member.id === client.user.id){
        //check if there is a connection to a channel
        if(!voiceState.connection){
            songQueue.delete(voiceState.guild.id);
        }
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