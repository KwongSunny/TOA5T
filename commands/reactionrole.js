const {Message} = require('discord.js');
const { execute } = require('./reactionrole_destinyraiders');

module.exports = {
    name: 'reactionrole',
    description: "Creates a reaction role message, syntax: '~reactionrole role1:emoji, role2:emoji2, role3:emoji3'",
    async execute(message, args, aws_reactionroles, Discord, client){

        args = args.trim().split(/, +/);
        let roleArgs = [];
        let roleList = [];
        console.log(args);

        //check for no args
        if(args.length === 0){ 
            message.channel.send("Please add the list of roles you want to be added seperated by spaces using the following format:.\n  `~reactionrole rolename:reaction rolename2:reaction2...`\n\n Use of custom emojis are currently not supported.");
        }
        //there are args, create a new reactionrole post
        else{
            for(i = 0; i < args.length; i++){
                roleArgs.push(args[i].split(':'));
                roleList.push(message.guild.roles.cache.find(role => role.name === roleArgs[i][0]));
            }

            let embed = new Discord.MessageEmbed()
                .setColor('#6b65e6')
                .setTitle('Pick a Role')
                .setDescription('React below to give yourself a role. \nUnreact to remove your role.\n')
            
            let rolesField = '';
            for(i = 0; i < roleList.length; i++){
                rolesField = rolesField + '\n' + roleArgs[i][1] + ' for ' + roleArgs[i][0];
            }
            embed.addField('Roles', rolesField);

            //send the message and it's reaction roles
            messageEmbed = await message.channel.send(embed);
            for(i = 0; i < roleArgs.length; i++)
                messageEmbed.react(roleArgs[i][1]);

            let commandPrefix = '~reactionrole ';
            aws_reactionroles.writeItem(message.guild.id.toString(), messageEmbed.id.toString(), message.content.slice(commandPrefix.length));

        }
    }
}