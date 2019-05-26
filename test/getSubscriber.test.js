/* eslint-disable */
const { assert, expect } = require('chai');
const fetch = require('node-fetch');
const db = require('../structure/databaseManager.js');
require('../server.js');

const subscriber = {
	id: 12345,
	name: 'Test'
};

describe('getSubscribers', function() {
	before(function(done) {
		this.timeout(0);
		db.removeSubscriber(12345).then(() => done());
	});

	after(function(done) {
		this.timeout(0);
		db.removeSubscriber(12345).then(() => done());
	});

	it('Should return empty array if no data', function(done) {
		this.timeout(0);
		fetch('http://localhost:3000/api/getsubscribers').then(res => res.json()).then(json => {
			assert.isObject(json, 'Data returned is an object');
			expect(json).to.have.property('data').that.is.empty;
			done();
		}).catch(err => {
			done(err);
		});
	});

	it('Should return object with subscribed property if subbed', function(done) {
		this.timeout(0);
		fetch('http://localhost:3000/api/addsubscriber', { method: 'POST', body: JSON.stringify(subscriber) }).then(() => {
			fetch('http://localhost:3000/api/getsubscribers').then(res => res.json()).then(json => {
				assert.isArray(json, 'Data returned is an array');
				expect(json).to.be.an('array').that.is.not.empty;
				done();
			}).catch(err => {
				done(err);
			});
		}).catch(err => {
			done(err);
		});
	});
});
