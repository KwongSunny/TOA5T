const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-east-2"
});

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = 'pixelbot_servers';

//returns a promise of the item from dynamodb using the server_id key
function fetchServer(server_id){
    let param = {
        TableName: tableName,
        Key: {
            "server_id": server_id
        }
    }
    return new Promise((resolve, reject)=>{
        docClient.get(param, function(err, data) {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
            } 
            else {
                //console.log("Read succeeded:", JSON.stringify(data, null, 2));
                resolve(data);
            }
        });
    }) 
}

//looks for and fetches a message in a server by id
async function fetchMessageFromGuild(guild, messageId){
    return new Promise((resolve, reject) => {
        let channels = guild.channels.cache;
        channels.each(async channel => {
            let messageManager = channel.messages;
            if(messageManager){
                try {
                    let fetchedMessage = await channel.messages.fetch(messageId);
                    if(fetchedMessage) resolve(fetchedMessage);
                }catch(e){
                    if(e.message !== 'Unknown Message')
                        reject(e);
                }
            }
        });
    });
}

//writes an items to the dynamodb database
function writeItem(server_id){
    let param = {
        TableName: tableName,
        Item: {
            "server_id": server_id
        }
    }

    docClient.put(param, function(err, data) {
        if (err) {
            console.error("Unable to write item. Error JSON:", JSON.stringify(err, null, 2));
        } 
        else {
            //console.log("Write succeeded:", JSON.stringify(data, null, 2));
        }
    });

}

//updates an item in the dynamodb database
function updateItem(server_id, keys, values){
    let updateExpression = 'set ';
    let expressionAttributeValues = {};
    for(key = 0; key < keys.length; key++){
        if(key === keys.length-1)
            updateExpression += keys[key] + '=:' + key;
        else
            updateExpression += keys[key] + '=:' + key + ', ';
        expressionAttributeValues[':' + key] = values[key];
    }

    let param = {
        TableName: tableName,
        Key: {
            "server_id": server_id
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "UPDATED_NEW"
    };

    docClient.update(param, function(err, data) {
        if (err) {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
        } 
        else {
            //console.log("Update succeeded:", JSON.stringify(data, null, 2));
        }
    });
}

module.exports.fetchServer = fetchServer;
module.exports.fetchMessageFromGuild = fetchMessageFromGuild;
module.exports.writeItem = writeItem;
module.exports.updateItem = updateItem;