const utilities = require('../utils/utilities.js');

module.exports = {
    name: 'unban',
    description: 'unbans a user, only takes a user Id',
    async execute(message, prefix, args){
        args = args.trim();
        //checks for user permissions
        if(!message.member.hasPermission('BAN_MEMBERS')){
            message.channel.send("You do not have sufficient permissions to use this command.");
        }
        //sends a message on how to use the command
        else if(args === 'help' || args === ''){
            message.channel.send("To unban a member, use the following format: `" + prefix + this.name + " userId reason[optional]`");
        }
        //continue with the command
        else{
            let user = '';
            let unbanReason = '';
            let userId = '';
            let userTag = '';

            //checks if there is a reason for the ban
            if(args.includes(' ')){
                user = args.substring(0, args.indexOf(' '));
                reason = args.substring(args.indexOf(' ')).trim();
            }
            else{
                user = args;
            }
    
            //if the args is numeric, it is an id
            if(utilities.isNumeric(user))
                userId = user;
            userTag = await message.guild.fetchBans();

            userTag = userTag.keyArray();
    
            //checks if the user exists
            if(userTag.includes(userId)){
                let unbanMessage = userTag + ' has been unbanned';
                if(unbanReason !== '') unbanMessage += ' for "' + unbanReason + '"';
    
                await message.channel.send(unbanMessage);
                message.guild.members.unban(userId, unbanReason);
            }
            //user could not be found in the bans
            else{
                message.channel.send(user + ' could not be found in the bans list, check you have the correct Id')
            }
        }
    }
}