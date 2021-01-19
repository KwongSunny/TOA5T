function executeCommand(command, prefix, message, args, Discord, client){
    //assigns a default role to every new member DONE
    if(command === 'autorole')
        client.commands.get('autorole').execute(message, prefix, args, Discord);
    else if(command === 'ban')
        client.commands.get('ban').execute(message, args);
    //provides a list of commands
    else if(command === 'help')
        client.commands.get('help').execute(message);
    //gives basic information about the bot
    else if(command === 'info')
        client.commands.get('info').execute(message, prefix, Discord);
    //test function DONE
    else if(command === 'ping')
        client.commands.get('ping').execute(message);
    else if(command === 'kick')
        client.commands.get('kick').execute(message, args)
    //stops the bot DONE, only to be used by bot admins
    else if(command === 'kill')
        client.commands.get('kill').execute(message, client);
    //randomizer command, gives a random output based on the parameters NEED TO DO EMBEDS | ARGS SEPERATES SPACED ITEMS IN LIST (NEED TO GO OFF ENTIRE MESSAGE.CONTENT)
    else if(command === 'random')
        client.commands.get('random').execute(message, args, Discord)
    //modular reactionrole command ON STARTUP FIRST REACTION IS NOT READ, MESSAGE NEEDS TO BE CACHED ON STARTUP
    else if(command === 'reactionrole')
        client.commands.get('reactionrole').execute(prefix, message, args, Discord, client);
}

module.exports.executeCommand = executeCommand;