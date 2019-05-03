const db = require('./databaseManager.js');

const bridge = {
	initializeDB: () => db.initialize(),
	getDB: () => db
};

module.exports = bridge;
