const bridge = require('./bridge.js');
const db = bridge.getDB();
const logger = require('../util/logger.js');

const keywordManagement = {
	getKeywords: () => new Promise((resolve, reject) => {
		db.getKeywords().then(data => {
			logger.debug('[keywordManagement - getKeywords()]', data);
			resolve(data);
		}).catch(err => {
			logger.error('[keywordManagement - getKeywords()]', err);
			reject(err);
		});
	}),
	addKeyword: keyword => new Promise((resolve, reject) => {
		db.addKeyword(keyword).then(data => {
			logger.debug('[keywordManagement - addKeyword(keyword)]', data);
			resolve(data);
		}).catch(err => {
			logger.error('[keywordManagement - addKeyword(keyword)]', err);
			reject(err);
		});
	})
};

module.exports = keywordManagement;
