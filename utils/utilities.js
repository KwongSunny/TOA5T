//returns a random integer in [0, n-1]
function getRandomInt(n){
    return Math.floor(Math.random()*Math.floor(n));
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

module.exports.getRandomInt = getRandomInt;
module.exports.isNumeric = isNumeric;
module.exports.waitSeconds = waitSeconds;
module.exports.numSuffix = numSuffix;
module.exports.getIndexOfMessageAndFlag = getIndexOfMessageAndFlag;
module.exports.getIndexOfNotifyUserFlag = getIndexOfNotifyUserFlag;
module.exports.isUserMention = isUserMention;
module.exports.isRoleMention = isRoleMention;
module.exports.getRoleId = getRoleId;
module.exports.getUserId = getUserId;