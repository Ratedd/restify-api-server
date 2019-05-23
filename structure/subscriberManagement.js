const bridge = require('./bridge.js');
const db = bridge.getDB();
const logger = require('../util/logger.js');

const subscriberManagement = {
	addSubscriber: data => new Promise((resolve, reject) => {
		db.getSubscriberById(data.id).then(subscriberInfo => {
			if (subscriberInfo) {
				resolve();
				return;
			}
			db.addSubscriber(data).then(subscriber => {
				logger.info('[subscriberManagement - addSubscriber(data): 2]\n', subscriber);
				resolve(subscriber);
			}).catch(err => {
				logger.error('[subscriberManagement - addSubscriber(data): 2]\n', err);
				reject(err);
			});
		}).catch(err => {
			logger.error('[subscriberManagement - addSubscriber(data): 1]\n', err);
			reject(err);
		});
	}),
	removeSubscriber: id => new Promise((resolve, reject) => {
		db.getSubscriberById(id).then(data => {
			if (!data) {
				resolve();
				return;
			}
			db.removeSubscriber(id).then(subscriber => {
				logger.info('[subscriberManagement - removeSubscriber(id): 2]\n', subscriber);
				resolve(subscriber);
			}).catch(err => {
				logger.info('[subscriberManagement - removeSubscriber(id): 2]\n', err);
				reject(err);
			});
		}).catch(err => {
			logger.info('[subscriberManagement - removeSubscriber(id): 1]\n', err);
			reject(err);
		});
	}),
	getSubscribers: () => new Promise((resolve, reject) => {
		db.getSubscribers().then(data => {
			if (data.count < 1) {
				resolve();
				return;
			}
			logger.info('[subscriberManagement - getSubscribers()]\n', data);
			resolve(data);
		}).catch(err => {
			logger.error('[subscriberManagement - getSubscribers()]\n', err);
			reject(err);
		});
	}),
	getSubscriberById: id => new Promise((resolve, reject) => {
		db.getSubscriberById(id).then(data => {
			if (!data) {
				resolve(data);
				return;
			}
			logger.info('[subscriberManagement - getSubscriberById(id)]\n', data);
			resolve(data);
		}).catch(err => {
			logger.error('[subscriberManagement - getSubscriberById(id)]\n', err);
			reject(err);
		});
	})
};

module.exports = subscriberManagement;
