var express = require('express');
var bluebird = require('bluebird');
var secret = require('../env/secret');
var token = secret.BOT_TOKEN;
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

secret.GOOGLE_CLOUD_API.keyFilename = 'env/keyfile.json';

// Cloud Vision example
var vision = require('@google-cloud/vision')(secret.GOOGLE_CLOUD_API);

// TelegramBot example
var TelegramBot = require('node-telegram-bot-api');

// Setup polling way
var bot = new TelegramBot(token, {polling: true});

// Matches /echo [whatever]
bot.onText(/\/echo (.+)/, function (msg, match) {
	var fromId = msg.from.id;
	var chatId = msg.chat.id;
	console.log(msg);
	var resp = match[1];
	bot.sendMessage(chatId, resp);
});

// Matches /echo [whatever]
bot.onText(/\/whoami/, function (msg, match) {
	var fromId = msg.from.id;
	var chatId = msg.chat.id;
	bot.sendMessage(chatId, resp);
});

//bot.sendMessage(-168589576, "");

// Any kind of message
bot.on('text', function (msg) {
	console.log(msg);
});

// Any kind of message
bot.on('photo', function (msg) {
	var fromId = msg.from.id;
	var chatId = msg.chat.id;
	var highestResolutionPhoto = msg.photo[msg.photo.length-1];
	bot.getFileLink(highestResolutionPhoto.file_id).then(function(res) {
		detectLandmark(res).then(function(apiResponse) {
			console.log(apiResponse.responses[0]);
			if(!apiResponse.responses[0].landmarkAnnotations) {
				var resp = 'I can\'t tell where this picture is taken.'
				bot.sendMessage(chatId, resp);
			} else {
				var landmark = apiResponse.responses[0].landmarkAnnotations[0];
				var score = Math.ceil(landmark.score * 20) * 5
				var coordinates = landmark.locations[0].latLng;

				var inlineKeyboardMarkup = {
					reply_markup: {
						inline_keyboard: [
							[{
								text: "Correct",
								callback_data: '0'
							}, {
								text: "Wrong",
								callback_data: '1'
							}]
						]	
					}
				}

				console.log(coordinates);
				var resp = "I am " + score + "% sure that this is the " + landmark.description;
				bot.sendMessage(chatId, resp);
				bot.sendLocation(chatId, coordinates.latitude, coordinates.longitude, inlineKeyboardMarkup);
			}
		});
	});
});

function detectLandmark(img) {
	var opts = {
		verbose: true
	};

	return new Promise(function(resolve, reject) {
		vision.detectLandmarks(img, opts, function(err, landmarks, apiResponse) {
			resolve(apiResponse);
		});
	});
}


module.exports = router;