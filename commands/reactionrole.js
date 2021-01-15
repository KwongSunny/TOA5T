const {Message} = require('discord.js');
const emojiRegex = require('emoji-regex/RGI_Emoji.js');
const common_library = require('../common_library');

module.exports = {
    name: 'reactionrole',
    description: "Creates a reaction role message, syntax: '~reactionrole role1:emoji, role2:emoji2, role3:emoji3'",
    async execute(message, args, aws_reactionroles, Discord, client){

        args = args.trim().split(/,/);
        args = args.map(element => element.trim());

        const roleArgs = [];
        const roleList = [];
        const guildEmojis = message.guild.emojis.cache.keyArray();

        //check for no args
        if(args[0] === '' || args[0] === 'help'){ 
            message.channel.send("Please use the following format, excluding brackets, to add a reaction roles post:\n`~reactionrole [rolename]:[reaction], [rolename2]:[reaction2]...`\n\nTo reassign a reaction roles post, use command:\n`~reactionrole [message-id]`\n\nUse of custom emojis are currently not supported.");
        }
        //if argument is an id, change the reactionrole_post_id
        else if(args.length === 1 && !args[0].includes(':')){
            if(common_library.isNumeric(args[0])){
                aws_reactionroles.updateItem(message.guild.id, 'reactionrole_post_id', args[0]);
            }
        }
        //there are roles, create a new reaction post
        else if(args[0].includes(':')){
            for(i = 0; i < args.length; i++){
                let arr = [];
                arr.push(args[i].substring(0, args[i].indexOf(':')));
                arr.push(args[i].substring(args[i].indexOf(':')+1));
        
                roleArgs.push(arr);
                roleList.push(message.guild.roles.cache.find(role => role.name === roleArgs[i][0]));
            }
            let embed = new Discord.MessageEmbed()
                .setColor('#6b65e6')
                .setTitle('Pick a Role')
                .setDescription('React below to give yourself a role. \nUnreact to remove your role.\n')
            
            let rolesField = '';
            for(i = 0; i < roleArgs.length; i++){
                const roleName = roleArgs[i][0]
                const emoji= roleArgs[i][1]
                console.log(`roleName: `,roleName );
                console.log(`emoji: `,emoji );

                const regex = emojiRegex();

                if(regex.test(emoji)){
                    rolesField = rolesField + '\n' + emoji + ' for ' + roleName;
                }
                else { 
                    message.channel.send(`${emoji} is an invalid emoji, try again with different emojis`);
                }
            }
            embed.addField('Roles', rolesField);

            //send the message and it's reactions
            messageEmbed = await message.channel.send(embed);
            for(i = 0; i < roleArgs.length; i++){
                messageEmbed.react(roleArgs[i][1]);
        
                let commandPrefix = '~reactionrole ';
                aws_reactionroles.writeItem(message.guild.id.toString(), messageEmbed.id.toString(), messageEmbed.channel.id.toString(), message.content.slice(commandPrefix.length).trim());
            }
        }
    }
}