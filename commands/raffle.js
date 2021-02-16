const utilities = require('../utils/utilities.js');

const finishRaffle = (raffleMessage) => {
    raffleMessage.channel.send('The Raffle has ended');
}

const askTime = (dmChannel) => {
    return new Promise(async (resolve) => {
        response = await dmChannel.awaitMessages(m => m, {max:2, time: 60000, errors:['time']});

        if(!utilities.isNumeric(response.last().content)){
            dmChannel.send('Sorry that is an invalid time, try again.');
            resolve(askTime(dmChannel));
        }
        else{
            resolve(parseInt(response.last().content));
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
        else if(args === 'help'){
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
                    '`' + prefix + this.name + ' delete name\n\n`' +
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
                timer: null,
                raffleId: null,
                host: message.author.tag
            }

            const directMessageChannel = await message.author.createDM();

            //ask and record name for raffle
            directMessageChannel.send('What would you like to name the raffle?');
            let askedName = await directMessageChannel.awaitMessages(m => m, {max:2, time: 60000, errors:['time']});

            newRaffle.name = askedName.last().content;

            //ask and record description for raffle
            directMessageChannel.send('Give a description of the raffle.');
            let askedDesc = await directMessageChannel.awaitMessages(m => m, {max:2, time: 60000, errors:['time']});

            newRaffle.description = askedDesc.last().content;

            //ask and record time for raffle
            directMessageChannel.send('How long will the raffle last? Give a number in terms of seconds.');
            
            let askedTime = await askTime(directMessageChannel);

            //create, send and react to a new raffle message
            let raffleMsg = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle(newRaffle.name)
                .addField('Description', newRaffle.description)
                .addField('Time', askedTime)
                .addField('Instruction', 'React below to be entered into the raffle')
                .addField('Hosted by', newRaffle.host);
            let sentMessage = await message.channel.send(raffleMsg);
            await sentMessage.react('🎉');

            newRaffle.timer = setTimeout(() => {finishRaffle(sentMessage)}, askedTime * 1000) 
            newRaffle.raffleId = sentMessage.id;

            raffles.add(newRaffle);
        }
        //lists all raffles
        else if(args.includes('list')){
            console.log(raffles);
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

    }

}

