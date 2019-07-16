require('dotenv').config();
const restify = require('restify');
const bridge = require('./structure/bridge.js');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const accountManagement = require('./structure/accountManagement.js');
const faqManagement = require('./structure/faqManagement.js');
const keywordManagement = require('./structure/keywordManagement.js');
const subscriberManagement = require('./structure/subscriberManagement.js');
const eventManagement = require('./structure/eventManagement.js');
const workshopManagement = require('./structure/workshopManagement.js');
const attendanceManagement = require('./structure/attendanceManagement.js');
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

server.post('/api/createaccount', (req, res, next) => {
	const { username, password, name } = req.body;

	if (!username || !password || !name) {
		return next(errors.fieldError());
	}

	const data = {
		username,
		password,
		name
	};

	accountManagement.getAccountByUsername(username).then(account => {
		if (account.count > 0) {
			res.send(200, { message: 'Account already exists' });
			return next();
		}
		accountManagement.createAccount(data).then(created => {
			const creation = {
				username: created.username,
				message: 'Account created'
			};
			res.send(200, creation);
			return next();
		}).catch(err => {
			server.logger.error('[server - /api/createaccount: 1 ]\n', err);
			return next(errors.internalServerError());
		});
	}).catch(err => {
		server.logger.error('[server - /api/createaccount: 2]\n', err);
		return next(errors.internalServerError());
	});
});

server.post('/api/verifyaccount', (req, res, next) => {
	const { username, password } = req.body;
	if (!username || !password) {
		return next(errors.fieldError());
	}
	accountManagement.getAccountByUsername(username).then(account => {
		if (account.count < 1) {
			res.send(200, { message: 'Account does not exist' });
			return next();
		}
		bcrypt.compare(password, account[0].password).then(match => {
			if (match) {
				const toSend = {
					uuid: account[0].uuid,
					username: account[0].username,
					isAdmin: account[0].isAdmin,
					name: account[0].name
				};
				res.send(200, toSend);
				return next();
			}
			res.send(200, { message: 'Invalid Credentials' });
			return next();
		}).catch(err => {
			server.logger.error('[server - /api/verifyaccount: 2]\n', err);
			return next(errors.internalServerError());
		});
	}).catch(err => {
		server.logger.error('[server - /api/verifyaccount: 1]\n', err);
		return next(errors.internalServerError());
	});
});

server.post('/api/addfaq', (req, res, next) => {
	const { moduleCode, questions, answers, keywords } = req.body;
	if (!moduleCode || !questions || !keywords || !answers) {
		return next(errors.fieldError());
	}

	const splittedQuestions = questions.split(';');
	const splittedAnswers = answers.split(';');
	const splittedKeywords = keywords.split(';');
	const trimmedQuestions = _.map(splittedQuestions, _.trim);
	const trimmedAnswers = _.map(splittedAnswers, _.trim);
	const trimmedKeywords = _.map(splittedKeywords, _.trim);
	const data = {
		moduleCode: moduleCode, // eslint-disable-line object-shorthand
		questions: trimmedQuestions,
		answers: trimmedAnswers,
		keywords: trimmedKeywords
	};
	faqManagement.addFaq(data).then(added => {
		server.logger.info('[server - /api/addfaq]\n', added);
		res.send(200, added);
	}).catch(err => {
		server.logger.error('[server - /api/addfaq]\n', err);
		return next(errors.internalServerError());
	});
});

server.get('/api/getfaq', (req, res, next) => {
	const { moduleCode } = req.body;
	if (!moduleCode) {
		return next(errors.fieldError());
	}

	faqManagement.getFaqByModuleCodeAndPopulate(moduleCode).then(faq => {
		if (!faq) {
			res.send(200, { message: 'No data found' });
			return next();
		}
		server.logger.info('[server - /api/getfaq]\n', faq);
		res.send(200, faq);
		return next();
	}).catch(err => {
		server.logger.error('[server - /api/getfaq]\n', err);
		return next(errors.internalServerError());
	});
});

