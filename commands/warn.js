module.exports = {
    name: 'warn',
    description: 'warns a user',
    execute(message, args){
        message.author.send('')
        message.channel.send(message.user.displayName + ' has been warned'); 
    }
}