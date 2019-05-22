const bcrypt = require('bcrypt');
const saltRounds = 12;
const bridge = require('./bridge.js');
const db = bridge.getDB();
const logger = require('../util/logger.js');

const accountManagement = {
	addAccount: data => new Promise(async (resolve, reject) => {
		const hashed = await bcrypt.hash(data.password, saltRounds);
		const lastIndex = await db.getTotalIndex();
		const nextIndex = lastIndex.length + 1;
		const postHashed = {
			id: nextIndex,
			username: data.username,
			password: hashed
		};
		db.addAccount(postHashed).then(done => {
			const createdAccount = {
				account: done.username,
				message: 'Account created'
			};
			logger.error('[accountManagement - addAccount(data)]\n', done);
			resolve(createdAccount);
		}).catch(err => {
			logger.error('[accountManagement - addAccount(data)]\n', err);
			reject(err);
		});
	}),
	getAccountByUsername: inputUsername => new Promise((resolve, reject) => {
		db.getAccountByUsername(inputUsername).then(data => {
			logger.error('[accountManagement - getAccountByUsername(inputUsername)]\n', data);
			resolve(data);
		}).catch(err => {
			logger.error('[accountManagement - getAccountByUsername(inputUsername)]\n', err);
			reject(err);
		});
	})
};

module.exports = accountManagement;
