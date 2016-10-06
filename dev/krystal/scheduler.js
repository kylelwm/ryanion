var schedule = require('node-schedule');
var EventEmitter = require('events');
class MyEventEmitter extends EventEmitter {}
var database = require('./database');
var scheduler = {};

scheduler.loadExistingJobs = function() {
	console.log('Getting job list from database');

	database.saveJob({
		type: "SLEEP",
		chatId: "1234",
		time: new Date().getTime() + 5000
	});

	database.getJobList().then(function(jobList) {
		var currentTime = new Date().getTime();
		jobList.forEach(function(job) {
			if(job.time < currentTime) {
				console.log('Legacy job!');
				database.removeJob(job);
			} else {
				console.log('Can be done job!');
				scheduleJob(job);
			}
		});
	})
}

scheduler.addJob = function(job) {
	console.log('Adding job');
	database.saveJob(job).then(function(dbJob) {
		console.log('Added job');
		scheduleJob(dbJob);
	})
}


scheduler.event = new MyEventEmitter();

function scheduleJob(job) {
	console.log('Scheduling job');
	schedule.scheduleJob(new Date(job.time), function() {
		//emit event
		scheduler.event.emit('JobEvent', job);
		//remove from database
		database.removeJob(job);
	});
}

module.exports = scheduler;