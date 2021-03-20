module.exports = {
    name: 'event',
    description: 'create a scheduled event',
    execute(param){
        const message = param.message;
        const prefix = param.prefix;
        const args = param.args.trim();
        const interactiveEmbeds = param.interactiveEmbeds;
        const Discord = param.Discord;
      
        if(args === '' || args === 'help'){

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
                timer: null,
                message_id: null,
                event_status: 'initialized',
                channel_id: message.channel.id,
                server_id: message.guild.id,
                host: message.author.tag
            }

            const directMessageChannel = await message.author.createDM();

            //ask questions to the user to create the event
                //ask and record NAME for the event
                directMessageChannel.send('WHat would you like to name the raffle?');
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
                let askedTimeZone = await raffle_utilities.askTimeZone(directMessageChannel, client);
                newEvent.timeZone = askedTimeZone;

                //ask and record DAY,MONTH,YEAR for the event
                directMessageChannel.send('What date will the event end? Please use the format mm/dd/yyyy, the date cannot be over 30 days.')
                let askedDate = await raffle_utilities.askDate(directMessageChannel, newRaffle, client);

                //askedDate is in form [day, month, year]
                newEvent.month = askedDate[0];
                newEvent.day = askedDate[1];
                newEvent.year = askedDate[2];

                //ask and record TIME for the event
                const today = raffle_utilities.isToday(askedDate);
                directMessageChannel.send('What time will the raffle end? Please use the format hour:minute in military time (24 hour clock).')
                let askedTime = await raffle_utilities.askTime(directMessageChannel, newRaffle, client);

                newEvent.time = askedTime;

            //finished asking questions, notify the user that the event has been created
            directMessageChannel.send('Your event has been created in the ' + message.channel.name + ' channel.');


        }
        else if(args === 'list'){

        }
        else if(args.includes('info')){

        }
        else if(args.includes('delete')){

        }


    }
}