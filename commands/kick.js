const utilities = require('../utils/utilities.js');

module.exports = {
    name: 'kick',
    description: 'kicks a user, takes a mention or user id',
    async execute(message, prefix, args){
        args = args.trim();
        //check for user permissions
        if(!message.member.hasPermission('KICK_MEMBERS')){
            message.channel.send("You do not have sufficient permissions to use this command.");
        }
        //sends a message on how to use the command
        else if(args === 'help' || args === ''){
            message.channel.send("To kick a member, use the following format: `" + prefix + this.name + " @user reason[optional]`");
        }
        //continue with the command
        else{
            let user = '';
            let kickReason = '';
            let userId = '';
            let userTag = '';

            //checks if there is a reason for the kick
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
            userTag = message.guild.members.cache.find(member => member.id === userId);
            userTag = userTag?.user.tag;
    
            //if the user exists
            if(userTag !== '' && userTag){
                let kickMessage = userTag + ' has been kicked';
                if(kickReason !== '') kickMessage += ' for "' + kickReason + '"';
    
                await message.channel.send(kickMessage);
                await message.guild.members.cache.find(member => member.id === userId).kick(kickReason);
            }
            //args should be the name of the user
            else{
                message.channel.send(user + ' could not be found, please use either the user Id or a user mention')
            }
        }
    }
}