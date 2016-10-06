var bluebird = require('bluebird');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', initialize);

var EventEmitter = require('events');
class MyEventEmitter extends EventEmitter {}

var ChatGroups, JobList;

var database = {};

function initialize() {
	// Set up schema
	var chatGroupsSchema = mongoose.Schema({
		chatId: String,
		inboundFlight: {
			flightNumber: String,
			departureTime: Number,
			arrivalTime: Number,
			origin: String,
			destination: String
		},
		outboundFlight: {
			flightNumber: String,
			departureTime: Number,
			arrivalTime: Number,
			origin: String,
			destination: String
		},
		phase: String,	// Refer to constant.PHASE 
		photos: [String]
	});

	var jobListSchema = mongoose.Schema({
		type: String,
		time: Number,
		chatId: String
	});

	ChatGroups = mongoose.model('ChatGroups', chatGroupsSchema);
	JobList = mongoose.model('JobList', jobListSchema);
	database.event.emit('DatabaseReadyEvent');
}

database.event = new MyEventEmitter();

database.findChatById = function(chatId) {
	return new Promise(function(resolve, reject) {
		ChatGroups.findOne({chatId: chatId}, function(err, doc) {
			if(err) {
				reject(err);
			}
			resolve(doc);
		});
	});	
}

database.saveChatGroup = function(chatGroup) {
	return new Promise(function(resolve, reject) {
		ChatGroups.findOneAndUpdate(
			{chatId: chatGroup.chatId}, 
			chatGroup, 
			{upsert: true, new : true}, 
			function(err, doc) {
				if(err) {
					reject(err);
				}
				console.log('Saved');
				console.log(doc);
				resolve(doc);
			}
		);
	});
}

database.removeChatGroup = function(chatGroup) {
	return new Promise(function(resolve, reject) {
		ChatGroups.findOneAndRemove(
			{chatId: chatGroup.chatId}, 
			chatGroup,
			function(err, doc) {
				if(err) {
					reject(err);
				}
				resolve(doc);
			}
		);
	})
}

database.getJobList = function() {
	return new Promise(function(resolve, reject) {
		JobList.find()
			.sort({time: 1})
			.exec(function(err, doc) {
				if(err) {
					reject(err);
				}
				resolve(doc);
			});
	});
}

database.saveJob = function(job) {
	if(!job._id) {
		job._id = mongoose.Types.ObjectId();
	}
	return new Promise(function(resolve, reject) {
		JobList.findOneAndUpdate(
			{_id: job._id},
			job,
			{upsert: true, new: true},
			function(err, doc) {
				if(err) {
					reject(err);
				}
				console.log('Saved');
				console.log(doc);
				resolve(doc);
			}
		);
	});
}

database.removeJob = function(job) {
	return new Promise(function(resolve, reject) {
		JobList.findOneAndRemove(
			{_id: job._id}, 
			job,
			function(err, doc) {
				if(err) {
					reject(err);
				}
				resolve(doc);
			}
		);
	});
}

module.exports = database;