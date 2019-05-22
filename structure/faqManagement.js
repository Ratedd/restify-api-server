const bridge = require('./bridge.js');
const db = bridge.getDB();
const logger = require('../util/logger.js');

const faqManagement = {
	addFaq: data => new Promise((resolve, reject) => {
		db.addFaq(data).then(addedFaq => {
			resolve(addedFaq);
		}).catch(err => {
			logger.error(err);
			reject(err);
		});
	}),
	getAndPopulate: moduleCode => new Promise((resolve, reject) => {
		db.getFaqByModuleCode(moduleCode).then(data => {
			const { id } = data[0];
			db.populateFaq(id).then(populated => {
				logger.info('[faqManagement - getAndPopulate: 2]\n', populated);
				resolve(populated);
			}).catch(err => {
				logger.error('[faqManagement - getAndPopulate: 2]\n', err);
				reject(err);
			});
		}).catch(err => {
			logger.error('[faqManagement - getAndPopulate: 1]\n', err);
			reject(err);
		});
	})
};

module.exports = faqManagement;
