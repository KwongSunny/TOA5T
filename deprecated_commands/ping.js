module.exports = {
    name: 'ping',
    description: 'this is a ping command!',
    execute(message){
        message.channel.send('pong!');
    }
}