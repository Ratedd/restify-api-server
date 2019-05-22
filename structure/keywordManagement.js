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
	updateKeywords: keywordsArr => new Promise((resolve, reject) => {
		db.getKeywords().then(data => {
			if (data.count < 1) {
				db.updateKeywords(keywordsArr).then(updated => {
					logger.info('[keywordManagement - updateKeywords(keywordsArr): 2]', updated);
					resolve(updated);
				}).catch(err => {
					logger.error('[keywordManagement - updateKeywords(keywordsArr): 2]', err);
					reject(err);
				});
				return;
			}
			const newArr = data[0].keywords;
			keywordsArr.forEach(keyword => {
				newArr.push(keyword);
			});
			db.updateKeywords(newArr).then(updated => {
				logger.info('[keywordManagement - updateKeywords(keywordsArr): 2]', updated);
				resolve(updated);
			}).catch(err => {
				logger.error('[keywordManagement - updateKeywords(keywordsArr): 2]', err);
				reject(err);
			});
		}).catch(err => {
			logger.error('[keywordManagement - updateKeywords(keywordsArr): 1]', err);
			reject(err);
		});
	})
};

module.exports = keywordManagement;
