const utilities = require('./utilities.js');

//generate list of users who reacted, then choose a random reacter
async function finishRaffle(raffleMessage, raffle, serverRaffles){

    let users = [];

    raffleMessage.reactions.cache.each((reaction) => {
        reaction.users.cache.each((user) => {
            if(!users.includes(user.id)) {
                users.push(user.id)}
        })
    });

    let userMention = '<@!' + users[utilities.getRandomInt(users.length)] + '>';

    removeRaffle(raffle, serverRaffles);

    return await raffleMessage.channel.send(userMention + ' has won the raffle[' + raffle.name + ']!');
}

function removeRaffle(raffle, serverRaffles){
    //cancel the timer
    clearTimeout(raffle.timer)

    //remove from raffles list
    return serverRaffles.splice(serverRaffles.indexOf(raffle), 1);
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
        console.log(daysInMonth);

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

module.exports.finishRaffle = finishRaffle;
module.exports.removeRaffle = removeRaffle;
module.exports.askDate = askDate;
module.exports.isValidRaffleDate = isValidRaffleDate;
module.exports.isToday = isToday;
module.exports.askTime = askTime;
module.exports.isValidRaffleTime = isValidRaffleTime;
module.exports.askTimeZone = askTimeZone;
module.exports.isValidRaffleTimeZone = isValidRaffleTimeZone;