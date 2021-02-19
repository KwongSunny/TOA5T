const utilities = require('../utils/utilities.js');

//generate list of users who reacted, then choose a random reacter
const finishRaffle = async (raffleMessage, raffle, serverRaffles) => {

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

const removeRaffle = (raffle, serverRaffles) => {
    //cancel the timer
    clearTimeout(raffle.timer)

    //remove from raffles list
    return serverRaffles.splice(serverRaffles.indexOf(raffle), 1);
}

//the user must give an input of dd/mm/yyyy ex: 02/18/2021
const askDate = (dmChannel) => {
    return new Promise(async (resolve) => {
        let response = await dmChannel.awaitMessages(m => m, {max:2, time: 60000, errors:['time']});

        response = response.last().content;

        if(!isValidRaffleDate(response)){ 
            dmChannel.send('Sorry that is an invalid date, try again.')
            resolve(askDate(dmChannel));
        }
        else {
            resolve(response.split('/'));
        }
    });
}

//user response must be in the format dd/mm/yyyy
const isValidRaffleDate = (userResponse) => {
    let dayMonthYear = userResponse.split('/');
    let date = new Date();
    date = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if(dayMonthYear.length !== 3){
        return false;
    }
    else{
        let day = dayMonthYear[0];
        let month = dayMonthYear[1];
        let year = dayMonthYear[2];
        
        let userDate = new Date(year, month-1, day);

        //check if userDate is within 30 days
        if(userDate - date > 30 * 24 * 60 * 60 * 1000 || userDate - date < 0){
            return false
        }
    }
    return true;
};

//date comes in form: [day, month, year]
const isToday = (date) => {
    const day = new Date();

    if(day.getFullYear() !== parseInt(date[2])) return false;
    if(day.getMonth()+1 !== parseInt(date[1])) return false;
    if(day.getDate() !== parseInt(date[0])) return false;
    return true;
}

//the user must give an input of hour:min in military time (24 hour clock)
const askTime = (dmChannel, isToday) => {

    return new Promise(async (resolve) => {
        let response = await dmChannel.awaitMessages(m => m, {max:2, time: 60000, errors:['time']});

        response = response.last().content;

        if(!isValidRaffleTime(response, isToday)){
            dmChannel.send('Sorry that is an invalid time, try again.');
            resolve(askTime(dmChannel, isToday));
        }
        else{
            resolve(response);
        }   
    });
}

//time must come in the format hour:min in military time (24 hour clock)
const isValidRaffleTime = (userResponse, isToday) => {
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

const askTimeZone = (dmChannel) => {
    return new Promise(async (resolve) => {
        let response = await dmChannel.awaitMessages(m => m, {max:2, time: 60000, errors:['time']});

        response = response.last().content;

        if(!isValidRaffleTimeZone(response)){
            dmChannel.send('Sorry that is an invalid time zone, try again.');
            resolve(askTimeZone(dmChannel));
        }
        else{
            resolve(response);
        }   
    });
}

module.exports = {
    name: 'raffle',
    description: 'Creates a raffle',
    async execute(message, prefix, args, raffles, Discord, client) {
        args = args.trim();

        if(!message.member.hasPermission('ADMINISTRATOR')){
            return message.channel.send('You have insufficient permissions to use this command');
        }
        else if(args === '' || args === 'help'){
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Raffle')
                .addField('Description', 'Creates a raffle in the server')
                .addField('Usage', 
                    'To create a new raffle use the following format:\n' +
                    '`' + prefix + this.name + ' new`\n\n' +
                    'To list all raffles use the following format:\n' +
                    '`' + prefix + this.name + ' list`\n\n' +
                    'To view information about a specific raffle use the following format:\n' +
                    '`' + prefix + this.name + ' info name`\n\n' +
                    'To delete a raffle use the following format:\n' +
                    '`' + prefix + this.name + ' delete name`\n\n' +
                    'To force finish a raffle use the following format:\n' + 
                    '`' + prefix + this.name + ' force name`'
                )
                .addField('Examples', 'Example');
            return message.channel.send(embed);
        }
        //creates a new raffle
        else if(args.includes('new')){

            let newRaffle = {
                name: '',
                description: '',
                year: null,
                month: null,
                day: null,
                time: null,
                timeZone: null,
                messageId: null,
                host: message.author.tag
            }

            const directMessageChannel = await message.author.createDM();

            //ask questions to the user to create the raffle
                //ask and record name for raffle
                directMessageChannel.send('What would you like to name the raffle?');
                let askedName = await directMessageChannel.awaitMessages(m => m, {max:2, time: 60000, errors:['time']});

                newRaffle.name = askedName.last().content;

                //ask and record description for raffle
                directMessageChannel.send('Give a description of the raffle.');
                let askedDesc = await directMessageChannel.awaitMessages(m => m, {max:2, time: 60000, errors:['time']});

                newRaffle.description = askedDesc.last().content;

                //ask and record endDate for raffle
                directMessageChannel.send('What date will the raffle end? Please use the format dd/mm/yyyy, the date cannot be over 30 days.')
                let askedDate = await askDate(directMessageChannel);

                //askedDate is in form [day, month, year]
                newRaffle.day = askedDate[0];
                newRaffle.month = askedDate[1];
                newRaffle.year = askedDate[2];

                const today = isToday(askedDate);

                //ask and record endTime for raffle
                directMessageChannel.send('What time will the raffle end? Please use the format hour:minute in military time (24 hour clock).')
                let askedTime = await askTime(directMessageChannel, today);

                newRaffle.time = askedTime;

            //finished asking questions, notify the user that a raffle has been created
            directMessageChannel.send('Your raffle has been created in the ' + message.channel.name + ' channel.');

            //create, send and react to a new raffle message
            let raffleMsg = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle(newRaffle.name)
                .addField('Description', newRaffle.description)
                .addField('Date', newRaffle.day + '/' + newRaffle.month + '/' + newRaffle.year)
                .addField('Time', newRaffle.time)
                .addField('Instruction', 'React below to be entered into the raffle')
                .addField('Hosted by', newRaffle.host);
            let sentMessage = await message.channel.send(raffleMsg);
            await sentMessage.react('🎟️');

            //get the server
            let serverRaffles = raffles.get(message.guild.id);

            newRaffle.messageId = sentMessage.id;

            //create an array of raffles for the server, if there already exists one then add a raffle to the array
            if(serverRaffles)
                serverRaffles.push(newRaffle);
            else serverRaffles = [newRaffle];
            raffles.set(message.guild.id, serverRaffles);

            console.log(newRaffle);
        }




        //lists all raffles
        else if(args.includes('list')){
            serverRaffles = raffles.get(message.guild.id);
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Raffles')

            let desc = '```';

            if(serverRaffles && serverRaffles.length > 0){
                for(raffle = 0; raffle < 4; raffle++){
                    if(serverRaffles[raffle])
                        desc += '[' + (raffle + 1) + '] ' + serverRaffles[raffle].name + ' by ' + serverRaffles[raffle].host + '\n';
                    else
                        desc += '[' + (raffle + 1) + ']\n';
                }
    
                //Math ceils the amount of pages of songs
                let pages = Math.ceil((serverRaffles.length-1)/4);
                if(pages === 0) pages++;
                
                desc += '```page 1/' + pages;
            }
            else
                desc += 'There are no raffles active. Use ' + prefix + this.name + ' new to create one!```';

            embed.setDescription(desc);
            return await message.channel.send(embed);

        }
        //returns information on a specific raffle
        else if(args.includes('info')){

        }
        //deletes a raffle
        else if(args.includes('delete')){

        }
        //force finishes a raffle
        else if(args.includes('force')){

        }
        else{
            return message.channel.send('Unknown arguments detected for the command.')
        }

    }

}

