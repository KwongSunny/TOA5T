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
module.exports.isUserMention = isUserMention;
module.exports.isRoleMention = isRoleMention;
module.exports.getRoleId = getRoleId;
module.exports.getUserId = getUserId;