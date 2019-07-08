const bridge = require('./bridge.js');
const db = bridge.getDB();
const logger = require('../util/logger.js');

const attendanceManagement = {
	addWorkshopAttendance: data => new Promise((resolve, reject) => {
		db.getWorkshopAttendance(data.uuid).then(workshopAttendance => {
			if (!workshopAttendance) {
				const newArr = [];
				newArr.push(data.details);
				const details = {
					uuid: data.uuid,
					attendees: newArr
				};
				db.addWorkshopAttendance(details).then(done => {
					logger.info('[attendanceManagement - addWorkshopAttendance(data)]\n', done);
					resolve(done);
				}).catch(err => {
					logger.error('[attendanceManagement - addWorkshopAttendance(data)]\n', err);
					reject(err);
				});
				return;
			}
			const newArr = workshopAttendance.attendees;
			newArr.push(data.details);
			db.updateWorkshopAttendance(data.uuid, newArr).then(done => {
				logger.info('[attendanceManagement - addWorkshopAttendance(data)]\n', done);
				resolve(done);
			}).catch(err => {
				logger.error('[attendanceManagement - addWorkshopAttendance(data)]\n', err);
				reject(err);
			});
		}).catch(err => {
			logger.error('[attendanceManagement - addWorkshopAttendance(data)]\n', err);
			reject(err);
		});
	}),
	getWorkshopAttendanceByUUID: uuid => new Promise((resolve, reject) => {
		db.getWorkshopAttendance(uuid).then(data => {
			logger.info('[attendanceManagement - getWorkshopAttendanceByUUID(uuid)]\n', data);
			resolve(data);
		}).catch(err => {
			logger.error('[attendanceManagement - getWorkshopAttendanceByUUID(uuid)]\n', err);
			reject(err);
		});
	}),
	addEventAttendance: data => new Promise((resolve, reject) => {
		db.getEventAttendance(data.uuid).then(eventAttendance => {
			if (!eventAttendance) {
				const newArr = [];
				newArr.push(data.details);
				const details = {
					uuid: data.uuid,
					attendees: newArr
				};
				db.addEventAttendance(details).then(done => {
					logger.info('[attendanceManagement - addEventAttendance(data)]\n', done);
					resolve(done);
				}).catch(err => {
					logger.error('[attendanceManagement - addEventAttendance(data)]\n', err);
					reject(err);
				});
				return;
			}
			const newArr = eventAttendance.attendees;
			newArr.push(data.details);
			db.updateEventAttendance(data.uuid, newArr).then(done => {
				logger.info('[attendanceManagement - addEventAttendance(data)]\n', done);
				resolve(done);
			}).catch(err => {
				logger.error('[attendanceManagement - addEventAttendance(data)]\n', err);
				reject(err);
			});
		}).catch(err => {
			logger.error('[attendanceManagement - addEventAttendance(data)]\n', err);
			reject(err);
		});
	}),
	getEventAttendanceByUUID: uuid => new Promise((resolve, reject) => {
		db.getEventAttendance(uuid).then(data => {
			logger.info('[attendanceManagement - getEventAttendanceByUUID(uuid)]\n', data);
			resolve(data);
		}).catch(err => {
			logger.error('[attendanceManagement - getEventAttendanceByUUID(uuid)]\n', err);
			reject(err);
		});
	})
};

module.exports = attendanceManagement;
