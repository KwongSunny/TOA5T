function executeCommand(param){
    let calledCommand = param.command;

    //aliases
        //Roles and Permissions
            if(calledCommand === 'listperm' || calledCommand === 'listperms' || calledCommand === 'listpermission')
                calledCommand = 'listpermissions';
            else if(calledCommand === 'setperm' || calledCommand === 'setperms' || calledCommand === 'setpermission')
                calledCommand = 'setpermissions';

        //Music and Audio
            else if(calledCommand === 'next')
                calledCommand = 'skip';
            else if(calledCommand === 'q')
                calledCommand = 'queue';
            else if(calledCommand === 'vol')
                calledCommand = 'volume';

    //exceptions
        //if you queue a song, trigger play
            if(calledCommand === 'queue' && param.args !== '' && param.args !== 'help'){
                calledCommand = 'play';
            }

    let command = param.client.commands.get(calledCommand);
    if(command) command.execute(param);
}

module.exports.executeCommand = executeCommand;