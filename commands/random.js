const utilities = require('../utils/utilities');
const {Message, DiscordAPIError} = require('discord.js');

module.exports = {
    name: 'random',
    description: 'random number generator',
    async execute(message, prefix, args, Discord){
        args = args.trim();
        //provides information on the command
        if(args === '' || args === 'help'){
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Randomizer')
                .addField('Description', 'Returns a random number or item from a range or list')
                .addField('Usage',
                    'To get a random number between `1` and `n` use the following format:\n' +
                    '`' + prefix + this.name + ' n`\n\n' +
                    'To get a random number between `x` and `y` use the following format:\n' +
                    '`' + prefix + this.name + ' x y`\n\n' +
                    'To get a random item in a list use the following format:\n' +
                    '`' + prefix + this.name + ' item1, item2, item3...`\n\n' +
                    'To get a random item in a weighted list, use the following format:\n' +
                    '`' + prefix + this.name + ' item1:weight, item2:weight, item3:weight...`'
                )
                .addField('Example', 
                    '`' + prefix + this.name + ' 5`\n' + 
                    '`' + prefix + this.name + ' 5 10`\n' +
                    '`' + prefix + this.name + ' red, green, blue`\n' +
                    '`' + prefix + this.name + ' red:5, green:3, blue:1`'
                );
            message.channel.send(embed);
        }
        else if(args[0] === ',')
            message.channel.send('Incorrect syntax');
        else{
            let isList = args.includes(',');
            //the arguments are a list of items, weighted or non-weighted
            if(isList){
                argArray = args.split(/,/);
                //weighted list
                if(args.includes(':')){
                    let weightedArr = [];
                    for(i = 0; i < argArray.length; i++){
                        let temp = argArray[i].split(':');
                        if(utilities.isNumeric(temp[1]) && temp.length === 2){
                            for(j = 0; j < parseInt(temp[1]); j++){
                                weightedArr.push(temp[0]);
                            }
                        }
                        else {
                            message.channel.send('Incorrect usage of a weighted list, please use `~random help` for instructions on how to use it.');
                            return;
                        }
                    }
                    message.channel.send(weightedArr[utilities.getRandomInt(weightedArr.length)]);
                }
                //non-weighted list
                else{
                    message.channel.send(argArray[utilities.getRandomInt(argArray.length)]);
                }
            }
            //the arguments are an integer range or a single item list
            else {
                let argArray = args.split(/ +/);
                //random int between 1 and argArray[0] or single item
                if(argArray.length === 1){
                    if(utilities.isNumeric(argArray[0]))
                        message.channel.send(utilities.getRandomInt(argArray[0]) + 1);
                    //single item list, will return that single item
                    else message.channel.send(argArray[0].split(':')[0]);
                }
                //random int between argArray[0] and argArray[1]
                else if(argArray.length === 2) 
                    message.channel.send(utilities.getRandomInt(parseInt(argArray[1]) - parseInt(argArray[0]) + 1) + parseInt(argArray[0]));
                //incorrect use of the command
                else
                    message.channel.send('Incorrect usage of `~random`, please use `~random help` for instructions on how to use this command.');
            }
        }
    }
}