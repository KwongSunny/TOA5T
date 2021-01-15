//(Param)args: ['role:emoji', 'role:emoji'...]
//(Desc):split the args array items into an array of [role, emoji] items
//(Return): [['role', 'emoji'], ['role', 'emoji']...]
function splitReactionArgs(args){
    const returnArr = [];
    for(i = 0; i < args.length; i++){
        let arr = [];
        arr.push(args[i].substring(0, args[i].indexOf(':')));
        arr.push(args[i].substring(args[i].indexOf(':')+1));

        returnArr.push(arr);
    }
    return returnArr;
}

module.exports.splitReactionArgs = splitReactionArgs;