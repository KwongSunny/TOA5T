function getRandomInt(n){ // will return a value from 0 to a - 1
    return Math.floor(Math.random()*Math.floor(n));
}

function isNumeric(n){
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function waitSeconds(s){
    setTimeout(() => {}, s * 1000);
}

module.exports.getRandomInt = getRandomInt;
module.exports.isNumeric = isNumeric;
module.exports.waitSeconds = waitSeconds;