const utilities = require('../utils/utilities.js');

module.exports = {
    name: 'kick',
    description: 'kicks a user, takes a mention',
    async execute(message, prefix, args, Discord){
        args = args.trim();
        //check for user permissions
        if(!message.member.hasPermission('KICK_MEMBERS')){
            return message.channel.send("You do not have sufficient permissions to use this command.");
        }
        //sends a message on how to use the command
        else if(args === 'help' || args === ''){
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Kick')
                .addField('Description', 'Kicks a user')
                .addField('Usage', '`' + prefix + this.name + ' @user`')
                .addField('Advanced Usage', '`' + prefix + this.name + ' @user tags[optional] "reason[optional]"`')
                .addField('Tags', 
                    '`-n`: notify the user of their kick\n' + 
                    '`-m`: include a reason for the kick')
                .addField('Example', 
                    '`' + prefix + this.name + ' @Toast`\n' + 
                    '`' + prefix + this.name + ' @Toast -n -m "spamming chat"`')
                .addField('Related Commands', '`ban`, `unban`, `warn`');
            return message.channel.send(embed);
        }
        //continue with the command
        else{
            let userArg = '';
            let kickReason = '';
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
                    kickReason = args.substring(indexOfMessageAndFlag[0], indexOfMessageAndFlag[1]+1).match(/"(.*?)"/g)[0];

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

            let user = message.guild.members.cache.get(userId);
            //checks if the user is in the guild
            if(!user){
                message.channel.send(userArg + ' could not be found, please use either the user Id or a user mention');
            }
            else {
                //check if the user is an admin, or has the kick_members permission if so then disallow the kick
                if(user.hasPermission('KICK_MEMBERS')){
                    return message.channel.send('You cannot kick this member');
                }
                else{
                    if(kickReason !== '') kickReason = '\nReason: ' + kickReason;
    
                    if(notifyUserFlag) await user.send('You have been kicked from the server: `' + message.guild.name + '`' + kickReason);
                    await message.channel.send('<@!' + userId + '> has been kicked' + kickReason);
                    return message.guild.members.cache.get(userId).kick(kickReason);
                }
            }   
        }
    }
}