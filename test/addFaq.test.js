/* eslint-disable */
const { assert, expect } = require('chai');
const fetch = require('node-fetch');
const db = require('../structure/databaseManager.js');
require('../server.js');

const faq = {
	moduleCode: 'EG1234',
	questions: 'What is unit testing?; Why is unit testing important?; What libraries are useful for unit testing?',
	answers: 'Answer1; Answer2; Answer3',
	keywords: 'Unit testing; Testing'
};

describe('addFaq', function() {
	before(function(done) {
		this.timeout(0);
		db.removeFaqByIndex(1).then(() => done());
	});

	after(function(done) {
		this.timeout(0);
		db.removeFaqByIndex(1).then(() => done());
	});

	it('Should addFaq if does not exists', function(done) {
		this.timeout(0);
		fetch('http://localhost:3000/api/addfaq', { method: 'POST', body: JSON.stringify(faq) }).then(res => res.json()).then(json => {
			assert.isObject(json, 'Data returned is an object');
			expect(json).to.have.property('keywords').that.is.a('number');
			done();
		}).catch(err => {
			done(err);
		});
	});

	it('Should not addFaq if already exists', function(done) {
		this.timeout(0);
		fetch('http://localhost:3000/api/addfaq', { method: 'POST', body: JSON.stringify(faq) }).then(res => res.json()).then(json => {
			assert.isObject(json, 'Data returned is an object');
			expect(json).to.have.property('message');
			done();
		}).catch(err => {
			done(err);
		});
	});
});
