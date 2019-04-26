const bridge = require('./bridge.js');
const db = bridge.getDB();

const testManagement = {
	addTest: desc => new Promise((resolve, reject) => {
		db.test(desc).then(data => {
			console.log('management', data);
			resolve(data);
		}).catch(err => {
			console.log(err);
			reject(err);
		});
	})
};

module.exports = testManagement;
