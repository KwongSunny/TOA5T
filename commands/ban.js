const utilities = require('../utils/utilities.js');

module.exports = {
    name: 'ban',
    description: 'permanently bans a user, takes a mention or a user',
    async execute(message, args){
        args = args.trim();
        let user = '';
        let banReason = '';
        let userId = '';
        let userTag = '';

        if(args.includes(' ')){
            user = args.substring(0, args.indexOf(' '));
            reason = args.substring(args.indexOf(' ')).trim();
        }
        else{
            user = args;
        }

        //if the args is a mention, then parse it to just the ID
        if(utilities.isUserMention(user))
            userId = utilities.getUserId(user);
        //if the args is numeric, it is an id
        else if(utilities.isNumeric(user))
            userId = user;
        userTag = message.guild.members.cache.find(member => member.id === userId)?.user.tag;

        if(userTag !== '' && userTag){
            let banMessage = userTag + ' has been banned';
            if(banReason !== '') banMessage += ' for "' + banReason + '"';
            
            await message.channel.send(banMessage);
            await message.guild.members.ban(userId, {reason: banReason});
        }
        //args should be the name of the user
        else{
            message.channel.send(user + ' could not be found, please use either the user Id or a user mention')
        }
    }
}