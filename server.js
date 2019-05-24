require('dotenv').config();
const restify = require('restify');
const bridge = require('./structure/bridge.js');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const accountManagement = require('./structure/accountManagement.js');
const faqManagement = require('./structure/faqManagement.js');
const keywordManagement = require('./structure/keywordManagement.js');
const subscriberManagement = require('./structure/subscriberManagement.js');
const errors = require('./util/error.js');

const server = restify.createServer({
	name: 'prometheus-api',
	version: '0.1.0'
});

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser({ mapParams: true }));
server.use(restify.plugins.authorizationParser());
server.use(restify.plugins.bodyParser({ requestBodyOnGet: true }));
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

server.put('/api/updatekeywords', (req, res, next) => {
	const { moduleCode, keywords } = req.body;
	if (!moduleCode || !keywords) {
		res.send(200, { message: 'One or more fields are missing' });
		return next();
	}
	const splitted = keywords.split(';');
	const trimmed = _.map(splitted, _.trim);
	keywordManagement.updateKeywords(moduleCode, trimmed).then(data => {
		if (!data) {
			res.send(200, { message: 'There\'s no data to update' });
			return next();
		}
		server.logger.info('[server - /api/updatekeywords]\n', data);
		res.send(200, data);
		return next();
	}).catch(err => {
		server.logger.error('[server - /api/updatekeywords]\n', err);
		return next(errors.internalServerError());
	});
});

server.post('/api/addfaq', (req, res, next) => {
	const { moduleCode, questions, answers, keywords } = req.body;
	if (!moduleCode || !questions || !keywords || !answers) {
		res.send(200, { message: 'One or more fields are missing' });
		return next();
	}

	const splittedQuestions = questions.split(';');
	const splittedAnswers = answers.split(';');
	const splittedKeywords = keywords.split(';');
	const trimmedQuestions = _.map(splittedQuestions, _.trim);
	const trimmedAnswers = _.map(splittedAnswers, _.trim);
	const trimmedKeywords = _.map(splittedKeywords, _.trim);
	const newData = {
		moduleCode: moduleCode, // eslint-disable-line object-shorthand
		questions: trimmedQuestions,
		answers: trimmedAnswers,
		keywords: trimmedKeywords
	};
	faqManagement.addFaq(newData).then(added => {
		server.logger.info('[server - /api/addfaq]\n', added);
		res.send(200, added);
	}).catch(err => {
		server.logger.error('[server - /api/addfaq]\n', err);
		return next(errors.internalServerError());
	});
});

server.get('/api/getfaq', (req, res, next) => {
	const { moduleCode } = req.body;
	faqManagement.getFaqByModuleCodeAndPopulate(moduleCode).then(data => {
		if (!data) {
			res.send(200, { message: 'No data found' });
			return next();
		}
		server.logger.info('[server - /api/getfaq]\n', data);
		res.send(200, data);
		return next();
	}).catch(err => {
		server.logger.error('[server - /api/getfaq]\n', err);
		return next(errors.internalServerError());
	});
});

server.post('/api/addsubscriber', (req, res, next) => {
	let data;
	try {
		data = JSON.parse(req.body);
	} catch (err) {
		data = req.body;
	}
	if (!data) {
		res.send(200, { message: 'One or more fields are missing' });
		return next();
	}
	subscriberManagement.addSubscriber(data).then(subscriber => {
		if (!subscriber) {
			res.send(200, { message: 'User already subscribed', subscribed: true });
			return next();
		}
		server.logger.info('[server - /api/addsubscriber]', subscriber);
		res.send(200, subscriber);
		return next();
	}).catch(err => {
		server.logger.error('[server - /api/addsubscriber]', err);
		return next(errors.internalServerError());
	});
});

server.del('/api/removesubscriber', (req, res, next) => {
	const { id } = req.body;
	if (!id) {
		res.send(200, { message: 'One or more fields are missing' });
		return next();
	}
	subscriberManagement.removeSubscriber(id).then(subscriber => {
		if (!subscriber) {
			res.send(200, { message: 'User is not subscribed', subscribed: false });
			return next();
		}
		res.send(200, subscriber);
		return next();
	}).catch(err => {
		server.logger.error('[server - /api/removesubscriber]', err);
		return next(errors.internalServerError());
	});
});

server.get('/api/searchfaqbykeywords', (req, res, next) => {
	const { keywords } = req.body;
	if (!keywords) {
		res.send(200, { message: 'One or more fields are missing' });
		return next();
	}
	const splitted = keywords.split(',');
	const trimmed = _.map(splitted, _.trim);
	faqManagement.searchFaqByKeywords(trimmed).then(data => {
		if (!data) {
			res.send(200, { message: 'No data found' });
			return next();
		}
		if (data.length < 1) {
			res.send(200, { message: `No faq found with the keyword(s): ${trimmed}`, data });
			return next();
		}
		res.send(200, data);
		return next();
	}).catch(err => {
		server.logger.error('[server - /api/searchfaqbykeywords]\n', err);
		return next(errors.internalServerError());
	});
});

server.get('/api/getsubscribers', (req, res, next) => {
	subscriberManagement.getSubscribers().then(data => {
		if (!data) {
			res.send(200, { message: 'No subscribers found', data: [] });
			return next();
		}
		server.logger.info('[server - /api/getsubscribers]\n', data);
		res.send(200, data);
		return next();
	}).catch(err => {
		server.logger.error('[server - /api/getsubscribers]\n', err);
		return next(errors.internalServerError());
	});
});

server.get('/api/getsubscriberbyid', (req, res, next) => {
	const { id } = req.body;
	if (!id) {
		res.send(200, { message: 'One or more fields are missing' });
		return next();
	}
	subscriberManagement.getSubscriberById(id).then(data => {
		if (!data) {
			res.send(200, { message: 'User is not subscribed' });
			return next();
		}
		server.logger.info('[server - /api/getsubscriberbyid]\n', data);
		res.send(200, data);
		return next();
	}).catch(err => {
		server.logger.error('[server - /api/getsubscriberbyid]\n', err);
		return next(errors.internalServerError());
	});
});

server.listen(3000, () => {
	bridge.initializeDB();
	server.logger.info(`${server.name} listening at ${server.url}`);
});

process.on('unhandledRejection', err => server.logger.error('[unhandledPromiseRejection]\n', err));
