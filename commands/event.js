const aws_utilities = require('../utils/aws_utilities.js');
const event_utilities = require('../utils/event_utilities.js');
const utilities = require('../utils/utilities.js');

module.exports = {
    name: 'event',
    description: 'create a scheduled event',
    async execute(param){
        const message = param.message;
        const prefix = param.prefix;
        const args = param.args.trim();
        const interactiveEmbeds = param.interactiveEmbeds;
        const Discord = param.Discord;
        const client = param.client;

        if(args === '' || args === 'help'){
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Event')
                .addField('Description', 'Creates an event in the server, best used in a designated events channel')
                .addField('Usage', 
                    'To create a new event use the following format:\n' +
                    '`' + prefix + this.name + ' new`\n\n' +
                    'To list all events use the following format:\n' +
                    '`' + prefix + this.name + ' list`\n\n' +
                    'To view information about a specific event use the following format:\n' +
                    '`' + prefix + this.name + ' info name`\n\n' +
                    'To delete a event use the following format:\n' +
                    '`' + prefix + this.name + ' delete name`\n\n'
                );
            return message.channel.send(embed);
        }
        else if(args === 'new'){
            let newEvent = {
                name: '',
                description: '',
                year: null,
                month: null,
                day: null,
                time: null,
                timeZone: null,
                message_id: null,
                max: 16,
                event_status: 'initialized',
                channel_id: message.channel.id,
                server_id: message.guild.id,
                host: message.author.tag
            }

            const directMessageChannel = await message.author.createDM();

            //ask questions to the user to create the event
                //ask and record NAME for the event
                directMessageChannel.send('What would you like to name the event?');
                let askedName = await directMessageChannel.awaitMessages(m => m.author.id !== client.user.id, {max:1, time: 60000, errors:['time']});

                newEvent.name = askedName.last().content;

                //ask and record DESCRIPTION for the event
                directMessageChannel.send('Give a description to the event.');
                let askedDesc = await directMessageChannel.awaitMessages(m => m.author.id !== client.user.id, {max:1, time: 60000, errors:['time']});

                newEvent.description = askedDesc.last().content;

                //ask and record TIMEZONE for the event
                directMessageChannel.send(
                    'What UTC offset is this event based in? Enter an offset between -12 and +14\n'+
                    'Examples: \nCalifornia is in UTC-8, enter `-8`\nSydney is in UTC+11, enter `+11`')
                let askedTimeZone = await event_utilities.askTimeZone(directMessageChannel, client);
                newEvent.timeZone = askedTimeZone;

                //ask and record DAY,MONTH,YEAR for the event
                directMessageChannel.send('What date will the event start? Please use the format mm/dd/yyyy, the date cannot be over 30 days.')
                let askedDate = await event_utilities.askDate(directMessageChannel, newEvent, client);

                //askedDate is in form [day, month, year]
                newEvent.month = askedDate[0];
                newEvent.day = askedDate[1];
                newEvent.year = askedDate[2];

                //ask and record TIME for the event
                const today = event_utilities.isToday(askedDate);
                directMessageChannel.send('What time will the event start? Please use the format hour:minute in military time (24 hour clock).')
                let askedTime = await event_utilities.askTime(directMessageChannel, newEvent, client);

                newEvent.time = askedTime;

                directMessageChannel.send("What's the max occupancy for the event? Limit: 16");
                let maxOccupancy;
                while(!maxOccupancy){
                    let maxResponse = await directMessageChannel.awaitMessages(m => m.author.id !== client.user.id, {max:1, time: 60000, errors:['time']});
                    if(utilities.isNumeric(maxResponse) && maxResponse <= 16)
                        maxOccupancy = maxResponse;
                    else directMessageChannel.send('That is not a valid number.');
                }
                newEvent.max = maxOccupancy;

            //finished asking questions, notify the user that the event has been created
            directMessageChannel.send('Your event has been created in the ' + message.channel.name + ' channel.');

            let fieldDesc = '```';
            for(i = 0; i < newEvent.max; ++i){
                fieldDesc += '\n' + i + '.';
            }
            fieldDesc += '```';

            //create, send and react to a new event message
            let eventMsg = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle(newEvent.name)
                .addFields([
                    {name: 'Description', value: newEvent.description},
                    {name: 'Date & Time', value: newEvent.month + '/' + newEvent.day + '/' + newEvent.year + ' ' + utilities.militaryToStandardTime(newEvent.time.split(':')[0], newEvent.time.split(':')[1]) + ' UTC' + newEvent.timeZone},
                    {name: 'Instruction', value: 'React below to sign up for the event'},
                    {name: "Yes", value: fieldDesc, inline: true},
                    {name: 'Maybe', value: fieldDesc, inline: true},
                    {name: 'Extra', value: fieldDesc, inline: true},
                    {name: 'Hosted by', value: newEvent.host}
                ])
            let sentEventMessage = await message.channel.send(eventMsg);
            await sentEventMessage.react('🇾');       
            await sentEventMessage.react('🇲');
            await sentEventMessage.react('🇪'); 

            newEvent.message_id = sentEventMessage.id;

            interactiveEmbeds.push(newEvent.message_id, {type: 'event', messageId: newEvent.message_id, });
            
        }
        else if(args === 'list'){

        }
        else if(args.includes('info')){

        }
        else if(args.includes('delete')){

        }


    }
}