const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-east-2"
});

const docClient = new AWS.DynamoDB.DocumentClient();
const serverTable = 'pixelbot_servers';
const raffleTable = 'toast_raffles';

//returns a promise of the item from dynamodb using the server_id key
//fetches a single item
function fetchServer(server_id){
    let param = {
        TableName: serverTable,
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
                if(!data.Item) resolve(null);
                else resolve(data);
            }
        });
    }) 
}

//writes an items to the dynamodb database
function writeItem(server){
    let param = {
        TableName: serverTable,
        Item: {
            "server_id": server.id,
            "server_name": server.name
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
        TableName: serverTable,
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

function deleteServer(server){
    let param = {
        TableName: serverTable,
        Key: {
            "server_id": server.id
        }
    }
    docClient.delete(param, function(err, data) {
        if (err) {
            console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
        } 
        else {
            //console.log("Update succeeded:", JSON.stringify(data, null, 2));
        }
    });
}

function fetchServers(){
    let param = {
        TableName: serverTable
    }
    return new Promise((resolve, reject)=>{
        docClient.scan(param, function(err, data) {
            if (err) {
                console.error("Unable to scan table. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
            } 
            else {
                //console.log("Read succeeded:", JSON.stringify(data, null, 2));
                if(!data.Items) resolve(null);
                else resolve(data);
            }
        });
    }) 
}

//fetches Items of raffles, fetches no more than 1mb
function fetchRaffles(){
    let param = {
        TableName: raffleTable
    }
    return new Promise((resolve, reject)=>{
        docClient.scan(param, function(err, data) {
            if (err) {
                console.error("Unable to scan table. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
            } 
            else {
                //console.log("Read succeeded:", JSON.stringify(data, null, 2));
                if(!data.Items) resolve(null);
                else resolve(data);
            }
        });
    }) 
}

function writeRaffle(raffle){
    let param = {
        TableName: raffleTable,
        Item: {
            'message_id': raffle.message_id,
            'name': raffle.name,
            'description': raffle.description,
            'year': raffle.year,
            'month': raffle.month,
            'day': raffle.day,
            'time': raffle.time,
            'timeZone': raffle.timeZone,
            'raffle_status': raffle.raffle_status,
            "channel_id": raffle.channel_id,
            "server_id": raffle.server_id,
            'host': raffle.host
        }
    }
    docClient.put(param, function(err, data) {
        if (err) {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
        } 
        else {
            //console.log("Update succeeded:", JSON.stringify(data, null, 2));
        }
    });
}

function updateRaffle(raffleMessageId, keys, values){
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
        TableName: raffleTable,
        Key: {
            "message_id": raffleMessageId
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "UPDATED_NEW"
    };

    docClient.update(param, function(err, data) {
        if (err) {
            console.error("Unable to update raffle. Error JSON:", JSON.stringify(err, null, 2));
        } 
        else {
            //console.log("Update succeeded:", JSON.stringify(data, null, 2));
        }
    });


}

function deleteRaffle(raffleMessageId){
    let param = {
        TableName: raffleTable,
        Key: {
            "message_id": raffleMessageId
        }
    }
    docClient.delete(param, function(err, data) {
        if (err) {
            console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
        } 
        else {
            //console.log("Update succeeded:", JSON.stringify(data, null, 2));
        }
    });
}

module.exports.fetchServer = fetchServer;
module.exports.writeItem = writeItem;
module.exports.updateItem = updateItem;
module.exports.deleteServer = deleteServer;
module.exports.fetchServers = fetchServers;

module.exports.fetchRaffles = fetchRaffles;
module.exports.writeRaffle = writeRaffle;
module.exports.updateRaffle = updateRaffle;
module.exports.deleteRaffle = deleteRaffle;