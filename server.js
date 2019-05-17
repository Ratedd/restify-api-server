require('dotenv').config();
const restify = require('restify');
const bridge = require('./structure/bridge.js');
const bcrypt = require('bcrypt');
const accountManagement = require('./structure/accountManagement.js');
const faqManagement = require('./structure/faqManagement.js');
const keywordManagement = require('./structure/keywordManagement.js');
const errors = require('./util/error.js');

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
	const data = req.body || req.params;
	server.logger.info('data', data);
	if (!data) {
		res.send(200);
		return next();
	}
	accountManagement.getAccountByUsername(data.username).then(account => {
		if (account.count > 0) {
			res.send(200, { message: 'Account already exists' });
			return next();
		}
		accountManagement.addAccount(data).then(created => {
			const creation = {
				username: created.username,
				message: 'Account created'
			};
			res.send(200, creation);
			return next();
		}).catch(err => {
			server.logger.error('[server - /api/addaccount: 1 ]\n', err);
			res.send(500, { message: 'Internal Server Error' });
			return next();
		});
	}).catch(err => {
		server.logger.error('[server - /api/addaccount: 2]\n', err);
		res.send(500, { message: 'Internal Server Error' });
		return next();
	});
});

server.get('/api/verifyaccount', (req, res, next) => {
	const accountDetails = req.body;
	accountManagement.getAccountByUsername(accountDetails.username).then(data => {
		if (data.count < 1) {
			res.send(200, { message: 'Account does not exists' });
			return next();
		}
		bcrypt.compare(accountDetails.password, data[0].password).then(match => {
			if (match) {
				res.send(200, { message: 'Account authenticated' });
				return next();
			}
			res.send(200, { message: 'Invalid Password' });
			return next();
		}).catch(err => {
			server.logger.error('[server - /api/verifyaccount: 2]\n', err);
			return next(errors.internalServerError());
		});
	}).catch(err => {
		server.logger.info('[server - /api/verifyaccount: 1]\n', err);
		return next(errors.internalServerError());
	});
});

server.get('/api/getkeywords', (req, res, next) => {
	keywordManagement.getKeywords().then(data => {
		server.logger.info('data', data);
		res.send(200, data);
		return next();
	}).catch(err => {
		server.logger.error('[server - /api/getkeywords]', err);
		res.send(500, err);
		return next();
	});
});

server.post('/api/addkeywords', (req, res, next) => {
	server.logger.info('req.body', req.body);
});

server.listen(3000, () => {
	bridge.initializeDB();
	server.logger.info(`${server.name} listening at ${server.url}`);
});

process.on('unhandledRejection', err => server.logger.error('unhandledPromiseRejection\n', err));
