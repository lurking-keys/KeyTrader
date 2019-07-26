var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('message', function(user, userID, channelID, message, event) {
	//if(message.author.bot) return;
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
	//first ID is prod, second is dev
	logger.info(message);
	var fs = require('fs');
	var path = require('path');
	// checking that userIDs.txt and keys.txt and key_sources.txt are valid
	fs.access('./userIDs.txt', fs.F_OK, (err) => {
		  if (err) {
			logger.info('Creating blank userIDs file.');
			fs.closeSync(fs.openSync("userIDs.txt", 'w'));
			return
		  }
	});
	fs.access('./keys.txt', fs.F_OK, (err) => {
		  if (err) {
			logger.info('Creating blank userIDs file.');
			fs.closeSync(fs.openSync("keys.txt", 'w'));
			return
		  }
	});
	fs.access('./key_log.txt', fs.F_OK, (err) => {
		  if (err) {
			logger.info('Creating blank userIDs file.');
			fs.closeSync(fs.openSync("key_log.txt", 'w'));
			return
		  }
	});

	if (message.substring(0, 1) == '!') {
		var args = message.substring(1).split(' ');
		var cmd = args.shift();
		switch(cmd) {
			// !ping
			/*case 'pmme':
				bot.sendMessage({to:userID,message:"PM'ed my dude"});
				break;*/
			case 'getkey':
				//var fs = require('fs'),
				var path = require('path'),    
					keyPath = path.join(__dirname, 'keys.txt');
					
				// check they haven't gotten a key before
				fs.readFile(path.join(__dirname, 'userIDs.txt'), {encoding: 'utf-8'}, function (err,text) {
					if (!err) {
						var good = true;
						var lines = text.split('\n');
						for (var i=0; i < lines.length; i++) {
							if (lines[i].trim()==userID.trim()) {
								good = false;
							}
						}
						if (good) { // send out first code in file
							fs.readFile(keyPath, {encoding: 'utf-8'}, function(err,text){
								if (!err) {
									var lines = text.split('\n');
									var key = lines.shift()
									if (!/^[a-zA-Z0-9]{15}$/.test(key)) {
										bot.sendMessage({to:channelID, message: "Out of keys at the moment :/ please check back later!"})
										var date = new DateTime();
										fs.appendFileSync('key_log.txt', '\n'.concat(new Date().getTime(), ": User ", user, " tried to get a key but we were out."));
									} else {
										if (!bot.directMessages[channelID]) {
											bot.sendMessage({to:channelID,message:"I'm PMing you a code, ".concat(user,".")});
										} 
										bot.sendMessage({to:userID, message: "Key: ".concat(key)});
										bot.sendMessage({to:userID, message: 'Please get your keys and direct message them to me one at a time with "!givekey <key>", ex: !givekey xdZpPjfMANtUKjf'});
										bot.sendMessage({to:userID, message: 'This system is only possible with your help! Thanks for participating!'});
										fs.appendFileSync('key_log.txt', '\n'.concat(new Date().getTime(), ": User ", user, " received key ", key));
										// add user to list
										//const fs = require('fs');
										try {
										  fs.unlinkSync(path.join(__dirname, 'userIDs.txt'))
										  //file removed
										} catch(err) {
										  bot.sendMessage({to:channelID,message: "Error in fs.unlinkSync, see console for details: ".concat(err)});
										  console.log(err);
										}
										//write new users file
										fs.writeFile("userIDs.txt", lines.join('\n').concat('\n',userID), (err) => {
										  if (err) { 
											bot.sendMessage({to:channelID,message: "Error in fs.writeFile, see console for details: ".concat(err)});
											console.log(err);
										  }
										});
										
										// new file is ready, remove old file
										
										try {
										  fs.unlinkSync(path.join(__dirname, 'keys.txt'))
										  //file removed
										} catch(err) {
										  bot.sendMessage({to:channelID,message: "Error in fs.unlinkSync, see console for details: ".concat(err)});
										  console.log(err);
										}
										// time to write new file
										fs.writeFile("keys.txt", lines.join('\n'), (err) => {
										  if (err) { 
											bot.sendMessage({to:channelID,message: "Error in fs.writeFile, see console for details: ".concat(err)});
											console.log(err);
										  }
										});
									}
									
								} else {
									logger.info(err);
								}
							});
						} else {
							bot.sendMessage({to:channelID, message: "It seems you've already gotten a key from me; contact 'lurking' if this is an error or your first key did not work."});
							fs.appendFileSync('key_log.txt', '\n'.concat(new Date().getTime(), ": User ", user, " tried to get a second key."));
						}
					} else {
						logger.info(err);
					}
				});
				break;
			case 'givekey':
				if (!bot.directMessages[channelID]) { // we'll have to disable his ability to read other chat channels
					var newkey = args[0];
					if (/^[a-zA-Z0-9]{15}$/.test(newkey)) {
						bot.sendMessage({to:channelID, message: "Please, only send me keys through PM. That key you've just posted is fair game for anyone now and shouldn't be given to me."});
					} else {
						bot.sendMessage({to:channelID, message: "Firstly, that doesn't look like a valid key. Secondly, please only send me keys through PM. If by some chance that's a real key, it is now fair game for anyone and shouldn't be given to me again."});
					}
				} else {
					var filePath = path.join(__dirname, 'keys.txt');
					// send out first code in file
					fs.readFile(filePath, {encoding: 'utf-8'}, function(err,text){
						if (!err) {
							var lines = text.split('\n');
							var newkey = args[0];
							if (/^[a-zA-Z0-9]{15}$/.test(newkey)) {
								bot.sendMessage({to:userID, message: "Adding ".concat(newkey.concat(" to keys list!"))});
								lines.push(newkey);
								// new file is ready, remove old file
								//const fs = require('fs');
								try {
								  fs.unlinkSync(path.join(__dirname, 'keys.txt'))
								  //file removed
								} catch(err) {
								  bot.sendMessage({to:channelID,message: "Error in fs.readFile, see console for details: ".concat(err)});
								  console.log(err);
								}
								// time to write new file
								if (lines.length == 0) {
												fs.closeSync(fs.openSync("keys.txt", 'w'));
								}else {
									fs.writeFile("keys.txt", lines.join('\n').trim(), (err) => {
									  if (err) { 
										bot.sendMessage({to:channelID,message: "Error in fs.writeFile, see console for details: ".concat(err)});
										console.log(err);
									  }
									});
								}
								fs.appendFileSync('key_log.txt', '\n'.concat(new Date().getTime(), ": User ", user, " added key ", newkey));
							} else {
								bot.sendMessage({to:userID, message: "That doesn't look like a key. Please Please contact 'lurking' if you're getting this error with a real key."});
								bot.sendMessage({to:userID, message: "Example command usage: !givekey xdZpPjfMANtUKjf"});
								logger.info("Possibly false key: ".concat(newkey," received from ", user));
								fs.appendFileSync('key_log.txt', '\n'.concat(new Date().getTime(), ": User ", user, " tried to give false key ", key));
							}
							
						} else {
							bot.sendMessage({to:channelID,message: err});
						}
					});
				}
				break;
			case 'clearusers':
				//const fs = require('fs');
				if( '603607990813065217' == userID || '600768173955874838' == userID) {
					
					try {
					  fs.unlinkSync(path.join(__dirname, 'userIDs.txt'))
					  //file removed
					} catch(err) {
					  bot.sendMessage({to:channelID,message: "Error in fs.unlinkSync, see console for details: ".concat(err)});
					  console.log(err);
					}
					fs.closeSync(fs.openSync("userIDs.txt", 'w'));
					bot.sendMessage({to:channelID,message: "User list cleared."});
					fs.appendFileSync('key_log.txt', '\n'.concat(new Date().getTime(), ": User ", user, " cleared the users list."));
				} else {
					bot.sendMessage({to:channelID,message: "You don't have permissions to do that."});
					fs.appendFileSync('key_log.txt', '\n'.concat(new Date().getTime(), ": User ", user, " tried to clears the users list and was denied."));
				}
				break;
			case 'help':
				bot.sendMessage({to:channelID, message: "This command will describe the bot and list valid commands: !givekey, !getkey, !clearusers, !help"});
				break;
			/*case 'userid':
				bot.sendMessage({to:channelID, message: userID});
				break; */
			default:
				bot.sendMessage({to:channelID, message: "Sorry, I didn't understand that. Valid commands are: !help, !givekey, !getkey, !clearusers"});
				break;
		 }
	 }
	
});