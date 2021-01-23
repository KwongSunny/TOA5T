const aws_utilities = require('../utils/aws_utilities.js');

module.exports = {
    name: 'setprefix',
    description: 'changes the default prefix to a custom one',
    async execute(message, prefix, args, Discord){
        args = args.trim();
        //checks for user permissions
        if(!message.member.hasPermission('ADMINISTRATOR')){
            message.channel.send('You do not have sufficient permissions to use this command');
        }
        //send a message on how to use the command
        else if(args === 'help' || args === ''){
            let embed = new Discord.MessageEmbed()
                .setColor('#f7c920')
                .setTitle('Set Prefix')
                .setDescription(
                    '**Description:**\n' +
                    'Change the bot prefix to a custom one\n\n' +
                    '**Usage:**\n' +
                    '`' + prefix + this.name + ' prefix`\n\n' + 
                    '**Example:**\n' +
                    '`' + prefix + this.name + ' ~`\n' + 
                    '`' + prefix + this.name + ' t/`' 
                );
                message.channel.send(embed);
        }
        //continue with command
        else{
            let prefixes = args.split(/\s/g);
            //check for only 1 prefix
            if(prefixes.length !== 1){
                message.channel.send('There are unecessary arguments or prefixes');
            }
            else{
                let server = aws_utilities.getItem(message.guild.id);
                //if the server is found update it
                if(server){
    
                    //update the item with custom_prefix
                    let keys = ['custom_prefix'];
                    let values = [prefixes[0]];
                    aws_utilities.updateItem(message.guild.id, keys, values);
                }
                //else write a new one
                else{
    
                    //update the item with custom_prefix
                    aws_utilities.writeItem(message.guild.id);
                    let keys = ['custom_prefix'];
                    let values = [prefixes[0]];
                    aws_utilities.updateItem(message.guild.id, keys, values);
                }
                message.channel.send("This bot's prefix has been set to `" + prefixes[0] + '`');
            }
        }
    }
}