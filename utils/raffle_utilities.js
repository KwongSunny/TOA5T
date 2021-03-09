const utilities = require('./utilities.js');
const aws_utilities = require('./aws_utilities.js');

//removes past due raffles in the times the bot was offline
function removePastDueRaffles(raffles, client){
    if(raffles){
        let resultRaffles = raffles;

        raffles.forEach((raffle) => {
            const hour = raffle.time.split(':')[0];
            const minute = raffle.time.split(':')[1];
    
            //create a UTC raffle date, displayed in local time
            const raffleEnd = createRaffleDate(raffle.year, raffle.month-1, raffle.day, hour, minute, raffle.timeZone);
    
            let present = new Date();
    
            // console.log('Checking Past Due Raffles');
            // console.log(raffle.name + '(' + raffle.message_id + '): ', raffleEnd - present, 'ms away.');
    
            if(raffleEnd - present < 0){
                console.log('This Raffle is past due. Remove it from the list of raffles. [' + raffle.name + ', ' + raffle.message_id + ']');
    
                if(raffle.raffle_status !== 'complete'){
                    console.log("Ending raffle: " + raffle.name);
                    declareRaffleWinner(raffle, client);
                    raffle.raffle_status = 'complete';
                }
            }
        });
    
        return resultRaffles;
    }
}

//adds raffles to the list of activeRaffles if they end within a day
function activateRaffles(raffles, client){
    let resultRaffles = raffles;

    raffles.forEach((raffle) => {
        if(raffle.timer === null || !raffle.timer){
            const hour = raffle.time.split(':')[0];
            const minute = raffle.time.split(':')[1];
    
            //create a UTC raffle date, displayed in local time
            const raffleEnd = createRaffleDate(raffle.year, raffle.month-1, raffle.day, hour, minute, raffle.timeZone);

            let present = new Date();
    
            // console.log('Activating Raffles');
            // console.log(raffle.name + '(' + raffle.message_id + '): ', raffleEnd - present, 'ms away.');

            //6 hours
            const ms = 6 * 60 * 60 * 1000;

            if(raffleEnd - present < ms && raffle.raffle_status !== 'complete'){
                raffle = startRaffleTimer(raffle, raffleEnd - present, client);
            }
        }
    })
    
    return resultRaffles;
}

//returns the raffle with a timeout
function startRaffleTimer(raffle, milliseconds, client){
    console.log("This Raffle's timer is now being started [" + raffle.name + ', ' + raffle.message_id + ']');
    resultRaffle = raffle;

    resultRaffle.timer = setTimeout(() => {
        console.log("Ending raffle: " + raffle.name);

        declareRaffleWinner(raffle, client);
        raffle.raffle_status = 'complete';
        raffle.timer = null;
        aws_utilities.updateRaffle(raffle.message_id, ['raffle_status'], [raffle.raffle_status]);

    }, milliseconds);

    return resultRaffle;
}

async function declareRaffleWinner(raffle, client){
        //retrieve the raffle message
        const channel = client.channels.cache.get(raffle.channel_id);
        const raffleMessage = await utilities.fetchMessageFromChannel(channel, raffle.message_id);

        //for each reaction, record the users
        const userSet = new Set();
        userSet = await utilities.fetchReactionUsers(raffleMessage, null, userSet);

        //remove the bot from the raffles
        userSet.delete(client.user.id);

        //check if anybody reacted to the raffle
        if(userSet.size === 0){
            return await raffleMessage.channel.send('There was no winner [' + raffle.name + ']');
        }
        else{
            //convert set to array to access a random index
            const userArr = Array.from(userSet);
            let userMention = '<@!' + userArr[utilities.getRandomInt(userArr.length)] + '>';

            return await raffleMessage.channel.send(userMention + ' has won the raffle [' + raffle.name + ']!');
        }
}

//remove completed raffles
function removeCompletedRaffles(raffles){
    const resultRaffles = [];

    //remove completed raffles from the list, and delete from dynamodb
    raffles.forEach((raffle) => {
        if(raffle.raffle_status === 'complete'){
            aws_utilities.deleteRaffle(raffle.message_id);
        }
        else resultRaffles.push(raffle);
    });

    return resultRaffles;
}

