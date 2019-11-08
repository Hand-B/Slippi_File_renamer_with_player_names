const https = require('https');
const myapikey = 'SOmUSQH5ed3DnQqYfKAleVz0VRMuYNdMBSVYccYN'
const username = 'Mr_Handy'
const challonge = require('challonge');
const Promise = require('promise');
//const url = 'VictoryRoad110'
let getPlayerSet = (url) => {
	return new Promise( (resolve, reject) => {
	const client = challonge.createClient({
		apiKey: myapikey
	});

	var playerSet = new Set()
	client.participants.index({
	  id: url,
	  callback: (err, data) => {
		//console.log(err, data);
		
		for (var i = 0; i < Object.keys(data).length; i++){
			playerSet.add(data[i]["participant"]["name"]);
		}
		resolve(playerSet)
	  }
	});
	});
};
module.exports.getPlayerSet = getPlayerSet;