server.post('/api/addsubscriber', (req, res, next) => {
	if (!req.body) {
		return next(errors.fieldError());
	}
	subscriberManagement.addSubscriber(req.body).then(subscriber => {
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
		return next(errors.fieldError());
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
		return next(errors.fieldError());
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

server.post('/api/searchfaqbykeyword', (req, res, next) => {
	const { keyword } = req.body;
	if (!keyword) {
		return next(errors.fieldError());
	}
	faqManagement.searchFaqByKeyword(keyword).then(data => {
		if (data.length < 1) {
			res.send(200, { message: `No faq(s) found with the keyword: ${keyword}` });
			return next();
		}
		res.send(200, data);
		return next();
	}).catch(err => {
		server.logger.error('[server - /api/searchfaqbykeywords]\n', err);
		return next(errors.internalServerError());
	});
});

server.put('/api/updatekeywords', (req, res, next) => {
	const { moduleCode, keywords } = req.body;
	if (!moduleCode || !keywords) {
		return next(errors.fieldError());
	}
	const splitted = keywords.split(';');
	const trimmed = _.map(splitted, _.trim);
	keywordManagement.updateKeywords(moduleCode, trimmed).then(updated => {
		if (!updated) {
			res.send(200, { message: 'There\'s no data to update' });
			return next();
		}
		server.logger.info('[server - /api/updatekeywords]\n', updated);
		res.send(200, updated);
		return next();
	}).catch(err => {
		server.logger.error('[server - /api/updatekeywords]\n', err);
		return next(errors.internalServerError());
	});
});

server.get('/api/events', (req, res, next) => {
	eventManagement.getEvents().then(data => {
		server.logger.info('[server - /api/events]\n', data);
		if (!data) {
			res.send(200, { message: 'No data found' });
			return next();
		}
		res.send(200, data);
		return next();
	}).catch(err => {
		server.logger.error('[server - /api/events]\n', err);
		return next(errors.internalServerError());
	});
});

server.post('/api/addevent', (req, res, next) => {
	const { eventName, description, eventDate } = req.body;
	if (!eventName || !description || !eventDate) {
		return next(errors.fieldError());
	}
	eventManagement.addEvent(req.body).then(event => {
		server.logger.info('[server - /api/addevent]\n', event);
		res.send(200, event);
		return next();
	}).catch(err => {
		server.logger.error('[server - /api/addevent]\n', err);
		return next(errors.internalServerError());
	});
});

server.get('/api/event/:id', (req, res, next) => {
	const { id } = req.params;
	eventManagement.getEventByUUID(id).then(data => {
		server.logger.info('[server - /api/event/:id]\n', data);
		res.send(200, { data });
		return next();
	}).catch(err => {
		server.logger.error('[server - /api/event/:id]\n', err);
		return next(errors.internalServerError());
	});
});

server.get('/api/workshops', (req, res, next) => {
	workshopManagement.getWorkshops().then(data => {
		if (!data) {
			res.send(200, { message: 'No data found' });
			return next();
		}
		server.logger.info('[server - /api/workshops]\n', data);
		res.send(200, data);
		return next();
	}).catch(err => {
		server.logger.error('[server - /api/workshops]\n', err);
		return next(errors.internalServerError());
	});
});

server.get('/api/workshop/:id', (req, res, next) => {
	const { id } = req.params;
	workshopManagement.getWorkshopByUUID(id).then(data => {
		server.logger.info('[server - /api/workshop/:id]\n', data);
		res.send(200, { data });
		return next();
	}).catch(err => {
		server.logger.error('[server - /api/workshop/:id]\n', err);
		return next(errors.internalServerError());
	});
});

server.post('/api/addworkshop', (req, res, next) => {
	const { workshopName, description, workshopDate } = req.body;
	if (!workshopName || !description || !workshopDate) {
		return next(errors.fieldError());
	}
	workshopManagement.addWorkshop(req.body).then(workshop => {
		server.logger.info('[server - /api/addworkshop]\n', workshop);
		res.send(200, workshop);
		return next();
	}).catch(err => {
		server.logger.error('[server - /api/addworkshop]\n', err);
		return next(errors.internalServerError());
	});
});

server.post('/api/addworkshopattendance', (req, res, next) => {
	const { uuid, details } = req.body;
	if (!uuid || !details) {
		return next(errors.fieldError());
	}
	attendanceManagement.addWorkshopAttendance(req.body).then(done => {
		server.logger.info('[server - /api/addworkshopattendance]\n', done);
		res.send(200, { message: 'Successfully Added' });
		return next();
	}).catch(err => {
		server.logger.error('[server - /api/addworkshopattendance]\n', err);
		if (err.statusCode === 400) {
			return next(errors.alreadyRegisteredError());
		}
		server.logger.error('[server - /api/addworkshopattendance]\n', err);
		return next(errors.internalServerError());
	});
});

server.get('/api/getworkshopattendance/:uuid', (req, res, next) => {
	const { uuid } = req.params;
	if (!uuid) {
		return next(errors.fieldError());
	}
	attendanceManagement.getWorkshopAttendanceByUUID(uuid).then(data => {
		server.logger.info('[server - /api/getworkshopattendance]\n', data);
		res.send(200, data);
		return next();
	}).catch(err => {
		server.logger.error('[server - /api/getworkshopattendance]\n', err);
		return next(errors.internalServerError());
	});
});

server.post('/api/addeventattendance', (req, res, next) => {
	const { uuid, details } = req.body;
	if (!uuid || !details) {
		return next(errors.fieldError());
	}
	attendanceManagement.addEventAttendance(req.body).then(done => {
		server.logger.info('[server - /api/addeventattendance]\n', done);
		res.send(200, { message: 'Successfully Added' });
		return next();
	}).catch(err => {
		server.logger.error('[server - /api/addeventattendance]\n', err);
		if (err.statusCode === 400) {
			return next(errors.alreadyRegisteredError());
		}
		server.logger.error('[server - /api/addeventattendance]\n', err);
		return next(errors.internalServerError());
	});
});

server.get('/api/geteventattendance/:uuid', (req, res, next) => {
	const { uuid } = req.params;
	if (!uuid) {
		return next(errors.fieldError());
	}
	attendanceManagement.getEventAttendanceByUUID(uuid).then(data => {
		server.logger.info('[server - /api/geteventattendance]\n', data);
		res.send(200, data);
		return next();
	}).catch(err => {
		server.logger.error('[server - /api/geteventattendance]\n', err);
		return next(errors.internalServerError());
	});
});

server.get('/api/workshops/:userId', (req, res, next) => {
	const { userId } = req.params;
	if (!userId) {
		return next(errors.fieldError());
	}
	workshopManagement.getWorkshopAddedByUserID(userId).then(data => {
		server.logger.info('[server - /api/workshops/:userId]\n', data);
		res.send(200, data);
		return next();
	}).catch(err => {
		server.logger.error('[server - /api/workshops/:userId]\n', err);
		return next(errors.internalServerError());
	});
});

server.get('/api/events/:userId', (req, res, next) => {
	const { userId } = req.params;
	if (!userId) {
		return next(errors.fieldError());
	}
	eventManagement.getEventAddedByUserID(userId).then(data => {
		server.logger.info('[server - /api/events/:userId]\n', data);
		res.send(200, data);
		return next();
	}).catch(err => {
		server.logger.error('[server - /api/events/:userId]\n', err);
		return next(errors.internalServerError());
	});
});

server.del('/api/workshop/:userId/:workshopId', (req, res, next) => {
	const { userId, workshopId } = req.params;
	if (!userId || !workshopId) {
		return next(errors.fieldError());
	}
	let workshopFound;
	workshopManagement.getWorkshopAddedByUserID(userId).then(data => {
		data.forEach(workshop => {
			if (workshop.addedByAdmin === userId && workshop.uuid === workshopId) {
				workshopFound = workshop;
			}
		});
		workshopManagement.deleteWorkshopByID(workshopFound.uuid).then(done => {
			server.logger.info('[server - /api/workshop/:userId/:workshopId]\n', done);
			res.send(200, done);
			return next();
		}).catch(err => {
			server.logger.error('[server - /api/workshop/:userId/:workshopId - 2]\n', err);
			return next(errors.internalServerError());
		});
	}).catch(err => {
		server.logger.error('[server - /api/workshop/:userId/:workshopId - 1]\n', err);
		return next(errors.internalServerError());
	});
});

server.del('/api/event/:userId/:eventId', (req, res, next) => {
	const { userId, eventId } = req.params;
	if (!userId || !eventId) {
		return next(errors.fieldError());
	}
	let eventFound;
	eventManagement.getEventAddedByUserID(userId).then(data => {
		data.forEach(event => {
			if (event.addedByAdmin === userId && event.uuid === eventId) {
				eventFound = event;
			}
		});
		eventManagement.deleteEventByID(eventFound.uuid).then(done => {
			server.logger.info('[server - /api/event/:userId/:eventId]\n', done);
			res.send(200, done);
			return next();
		}).catch(err => {
			server.logger.error('[server - /api/event/:userId/:eventId - 2]\n', err);
			return next(errors.internalServerError());
		});
	}).catch(err => {
		server.logger.error('[server - /api/event/:userId/:eventId - 1]\n', err);
		return next(errors.internalServerError());
	});
});

server.listen(3000, () => {
	bridge.initializeDB();
	server.logger.info(`${server.name} listening at ${server.url}`);
});

process.on('unhandledRejection', err => server.logger.error('[unhandledPromiseRejection]\n', err));

module.exports = server;
