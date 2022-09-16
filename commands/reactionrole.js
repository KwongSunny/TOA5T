const emojiRegex = require('emoji-regex/RGI_Emoji.js');
const utilities = require('../utils/utilities');
const rr_utilities = require('../utils/reactionrole_utilities.js');
const aws_utilities = require('../utils/aws_utilities.js');

module.exports = {
    name: 'reactionrole',
    description: "Creates a reaction role message, syntax: '~reactionrole role1:emoji, role2:emoji2, role3:emoji3'",
    async execute(param){
        const message = param.message;
        const prefix = param.prefix;
        let args = param.args;
        const Discord = param.Discord;

        args = args.trim().split(',');
        args = args.map(element => element.trim());

        const guildEmojis = message.guild.emojis.cache.keyArray();

        //check for the user's permissions
        if(!message.member.hasPermission('MANAGE_ROLES')){
            return message.channel.send("You do not have sufficient permissions to use this command.");
        }
        //check for no arguments or if user is asking for help
        else if(args[0] === '' || args[0] === 'help'){ 
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Reaction Roles')
                .addField('Description', 'Creates a reaction post which assigns roles based on user reactions')
                .addField('Usage', 
                    'To create a post use the format:\n `' + prefix + this.name + ' @role:reaction, @role2:reaction2...`\n\n' +
                    'To reassign a reaction post use:\n `' + prefix + this.name + ' messageId`'
                )
                .addField('Related Commands', '`autorole`')
            message.channel.send(embed);
        }
        //if argument is an id, change the reactionrole_post_id
        else if(args.length === 1 && !args[0].includes(':')){
            if(utilities.isNumeric(args[0])){
                aws_utilities.updateItem(message.guild.id, ['reactionrole_post_id', 'server_name'], [args[0], message.guild.name]);
                const server = await aws_utilities.fetchServer(message.guild.id);

                let roleArgs;
                if(server && server.Item.reaction_roles) {
                    console.log("B");
                    roleArgs = rr_utilities.splitReactionArgs(server.Item.reaction_roles.split(','));
                }

                const messageEmbed = await utilities.fetchMessageFromGuild(message.guild, args[0]);
                console.log(messageEmbed);
                for(roleMention = 0; roleMention < roleArgs.length; roleMention++){
                    messageEmbed.react(roleArgs[roleMention][1]);
                }
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
            
            //creates a text field of all the reactions on the embed, also tests to see if emojis and roles are valid
            let rolesField = '';
            for(roleArg = 0; roleArg < roleArgs.length; roleArg++){
                const roleMention = roleArgs[roleArg][0];
                const emoji= roleArgs[roleArg][1];
                let roleId = '';

                //checks whether the role is a mention or id else return an error
                if(utilities.isRoleMention(roleMention) && roleMention !== '@everyone'){
                    roleId = utilities.getRoleId(roleMention);
                }
                else if(utilities.isNumeric(roleMention)){
                    roleId = roleMention;
                }
                else{
                    message.channel.send(roleMention + ' is not a valid role, please use a role mention or id');
                    return;
                }

                //instance of an emoji regex to be tested against the emoji being used for the reaction role
                const regex = emojiRegex();

                //checks if the role exists in the guild
                const guildRoleExists = message.guild.roles.cache.get(roleId) !== undefined;

                //check if the emoji is a valid emoji or guild emoji and the role exists
                if(!guildRoleExists){
                    message.channel.send(`${roleMention} is an invalid role, please check your spelling and casing`);
                    return;
                }
                else if(!regex.test(emoji) && !guildEmojis.includes(emoji.split(':')[2].substring(0, emoji.split(':')[2].length-1))){
                    message.channel.send(`${emoji} is an invalid emoji, try again with different emojis`);
                    return;
                }
                else
                    rolesField = rolesField + '\n' + emoji + ' for ' + '<@&' + roleId +'>';
            }
            embed.addField('Roles', rolesField);

            //send the message and it's reactions
            messageEmbed = await message.channel.send(embed);
            for(roleMention = 0; roleMention < roleArgs.length; roleMention++){
                messageEmbed.react(roleArgs[roleMention][1]);
            }

            let commandPrefix = prefix + this.name;
            let item = await aws_utilities.fetchServer(message.guild.id);
            let keys;
            let values;

            //if server is in the database, update the item
            if(item){
                keys = ['reactionrole_post_id', 'reaction_roles', 'server_name'];
                values = [messageEmbed.id, message.content.slice(commandPrefix.length).trim(), message.guild.name];
                aws_utilities.updateItem(message.guild.id, keys, values);
            }
            //if the server is not in the database, write a new item
            else{
                aws_utilities.writeItem(message.guild);
                keys = ['reactionrole_post_id', 'reaction_roles', 'server_name'];
                values = [messageEmbed.id, message.content.slice(commandPrefix.length).trim(), message.guild.name];
                aws_utilities.updateItem(message.guild.id, keys, values);
            }
        }
        else message.channel.send("Incorrect usage of reactionrole, please use `~reactionrole help` for instructions on how to use it.");
    }
}