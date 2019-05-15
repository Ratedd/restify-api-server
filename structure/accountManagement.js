const bcrypt = require('bcrypt');
const saltRounds = 12;
const bridge = require('./bridge.js');
const db = bridge.getDB();
const logger = require('../util/logger.js');

const accountManagement = {
	addAccount: data => new Promise(async (resolve, reject) => {
		const hashed = await bcrypt.hash(data.password, saltRounds);
		const lastIndex = await db.getTotalIndex();
		const accountExist = await db.getAccountByUsername(data.username);
		if (accountExist.length > 0) {
			const accountExistsObj = {
				account: accountExist[0].username,
				message: 'Username already exists'
			};
			resolve(accountExistsObj);
			return;
		}
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
			resolve(createdAccount);
		}).catch(err => {
			logger.error(`[AccountManagement] ${err}`);
			reject(err);
		});
	})
};

module.exports = accountManagement;
