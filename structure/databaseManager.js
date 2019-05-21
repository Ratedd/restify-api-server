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
			moduleCode: {
				type: String,
				required: true,
				rangeKey: true,
				index: true
			},
			questions: {
				type: Array,
				required: true
			},
			keywords: {
				type: Array
			}
		});

		keywordSchema = new Schema({
			id: {
				type: Number,
				hashKey: true
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
			moduleCode: data.moduleCode,
			questions: data.questions,
			keywords: data.keywords ? data.keywords : []
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
	addKeywords: data => {
		const keywordDetail = new KeywordModel({
			id: 1,
			keywords: data
		});

		return keywordDetail.save();
	},
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
	}
};

module.exports = databaseManager;
