const utilities = require('../utils/utilities.js');
const aws_utilities = require('../utils/aws_utilities.js');
const raffle_utils = require('../utils/raffle_utilities.js');

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
                timer: null,
                message_id: null,
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

                //ask and record TIMEZONE for raffle NOT DONE YET
                directMessageChannel.send(
                    'What UTC offset is this raffle based in? Enter an offset between -12 and +14\n'+
                    'Examples: \nCalifornia is in UTC-8, enter `-8`\nSydney is in UTC+11, enter `+11`')
                let askedTimeZone = await raffle_utils.askTimeZone(directMessageChannel, client);
                newRaffle.timeZone = askedTimeZone;

                //ask and record DAY,MONTH,YEAR for raffle
                directMessageChannel.send('What date will the raffle end? Please use the format dd/mm/yyyy, the date cannot be over 30 days.')
                let askedDate = await raffle_utils.askDate(directMessageChannel, client);

                //askedDate is in form [day, month, year]
                newRaffle.day = askedDate[0];
                newRaffle.month = askedDate[1];
                newRaffle.year = askedDate[2];

                //ask and record TIME for raffle
                const today = raffle_utils.isToday(askedDate);
                directMessageChannel.send('What time will the raffle end? Please use the format hour:minute in military time (24 hour clock).')
                let askedTime = await raffle_utils.askTime(directMessageChannel, today, client);

                newRaffle.time = askedTime;

            //finished asking questions, notify the user that a raffle has been created
            directMessageChannel.send('Your raffle has been created in the ' + message.channel.name + ' channel.');

            //create, send and react to a new raffle message
            let raffleMsg = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle(newRaffle.name)
                .addField('Description', newRaffle.description)
                .addField('Date', newRaffle.day + '/' + newRaffle.month + '/' + newRaffle.year)
                .addField('Time', newRaffle.time + ' UTC' + newRaffle.timeZone)
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

            console.log(raffles);
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

