const {Message} = require('discord.js');
const { execute } = require('./reactionrole_destinyraiders');

module.exports = {
    name: 'reactionrole',
    description: 'Creates a reaction role message',
    async execute(message, args, Discord, client){

        //finds the get-role channel
        let getRoleChannel = message.guild.channels.cache.find((cachedChannel) => 
            cachedChannel.name ==='get-role'
        );

        let reactionPost;
        //finds a previous reaction post from a past runtime and syncs up
        client.once('ready', () => {
            reactionPost = getRoleChannel.messages.cache.find((cachedMessage) => 
                cachedMessage.embeds[0].title === 'Pick a role!')
            }
        );

        //asks for roles:reactions
        if(args.length === 0){ 
            getRoleChannel.send("Please add the list of roles you want to be added seperated by spaces using the following format:.\n  `~reactionrole rolename:reaction rolename2:reaction2...`");
        }
        //given roles:reactions
        else{
            let roleArgs = [];
            let roleList = [];

            for(i = 0; i < args.length; i++){
                roleArgs.push(args[i].split(':'));
                roleList.push(message.guild.roles.cache.find(role => role.name === roleArgs[i][0]));
            }

            let embed = new Discord.MessageEmbed()
                .setColor('#6b65e6')
                .setTitle('Pick a role!')
                .setDescription('React below to give yourself a role. \nUnreact to remove your role.\n')
                .addField('reactionRoles', message.content.slice(14));
            for(i = 0; i < roleList.length; i++){
                embed.setDescription(embed.description + '\n' + roleArgs[i][1] + ' for ' + roleArgs[i][0]);
            }

            messageEmbed = await getRoleChannel.send(embed);
            for(i = 0; i < roleArgs.length; i++)
                messageEmbed.react(roleArgs[i][1]);

        }
    }
}