const AWS = require('aws-sdk');
const uuid = require('uuid');

AWS.config.update({
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
                //console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err)
            } else {
                //console.log("get succeeded:", JSON.stringify(data, null, 2));
                resolve(data)
            }
        });
    })

  
}

function writeItem(server_id, post_id, roles){
    let param = {
        TableName: tableName,
        Item: {
            "server_id": server_id,
            "reactionrole_post_id": post_id,
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

module.exports.returnServers = returnServers;
module.exports.getItem = getItem;
module.exports.writeItem = writeItem;