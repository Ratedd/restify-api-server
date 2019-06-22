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
			id: {
				type: String,
				required: true,
				hashKey: true
			},
			eventName: {
				type: String,
				required: true,
				index: { global: true }
			},
			description: {
				type: String,
				required: true
			}
		});

		workshopSchema = new Schema({
			id: {
				type: String,
				required: true,
				hashKey: true
			},
			workshopName: {
				type: String,
				required: true,
				index: { global: true }
			},
			description: {
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
	addAccount: data => {
		const accountDetail = new AccountModel(data);

		return accountDetail.save();
	},
	getTotalIndex: () => AccountModel.scan().exec(),
	getAccountByUUID: inputUUID => AccountModel.get(inputUUID),
	getAccountByUsername: inputUsername => AccountModel.query('username').eq(inputUsername).exec(),
	getFaqByModuleCode: inputModuleCode => FaqModel.scan({ moduleCode: inputModuleCode }).exec(),
	getFaqs: () => FaqModel.scan().exec(),
	removeFaqByIndex: id => FaqModel.delete(id),
	updateKeywords: (index, newArr) => KeywordModel.update({ id: index, keywords: newArr }),
	getKeywordsById: id => KeywordModel.get(id),
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
	})
};

module.exports = databaseManager;
