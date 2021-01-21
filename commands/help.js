module.exports = {
    name: 'help',
    description: 'provides a list of commands',
    execute(message, args, Discord){
        let embed = new Discord.MessageEmbed()
            .setColor('#f7c920')
            .setTitle('Commands List')

        if(args === ''){ //provides a list of commands
            embed.addField('Member Management',
                '`ban`: bans a user from the server\n' +
                '`kick`: kicks a user from the server\n' +
                '`setmaxwarnings`: sets the max amount of warnings a user can get before a ban\n' +
                '`unban`: unbans a user from the server\n' +
                '`warn`: warns a user from the server, if the user exceeds the max warnings then ban them\n'
            );
            
            embed.addField('Role Management', 
                '`autorole`: sets a default role for the server, any new members will be granted this role\n' +
                '`reactionrole`: creates a post which people can react to to give out and take away roles\n' +
                ''
            );

            embed.addField('Miscellaneous',
                '`random`: random number generator, can also use item lists\n' +
                ''
            );
        }
        message.channel.send(embed);
    }
}