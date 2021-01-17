const utilities = require('../utilities');
const {Message} = require('discord.js');

module.exports = {
    name: 'random',
    description: 'random number generator',
    async execute(message, args, Discord){
        const channel = message.channel;

        args = args.trim();
        if(args === '' || args === 'help'){
            channel.send(
                'To get a random number between `1` and `n` use the following format:\n' +
                '`~random n`\n\n' +
                'To get a random number between `x` and `y` use the following format:\n' +
                '`~random x y`\n\n' +
                'To get a random item in a list use the following format:\n' +
                '`~random item1, item2, item3...`\n\n' +
                'To get a random item in a weighted list, use the following format:\n' +
                '`~random item1:weight, item2:weight, item3:weight...`'
            );
        }
        else if(args[0] === ',')
            channel.send('Incorrect syntax');
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
                        for(j = 0; j < parseInt(temp[1]); j++){
                            weightedArr.push(temp[0]);
                        }
                    }
                    channel.send(weightedArr[utilities.getRandomInt(weightedArr.length)]);
                }
                //non-weighted list
                else{
                    channel.send(argArray[utilities.getRandomInt(argArray.length)]);
                }
            }
            //the arguments are an integer range or a single item list
            else {
                let argArray = args.split(/ +/);
                //random int between 1 and argArray[0] or single item
                if(argArray.length === 1){
                    if(utilities.isNumeric(argArray[0]))
                        channel.send(utilities.getRandomInt(argArray[0]) + 1);
                    //single item list, will return that single item
                    else channel.send(argArray[0].split(':')[0]);
                }
                //random int between argArray[0] and argArray[1]
                else if(argArray.length === 2) 
                    channel.send(utilities.getRandomInt(parseInt(argArray[1]) - parseInt(argArray[0]) + 1) + parseInt(argArray[0]));
                //incorrect use of the command
                else
                    channel.send('Incorrect usage of `~random`, please use `~random help` for instructions on how to use this command.');
            }
        }
    }
}