//the user must give an input of mm/dd/yyyy ex: 02/18/2021
function askDate(dmChannel, raffle, client){
    return new Promise(async (resolve) => {
        let response = await dmChannel.awaitMessages(m => m.author.id !== client.user.id, {max:1, time: 60000, errors:['time']});

        response = response.last().content;

        if(!isValidRaffleDate(response, raffle)){ 
            dmChannel.send('Sorry that is an invalid date, try again.')
            resolve(askDate(dmChannel, raffle, client));
        }
        else {
            resolve(response.split('/'));
        }
    });
}


// 2.23.2021 - 9:46pm est - If the UTC date is the next day in local time, then this won't work
//user response must be in the format mm/dd/yyyy
function isValidRaffleDate(userResponse, raffle){
    let monthDayYear = userResponse.split('/');
    if(monthDayYear.length !== 3) return false;
    else{
        let month = monthDayYear[0];
        let day = monthDayYear[1];
        let year = monthDayYear[2];

        let daysInMonth = new Date(year, month-1, 0).getUTCDate();
        if(day > daysInMonth){
            return false;
        }

        let date = new Date();
        
        //get utc time offset by timezone
        date = new Date(date.getTime() + (1000 * 60 * 60 * raffle.timeZone));

        //remove hour and minute
        date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

        let userDate = new Date(year, month-1, day);

        if(userDate - date < 0){
            return false;
        }

        return true;
    }
}


//date comes in form: [day, month, year]
function isToday(date){
    const day = new Date();

    if(day.getUTCFullYear() !== parseInt(date[2])) return false;
    if(day.getUTCMonth()+1 !== parseInt(date[1])) return false;
    if(day.getUTCDate() !== parseInt(date[0])) return false;
    return true;
}

//the user must give an input of hour:min in military time (24 hour clock)
function askTime(dmChannel, raffle, client){

    return new Promise(async (resolve) => {
        let response = await dmChannel.awaitMessages(m => m.author.id !== client.user.id, {max:1, time: 60000, errors:['time']});

        response = response.last().content;

        if(!isValidRaffleTime(response, raffle)){
            dmChannel.send('Sorry that is an invalid time, try again.');
            resolve(askTime(dmChannel, raffle, client));
        }
        else{
            resolve(response);
        }   
    });
}

//time must come in the format hour:min in military time (24 hour clock)
function isValidRaffleTime(userResponse, raffle){
    let hourMinute = userResponse.split(':');
    if(hourMinute.length !== 2){
        return false;        
    }
    else{
        let hour = hourMinute[0];
        let minute = hourMinute[1];

        //check that hour and minute are numbers
        if(!utilities.isNumeric(hour) || !utilities.isNumeric(minute)) return false;

        if(hour > 23  || minute > 59 || hour < 0 || minute < 0) return false;

        //Creates a UTC raffle end date, displayed in local time
        const raffleEnd = createRaffleDate(raffle.year, raffle.month-1, raffle.day, hour, minute, raffle.timeZone);

        //creates a UTC date, displayed in local time
        const today = new Date();

        if(raffleEnd - today <= 0) return false;
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

function createRaffleDate(year, month, date, hour, minute, timeZone){
    const raffleEnd = new Date(year, month, date);
    raffleEnd.setUTCHours(parseInt(hour) - parseInt(timeZone));
    raffleEnd.setUTCMinutes(minute);

    return raffleEnd;
}

module.exports.activateRaffles = activateRaffles;
module.exports.removePastDueRaffles = removePastDueRaffles;
module.exports.removeCompletedRaffles = removeCompletedRaffles;
module.exports.askDate = askDate;
module.exports.isValidRaffleDate = isValidRaffleDate;
module.exports.isToday = isToday;
module.exports.askTime = askTime;
module.exports.isValidRaffleTime = isValidRaffleTime;
module.exports.askTimeZone = askTimeZone;
module.exports.isValidRaffleTimeZone = isValidRaffleTimeZone;