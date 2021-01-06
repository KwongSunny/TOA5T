module.exports = {
    name: 'kill',
    description: "stops the bot",
    async execute(message, args){
        if(message.author.id === '184783523624910858')
        {
            message.channel.send('Stopping processes...');
            await args.destroy().catch(console.error);
        }
        else
            message.channel.send('You have insufficient permissions to use this command.');
    }
}