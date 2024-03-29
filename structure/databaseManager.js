const dynamoose = require('dynamoose');
const Schema = dynamoose.Schema; // eslint-disable-line prefer-destructuring
let faqSchema = {};
let accountSchema = {};
let FaqModel;
let AccountModel;
let keywordSchema = {};
let KeywordModel;
let subscriberSchema = {};
let SubscriberModel;
let eventSchema = {};
let EventModel;
let workshopSchema = {};
let WorkshopModel;
let workshopAttendanceSchema = {};
let WorkshopAttendanceModel;
let eventAttendanceSchema = {};
let EventAttendanceModel;

const databaseManager = {
	initialize: () => {
		dynamoose.AWS.config.update({
			region: process.env.REGION
		});

		accountSchema = new Schema({
			uuid: {
				type: String,
				required: true,
				hashKey: true
			},
			name: {
				type: String,
				required: true
			},
			username: {
				type: String,
				required: true,
				index: { global: true }
			},
			password: {
				type: String,
				required: true
			},
			isAdmin: {
				type: Boolean,
				required: true
			}
		});

		faqSchema = new Schema({
			id: {
				type: Number,
				required: true,
				hashKey: true
			},
			moduleCode: {
				type: String,
				required: true
			},
			questions: {
				type: Array,
				required: true
			},
			answers: {
				type: Array,
				required: true
			},
			keywords: {
				type: Number
			}
		});

		keywordSchema = new Schema({
			id: {
				type: Number,
				hashKey: true,
				required: true
			},
			keywords: {
				type: Array
			}
		});

		subscriberSchema = new Schema({
			id: {
				type: Number,
				required: true,
				hashKey: true
			},
			name: {
				type: String,
				required: true
			}
		});

		eventSchema = new Schema({
			uuid: {
				type: String,
				required: true,
				hashKey: true
			},
			eventName: {
				type: String,
				required: true
			},
			description: {
				type: String,
				required: true
			},
			eventThumbnail: {
				type: String
			},
			eventDate: {
				type: String
			},
			addedByAdmin: {
				type: String,
				required: true,
				index: { global: true }
			}
		});

		workshopSchema = new Schema({
			uuid: {
				type: String,
				required: true,
				hashKey: true
			},
			workshopName: {
				type: String,
				required: true
			},
			description: {
				type: String,
				required: true
			},
			workshopThumbnail: {
				type: String
			},
			workshopDate: {
				type: String
			},
			addedByAdmin: {
				type: String,
				required: true,
				index: { global: true }
			}
		});

		workshopAttendanceSchema = new Schema({
			uuid: {
				type: String,
				required: true,
				hashKey: true
			},
			attendees: {
				type: [Array],
				required: true
			},
			workshopName: {
				type: String,
				required: true
			}
		});

		eventAttendanceSchema = new Schema({
			uuid: {
				type: String,
				required: true,
				hashKey: true
			},
			attendees: {
				type: [Array],
				required: true
			},
			eventName: {
				type: String,
				required: true
			}
		});

		FaqModel = dynamoose.model('faqs', faqSchema);
		AccountModel = dynamoose.model('accounts', accountSchema);
		KeywordModel = dynamoose.model('keywords', keywordSchema);
		SubscriberModel = dynamoose.model('subscribers', subscriberSchema);
		EventModel = dynamoose.model('events', eventSchema);
		WorkshopModel = dynamoose.model('workshops', workshopSchema);
		WorkshopAttendanceModel = dynamoose.model('workshopAttendees', workshopAttendanceSchema);
		EventAttendanceModel = dynamoose.model('eventAttendees', eventAttendanceSchema);
	},
	addFaq: data => {
		const faqDetail = new FaqModel({
			id: data.id,
			moduleCode: data.moduleCode,
			questions: data.questions,
			answers: data.answers,
			keywords: data.keywords
		});

		return faqDetail.save();
	},
	createAccount: data => {
		const accountDetail = new AccountModel(data);

		return accountDetail.save();
	},
	getAccountByUUID: inputUUID => AccountModel.get(inputUUID),
	getAccountByUsername: inputUsername => AccountModel.query('username').eq(inputUsername).exec(),
	getFaqByModuleCode: inputModuleCode => FaqModel.scan({ moduleCode: inputModuleCode }).exec(),
	getFaqs: () => FaqModel.scan().exec(),
	removeFaqByIndex: id => FaqModel.delete(id),
	updateKeywords: (index, newArr) => KeywordModel.update({ id: index, keywords: newArr }),
	getKeywordsById: id => KeywordModel.get(id),
	getKeywordsWithKeyword: keyword => KeywordModel.scan('keywords').contains(keyword).exec(),
	addSubscriber: data => {
		const subscriberDetail = new SubscriberModel(data);
		return subscriberDetail.save();
	},
	removeSubscriber: id => SubscriberModel.delete(id),
	getSubscriberById: id => SubscriberModel.get(id),
	getSubscribers: () => SubscriberModel.scan().exec(),
	populateFaq: id => new Promise((resolve, reject) => {
		FaqModel.get(id).then(faqData => {
			faqData.populate({
				path: 'keywords',
				model: 'keywords'
			}).then(populated => {
				resolve(populated);
			}).catch(err => {
				reject(err);
			});
		}).catch(err => {
			reject(err);
		});
	}),
	populateFaqs: () => new Promise((resolve, reject) => {
		FaqModel.scan().exec().then(faqs => Promise.all(faqs.map(faq => faq.populate({
			path: 'keywords',
			model: 'keywords'
		}))))
			.then(faqs => {
				resolve(faqs);
			})
			.catch(err => {
				reject(err);
			});
	}),
	addEvent: data => {
		const eventDetails = new EventModel(data);

		return eventDetails.save();
	},
	getEventAddedByUserID: userId => EventModel.query('addedByAdmin').eq(userId).exec(),
	getEvents: () => EventModel.scan().exec(),
	getEventByUUID: uuid => EventModel.get(uuid),
	addWorkshop: data => {
		const workshopDetails = new WorkshopModel(data);

		return workshopDetails.save();
	},
	deleteEventByID: uuid => EventModel.delete(uuid),
	deleteEventAttendance: uuid => EventAttendanceModel.delete(uuid),
	getWorkshops: () => WorkshopModel.scan().exec(),
	getWorkshopByUUID: uuid => WorkshopModel.get(uuid),
	deleteWorkshopByID: uuid => WorkshopModel.delete(uuid),
	deleteWorkshopAttendance: uuid => WorkshopAttendanceModel.delete(uuid),
	addWorkshopAttendance: data => {
		const details = new WorkshopAttendanceModel(data);
		return details.save();
	},
	getWorkshopAddedByUserID: userId => WorkshopModel.query('addedByAdmin').eq(userId).exec(),
	updateWorkshopAttendance: (wuuid, details) => WorkshopAttendanceModel.update({ uuid: wuuid, attendees: details }),
	getWorkshopAttendance: uuid => WorkshopAttendanceModel.get(uuid),
	addEventAttendance: data => {
		const details = new EventAttendanceModel(data);
		return details.save();
	},
	updateEventAttendance: (euuid, details) => EventAttendanceModel.update({ uuid: euuid, attendees: details }),
	getEventAttendance: uuid => EventAttendanceModel.get(uuid)
};

module.exports = databaseManager;
