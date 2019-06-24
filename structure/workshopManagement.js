const bridge = require('./bridge.js');
const db = bridge.getDB();
const logger = require('../util/logger.js');

const workshopManagement = {
	addWorkshop: workshopData => new Promise((resolve, reject) => {
		db.addWorkshop(workshopData).then(data => {
			logger.info('[workshopManagement - addWorkshop(workshopData)]\n', data);
			resolve(data);
		}).catch(err => {
			logger.error('[workshopManagement - addWorkshop(workshopData)]\n', err);
			reject(err);
		});
	}),
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
