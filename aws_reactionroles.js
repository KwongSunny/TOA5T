const AWS = require('aws-sdk');
const uuid = require('uuid');

AWS.config.update({
    region: "us-east-2"
});

const dynamodb = new AWS.DynamoDB();
let docClient = new AWS.DynamoDB.DocumentClient();

async function returnServers(){
    await dynamodb.scan({TableName: 'pixelbot_servers'}, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("dynamodb GetItem succeeded:", JSON.stringify(data, null, 2));
        }
    });
    
    await docClient.scan({TableName: 'pixelbot_servers'}, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("docClient GetItem succeeded:", JSON.stringify(data, null, 2));
        }
    });
}

module.exports.returnServers = returnServers;