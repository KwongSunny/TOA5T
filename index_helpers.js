function executeCommand(command, prefix, defaultPrefix, message, args, songQueue, Discord, client){
    //assigns a default role to every new member
    if(command === 'autorole')
        client.commands.get('autorole').execute(message, prefix, args, Discord);
    else if(command === 'ban')
        client.commands.get('ban').execute(message, prefix, args, Discord);
    if(command === 'getprefix')
        client.commands.get('getprefix').execute(message, prefix, args, Discord);
    //provides a list of commands
    else if(command === 'help')
        client.commands.get('help').execute(message, args, Discord);
    //gives basic information about the bot
    else if(command === 'info')
        client.commands.get('info').execute(message, prefix, Discord);
    else if(command === 'kick')
        client.commands.get('kick').execute(message, prefix, args, Discord);
    //randomizer command, gives a random output based on the parameters
    else if(command === 'play')
        client.commands.get('play').execute(message, prefix, args, songQueue, Discord);
    else if(command === 'queue')
        client.commands.get('queue').execute(message, prefix, args, songQueue, Discord);
    else if(command === 'random')
        client.commands.get('random').execute(message, prefix, args, Discord)
    //modular reactionrole command ON STARTUP FIRST REACTION IS NOT READ, MESSAGE NEEDS TO BE CACHED ON STARTUP
    else if(command === 'reactionrole')
        client.commands.get('reactionrole').execute(message, prefix, args, Discord, client);
    else if(command === 'resetprefix')
        client.commands.get('resetprefix').execute(message, prefix, defaultPrefix, args, Discord);
    else if(command === 'setmaxwarnings')
        client.commands.get('setmaxwarnings').execute(message, prefix, args, Discord);
    else if(command === 'setprefix')
        client.commands.get('setprefix').execute(message, prefix, args, Discord);
    else if(command === 'unban')
        client.commands.get('unban').execute(message, prefix, args, Discord);
    else if(command === 'volume')
        client.commands.get('volume').execute(message, prefix, args, songQueue, Discord);
    else if(command === 'warn')
        client.commands.get('warn').execute(message, prefix, args, Discord);
}

module.exports.executeCommand = executeCommand;