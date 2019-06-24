const bridge = require('./bridge.js');
const db = bridge.getDB();
const logger = require('../util/logger.js');

const eventManagement = {
	addEvent: eventData => new Promise((resolve, reject) => {
		db.addEvent(eventData).then(data => {
			logger.info('[eventManagement - addEvent(eventData)]\n', data);
			resolve(data);
		}).catch(err => {
			logger.error('[eventsManagement - addEvent(eventData)]\n', err);
			reject(err);
		});
	}),
	getEvents: () => new Promise((resolve, reject) => {
		db.getEvents().then(data => {
			logger.info('[eventsManagement - getEvents()]\n', data);
			resolve(data);
		}).catch(err => {
			logger.error('[eventsManagement - getEvents()]\n', err);
			reject(err);
		});
	})
};

module.exports = eventManagement;
