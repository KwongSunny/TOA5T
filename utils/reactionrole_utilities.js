const aws_utilities = require('./aws_utilities.js');
const emojiRegex = require('emoji-regex/RGI_Emoji.js');

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


//To ONLY be used in client.on() where listener is 'messageReactionAdd'
//adds a role to the user depending on their reaction on a reactionroles post
async function addRoleFromReaction(reaction, user){
    let response = await aws_utilities.getItem(reaction.message.guild.id.toString());
    //checks if the server is in the reactinroles db and the post being reacted to is the server's reactionroles post
    if(response && (reaction.message.id === response.Item.reactionrole_post_id)){
        let roleString = response.Item.roles;

        let args = roleString.trim().split(/,/);
        args = args.map(element => element.trim());

        //split the args array items into an array of [role, emoji] items
        let roleArgs = splitReactionArgs(args);

        //array of role items
        let roleList = []; 
        for(i = 0; i < args.length; i++){
            roleList.push(reaction.message.guild.roles.cache.find(role => role.name === roleArgs[i][0]));
        }
    
        for(i = 0; i < roleArgs.length; i++){
            let regex = emojiRegex();

            //checks if it's an unicode emoji
            let isEmoji = regex.test(roleArgs[i][1]);;

            if(isEmoji && reaction.emoji.name === roleArgs[i][1] || !isEmoji && reaction.emoji.id === roleArgs[i][1].split(':')[2].substring(0, roleArgs[i][1].split(':')[2].length-1))
                await reaction.message.guild.members.cache.get(user.id).roles.add(roleList[i]).catch(console.error);
        }
    }
}

//To ONLY be used in client.on() where listener is 'messageReactionRemove'
//removes a role from the user depending on their reaction on a reactionroles post
async function removeRoleFromReaction(reaction, user){
    let response = await aws_utilities.getItem(reaction.message.guild.id.toString());
    if(reaction.message.id === response.Item.reactionrole_post_id){
        let roleString = response.Item.roles;

        let args = roleString.trim().split(/,/);
        args = args.map(element => element.trim());

        //split the args array items into an array of [role, emoji] items
        let roleArgs = splitReactionArgs(args);

        //array of role items
        let roleList = []; 
        for(i = 0; i < args.length; i++){
            roleList.push(reaction.message.guild.roles.cache.find(role => role.name === roleArgs[i][0]));
        }
    
        for(i = 0; i < roleArgs.length; i++){
            let regex = emojiRegex();

            //checks if it's an unicode emoji
            let isEmoji = regex.test(roleArgs[i][1]);;

            if(isEmoji && reaction.emoji.name === roleArgs[i][1] || !isEmoji && reaction.emoji.id === roleArgs[i][1].split(':')[2].substring(0, roleArgs[i][1].split(':')[2].length-1))
                await reaction.message.guild.members.cache.get(user.id).roles.remove(roleList[i]).catch(console.error);
        }
    }
}

module.exports.splitReactionArgs = splitReactionArgs;
module.exports.addRoleFromReaction = addRoleFromReaction;
module.exports.removeRoleFromReaction = removeRoleFromReaction;