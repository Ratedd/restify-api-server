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

const databaseManager = {
	initialize: () => {
		dynamoose.AWS.config.update({
			region: process.env.REGION
		});

		accountSchema = new Schema({
			id: {
				type: Number,
				validate: v => v > 0,
				hashKey: true
			},
			username: {
				type: String,
				required: true,
				rangeKey: true
			},
			password: {
				type: String,
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
				type: String,
				required: true
			},
			name: {
				type: String,
				required: true
			}
		});

		FaqModel = dynamoose.model('faqs', faqSchema);
		AccountModel = dynamoose.model('accounts', accountSchema);
		KeywordModel = dynamoose.model('keywords', keywordSchema);
		SubscriberModel = dynamoose.model('subscribers', subscriberSchema);
	},
	addFaq: data => {
		const faqDetail = new FaqModel({
			id: data.id,
			moduleCode: data.moduleCode,
			questions: data.questions,
			keywords: data.keywords
		});

		return faqDetail.save();
	},
	addAccount: data => {
		const accountDetail = new AccountModel(data);

		return accountDetail.save();
	},
	getTotalIndex: () => AccountModel.scan().exec(),
	getAccountByUsername: inputUsername => AccountModel.scan({ username: inputUsername }).exec(),
	getFaqByModuleCode: inputModuleCode => FaqModel.scan({ moduleCode: inputModuleCode }).exec(),
	updateKeywords: newArr => KeywordModel.update({ id: 1, keywords: newArr }),
	getKeywords: () => KeywordModel.scan().exec(),
	getFaqByKeyword: keyword => {
		const keywordArray = [keyword];
		return FaqModel.scan({ keywords: keywordArray }).exec();
	},
	addSubscriber: data => {
		const subscriberDetail = new SubscriberModel({
			id: data.id,
			name: data.name
		});

		return subscriberDetail.save();
	},
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
	})
};

module.exports = databaseManager;
