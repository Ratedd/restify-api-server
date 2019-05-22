const bridge = require('./bridge.js');
const db = bridge.getDB();
const logger = require('../util/logger.js');

const subscriberManagement = {
	addSubscriber: data => new Promise((resolve, reject) => {
		db.addSubscriber(data).then(subscriber => {
			logger.info('[subscriberManagement - addSubscriber(data): 1]\n', subscriber);
		}).catch(err => {
			logger.error('[subscriberManagement - addSubscriber(data): 1]\n', err);
		});
	})
};

module.exports = subscriberManagement;
