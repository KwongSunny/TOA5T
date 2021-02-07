const aws_utilities = require('./aws_utilities.js');
const fs = require('fs');
const warn = require('../commands/warn.js');

function filterMessage(message){
    const filterDegree = 'NONE';
    
    let warnUser = false;

    if(checkCaseFilter(message, filterDegree)) warnUser = true;

    if(warnUser) warn.execute(message, '~', '<@!' + message.author.id + '> "Triggered the auto chat filter"');
}

//checks to see if the message surpasses the limited all caps filter
function checkCaseFilter(message, filterDegree){
    const messageLength = message.content.length;

    //percentage of text needed to be uppercase for each filter level, the more severe the less leniency
    const highPercentage = 0.4;
    const mediumPercentage = 0.5;
    const lowPercentage = 0.7;

    //length of text needed for each filter level, the more severe the less leniency
    const highMessageLength = 10;
    const mediumMessageLength = 20;
    const lowMessageLength = 40;

    let count = 0;
    for(letter = 0; letter < message.content.length; letter++)
    {  
        if(isUpperCase(message.content[letter])) count++;
    }

    if(filterDegree === 'HIGH' && count/messageLength > highPercentage && messageLength > highMessageLength) return true;

    else if(filterDegree === 'MEDIUM' && count/messageLength > mediumPercentage && messageLength > mediumMessageLength) return true;

    else if(filterDegree === 'LOW' && count/messageLength > lowPercentage && messageLength > lowMessageLength) return true;

    else return false;
}

//check the message for profanity
function checkProfanityFilter(message, filterDegree){
    return false;
}

//Caesar Cipher
function caesarShift(word, amount){
    let shiftedWord = '';
    for(letter = 0; letter < word.length; letter++){

        let charCode = word.charCodeAt(letter);

        if(word[letter].match(/[a-z]/)){
            charCode += amount;
            if(charCode > 122){
                charCode -= 26;
            }
        }
        else if(word[letter].match(/[A-Z]/)){
            charCode += amount;
            if(charCode > 90){
                charCode -= 26;
            }
        }

        let newLetter = String.fromCharCode(charCode);

        shiftedWord += newLetter;
    }
    return shiftedWord;
}

function isUpperCase(str){
    return str === str.toUpperCase();
}

module.exports.filterMessage = filterMessage;