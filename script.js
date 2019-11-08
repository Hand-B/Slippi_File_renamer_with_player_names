const { default: SlippiGame } = require('slp-parser-js');
const brackets = require("./brackets");
var renameFiles = async function renameFiles(characterIDs,playerData,url=""){
	var fs = require('fs');
	//console.log(playerData);
	debugFile = "debug.txt"
	fs.writeFile(debugFile,"Debug File\n",function(){});
	var tourneyPlayers = new Set();
	var nameWidth = 5;
	if (url != ""){
		tourneyPlayers = await brackets.getPlayerSet(url);
	}
	var priorityPlayers = new Set([...Object.keys(playerData)].filter(i => tourneyPlayers.has(i)));
	var validNonPriorityPlayers = new Set([...Object.keys(playerData)].filter(i => !tourneyPlayers.has(i)));
	
	
	//Add prirority Players to debug
	var fullDebugText = "ALL Players At Tournament: "
	for (pPlayer of tourneyPlayers){
		fullDebugText += " "+pPlayer +","
	}
	fullDebugText = fullDebugText.slice(0, -1) + "\n";
	//Add prirority Players to debug
	var fullDebugText += "Valid Players At Tournament: "
	for (pPlayer of priorityPlayers){
		fullDebugText += " "+pPlayer +","
	}
	fullDebugText = fullDebugText.slice(0, -1) + "\n";
	const files = fs.readdirSync('./');//list of filenames 
	var slipfmt = new RegExp('.+\.slp');
	var gameID = 0;
	for( var i = 0; i < files.length ; i++){
		
		if( slipfmt.test(files[i])){
			fullDebugText += "-----------------------"+"\n"
			fullDebugText += "--------Game "+gameID+"------------\n"
			console.log(files[i]);
			const game = new SlippiGame(files[i]);
			const settings = game.getSettings()["players"];
			console.log(settings);
			var isTeamGame = game.getSettings()["isTeams"];
			var needVerifiy = false;
			var renameData = [];
			
			// for every player get character, tag, and color 
			for (var j =0; j < settings.length; j++){
				currPlayer =settings[j]
				var nametag = currPlayer["nametag"];
				var playerID = currPlayer["playerIndex"];
				var charID = currPlayer["characterId"];
				var teamID = currPlayer["teamId"];
				var colorID = currPlayer["characterColor"];
				var characterName = characterIDs[charID][0];
				var characterColor = characterIDs[charID][colorID+1];
				console.log(characterName,characterColor);
				var maxCert = 0;
				var nameDict = {}; // entries in form [player#,team#, bestname]
				var nameList = []; // entries in form [player#,team#, bestname]
		
				for (const [key, value] of Object.entries(playerData)) {
				  if (value != [] && key != "Player Name"){
					var cernt = certiantyOfMatch (value, nametag, characterName, characterColor);
					nameDict[key] = cernt
				  }
				}
				//sort the list best match first
				nameList = Object.entries(nameDict).sort(function(a, b){return b[1] - a[1]});
				//check if best match is >= 100 i.e. it matched the tag
				var bestName = ""
				//if tag matched best name is the players
				if (nameList[0][1] >= 100){
					bestName = nameList[0][0];
				}
				//otherwise the char name is best and verify set to true
				else{
					bestName = characterName;
					needVerifiy = true;
				}
				// add to player list for file rename 
				
				renameData.push([playerID,teamID,bestName]);

				var highProbability = [];
				for (const nameP of priorityPlayers){
					highProbability.push([nameP,nameDict[nameP]]);
				}
				var lowProbability = [];
				for (const nameP of validNonPriorityPlayers){
					lowProbability.push([nameP,nameDict[nameP]]);
				}
				fullDebugText += "---------  "+ characterName + " Team: "+teamID;
				fullDebugText += " Port: "+currPlayer["port"]+"  ---------\n";
				// Add non-zero high-priorityPlayers and non-zero alternative players to output
				if (nameList[0][1] > 0){	
					fullDebugText += "High Priority Macthes \n"
					var currCol = 0;
					for ([nameP,value] of highProbability){
						if (value > 0){
							fullDebugText +=  nameP + " : " +  value
							if ((currCol+1) >= nameWidth){
								fullDebugText += "\n"
							}else{
								fullDebugText+=" || "
							}
							currCol = (currCol +1)% nameWidth;
						}
					}
					fullDebugText += "\n";
					fullDebugText += "Lower Priority Macthes \n";
					currCol = 0;
					for ([nameP,value] of lowProbability){
						if (value > 0){
							fullDebugText +=  nameP + " : " +  value
							if ((currCol+1) >= nameWidth){
								fullDebugText += "\n"
							}else{
								fullDebugText+=" || "
							}
							currCol = (currCol +1)% nameWidth;
						}
					}
				}
				fullDebugText += "\n";
			}
			
			
			//rename file
			nameFile (files[i], needVerifiy, isTeamGame, renameData,gameID);
			gameID +=1; // inc game ID so each game has a uniqueID
		}
	}
	fs.appendFile(debugFile,fullDebugText,function(){});
};
module.exports.renameFiles = renameFiles;

function certiantyOfMatch (PlayerID, Tag, character, color){
	certianty = 0;
	//check if tag matches
	var tag1match  = PlayerID[0] != "" && (PlayerID[0] == Tag)
	var tag2match  = PlayerID[1] != "" && (PlayerID[1] == Tag)
	if (tag1match || tag2match){
		certianty =100;
	}
	//check if main matches
	if (PlayerID[2] == character){
		certianty += 20;
		//check if main color matches max for first color less for second
		if (PlayerID[3] == color){
			certianty += 20;
		}
		else if (PlayerID[4] == color){
			certianty += 10;
		}
	}
	//check if secondary matches
	if (PlayerID[5] == character){
		certianty += 10;
		//check if second color matches max for first color less for second
		if (PlayerID[6] == color){
			certianty += 20;
		}
		else if (PlayerID[7] == color){
			certianty += 10;
		}
	}
	return certianty;
	
		
		
}

function nameFile (file, needVerifiy, teamBool, playerData,gameID,filePath = "./"){
	var newFileName = "";
	var fs = require('fs');
	if (needVerifiy){
		newFileName = "ver_";
	}
	if (teamBool){
		//sort by team
		playerData.sort(function(a, b){return a[1] - b[1]});
		for (var i =0; i < playerData.length; i++){
			// entries in form [player#,team#, bestname]
			var playerNum = playerData[i][0];
			var team = playerData[i][1];
			var name = playerData[i][2].trim();
			newFileName+= name + "(P"+ playerNum +")";
			if (i+1 < playerData.length){
				futureT = playerData[i+1][1];
				if(futureT !=team){
					newFileName += "_VS_";
				}else{
					newFileName += "^";
				}
				
			}
		}
	}else{
		for (var i =0; i < playerData.length; i++){
			// entries in form [player#,team#, bestname]
			var playerNum = playerData[i][0];
			var name = playerData[i][2].trim();
			newFileName+= name + "(P"+ playerNum +")";
			if (i+1 < playerData.length){
				newFileName += "_VS_";
			}
		}
	}
	newFileName+=("G"+gameID+".slp");
	fs.rename(filePath+file, filePath+newFileName, function (err) {
	if (err) {console.log(err); return; }});
	
}