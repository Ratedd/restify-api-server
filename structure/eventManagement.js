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
			eventName: eventData.eventName,
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
	}),
	getEventAddedByUserID: userId => new Promise((resolve, reject) => {
		db.getEventAddedByUserID(userId).then(data => {
			logger.info('[eventManagement - getEventAddedByUserID]\n', data);
			resolve(data);
		}).catch(err => {
			logger.error('[eventManagement - getEventAddedByUserID]\n', err);
			reject(err);
		});
	}),
	deleteEventByID: uuid => new Promise((resolve, reject) => {
		db.deleteEventByID(uuid).then(done => {
			logger.info('[workshopManagement - deleteEventByID(uuid)]\n', done);
			db.deleteEventAttendance(uuid).then(data => {
				logger.info('[workshopManagement - deleteEventAttendance(uuid)]\n', data);
				resolve(data);
			}).catch(err => {
				logger.error('[workshopManagement - deleteEventAttendance(uuid)]\n', err);
				reject(err);
			});
		}).catch(err => {
			logger.error('[workshopManagement - deleteEventByID(uuid)]\n', err);
			reject(err);
		});
	})
};

module.exports = eventManagement;
