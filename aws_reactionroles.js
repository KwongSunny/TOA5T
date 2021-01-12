const AWS = require('aws-sdk');
const uuid = require('uuid');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-east-2"
});

const dynamodb = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = 'pixelbot_servers';

async function returnServers(){
    let param = {
        TableName: tableName
    }

    docClient.scan(param, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("scan succeeded:", JSON.stringify(data, null, 2));
            return data;
        }
    });
}

 function getItem(server_id){
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
                reject(err)
            } else {
                console.log("get succeeded:", JSON.stringify(data, null, 2));
                resolve(data)
            }
        });
    })

  
}

function writeItem(server_id, post_id, channel_id, roles){
    let param = {
        TableName: tableName,
        Item: {
            "server_id": server_id,
            "reactionrole_post_id": post_id,
            "reactionrole_channel_id": channel_id,
            "roles": roles
        }
    }

    docClient.put(param, function(err, data) {
        if (err) {
            console.error("Unable to write item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("write succeeded:", JSON.stringify(data, null, 2));
        }
    });

}

function updateItem(server_id, key, value){
    let param = {
        TableName: tableName,
        Key: {
            "server_id": server_id
        },
        UpdateExpression: `set ${key}=:k`,
        ExpressionAttributeValues: {
            ":k": value
        },
        ReturnValues: "UPDATED_NEW"
    };

    docClient.update(param, function(err, data) {
        if (err) {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
        }
    });
}

async function cacheMessages(){
    let param = {
        TableName: tableName,
        FilterExpression: 'reactionrole_channel_id <> :id',
        ExpressionAttributeValues: {':id': ""}
    }

    let table = new Promise((resolve, reject)=>{
        docClient.scan(param, function(err, data) {
            if (err) {
                console.error("Unable to scan item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err)
            } else {
                console.log("scan succeeded:", JSON.stringify(data, null, 2));
                resolve(data)
            }
        });
    });

}

module.exports.returnServers = returnServers;
module.exports.getItem = getItem;
module.exports.writeItem = writeItem;
module.exports.updateItem = updateItem;
module.exports.cacheMessages = cacheMessages;