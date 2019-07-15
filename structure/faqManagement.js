const bridge = require('./bridge.js');
const db = bridge.getDB();
const logger = require('../util/logger.js');
const _ = require('lodash');

const faqManagement = {
	addFaq: data => new Promise((resolve, reject) => {
		db.getFaqs().then(faqs => {
			const index = faqs.count + 1;
			const dataToAdd = {
				id: index,
				moduleCode: data.moduleCode,
				questions: data.questions,
				answers: data.answers,
				keywords: index
			};
			const keywordsArr = data.keywords;
			db.getFaqByModuleCode(dataToAdd.moduleCode).then(faq => {
				if (faq.count > 0) {
					resolve({ message: 'FAQ already exists.' });
					return;
				}
				db.addFaq(dataToAdd).then(added => {
					logger.info('[faqManagement - addFaq(data): 3]\n', added);
					db.updateKeywords(index, keywordsArr).then(keywords => {
						logger.info('[faqManagement - addFaq(data): 4]\n', keywords);
						resolve(added);
					}).catch(err => {
						logger.error('[faqManagement - addFaq(data): 4]\n', err);
						reject(err);
					});
				}).catch(err => {
					logger.error('[faqManagement - addFaq(data): 3]\n', err);
					reject(err);
				});
			}).catch(err => {
				logger.error('[faqManagement - addFaq(data): 2]\n', err);
				reject(err);
			});
		}).catch(err => {
			logger.error('[faqManagement - addFaq(data): 1]\n', err);
			reject(err);
		});
	}),
	getFaqByModuleCodeAndPopulate: moduleCode => new Promise((resolve, reject) => {
		db.getFaqByModuleCode(moduleCode).then(data => {
			if (data.count < 1) {
				resolve();
				return;
			}
			const { id } = data[0];
			db.populateFaq(id).then(populated => {
				logger.info('[faqManagement - getFaqByModuleCodeAndPopulate: 2]\n', populated);
				resolve(populated);
			}).catch(err => {
				logger.error('[faqManagement - getFaqByModuleCodeAndPopulate: 2]\n', err);
				reject(err);
			});
		}).catch(err => {
			logger.error('[faqManagement - getFaqByModuleCodeAndPopulate: 1]\n', err);
			reject(err);
		});
	}),
	searchFaqByKeyword: keyword => new Promise((resolve, reject) => {
		db.getKeywordsWithKeyword(_.toString(keyword)).then(async data => {
			const faqs = [];
			for (let i = 0; i < data.length; i++) {
				const faq = await db.populateFaq(data[i].id);
				faqs.push(faq);
			}
			logger.info('[faqManagement - searchFaqByKeyword]\n', faqs);
			resolve(faqs);
		}).catch(err => {
			logger.error('[faqManagement - searchFaqByKeyword]\n', err);
			reject(err);
		});
	})
};

module.exports = faqManagement;
