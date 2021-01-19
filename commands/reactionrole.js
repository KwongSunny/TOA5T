const {Message} = require('discord.js');
const emojiRegex = require('emoji-regex/RGI_Emoji.js');
const common_library = require('../utils/utilities');
const rr_utilities = require('../utils/reactionrole_utilities.js');
const aws_utilities = require('../utils/aws_utilities.js');

module.exports = {
    name: 'reactionrole',
    description: "Creates a reaction role message, syntax: '~reactionrole role1:emoji, role2:emoji2, role3:emoji3'",
    async execute(message, prefix, args, Discord, client){
        args = args.trim().split(',');
        args = args.map(element => element.trim());

        const guildEmojis = message.guild.emojis.cache.keyArray();

        //check for the user's permissions
        if(!message.member.hasPermission('MANAGE_ROLES')){
            message.channel.send("You do not have sufficient permissions to use this command.");
        }
        //check for no arguments or if user is asking for help
        else if(args[0] === '' || args[0] === 'help'){ 
            message.channel.send("Please use the following format, excluding brackets, to add a reaction roles post:\n`~reactionrole rolename:reaction, rolename2:reaction2...`\n\nTo reassign a reaction roles post, use command:\n`~reactionrole message-id`\n\nUse of custom emojis are currently not supported.");
        }
        //if argument is an id, change the reactionrole_post_id
        else if(args.length === 1 && !args[0].includes(':')){
            if(common_library.isNumeric(args[0])){
                aws_utilities.updateItem(message.guild.id, 'reactionrole_post_id', args[0]);
            }
        }
        //there are roles, create a new reaction post
        else if(args[0].includes(':')){
            //split the args array items into an array of [role, emoji] items
            const roleArgs = rr_utilities.splitReactionArgs(args);

            //create embed to be sent later
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Pick a Role')
                .setDescription('React below to give yourself a role. \nUnreact to remove your role.\n')
            
            //creates a text field of all the reactions on the embed, also tests to see if emojis are valid
            let rolesField = '';
            for(roleArg = 0; roleArg < roleArgs.length; roleArg++){
                const roleName = roleArgs[roleArg][0];
                const emoji= roleArgs[roleArg][1];

                //instance of an emoji regex to be tested against the emoji being used for the reaction role
                let regex = emojiRegex();

                //checks if the role exists in the guild
                let guildRoleExists = message.guild.roles.cache.find(role => role.name === roleName) !== undefined;

                //check if the emoji is a valid emoji or guild emoji and the role exists
                if(!guildRoleExists){
                    message.channel.send(`${roleName} is an invalid role, please check your spelling and casing`);
                    return;
                }
                else if(!regex.test(emoji) && !guildEmojis.includes(emoji.split(':')[2].substring(0, emoji.split(':')[2].length-1))){
                    message.channel.send(`${emoji} is an invalid emoji, try again with different emojis`);
                    return;
                }
                else rolesField = rolesField + '\n' + emoji + ' for ' + roleName;
            }
            embed.addField('Roles', rolesField);

            //send the message and it's reactions
            messageEmbed = await message.channel.send(embed);
            for(roleArg = 0; roleArg < roleArgs.length; roleArg++){
                messageEmbed.react(roleArgs[roleArg][1]);
            }

            let commandPrefix = prefix + this.name;
            let item = await aws_utilities.getItem(message.guild.id);

            //if server is in the database, update the item
            if(item){
                let keys = ['reactionrole_post_id', 'reactionrole_channel_id', 'reaction_roles'];
                let values = [messageEmbed.id.toString(), messageEmbed.channel.id.toString(), message.content.slice(commandPrefix.length).trim()];
                aws_utilities.updateItem(message.guild.id, keys, values);
            }
            //if the server is not in the database, write a new item
            else{
                aws_utilities.writeItem(message.guild.id.toString(), messageEmbed.id.toString(), messageEmbed.channel.id.toString(), message.content.slice(commandPrefix.length).trim(), '');
            }
        }
        else message.channel.send("Incorrect usage of reactionrole, please use `~reactionrole help` for instructions on how to use it.");
    }
}