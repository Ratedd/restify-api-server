const bridge = require('./bridge.js');
const db = bridge.getDB();
const logger = require('../util/logger.js');

const attendanceManagement = {
	addAttendance: data => new Promise((resolve, reject) => {
		db.getWorkshopAttendance(data.uuid).then(workshopAttendance => {
			if (!workshopAttendance) {
				const newArr = [];
				newArr.push(data.details);
				const details = {
					uuid: data.uuid,
					attendees: newArr
				};
				db.addWorkshopAttendance(details).then(done => {
					logger.info('[attendanceManagement - addAttendance(data)]\n', done);
					resolve(done);
				}).catch(err => {
					logger.error('[attendanceManagement - addAttendance(data)]\n', err);
					reject(err);
				});
				return;
			}
			const newArr = workshopAttendance.attendees;
			newArr.push(data.details);
			db.updateWorkshopAttendance(data.uuid, newArr).then(done => {
				logger.info('[attendanceManagement - addAttendance(data)]\n', done);
				resolve(done);
			}).catch(err => {
				logger.error('[attendanceManagement - addAttendance(data)]\n', err);
				reject(err);
			});
		}).catch(err => {
			logger.error('[attendanceManagement - addAttendance(data)]\n', err);
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
	})
};

module.exports = attendanceManagement;
