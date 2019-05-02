require('dotenv').config();
const restify = require('restify');
const bridge = require('./structure/bridge.js');
const accountManagement = require('./structure/accountManagement.js');

const server = restify.createServer({
	name: 'prometheus-api',
	version: '0.1.0'
});

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser({ mapParams: true }));
server.use(restify.plugins.authorizationParser());
server.use(restify.plugins.bodyParser());

server.logger = require('./structure/logger.js');

server.post('/api/add', (req, res, next) => {
	if (!Object.keys(req.authorization).length) {
		res.send(403, { error: 'Unauthorized' });
		return next();
	}
	const data = req.body;
	accountManagement.addAccount(data).then(account => {
		res.send(200, account);
		return next();
	}).catch(err => {
		res.send(500, { err, error: 'Internal Server Error' });
		return next();
	});
});

server.listen(3000, () => {
	bridge.initializeDB();
	server.logger.info(`${server.name} listening at ${server.url}`);
});

process.on('unhandledRejection', err => server.logger.error(err));
