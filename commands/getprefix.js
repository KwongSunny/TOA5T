const aws_utilities = require('../utils/aws_utilities.js');

module.exports = {
    name: 'getprefix',
    description: 'returns the custom prefix in case a user forgets, this will always utilize the default prefix',
    async execute(param){
        const message = param.message;
        const prefix = param.prefix;
        let args = param.prefix;
        const Discord = param.Discord;

        args = args.trim();
        if(args === 'help'){
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Set Prefix')
                .addField('Description', "Retrieves the server's bot's prefix")
                .addField('Usage', '`' + prefix + this.name + '`')
                .addField('Related Commands', '`resetprefix`, `setprefix`');
            return message.channel.send(embed);
        }
        else if(args === ''){
            let server = await aws_utilities.fetchServer(message.guild.id);
            if(server.Item.custom_prefix)
                prefix = server.Item.custom_prefix;

            message.channel.send("This server's bot's prefix is `" + prefix + '`');
        }
        else{
            message.channel.send("There are unecessary arguments, please use `" + prefix + this.name + '` for more information');
        }
    }
}