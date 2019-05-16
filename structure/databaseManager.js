const dynamoose = require('dynamoose');
const Schema = dynamoose.Schema; // eslint-disable-line prefer-destructuring
let faqSchema = {};
let accountSchema = {};
let FaqModel;
let AccountModel;
let keywordSchema = {};
let KeywordModel;

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
			keywords: {
				type: Array
			}
		});
		FaqModel = dynamoose.model('faqs', faqSchema);
		AccountModel = dynamoose.model('accounts', accountSchema);
		KeywordModel = dynamoose.model('keywords', keywordSchema);
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
		const accountDetail = new AccountModel({
			id: data.id,
			username: data.username,
			password: data.password
		});

		return accountDetail.save();
	},
	getTotalIndex: () => AccountModel.scan().exec(),
	getAccountByUsername: inputUsername => AccountModel.scan({ username: inputUsername }).exec(),
	getFaqByModuleCode: inputModuleCode => FaqModel.scan({ moduleCode: inputModuleCode }).exec(),
	addKeyword: data => {
		const keywordDetail = new KeywordModel({
			keywords: data
		});

		return keywordDetail.save();
	},
	getKeywords: () => KeywordModel.scan().exec(),
	getFaqByKeyword: keyword => {
		const keywordArray = [keyword];
		return FaqModel.scan({ keywords: keywordArray }).exec();
	}
};

module.exports = databaseManager;
