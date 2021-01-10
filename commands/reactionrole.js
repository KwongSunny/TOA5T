const {Message} = require('discord.js');
const { execute } = require('./reactionrole_destinyraiders');

module.exports = {
    name: 'reactionrole',
    description: "Creates a reaction role message, syntax: '~reactionrole role1:emoji, role2:emoji2, role3:emoji3'",
    async execute(message, args, aws_reactionroles, Discord, client){

        args = args.split(/, +/);
        let roleArgs = [];
        let roleList = [];

        //check for no args
        if(args.length === 0){ 
            message.channel.send("Please add the list of roles you want to be added seperated by spaces using the following format:.\n  `~reactionrole rolename:reaction rolename2:reaction2...`");
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

        //read active reactions, and gives out roles
        // client.on('messageReactionAdd', async(reaction, user) => {
        //     if(reaction.message.partial) await reaction.message.fetch().catch(console.error);
        //     if(reaction.partial) await reaction.fetch().catch(console.error);
        //     if(user.bot) return;
        //     if(!reaction.message.guild) return;
   
        //     if(reaction.message.channel === getRoleChannel){
        //         for(i = 0; i < roleArgs.length; i++)
        //         {
        //             if(reaction.emoji.name === roleArgs[i][1])
        //                 await reaction.message.guild.members.cache.get(user.id).roles.add(roleList[i]).catch(console.error);
        //         }
        //     }
        //     else return;

        // });
        
        //read active reactions, and remove roles
        // client.on('messageReactionRemove', async(reaction, user) => {
        //     if(reaction.message.partial) await reaction.message.fetch().catch(console.error);
        //     if(reaction.partial) await reaction.fetch().catch(console.error);
        //     if(user.bot) return;
        //     if(!reaction.message.guild) return;

        //     if(reaction.message.channel === getRoleChannel){
        //         for(i = 0; i < roleArgs.length; i++)
        //         {
        //             if(reaction.emoji.name === roleArgs[i][1])
        //                 await reaction.message.guild.members.cache.get(user.id).roles.remove(roleList[i]).catch(console.error);
        //         }
        //     }
        //     else return;
        // });
    }
}