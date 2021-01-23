const utilities = require('../utils/utilities.js');

module.exports = {
    name: 'ban',
    description: 'permanently bans a user, takes a mention or a user Id',
    async execute(message, prefix, args, Discord){
        args = args.trim();
        //checks for user permissions
        if(!message.member.hasPermission('BAN_MEMBERS')){
            message.channel.send("You do not have sufficient permissions to use this command.");
        }
        //sends a message on how to use the command
        else if(args === 'help' || args === ''){
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Ban')
                .setDescription(
                    '**Description:**\n' +
                    'Ban a user\n\n' + 
                    '**Usage:**\n' +
                    '`' + prefix + this.name + ' @user`\n\n' +
                    "**Advanced Usage:**\n" +
                    '`' + prefix + this.name + ' @user tags[optional] "reason[optional]"`\n\n' +
                    '**Tags:**\n' +
                    '`-n`: notify the user of their ban\n' + 
                    '`-m`: include a reason for the ban\n\n' + 
                    '**Example:**\n' +
                    '`' + prefix + this.name + ' @Toast`\n' + 
                    '`' + prefix + this.name + ' @Toast -n -m "spamming chat"`\n\n' +
                    '**reasons must be preceeded with a -m tag and enclosed in quotes**' 
                );
            message.channel.send(embed);
        }
        //continue with the command
        else{
            let userArg = '';
            let banReason = '';
            let userId = '';
            let notifyUserFlag = false;
            let messageFlag = false;

            //split the arguments into userArgs, messageFlag, notifyUserFlag
                //retrieve the indices of the flags and their last index, if there is none then it will be an empty array
                let indexOfMessageAndFlag = utilities.getIndexOfMessageAndFlag(args);
                let indexOfNotifyUserFlag = utilities.getIndexOfNotifyUserFlag(args);

                //checks if there is a message and notify user flag
                messageFlag = (indexOfMessageAndFlag.length > 0);
                notifyUserFlag = (indexOfNotifyUserFlag.length > 0);

                //extracts the kick reason from indices from getIndexOfMessageAndFlag
                if(messageFlag)
                    banReason = args.substring(indexOfMessageAndFlag[0], indexOfMessageAndFlag[1]+1).match(/"(.*?)"/g)[0];

                //get the userArgument
                userArg = args.substring(0, args.search(/>\s|>+$/g)+1);

            //take out the user and flags from arguments, if there is leftover args, then there is uneccesary arguments, return an error to the user
                let strings = [args.substring(indexOfMessageAndFlag[0], indexOfMessageAndFlag[1]+1), userArg, '-n'];
                args = utilities.removeFromString(args, strings);

                if(args.trim() !== ''){
                    message.channel.send('There are invalid arguments: `' + args.trim() + '` please use `' + prefix + this.name + ' help` for more info');
                    return;
                }
    
            //if the user argument is a mention, then parse it to just the ID
            if(utilities.isUserMention(userArg))
                userId = utilities.getUserId(userArg);

            let user = message.guild.members.cache.find(member => member.id === userId);
            //checks if the user exists
            if(!user){
                message.channel.send(userArg + ' could not be found, please use either the user Id or a user mention');
            }
            else {
                //check if the user is an admin, or has the kick_members permission if so then disallow the kick
                if(user.hasPermission('BAN_MEMBERS')){
                    message.channel.send('You cannot ban this member');
                    return;
                }
                else{
                    if(banReason !== '') banReason = '\nReason: ' + banReason;
    
                    if(notifyUserFlag) await user.send('You have been banned from the server: `' + message.guild.name + '`' + banReason);
                    await message.channel.send('<@!' + userId + '> has been banned' + banReason);
                    await message.guild.members.ban(userId, {reason: banReason});
                }
            }   
        }
    }
}