const https = require('https');
const apikey = 'SOmUSQH5ed3DnQqYfKAleVz0VRMuYNdMBSVYccYN'
const username = 'Mr_Handy'

https.get('https://'+username+':'+ apikey+'@api.challonge.com/v1/tournaments/VictoryRoad110/participants.json', (resp) => {
  let data = '';

  // A chunk of data has been recieved.
  resp.on('data', (chunk) => {
    data += chunk;
  });
  console.log(resp);

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
    console.log(JSON.parse(data).explanation);
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});