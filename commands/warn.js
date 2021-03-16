const aws_utilities = require('../utils/aws_utilities.js');
const utilities = require('../utils/utilities.js');

module.exports = {
    name: 'warn',
    description: "warns a user, if the user has too many warnings they will get banned, default max warnings: 2, items in database: '<@!user_id>:current_warns:total_warns'",
    async execute(param){
        const message = param.message;
        const prefix = param.prefix;
        let args = param.args;
        const Discord = param.Discord;
        
        args = args.trim();

        //check for user permissions
        if(!message.member.hasPermission('BAN_MEMBERS')){
            return message.channel.send("You do not have sufficient permissions to use this command.");
        }
        //sends a message on how to use the command if no args or args is help
        else if(args === 'help' || args === ''){
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Warn')
                .addField('Description', 'Warn a user for an offense; the default max warnings is 2 before a ban')
                .addField('Usage', '`' + prefix + this.name + ' @user "warning[optional]"`')
                .addField('Example',
                    '`' + prefix + this.name + ' @Toast`\n' +
                    '`' + prefix + this.name + ' @Toast "spam"`')
                .addField('Related Commands', '`ban`, `kick`, `setmaxwarnings`, `unban`');
            message.channel.send(embed);
        }
        //check for user and reason
        else{
            const defaultMaxWarnings = 2;
            let userArg = '';
            let warnReason = '';
            let userId = '';

            // console.log('reason: ');
            // console.log(args.match(/"(.*?)"/g));

            //split the args into user and warnReason
                if(args.search(/"(.*?)"/g) !== -1){
                    userArg = args.substring(0, args.indexOf(' '));
                    warnReason = args.match(/"(.*?)"/g)[0];
                }
                else{
                    if(args.indexOf(' ') !== -1)
                    userArg = args.substring(0, args.indexOf(' '));
                    else userArg = args;
                }

            //take our the user and warnReason, if there is leftover then there are uneccesary arguments, return an error to the user
                let strings = [warnReason, userArg];
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
                message.channel.send(userArg + ' is not a member of the server, please check to make sure you have the correct user');
            }
            //the user exists in the guild, continue with warning
            else{
                //if the user has the ban_members perm, they cannot be warned/banned
                if(user.hasPermission('BAN_MEMBERS')) return message.channel.send('You cannot warn this member');

                let maxWarnings = defaultMaxWarnings;
                let currentWarnings = 1;
                let banned = false;

                const server = await aws_utilities.fetchServer(message.guild.id);
                //if the server exists, add a warning count to the user, if the user has over the max amount of warnings, ban the user
                if(server){
                    let warnedUsers = server.Item.warned_users;
                    maxWarnings = server.Item.max_warnings;

                    //if the warned_users does not exist, then create a new warned_users
                    if(!warnedUsers || warnedUsers === undefined){
                        warnedUsers = [userId + ':' + currentWarnings + ':1'];
                    }
                    else{
                        //look for the user in the warnedUsers list
                        let found = false;
                        for(warnedUser = 0; warnedUser < warnedUsers.length; warnedUser++){
                            let split = warnedUsers[warnedUser].split(':');

                            let splitUserId = split[0];
                            currentWarnings = split[1];
                            let totalWarnings = split[2];

                            //user is found, increment their warnings, if their warnings exceed max warnings, ban them
                            if(splitUserId === userId){
                                found = true;
                                currentWarnings = parseInt(currentWarnings) + 1;
                                totalWarnings = parseInt(totalWarnings) + 1; 

                                //ban the user if their warnings exceed max warnings and reset their current warnings
                                if(currentWarnings > maxWarnings)  
                                {
                                    currentWarnings = maxWarnings;
                                    banned = true;
                                    await message.guild.members.ban(userId, {reason: 'This user has exceeded the maximum amount of warnings'});
                                }
                                warnedUsers[warnedUser] = userId + ':' + currentWarnings + ':' + totalWarnings;
                                break;
                            }
                        }
                        //if the users not found, add the user, a long with one warning count
                        if(!found){
                            warnedUsers.push(userId + ':' + currentWarnings + ':1');
                        }
                    }

                    //update the item
                    let keys = ['warned_users', 'max_warnings', 'server_name'];
                    let values = [warnedUsers, maxWarnings, message.guild.name];
                    aws_utilities.updateItem(message.guild.id, keys, values); 
                }
                //if the server does not exist, write a new item, set the default max warns to 2
                else{
                    aws_utilities.writeItem(message.guild);

                    let keys = ['warned_users', 'max_warnings', 'server_name'];
                    let values = [[userId + ':1:1'], defaultMaxWarnings, message.guild.name];
                    aws_utilities.updateItem(message.guild.id, keys, values); 
                }

                //sends a direct message to the user about their warning/ban and a message to the channel
                let directMessage = '';
                let channelMessage = '';
                if(!banned){
                    directMessage = 'You have been given a warning in the server: `' + message.guild.name + '`, this is your ' + currentWarnings + utilities.numSuffix(currentWarnings) + ' warning out of ' + maxWarnings;
                    channelMessage = '<@!' + userId + '> has been given their ' + currentWarnings + utilities.numSuffix(currentWarnings) + ' warning';
                }
                else{
                    directMessage = 'You have been banned from the server: `' + message.guild.name + '` for exceeding the maximum amount of warnings';
                    channelMessage = '<@!' + userId + '> has been banned from the server for exceeding the maximum amount of warnings'
                }

                if(warnReason !== ''){
                    directMessage += '\nReason: ' + warnReason;
                    channelMessage += '\nReason: ' + warnReason;
                }
                await user.send(directMessage);
                return message.channel.send(channelMessage);
            }
        }
    }
}