const db = require('./database.js');

const bridge = {
	initializeDB: () => db.initialize(),
	getDB: () => db
};

module.exports = bridge;
