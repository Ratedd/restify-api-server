const bcrypt = require('bcrypt');
const saltRounds = 12;
const bridge = require('./bridge.js');
const db = bridge.getDB();
const logger = require('../util/logger.js');
const uuid = require('uuid/v4');

const accountManagement = {
	addAccount: data => new Promise(async (resolve, reject) => {
		const hashed = await bcrypt.hash(data.password, saltRounds);
		let uuidUsed = false;
		let newUUID;
		const postHashed = {
			uuid: uuid(),
			username: data.username,
			password: hashed
		};

		const uuidExist = await db.getAccountByUUID(postHashed.uuid).catch(err => logger.error(err));

		if (uuidExist) {
			uuidUsed = true;
		}

		while (uuidUsed) {
			newUUID = uuid();
			const dataUUID = await db.getAccountByUUID(newUUID).catch(err => logger.error(err));

			if (dataUUID) continue;
			uuidUsed = false;
			postHashed.uuid = newUUID;
		}

		db.addAccount(postHashed).then(done => {
			const createdAccount = {
				account: done.username,
				message: 'Account created'
			};
			logger.info('[accountManagement - addAccount(data)]\n', done);
			resolve(createdAccount);
		}).catch(err => {
			logger.error('[accountManagement - addAccount(data)]\n', err);
			reject(err);
		});
	}),
	getAccountByUsername: inputUsername => new Promise((resolve, reject) => {
		db.getAccountByUsername(inputUsername).then(data => {
			logger.info('[accountManagement - getAccountByUsername(inputUsername)]\n', data);
			resolve(data);
		}).catch(err => {
			logger.error('[accountManagement - getAccountByUsername(inputUsername)]\n', err);
			reject(err);
		});
	}),
	getAccountByUUID: inputUUID => new Promise((resolve, reject) => {
		db.getAccountByUUID(inputUUID).then(data => {
			logger.info('[accountManagement - getAccountByUUID(inputUUID)]\n', data);
			resolve(data);
		}).catch(err => {
			logger.error('[accountManagement - getAccountByUUID(inputUUID)]\n', err);
			reject(err);
		});
	})
};

module.exports = accountManagement;
