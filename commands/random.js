const common_library = require('../common_library');
const {Message} = require('discord.js');

module.exports = {
    name: 'random',
    description: 'random number generator',
    async execute(message, args, Discord){
        const channel = message.channel;

        // let bar = '[----------------]';

        // let embed = new Discord.MessageEmbed()
        //     .setColor('#f7c920')
        //     .setTitle('Randomizer')
        //     .setDescription(bar);
        
        // let messagePromise = channel.send(embed);

        // messagePromise.then(() => {
        //     console.log(messagePromise);
        //     while(messagePromise.embeds[0].description != "[■■■■■■■■■■■■]"){
        //         setTimeout(() => {

        //             bar = bar.substring(0, i) + '■' + bar.substring(i+2);
        //             //messagePromise.edit(embed.description.substring(embed.description.length - bar.length) + '\n\n' + bar);
        //             console.log(messagePromise.embeds);
    
        //             let newEmbed = new Discord.MessageEmbed()
        //                 .setColor('#6b65e6')
        //                 .setTitle('Randomizer')
        //                 .setDescription(embed.description.substring(embed.description.length - bar.length) + '\n\n' + bar);
    
        //             messagePromise.edit(newEmbed);
        //         }, 2000)
        //     }
        // }).catch(console.error);

        if(args.length === 0) 
            channel.send('Insufficient parameters');
        else if(args[0][0] === ',')
            channel.send('Incorrect syntax');

        else{
            let isList = false;
            for(i = 0; i < args.length; i++){ //checks if the args has a comma to see if it's a list
                if(args[i].includes(',')){
                    isList = true;
                    break;
                }
            }
            
            if(isList){ //the command will be a list of items, weighted or non-weighted
                for(i = 0; i < args.length; i++){ //prune all ","
                    if(args[i] === ','){
                        args.splice(i, 1);
                        i--;
                    }
                    if(args[i].includes(',')){
                        let split = args[i].split(',');
                        if(split[0] === '') args[i] = split[1];
                        else args[i] = split[0];
                    }
                }
                
                if(args[0].includes(':')){ //weighted list
                    let words = [];
                    for(i = 0; i < args.length; i++){
                        let word = args[i].split(':');
                        for(j = 0; j < word[1]; j++){
                            words.push(word[0]);
                        }
                    }
                    channel.send(words[common_library.getRandomInt(words.length)]);
                }
                else{ //un-weighted list
                    channel.send(args[common_library.getRandomInt(args.length)]);
                }

            }
            else{ //the command will be numerical or a single item item
                if(args.length === 1){ //returns a number between 1 and args[0] or a single item list
                    if(common_library.isNumeric(args[0]))
                        channel.send(common_library.getRandomInt(args[0]) + 1);
                    else 
                        channel.send(args[0]);
                }
                else{ //returns a random number between args[0] and args[1]
                    channel.send(common_library.getRandomInt(parseInt(args[1]) - parseInt(args[0]) + 1) + parseInt(args[0]));
                }
            }
        }
    }
}

function loadingBar(embed)
{
    bar = '[------------]';

    for(i = 0; i < 12; i++)
    {
        console.log("A");
        setTimeout(() => {
            bar = bar.substring(0, i+1) + '■' + bar.substring(i+2);
            embed.setDescription(embed.description.substring(embed.description.length - bar.length) + '\n\n' + bar);
        }, 1000);

    }

}