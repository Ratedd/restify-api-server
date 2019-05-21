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
	addKeywords: keywordArr => new Promise((resolve, reject) => {
		db.addKeywords(keywordArr).then(data => {
			logger.debug('[keywordManagement - addKeyword(keyword)]', data);
			resolve(data);
		}).catch(err => {
			logger.error('[keywordManagement - addKeyword(keyword)]', err);
			reject(err);
		});
	}),
	updateKeywords: keywordsArr => new Promise((resolve, reject) => {
		db.getKeywords().then(data => {
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
