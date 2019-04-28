require('dotenv').config();
const restify = require('restify');
const bridge = require('./structure/bridge.js');
const testManagement = require('./structure/testManagement.js');

const server = restify.createServer({
	name: 'prometheus-api',
	version: '0.1.0'
});

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser({ mapParams: true }));
server.use(restify.plugins.bodyParser());

server.logger = require('./structure/logger.js');

server.post('/test', (req, res, next) => {
	const desc = req.params.description;
	testManagement.addTest(desc).then(data => {
		res.send(200, data);
		return next();
	}).catch(err => {
		res.send(500, err);
		return next();
	});
});

server.listen(3000, () => {
	bridge.initializeDB();
	server.logger.info(`${server.name} listening at ${server.url}`);
});
