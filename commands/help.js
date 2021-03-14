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
                '`warn`: warns a user from the server, if the user exceeds the max warnings then ban them\n' +
                ''
            );
            
            embed.addField('Role Management and Permissions', 
                '`autorole`: sets a default role for the server, any new members will be granted this role\n' +
                '`listpermissions`: lists the permissions of all roles in the server\n' +
                '`reactionrole`: creates a post which people can react to to give out and take away roles\n' +
                '`setpermissions`: sets the TOA5T permissions of a role\n' +
                ''
            );

            embed.addField('Music and Audio', 
                '`clear`: clears the queue\n' +
                '`join`: joins the voice channel\n' +
                '`leave`: leaves the voice channel\n' +
                '`loop`: sets the current song on loop\n' +
                '`pause`: pause the current audio playlist\n' +
                '`play`: adds a song to the queue and plays the queue\n' +
                '`queue`: returns the current audio playlist\n' +
                '`resume`: resumes a paused playlist\n' +
                '`setmusicrole`: designates a role that can play music\n' +
                '`skip`: skips the current song\n' +
                '`stop`: stops the current song and queue\n' +
                '`volume`: set the volume of the bot\n' +
                ''
            );

            embed.addField('Miscellaneous',
                "`getprefix`: retrieves the server's bot's prefix\n" +
                '`help`: returns this page\n' +
                '`info`: returns information about the bot\n' +
                '`random`: random number generator, can also use item lists\n' +
                "`resetprefix`: resets the bot's prefix to its default\n" +
                "`setprefix`: changes the bot's default prefix\n" +
                ''
            );
        }
        message.channel.send(embed);
    }
}