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
	})
};

module.exports = faqManagement;
