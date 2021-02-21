//returns a random integer in [0, n-1]
function getRandomInt(n){
    let rand = Math.random()*Math.floor(n);
    return Math.floor(rand);
}

//returns a boolean, checks whether n is a number or not
function isNumeric(n){
    return !isNaN(parseFloat(n)) && isFinite(n);
}

//time delay for s seconds
function waitSeconds(s){
    setTimeout(() => {}, s * 1000);
}

//returns a string suffix of the number n
function numSuffix(n){
    const remainder = n % 10;
    
    if(remainder === 1) return 'st';
    else if(remainder === 2) return 'nd';
    else if(remainder === 3) return 'rd';
    else return 'th';
}

//removes strings from str and returns the leftover
//str : the string to be removed from
//removals : [] values of string that will be removed
function removeFromString(str, removals){
    result = str;

    for(value = 0; value < removals.length; value++){
        result = result.replace(removals[value], '');
    }

    return result;
}

//converts time to minutes, comes in m,d,h
function convertToMinutes(time){
    const unit = time.match(/[mhd]/g);
    let amount = time.match(/\d+/g);

    if(unit === 'h'){
        amount = amount * 60;
    }
    else if(unit === 'd'){
        amount = amount * 60 * 24;
    }
    return amount;
}

//checks the string if it contains a message flag and a message (-m "message")
//if it has more than one or no matches, then return []
//returns an array [startIndex, lastIndex] of the flag and message
function getIndexOfMessageAndFlag(str){
    let results = str.match(/ -m\s+".*?"/);

    if(!results || results.length !== 1)
    {
        return [];
    }
    else{
        return [str.indexOf('-m'), str.substring(str.indexOf('"')+1).indexOf('"') + str.indexOf('"')+1];
    }
}

//checks the string if it contains a notify user flag
//if it there is no match, then return []
//returns an array [startIndex, lastIndex] of the flag
function getIndexOfNotifyUserFlag(str){
    let results = str.match(/ -n\s| -n+$/);

    if(!results || results.length !== 1){
        return [];
    }
    else{
        return [str.indexOf('-n'), str.indexOf('-n')+1];
    }
}

//function that takes in a user mention and return T/F if it is a valid mention
function isUserMention(mention){
    let result = mention.trim();
    return result[0] === '<' && result[1] === '@' && result[2] === '!';
}

//function that takes in a role mention and returns T/F if it is a valid mention
function isRoleMention(mention){
    let result = mention.trim();
    return result[0] === '<' && result[1] === '@' && result[2] === '&';
}

//function that takes in a role mention and returns the id
//<@$000000000001> returns id
function getRoleId(roleMention){
    let result = roleMention.trim();
    return result.substring(3, result.length-1);
}

//function that takes in a user mention and returns the id
//<@!000000000001> returns id
function getUserId(userMention){
    let result = userMention.trim();
    return result.substring(3, result.length-1);
}

function getDaysInMonth(month, year){
    return new Date(year, month, 0).getDate();
}

//looks for and fetches a message in a server by id
async function fetchMessageFromGuild(guild, messageId){
    return new Promise((resolve, reject) => {
        let channels = guild.channels.cache;
        channels.each(async channel => {
            let messageManager = channel.messages;
            if(messageManager){
                try {
                    let fetchedMessage = await channel.messages.fetch(messageId);
                    if(fetchedMessage) resolve(fetchedMessage);
                }catch(e){
                    if(e.message !== 'Unknown Message')
                        reject(e);
                }
            }
        });
    });
}

//looks for and fetches a message in a server by id
async function fetchMessageFromChannel(channel, messageId){
    return new Promise(async (resolve, reject) => {
        let messageManager = channel.messages;
        if(messageManager){
            try {
                let fetchedMessage = await channel.messages.fetch(messageId);
                if(fetchedMessage) resolve(fetchedMessage);
            }catch(e){
                if(e.message !== 'Unknown Message')
                    reject(e);
            }
        }
    });
}

//requires a set for items to be placed into
//returns a promise, recursively fetches reactions and puts the results in resultSet
function fetchReactionUsers(message, lastFetchedUser, resultSet){
    return new Promise(async (resolve) => {
        const fetchLimit = 100;
        message.reactions.cache.each(async (reaction) => {
            const fetchedReaction = await reaction.fetch();
            const fetchedUsers = await fetchedReaction.users.fetch({limit: fetchLimit, after: lastFetchedUser});
            
            const userArray = fetchedUsers.keyArray();
            userArray.forEach((user) => {
                resultSet.add(user)
            });

            if(fetchedUsers.size === fetchLimit){
                resolve(await fetchReactionUsers(message, fetchedUsers.last(1)[0].id, resultSet));
            }
            else{
                resolve();
            }
        })
    })
}

//turns utc offset to ms offset
function hourToMs(offset){
    return offset * 60 * 60 * 1000;
}

module.exports.getRandomInt = getRandomInt;
module.exports.isNumeric = isNumeric;
module.exports.waitSeconds = waitSeconds;
module.exports.numSuffix = numSuffix;
module.exports.convertToMinutes = convertToMinutes;
module.exports.removeFromString = removeFromString;
module.exports.getIndexOfMessageAndFlag = getIndexOfMessageAndFlag;
module.exports.getIndexOfNotifyUserFlag = getIndexOfNotifyUserFlag;
module.exports.isUserMention = isUserMention;
module.exports.isRoleMention = isRoleMention;
module.exports.getRoleId = getRoleId;
module.exports.getUserId = getUserId;
module.exports.getDaysInMonth = getDaysInMonth;
module.exports.fetchMessageFromGuild = fetchMessageFromGuild;
module.exports.fetchMessageFromChannel = fetchMessageFromChannel;
module.exports.fetchReactionUsers = fetchReactionUsers;
module.exports.hourToMs = hourToMs