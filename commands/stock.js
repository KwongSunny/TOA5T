const yahooFinance = require('yahoo-finance');

module.exports = {
    name: 'stock',
    description: 'gives the stock price of a named stock',
    async execute(param){
        const message = param.message;
        const prefix = param.prefix;
        let args = param.args;
        const Discord = param.Discord;
        args = args.trim();

        if(args === '' || args === 'help'){

        }
        else{
            args = args.toUpperCase()
            let stock = await yahooFinance.quote({symbol: args, modules: ['price']});
            console.log(stock);
            if(stock){
                let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle(stock.price.shortName.substring(0, 20) + ' (' + stock.price.symbol + ')')
                .addField('Current Market Price: ', stock.price.regularMarketPrice);

                return message.channel.send(embed);
            }
            else{
                return message.channel.send('Invalid stock symbol given: ' + args); 
            }

        }

    }
}