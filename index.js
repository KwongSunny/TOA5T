require('dotenv').config();

const Discord = require('discord.js');
const fs = require('fs');
const emojiRegex = require('emoji-regex/RGI_Emoji.js');
const aws_reactionroles = require('./aws_reactionroles');
const rr_utilities = require('./reactionrole_utilities');

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

    // let table = aws_reactionroles.scanItemsPromise();
    // table.then((result) => {
    //     for(i = 0; i < result.Count; i++)
    //     {
    //         if(client.channels.cache.get(result.Items[i].reactionrole_channel_id) != undefined)
    //         {
    //             let item = client.channels.cache.get(result.Items[i].reactionrole_channel_id).messages.fetch(result.Items[i].reactionrole_post_id);
    //             item.then((result) => {
    //                 console.log(result.id);
    //             })
    //         } 
    //     }
    // });
})

//persist while bot is alive
client.on('message', message => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    let args = '';
    if(message.content.includes(' ')) args = message.content.slice(message.content.search(" ")+1);
    const command = message.content.slice(prefix.length).split(/ +/).shift().toLowerCase();

    //gives basic information about the bot
    if(command === 'info')
        client.commands.get('info').execute(message);
    //test function DONE
    else if(command === 'ping')
        client.commands.get('ping').execute(message);
    //stops the bot DONE
    else if(command === 'kill')
        client.commands.get('kill').execute(message, client);
    //modular reactionrole command ON STARTUP FIRST REACTION IS NOT READ, MESSAGE NEEDS TO BE CACHED ON STARTUP
    else if(command === 'reactionrole')
        client.commands.get('reactionrole').execute(message, args, aws_reactionroles, Discord, client);
    //randomizer command, gives a random output based on the parOameters NEED TO DO EMBEDS | ARGS SEPERATES SPACED ITEMS IN LIST (NEED TO GO OFF ENTIRE MESSAGE.CONTENT)
    else if(command === 'random')
        client.commands.get('random').execute(message, args, Discord)
    
});

//read active reactions, and gives out roles
client.on('messageReactionAdd', async(reaction, user) => {
    if(reaction.message.partial) await reaction.message.fetch();
    if(reaction.partial) await reaction.fetch();
    if(user.bot) return;
    if(!reaction.message.guild) return;

    let response = await aws_reactionroles.getItem(reaction.message.guild.id.toString());
    //if the server is logged in the reactinroles db and the post being reacted to is the reactionroles post
    if(response && (reaction.message.id === response.Item.reactionrole_post_id)){
        let roleString = response.Item.roles;

        let args = roleString.trim().split(/,/);
        args = args.map(element => element.trim());

        //split the args array items into an array of [role, emoji] items
        let roleArgs = rr_utilities.splitReactionArgs(args);

        //array of role items
        let roleList = []; 
        for(i = 0; i < args.length; i++){
            roleList.push(reaction.message.guild.roles.cache.find(role => role.name === roleArgs[i][0]));
        }
    
        for(i = 0; i < roleArgs.length; i++){
            let regex = emojiRegex();

            //checks if it's an unicode emoji
            let isEmoji = regex.test(roleArgs[i][1]);;

            if(isEmoji && reaction.emoji.name === roleArgs[i][1] || !isEmoji && reaction.emoji.id === roleArgs[i][1].split(':')[2].substring(0, roleArgs[i][1].split(':')[2].length-1))
                await reaction.message.guild.members.cache.get(user.id).roles.add(roleList[i]).catch(console.error);
        }
    }
});

//read active reactions, and gives out roles
client.on('messageReactionRemove', async(reaction, user) => {
    if(reaction.message.partial) await reaction.message.fetch();
    if(reaction.partial) await reaction.fetch();
    if(user.bot) return;
    if(!reaction.message.guild) return;

    let response = await aws_reactionroles.getItem(reaction.message.guild.id.toString());
    if(reaction.message.id === response.Item.reactionrole_post_id){
        let roleString = response.Item.roles;

        let args = roleString.trim().split(/,/);
        args = args.map(element => element.trim());

        //split the args array items into an array of [role, emoji] items
        let roleArgs = rr_utilities.splitReactionArgs(args);

        //array of role items
        let roleList = []; 
        for(i = 0; i < args.length; i++){
            roleList.push(reaction.message.guild.roles.cache.find(role => role.name === roleArgs[i][0]));
        }
    
        for(i = 0; i < roleArgs.length; i++){
            let regex = emojiRegex();

            //checks if it's an unicode emoji
            let isEmoji = regex.test(roleArgs[i][1]);;

            if(isEmoji && reaction.emoji.name === roleArgs[i][1] || !isEmoji && reaction.emoji.id === roleArgs[i][1].split(':')[2].substring(0, roleArgs[i][1].split(':')[2].length-1))
                await reaction.message.guild.members.cache.get(user.id).roles.remove(roleList[i]).catch(console.error);
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