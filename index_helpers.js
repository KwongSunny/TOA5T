function executeCommand(command, prefix, defaultPrefix, message, args, songQueue, Discord, client){
    //Member Management
    if(command === 'ban')
        client.commands.get('ban').execute(message, prefix, args, Discord);
    else if(command === 'kick')
        client.commands.get('kick').execute(message, prefix, args, Discord);
    else if(command === 'setmaxwarnings')
        client.commands.get('setmaxwarnings').execute(message, prefix, args, Discord);
    else if(command === 'unban')
        client.commands.get('unban').execute(message, prefix, args, Discord);
    else if(command === 'warn')
        client.commands.get('warn').execute(message, prefix, args, Discord);

    //Role Management
    else if(command === 'autorole')
        client.commands.get('autorole').execute(message, prefix, args, Discord);
    else if(command === 'reactionrole')
        client.commands.get('reactionrole').execute(message, prefix, args, Discord, client);

    //Music and Audio
    else if(command === 'pause')
        client.commands.get('pause').execute(message, prefix, args, songQueue, Discord);
    else if(command === 'play')
        client.commands.get('play').execute(message, prefix, args, songQueue, Discord);
    else if(command === 'queue')
        client.commands.get('queue').execute(message, prefix, args, songQueue, Discord);
    else if(command === 'resume')
        client.commands.get('resume').execute(message, prefix, args, songQueue, Discord);
    else if(command === 'volume')
        client.commands.get('volume').execute(message, prefix, args, songQueue, Discord);

    //Miscellaneous
    else if(command === 'getprefix')
        client.commands.get('getprefix').execute(message, prefix, args, Discord);
    else if(command === 'help')
        client.commands.get('help').execute(message, args, Discord);
    else if(command === 'info')
        client.commands.get('info').execute(message, prefix, Discord);
    else if(command === 'random')
        client.commands.get('random').execute(message, prefix, args, Discord)
    else if(command === 'resetprefix')
        client.commands.get('resetprefix').execute(message, prefix, defaultPrefix, args, Discord);
    else if(command === 'setprefix')
        client.commands.get('setprefix').execute(message, prefix, args, Discord);
}

module.exports.executeCommand = executeCommand;