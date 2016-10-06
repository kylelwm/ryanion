var bluebird = require('bluebird');
var secret = require('../env/secret');
var response = require('./response');
var database = require('./database');
var scheduler = require('./scheduler');
var constant = require('./constant');

var token = secret.BOT_TOKEN;

secret.GOOGLE_CLOUD_API.keyFilename = 'env/keyfile.json';

// Cloud Vision example
var vision = require('@google-cloud/vision')(secret.GOOGLE_CLOUD_API);

// TelegramBot example
var TelegramBot = require('node-telegram-bot-api');

// Setup polling way
var bot = new TelegramBot(token, {polling: true});

bot.getMe().then(function(user) {
	bot.me = user;
});

bot.on('new_chat_participant', function(msg) {
	if(msg.new_chat_participant.id === bot.me.id) {
		console.log("BOT_ADDED_INTO_NEW_GROUP");
		var chatId = msg.chat.id;
		bot.sendMessage(chatId, response.GREETING_MESSAGE);
		bot.sendMessage(chatId, response.ASK_FLIGHT_INFORMATION_MESSAGE);
		var chatGroup = {
			chatId: chatId,
			phase: constant.PHASE.PRE_TRIP
		};
		database.saveChatGroup(chatGroup);
	}
});


bot.on('text', function(msg, match) {
	database.findChatById(msg.chat.id).then(function(chatGroup) {
		if(chatGroup.outboundFlight.flightNumber === undefined || 
			chatGroup.inboundFlight.flightNumber === undefined ) {
			var flightNumbers = msg.text.match(constant.FLIGHT_REGEX);
			console.log(flightNumbers);
			if(flightNumbers !== null && flightNumbers.length <= 2) {
				flightNumbers.forEach(function(flightNumber) {
				var buttons = [{
					text: "Outbound",
					callback_data: JSON.stringify({
						type: constant.FLIGHT_DIRECTION.OUTBOUND,
						flightNumber: flightNumber
					})
				}, {
					text: "Inbound",
					callback_data: JSON.stringify({
						type: constant.FLIGHT_DIRECTION.INBOUND,
						flightNumber: flightNumber
					})	
				}];

				var options = createHorizontalInlineButtons(buttons);

				bot.sendMessage(msg.chat.id, 
						response.ASK_CONFIRM_FLIGHT_MESSAGE + " " + flightNumber,
						options);
				});
			}
		}
	})

});

bot.on('callback_query', function(query) {
	console.log('Callback query');
	console.log(query);
	var chatId = query.message.chat.id;
	var messageId = query.message.message_id;

	var queryResponse = JSON.parse(query.data);

	// USE ACTUAL DATA
	var fake_offset_for_online_check_in_reminder = 20 * 1000;

	switch(queryResponse.type) {
		case constant.FLIGHT_DIRECTION.OUTBOUND:
			bot.sendMessage(chatId, response.SET_OUTBOUND_FLIGHT_MESSAGE);
			removeInlineKeyboard(chatId, messageId);
			setFlightInformation(chatId, queryResponse.type, queryResponse.flightNumber).then(function(flightInformation) {
				scheduler.addJob({
					time: flightInformation.departureTime - fake_offset_for_online_check_in_reminder,
					chatId: chatId,
					type: constant.EVENT_TYPE.ONLINE_CHECKIN
				});
			});
		break;

		case constant.FLIGHT_DIRECTION.INBOUND:
			bot.sendMessage(query.message.chat.id, response.SET_INBOUND_FLIGHT_MESSAGE);
			removeInlineKeyboard(chatId, messageId);
			setFlightInformation(chatId, queryResponse.type, queryResponse.flightNumber).then(function(flightInformation) {
				scheduler.addJob({
					time: flightInformation.departureTime - fake_offset_for_online_check_in_reminder,
					chatId: chatId,
					type: constant.EVENT_TYPE.ONLINE_CHECKIN
				});
			});
		break;
	}
});

database.event.on('DatabaseReadyEvent', function() {
	scheduler.loadExistingJobs();
});

scheduler.event.on('JobEvent', function(job) {
	console.log('Received job!');
	switch(job.type) {
		case constant.EVENT_TYPE.ONLINE_CHECKIN:
			bot.sendMessage(job.chatId, response.ONLINE_CHECKIN_MESSAGE);
		break;
		case constant.EVENT_TYPE.UPLOAD_PHOTO:
			bot.sendMessage(job.chatId, response.UPLOAD_PHOTO_MESSAGE);
		break;
		default:
			console.log("Unidentified job");
		break;
	}
});

// Dummy
function setFlightInformation(chatId, direction, flightNumber) {
	return new Promise(function(resolve, reject) {

		// GET ACTUAL DATA
		var currentTime = new Date().getTime();
		var tillOutboundFlight = 60 * 1000;
		var flightDuration = 60 * 1000;
		var holidayDuration = 60 * 1000;
		var origin = "SIN";
		var destination = "SV";

		database.findChatById(chatId).then(function(chatGroup) {
			switch(direction) {
				case constant.FLIGHT_DIRECTION.OUTBOUND:
					chatGroup.outboundFlight = {
						flightNumber: flightNumber,
						departureTime: currentTime + tillOutboundFlight,
						arrivalTime: currentTime + tillOutboundFlight + flightDuration,
						origin: origin,
						destination: destination
					};
					database.saveChatGroup(chatGroup);
					resolve(chatGroup.outboundFlight);
				break;
				case constant.FLIGHT_DIRECTION.INBOUND:
					chatGroup.outboundFlight = {
						flightNumber: flightNumber,
						departureTime: currentTime + tillOutboundFlight + flightDuration + holidayDuration,
						arrivalTime: currentTime + tillOutboundFlight + flightDuration + holidayDuration + flightDuration,
						origin: destination,
						destination: origin
					};
					database.saveChatGroup(chatGroup);
					resolve(chatGroup.inboundFlight);
				break;
			}
		})
	});
}

function removeInlineKeyboard(chatId, messageId) {
	bot.editMessageReplyMarkup({}, {
		chat_id: chatId,
		message_id: messageId 
	});
}

function createHorizontalInlineButtons(buttons) {
	var markup = {
		reply_markup: {
			inline_keyboard: [
				[]
			]	
		}
	};

	buttons.forEach(function(button) {
		markup.reply_markup.inline_keyboard[0].push(button);
	});

	return markup
}

module.exports = bot;