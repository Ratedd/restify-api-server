const dynamoose = require('dynamoose');
const Schema = dynamoose.Schema; // eslint-disable-line prefer-destructuring
let testSchema = {};
let TestModel;

const database = {
	initialize: () => {
		dynamoose.AWS.config.update({
			region: process.env.REGION
		});

		testSchema = new Schema({
			description: {
				type: String,
				required: true
			}
		});
		TestModel = dynamoose.model('test', testSchema);
	},
	test: desc => {
		const testDetail = new TestModel({
			description: desc
		});

		return testDetail.save();
	}
};

module.exports = database;
