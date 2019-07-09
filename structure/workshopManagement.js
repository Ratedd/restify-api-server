const bridge = require('./bridge.js');
const db = bridge.getDB();
const logger = require('../util/logger.js');
const uuid = require('uuid/v4');

const workshopManagement = {
	addWorkshop: workshopData => new Promise(async (resolve, reject) => {
		let uuidUsed = false;
		let newUUID;
		const preData = {
			uuid: uuid(),
			workshopName: workshopData.workshopName,
			description: workshopData.description,
			workshopThumbnail: workshopData.workshopThumbnail,
			workshopDate: workshopData.workshopDate,
			addedByAdmin: workshopData.addedByAdmin
		};

		const uuidExist = await db.getWorkshopByUUID(preData.uuid).catch(err => logger.error(err));

		if (uuidExist) {
			uuidUsed = true;
		}

		while (uuidUsed) {
			newUUID = uuid();
			const dataUUID = await db.getAccountByUUID(newUUID).catch(err => logger.error(err));

			if (dataUUID) continue;
			uuidUsed = false;
			preData.uuid = newUUID;
		}

		db.addWorkshop(preData).then(data => {
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
			if (data.count <= 0) {
				resolve();
			}
			resolve(data);
		}).catch(err => {
			logger.error('[workshopManagement - getWorkshops()]\n', err);
			reject(err);
		});
	}),
	getWorkshopByUUID: workshopUUID => new Promise((resolve, reject) => {
		db.getWorkshopByUUID(workshopUUID).then(data => {
			logger.info('[workshopManagement - getWorkshopByUUID(uuid)]\n', data);
			resolve(data);
		}).catch(err => {
			logger.error('[workshopManagement - getWorkshopByUUID(uuid)]\n', err);
			reject(err);
		});
	})
};

module.exports = workshopManagement;
