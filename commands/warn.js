const aws_utilities = require('../utils/aws_utilities.js');
const utilities = require('../utils/utilities.js');

module.exports = {
    name: 'warn',
    description: "warns a user, if the user has too many warnings they will get banned, default max warnings: 2, items in database: '<@!user_id>:current_warns:total_warns'",
    async execute(message, prefix, args){
        args = args.trim();

        //check for user permissions
        if(!message.member.hasPermission('BAN_MEMBERS')){
            message.channel.send("You do not have sufficient permissions to use this command.");
        }
        //sends a message on how to use the command if no args or args is help
        else if(args === 'help' || args === ''){
            message.channel.send("To warn a member, use the following format:\n\n`" + prefix + this.name + " @user reason[optional]`\n\nThe default maximum warnings is 2 before a ban; to change this maximum, use:\n\n`" + prefix + "setmaxwarnings number`");
        }
        //check for user and reason
        else{
            const defaultMaxWarnings = 2;
            let user = '';
            let warnReason = '';
            
            //checks if there is a reason for the warning
            if(args.includes(' ')){
                user = args.substring(0, args.indexOf(' '));
                warnReason = args.substring(args.indexOf(' ')).trim();
            }
            else{
                user = args;
            }

            //parses the user into to userId
            let userId = '';
            if(utilities.isUserMention(user))
                userId = utilities.getUserId(user);
            else if(utilities.isNumeric(user))
                userId = user;


            //checks if the user is in the guild
            if(!message.guild.members.cache.find(member => member.id === userId)){
                message.channel.send(user + ' is not a member of the server, please check to make sure you have the correct user')
                return;
            }
            //the user exists in the guild, continue with warning
            else{
                let userItem = message.guild.members.cache.get(userId);
                let maxWarnings;
                let currentWarnings = 0;
                let banned = false;

                const server = await aws_utilities.getItem(message.guild.id);
                //if the server exists, add a warning count to the user, if the user has over the max amount of warnings, ban the user
                if(server){
                    let warnedUsers = server.Item.warned_users;
                    maxWarnings = server.Item.max_warnings;

                    //if the server does not have a max warnings, set it to the default
                    if(!maxWarnings || maxWarnings === ''){
                        maxWarnings = defaultMaxWarnings;
                    }

                    //if the warned_users does not exist, then create a new warned_users
                    if(!warnedUsers || warnedUsers === undefined){
                        warnedUsers = [userId + ':1:1'];
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
                            warnedUsers.push(userId + ':1:1');
                            currentWarnings = 1;
                        }
                    }

                    let keys = ['warned_users', 'max_warnings'];
                    let values = [warnedUsers, maxWarnings];
                    aws_utilities.updateItem(message.guild.id, keys, values); 
                }
                //if the server does not exist, write a new item, set the default max warns to 2
                else{
                    aws_utilities.writeItem(message.guild.id);

                    let keys = ['warned_users', 'max_warnings'];
                    let values = [[userId + ':1:1'], defaultMaxWarnings];
                    aws_utilities.updateItem(message.guild.id, keys, values); 
                }

                //sends a direct message to the user about their warning/ban and a message to the channel
                let directMessage = '';
                let channelMessage = '';
                if(!banned){
                    directMessage = 'You have been given a warning in the server: ' + message.guild.name + ', this is your ' + currentWarnings + utilities.numSuffix(currentWarnings) + ' warning out of ' + maxWarnings;
                    channelMessage = '<@!' + userId + '> has been given their ' + currentWarnings + utilities.numSuffix(currentWarnings) + ' warning';
                }
                else{
                    directMessage = 'You have been banned from the server: ' + message.guild.name + ' for exceeding the maximum amount of warnings';
                    channelMessage = '<@!' + userId + '> has been banned from the server for exceeding the maximum amount of warnings'
                }

                if(warnReason !== ''){
                    directMessage += '\n\nReason: ' + warnReason;
                    channelMessage += '\n\nReason: ' + warnReason;
                }
                await userItem.send(directMessage);
                message.channel.send(channelMessage);

            }
        }
    }
}