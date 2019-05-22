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
	updateKeywords: (moduleCode, keywordsArr) => new Promise((resolve, reject) => {
		db.getFaqByModuleCode(moduleCode).then(module => {
			const { id } = module[0];
			db.getKeywordsById(id).then(data => {
				const newArr = data.keywords;
				keywordsArr.forEach(keyword => {
					newArr.push(keyword);
				});
				db.updateKeywords(id, newArr).then(updated => {
					logger.info('[keywordManagement - updateKeywords(keywordsArr): 2]', updated);
					resolve(updated);
				}).catch(err => {
					logger.error('[keywordManagement - updateKeywords(moduleCode, keywordsArr): 3]\n', err);
					reject(err);
				});
			}).catch(err => {
				logger.error('[keywordManagement - updateKeywords(moduleCode, keywordsArr): 2]\n', err);
				reject(err);
			});
		}).catch(err => {
			logger.error('[keywordManagement - updateKeywords(moduleCode, keywordsArr): 1]\n', err);
			reject(err);
		});
	})
};

module.exports = keywordManagement;
