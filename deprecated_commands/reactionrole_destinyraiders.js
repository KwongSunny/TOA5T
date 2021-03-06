const { Message } = require('discord.js');

module.exports = {
    name: 'reactionrole_destinyraiders',
    description: '[DEPRECATED - use reactionrole] Creates a reaction role message for a private server.',
    async execute(message, args, Discord, client){
        const channel = message.channel;
        const role1 = message.guild.roles.cache.find(role => role.name === 'Raiders');
        const role2 = message.guild.roles.cache.find(role => role.name === 'Guest');

        const role1Emoji = '🔴';

        let embed = new Discord.MessageEmbed()
            .setColor('#f7c920')
            .setTitle('Pick a Role')
            .setDescription('React below to give yourself a role. \nUnreact to remove your role.\n\n'
                + `${role1Emoji} for Raiders`);
            
        let messageEmbed = await message.channel.send(embed);
        messageEmbed.react(role1Emoji);

        client.on('messageReactionAdd', async(reaction, user) => {
            if(reaction.message.partial) await reaction.message.fetch().catch(console.error);
            if(reaction.partial) await reaction.fetch().catch(console.error);
            if(user.bot) return;
            if(!reaction.message.guild) return;

            if(reaction.message.channel.id == channel){
                if(reaction.emoji.name === role1Emoji)
                    await reaction.message.guild.members.cache.get(user.id).roles.add(role1).catch(console.error);
            }
            else return;

        });
        
        client.on('messageReactionRemove', async(reaction, user) => {
            if(reaction.message.partial) await reaction.message.fetch().catch(console.error);
            if(reaction.partial) await reaction.fetch().catch(console.error);
            if(user.bot) return;
            if(!reaction.message.guild) return;

            if(reaction.message.channel.id == channel){
                if(reaction.emoji.name === role1Emoji)
                    await reaction.message.guild.members.cache.get(user.id).roles.remove(role1).catch(console.error);
            }
            else return;
        });
    }
}