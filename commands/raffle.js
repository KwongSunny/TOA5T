const utilities = require('../utils/utilities.js');
const aws_utilities = require('../utils/aws_utilities.js');
const raffle_utilities = require('../utils/raffle_utilities.js');
const perm_utilities = require('../utils/perm_utilities.js');

module.exports = {
    name: 'raffle',
    description: 'Creates a raffle',
    async execute(param){
        const message = param.message;
        const prefix = param.prefix;
        let args = param.args;
        const raffles = param.raffles;
        const Discord = param.Discord;
        const client = param.client;

        args = args.trim();

        let permission = 'manage_raffle';
        let hasRafflePermissions = await perm_utilities.checkPermission(message, permission);

        if(!message.member.hasPermission('ADMINISTRATOR') && !hasRafflePermissions){
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
                timer: null,
                message_id: null,
                raffle_status: 'initialized',
                channel_id: message.channel.id,
                server_id: message.guild.id,
                host: message.author.tag
            }

            const directMessageChannel = await message.author.createDM();

            //ask questions to the user to create the raffle
                //ask and record NAME for raffle
                directMessageChannel.send('What would you like to name the raffle?');
                let askedName = await directMessageChannel.awaitMessages(m => m.author.id !== client.user.id, {max:1, time: 60000, errors:['time']});

                newRaffle.name = askedName.last().content;

                //ask and record DESCRIPTION for raffle
                directMessageChannel.send('Give a description of the raffle.');
                let askedDesc = await directMessageChannel.awaitMessages(m => m.author.id !== client.user.id, {max:1, time: 60000, errors:['time']});

                newRaffle.description = askedDesc.last().content;

                //ask and record TIMEZONE for raffle
                directMessageChannel.send(
                    'What UTC offset is this raffle based in? Enter an offset between -12 and +14\n'+
                    'Examples: \nCalifornia is in UTC-8, enter `-8`\nSydney is in UTC+11, enter `+11`')
                let askedTimeZone = await raffle_utilities.askTimeZone(directMessageChannel, client);
                newRaffle.timeZone = askedTimeZone;

                //ask and record DAY,MONTH,YEAR for raffle
                directMessageChannel.send('What date will the raffle end? Please use the format mm/dd/yyyy, the date cannot be over 30 days.')
                let askedDate = await raffle_utilities.askDate(directMessageChannel, newRaffle, client);

                //askedDate is in form [day, month, year]
                newRaffle.month = askedDate[0];
                newRaffle.day = askedDate[1];
                newRaffle.year = askedDate[2];

                //ask and record TIME for raffle
                const today = raffle_utilities.isToday(askedDate);
                directMessageChannel.send('What time will the raffle end? Please use the format hour:minute in military time (24 hour clock).')
                let askedTime = await raffle_utilities.askTime(directMessageChannel, newRaffle, client);

                newRaffle.time = askedTime;

            //finished asking questions, notify the user that a raffle has been created
            directMessageChannel.send('Your raffle has been created in the ' + message.channel.name + ' channel.');

            //create, send and react to a new raffle message
            let raffleMsg = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle(newRaffle.name)
                .addField('Description', newRaffle.description)
                .addField('Date', newRaffle.month + '/' + newRaffle.day + '/' + newRaffle.year + ' ' + utilities.militaryToStandardTime(newRaffle.time.split(':')[0], newRaffle.time.split(':')[1]) + ' UTC' + newRaffle.timeZone)
                .addField('Instruction', 'React below to be entered into the raffle')
                .addField('Hosted by', newRaffle.host);
            let sentRaffleMessage = await message.channel.send(raffleMsg);
            await sentRaffleMessage.react('🎟️');

            //set the newRaffle messageId
            newRaffle.message_id = sentRaffleMessage.id;

            //push the newRaffle to the list of local raffles
            raffles.push(newRaffle);

            //write the newRaffle to the db
            aws_utilities.writeRaffle(newRaffle);

            //activate any unactivated raffles, including the new one
            raffle_utilities.activateRaffles(raffles, client);
        }
        //lists all raffles
        else if(args.includes('list')){
            let description = '```';

            serverRaffles = [];
            raffles.forEach((raffle) => {
                if(raffle.server_id === message.guild.id && raffle.raffle_status !== 'complete'){
                    serverRaffles.push(raffle);
                }
            })

            if(serverRaffles.length === 0){
                description = '```There are no active raffles in this server```';
            }
            else{
                for(raffle = 0; raffle < serverRaffles.length; raffle++){
                    description += '[' + (raffle + 1) + '] ' + serverRaffles[raffle].name + ' ' +
                        serverRaffles[raffle].month + '/' + serverRaffles[raffle].day + '/' + serverRaffles[raffle].year + ' ' + utilities.militaryToStandardTime(serverRaffles[raffle].time.split(':')[0], serverRaffles[raffle].time.split(':')[1]) + ' UTC' + serverRaffles[raffle].timeZone + '\n';
                }
                description += '```';
            }

            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Raffles')
                .setDescription(description);

            return await message.channel.send(embed);
        }
        //returns information on a specific raffle
        else if(args.includes('info')){
            args = utilities.removeFromString(args, 'info').trim();

            raffles.forEach(async (raffle) => {
                if(raffle.server_id === message.guild.id && raffle.raffle_status !== 'complete' && raffle.name === args){
                    let embed = new Discord.MessageEmbed()
                        .setColor('#f7c920')
                        .setTitle(raffle.name)
                        .addField('Description', raffle.description)
                        .addField('Date', raffle.month + '/' + raffle.day + '/' + raffle.year + ' ' + utilities.militaryToStandardTime(raffle.time.split(':')[0], raffle.time.split(':')[1]) + ' UTC' + raffle.timeZone);

                    let raffleMsg = await utilities.fetchMessageFromGuild(message.guild, raffle.message_id);

                    let userSet = new Set();
                    userSet = await utilities.fetchReactionUsers(raffleMsg, null, userSet);

                    embed.addField('Entries: ', userSet.size - 1);
                    embed.addField('Hosted by', raffle.host);

                    return message.channel.send(embed);
                }
            })

        }
        //deletes a raffle
        else if(args.includes('delete')){
            args = utilities.removeFromString(args, 'delete').trim();

            for(raffle = 0; raffle < raffles.length; raffle++){
                if(message.guild.id === raffles[raffle].server_id && raffles[raffle].raffle_status !== 'complete' && args === raffles[raffle].name){
                    if(raffles[raffle].timer){
                        clearTimeout(raffles[raffle].timer);
                    }
                    aws_utilities.deleteRaffle(raffles[raffle].message_id);
                    raffles.splice(raffle, 1);
                    return message.channel.send('The raffle has been removed');
                }
            }
            return message.channel.send('No such raffle found');
        }
        //force finishes a raffle
        else if(args.includes('force')){
            args = utilities.removeFromString(args, 'force').trim();

            for(raffle = 0; raffle < raffles.length; raffle++){
                if(message.guild.id === raffles[raffle].server_id && raffles[raffle].raffle_status !== 'complete' && args === raffles[raffle].name){
                    if(raffles[raffle].timer){
                        clearTimeout(raffles[raffle].timer);
                    }
                    raffles[raffle] = raffle_utilities.startRaffleTimer(raffles[raffle], 1, client);
                    return;
                }
            }
            return message.channel.send('No such raffle found');
        }
        else{
            return message.channel.send('Unknown arguments detected for the command.')
        }

    }

}

