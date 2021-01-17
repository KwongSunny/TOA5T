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

module.exports.getRandomInt = getRandomInt;
module.exports.isNumeric = isNumeric;
module.exports.waitSeconds = waitSeconds;