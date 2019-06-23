const bridge = require('./bridge.js');
const db = bridge.getDB();
const logger = require('../util/logger.js');

const eventManagement = {
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
