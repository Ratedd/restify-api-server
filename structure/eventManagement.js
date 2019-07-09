const bridge = require('./bridge.js');
const db = bridge.getDB();
const logger = require('../util/logger.js');
const uuid = require('uuid/v4');

const eventManagement = {
	addEvent: eventData => new Promise(async (resolve, reject) => {
		let uuidUsed = false;
		let newUUID;
		const preData = {
			uuid: uuid(),
			eventName: eventData.workshopName,
			description: eventData.description,
			eventThumbnail: eventData.eventThumbnail,
			eventDate: eventData.eventDate,
			addedByAdmin: eventData.addedByAdmin
		};

		const uuidExist = await db.getEventByUUID(preData.uuid).catch(err => logger.error(err));

		if (uuidExist) {
			uuidUsed = true;
		}

		while (uuidUsed) {
			newUUID = uuid();
			const dataUUID = await db.getEventByUUID(newUUID).catch(err => logger.error(err));

			if (dataUUID) continue;
			uuidUsed = false;
			preData.uuid = newUUID;
		}

		db.addEvent(preData).then(data => {
			logger.info('[eventManagement - addEvent(eventDate)]\n', data);
			resolve(data);
		}).catch(err => {
			logger.error('[eventManagement - addEvent(eventDate)]\n', err);
			reject(err);
		});
	}),
	getEvents: () => new Promise((resolve, reject) => {
		db.getEvents().then(data => {
			logger.info('[eventManagement - getEvents()]\n', data);
			if (data.count <= 0) {
				resolve();
			}
			resolve(data);
		}).catch(err => {
			logger.error('[eventManagement - getEvents()]\n', err);
			reject(err);
		});
	}),
	getEventByUUID: eventUUID => new Promise((resolve, reject) => {
		db.getEventByUUID(eventUUID).then(data => {
			logger.info('[eventManagement - getEventByUUID(eventUUID)]\n', data);
			resolve(data);
		}).catch(err => {
			logger.error('[eventManagement - getEventByUUID(eventUUID)]\n', err);
			reject(err);
		});
	})
};

module.exports = eventManagement;
