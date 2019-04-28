const dynamoose = require('dynamoose');
const Schema = dynamoose.Schema; // eslint-disable-line prefer-destructuring
let faqSchema = {};
let FaqModel;

const database = {
	initialize: () => {
		dynamoose.AWS.config.update({
			region: process.env.REGION
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
			}
		});
		FaqModel = dynamoose.model('faqs', faqSchema);
	},
	addFaq: data => {
		const faqDetail = new FaqModel({
			moduleCode: data.moduleCode,
			questions: data.questions
		});

		return faqDetail.save();
	}
};

module.exports = database;
