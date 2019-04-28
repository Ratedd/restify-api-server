const bridge = require('./bridge.js');
const db = bridge.getDB();

const faqManagement = {
	addFaq: data => new Promise((resolve, reject) => {
		db.addFaq(data).then(addedFaq => {
			resolve(addedFaq);
		}).catch(err => {
			console.log(err);
			reject(err);
		});
	})
};

module.exports = faqManagement;
