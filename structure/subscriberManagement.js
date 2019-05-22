const bridge = require('./bridge.js');
const db = bridge.getDB();
const logger = require('../util/logger.js');

const subscriberManagement = {
	addSubscriber: data => new Promise((resolve, reject) => {
		db.addSubscriber(data).then(subscriber => {
			logger.info('[subscriberManagement - addSubscriber(data): 1]\n', subscriber);
			resolve(subscriber);
		}).catch(err => {
			logger.error('[subscriberManagement - addSubscriber(data): 1]\n', err);
			reject(err);
		});
	}),
	removeSubscriber: id => new Promise((resolve, reject) => {
		db.removeSubscriber(id).then(subscriber => {
			logger.info('[subscriberManagement - removeSubscriber(id)]\n', subscriber);
			resolve(subscriber);
		}).catch(err => {
			logger.info('[subscriberManagement - removeSubscriber(id)]\n', err);
			reject(err);
		});
	})
};

module.exports = subscriberManagement;
