const bridge = require('./bridge.js');
const db = bridge.getDB();
const logger = require('../util/logger.js');

const workshopManagement = {
	getWorkshops: () => new Promise((resolve, reject) => {
		db.getWorkshops().then(data => {
			logger.info('[workshopManagement - getWorkshops()]\n', data);
			resolve(data);
		}).catch(err => {
			logger.error('[workshopManagement - getWorkshops()]\n', err);
			reject(err);
		});
	})
};

module.exports = workshopManagement;
