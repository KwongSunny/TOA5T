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
            message.channel.send(
                "To kick a member, use the following format:\n\n`" +
                prefix + this.name + ' @user tags(-n: notify user)[optional] "reason[optional]"`\n\n' +
                'Example: `' + prefix + this.name + ' @Toast -n "spamming chat"`'
            );
        }
        //continue with the command
        else{
            let userArg = '';
            let kickReason = '';
            let userId = '';
            let notifyUser = false;

            //split the ags into user, notifyUser, and kickReason
            if(args.search(/"(.*?)"/) !== -1){
                userArg = args.substring(0, args.indexOf(' '));
                notifyUser = args.indexOf('-n') !== -1;
                kickReason = args.substring(args.search(/"(.*?)"/));
            }
            else{
                if(args.substring(0, args.indexOf(' ') !== -1))
                    userArg = args.substring(0, args.indexOf(' '));
                else userArg = args;
                notifyUser = args.indexOf('-n') !== -1;
            }
    
            //if the user argument is a mention, then parse it to just the ID
            if(utilities.isUserMention(userArg))
                userId = utilities.getUserId(userArg);
            //if the user argument is numeric, it is an id
            else if(utilities.isNumeric(userArg))
                userId = userArg;
            //the user argument is not valid
            else
                message.channel.send(userArg + ' is not a valid id or mention, please try again')

            let user = message.guild.members.cache.find(member => member.id === userId);

            //if the user exists
            if(user){
                //check if the user is an admin, or the caller, if so then cancel the kick
                if(userId === message.author.id || user.hasPermission('KICK_MEMBERS')){
                    message.channel.send('You cannot kick this member');
                    return;
                }
                else{
                    if(kickReason !== '') kickReason = '\nReason: ' + kickReason;
    
                    if(notifyUser) await user.send('You have been kicked from the server: `' + message.guild.name + '`' + kickReason);
                    await message.channel.send(userArg + ' has been kicked' + kickReason);
                    await message.guild.members.cache.find(member => member.id === userId).kick(kickReason);
                }
            }
            else message.channel.send(userArg + ' could not be found, please use either the user Id or a user mention')
        }
    }
}