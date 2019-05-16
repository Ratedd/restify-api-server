require('dotenv').config();
const restify = require('restify');
const bridge = require('./structure/bridge.js');
const accountManagement = require('./structure/accountManagement.js');
const faqManagement = require('./structure/faqManagement.js');
const keywordManagement = require('./structure/keywordManagement.js');

const server = restify.createServer({
	name: 'prometheus-api',
	version: '0.1.0'
});

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser({ mapParams: true }));
server.use(restify.plugins.authorizationParser());
server.use(restify.plugins.bodyParser());
server.use(restify.plugins.jsonBodyParser());
server.pre(restify.plugins.pre.sanitizePath());

server.logger = require('./util/logger.js');

server.post('/api/addaccount', (req, res, next) => {
	// if (!Object.keys(req.authorization).length) {
	// 	res.send(403, { error: 'Authentication Failed' });
	// 	return next();
	// }
	// const { authorization } = req;
	// console.log(authorization);
	// const data = req.body;
	// accountManagement.addAccount(data).then(account => {
	// 	res.send(200, account);
	// 	return next();
	// }).catch(err => {
	// 	res.send(500, { err, error: 'Internal Server Error' });
	// 	return next();
	// });
	accountManagement.addAccount({ username: 'admin', password: '123' }).then(account => {
		res.send(200, account);
		return next();
	}).catch(err => {
		res.send(500);
		return next();
	});
});

server.get('/api/getaccount', (req, res, next) => {
	accountManagement.getAccountByUsername(req.body.username).then(data => {
		server.logger.info('data', data);
	}).catch(err => {
		server.logger.error(err);
	});
});

server.get('/api/getkeywords', (req, res, next) => {
	keywordManagement.getKeywords().then(data => {
		server.logger.info('data', data);
	});
});

server.post('/api/addkeywords', (req, res, next) => {
	server.logger.info('req.body', req.body);
});

server.listen(3000, () => {
	bridge.initializeDB();
	server.logger.info(`${server.name} listening at ${server.url}`);
});

process.on('unhandledRejection', err => server.logger.error(err));
