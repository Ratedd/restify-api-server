const dynamoose = require('dynamoose');
const Schema = dynamoose.Schema; // eslint-disable-line prefer-destructuring
let faqSchema = {};
let accountSchema = {};
let FaqModel;
let AccountModel;

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
				type: Array[String],
				required: true
			},
			keyWords: {
				type: Array[String],
				required: true
			}
		});
		FaqModel = dynamoose.model('faqs', faqSchema);
		AccountModel = dynamoose.model('accounts', accountSchema);
	},
	addFaq: data => {
		const faqDetail = new FaqModel({
			moduleCode: data.moduleCode,
			questions: data.questions
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
	getFaqByModuleCode: inputModuleCode => FaqModel.scan({ moduleCode: inputModuleCode }).exec()
};

module.exports = databaseManager;
