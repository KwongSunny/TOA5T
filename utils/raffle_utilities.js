const utilities = require('./utilities.js');
const aws_utilities = require('./aws_utilities.js');

//check every day and on startup
function checkRaffles(raffles, activeRaffles, client){
    raffles.forEach((raffle) => {
        let raffleEnd = new Date(raffle.year, raffle.month-1, raffle.day, raffle.time.split(':')[0],  raffle.time.split(':')[1]);
        let present = new Date();

        console.log(raffle.message_id, ': ', raffleEnd - present, 'ms away.');
        if(raffleEnd - present < 0){
            console.log('This Raffle is past due. Force conclude it.')
            finishRaffle(raffle, raffles, activeRaffles, client);
        }
        else if(raffleEnd - present < 24 * 60 * 60 * 1000){
            activeRaffles.push(startRaffle(raffle, raffleEnd - present, raffles, activeRaffles, client));
        }


    })
}

//create a timer for the raffle
function startRaffle(raffle, milliseconds, raffles, activeRaffles, client){
    return setTimeout(()=>{
        console.log("Concluding Raffle");
        finishRaffle(raffle, raffles, activeRaffles, client)
    }, milliseconds);
}

//generate list of users who reacted, then choose a random reacter, delete raffle from lists
async function finishRaffle(raffle, raffles, activeRaffles, client){

    //retrieve the raffle message
    const channel = client.channels.cache.get(raffle.channel_id);
    const raffleMessage = await utilities.fetchMessageFromChannel(channel, raffle.message_id);

    //for each reaction, record the users
    const userSet = new Set();
    await utilities.fetchReactionUsers(raffleMessage, null, userSet);

    //remove the bot from the raffles
    userSet.delete(client.user.id);

    const userArr = Array.from(userSet);

    let userMention = '<@!' + userArr[utilities.getRandomInt(userArr.length)] + '>';

    removeRaffle(raffle, raffles, activeRaffles);

    return await raffleMessage.channel.send(userMention + ' has won the raffle [' + raffle.name + ']!');
}

function removeRaffle(raffle, raffles, activeRaffles){
    clearTimeout(raffle.timer);

    let index = 0;
    raffles.forEach((element) => {if(element.message_id === raffle.message_id){raffles.slice(index, 1)}; index++;});
    
    index = 0;
    activeRaffles.forEach((element) => {if(element.message_id === raffle.message_id){activeRaffles.slice(index, 1)}; index++;});

    aws_utilities.deleteRaffle(raffle.message_id);
}

//the user must give an input of dd/mm/yyyy ex: 02/18/2021
function askDate(dmChannel, client){
    return new Promise(async (resolve) => {
        let response = await dmChannel.awaitMessages(m => m.author.id !== client.user.id, {max:1, time: 60000, errors:['time']});

        response = response.last().content;

        if(!isValidRaffleDate(response)){ 
            dmChannel.send('Sorry that is an invalid date, try again.')
            resolve(askDate(dmChannel, client));
        }
        else {
            resolve(response.split('/'));
        }
    });
}

//user response must be in the format dd/mm/yyyy
function isValidRaffleDate(userResponse){
    let dayMonthYear = userResponse.split('/');
    let date = new Date();
    date = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    //check there is a day, month and year
    if(dayMonthYear.length !== 3){
        return false;
    }
    else{
        let day = dayMonthYear[0];
        let month = dayMonthYear[1];
        let year = dayMonthYear[2];
        
        let daysInMonth = new Date(year, month, 0).getDate();

        if(day > daysInMonth){
            return false;
        }

        let userDate = new Date(year, month-1, day);
        //check if userDate is within 30 days
        if(userDate - date > 30 * 24 * 60 * 60 * 1000 || userDate - date < 0){
            return false
        }
    }
    return true;
};

//date comes in form: [day, month, year]
function isToday(date){
    const day = new Date();

    if(day.getFullYear() !== parseInt(date[2])) return false;
    if(day.getMonth()+1 !== parseInt(date[1])) return false;
    if(day.getDate() !== parseInt(date[0])) return false;
    return true;
}

//the user must give an input of hour:min in military time (24 hour clock)
function askTime(dmChannel, isToday, client){

    return new Promise(async (resolve) => {
        let response = await dmChannel.awaitMessages(m => m.author.id !== client.user.id, {max:1, time: 60000, errors:['time']});

        response = response.last().content;

        if(!isValidRaffleTime(response, isToday)){
            dmChannel.send('Sorry that is an invalid time, try again.');
            resolve(askTime(dmChannel, isToday, client));
        }
        else{
            resolve(response);
        }   
    });
}

//time must come in the format hour:min in military time (24 hour clock)
function isValidRaffleTime(userResponse, isToday){
    let hourMinute = userResponse.split(':');
    const today = new Date();

    if(hourMinute.length !== 2){
        return false;        
    }
    else{
        let hour = hourMinute[0];
        let minute = hourMinute[1];

        //check that hour and minute are numbers
        if(!utilities.isNumeric(hour) || !utilities.isNumeric(minute)) return false;

        if(hour > 23  || minute > 59 || hour < 0 || minute < 0) return false;

        //check if the time has passed
        if(isToday){
            let raffleTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, minute);

            if(raffleTime - today < 0) return false;
        }
    }
    return true;
}

function askTimeZone(dmChannel, client){
    return new Promise(async (resolve) => {
        let response = await dmChannel.awaitMessages(m => m.author.id !== client.user.id, {max:1, time: 60000, errors:['time']});

        response = response.last().content;

        if(!isValidRaffleTimeZone(response)){
            dmChannel.send('Sorry that is an invalid time zone, try again.');
            resolve(askTimeZone(dmChannel, client));
        }
        else{
            resolve(response);
        }   
    });
}

function isValidRaffleTimeZone(userResponse){
    const offset = parseInt(userResponse.substring(1));
    if(userResponse[0] === '+' && offset < 15 && offset >= 0) return true;
    else if(userResponse[0] === '-' && offset < 13 && offset >= 0) return true;
    else return false;
}

module.exports.checkRaffles = checkRaffles;
module.exports.finishRaffle = finishRaffle;
module.exports.removeRaffle = removeRaffle;
module.exports.askDate = askDate;
module.exports.isValidRaffleDate = isValidRaffleDate;
module.exports.isToday = isToday;
module.exports.askTime = askTime;
module.exports.isValidRaffleTime = isValidRaffleTime;
module.exports.askTimeZone = askTimeZone;
module.exports.isValidRaffleTimeZone = isValidRaffleTimeZone;