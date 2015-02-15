'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	MailingList = mongoose.model('MailingList'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, mailingList;

/**
 * Mailing list routes tests
 */
describe('Mailing list CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Mailing list
		user.save(function() {
			mailingList = {
				name: 'Mailing list Name'
			};

			done();
		});
	});

	it('should be able to save Mailing list instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Mailing list
				agent.post('/mailing-lists')
					.send(mailingList)
					.expect(200)
					.end(function(mailingListSaveErr, mailingListSaveRes) {
						// Handle Mailing list save error
						if (mailingListSaveErr) done(mailingListSaveErr);

						// Get a list of Mailing lists
						agent.get('/mailing-lists')
							.end(function(mailingListsGetErr, mailingListsGetRes) {
								// Handle Mailing list save error
								if (mailingListsGetErr) done(mailingListsGetErr);

								// Get Mailing lists list
								var mailingLists = mailingListsGetRes.body;

								// Set assertions
								(mailingLists[0].user._id).should.equal(userId);
								(mailingLists[0].name).should.match('Mailing list Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Mailing list instance if not logged in', function(done) {
		agent.post('/mailing-lists')
			.send(mailingList)
			.expect(401)
			.end(function(mailingListSaveErr, mailingListSaveRes) {
				// Call the assertion callback
				done(mailingListSaveErr);
			});
	});

	it('should not be able to save Mailing list instance if no name is provided', function(done) {
		// Invalidate name field
		mailingList.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Mailing list
				agent.post('/mailing-lists')
					.send(mailingList)
					.expect(400)
					.end(function(mailingListSaveErr, mailingListSaveRes) {
						// Set message assertion
						(mailingListSaveRes.body.message).should.match('Please fill Mailing list name');
						
						// Handle Mailing list save error
						done(mailingListSaveErr);
					});
			});
	});

	it('should be able to update Mailing list instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Mailing list
				agent.post('/mailing-lists')
					.send(mailingList)
					.expect(200)
					.end(function(mailingListSaveErr, mailingListSaveRes) {
						// Handle Mailing list save error
						if (mailingListSaveErr) done(mailingListSaveErr);

						// Update Mailing list name
						mailingList.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Mailing list
						agent.put('/mailing-lists/' + mailingListSaveRes.body._id)
							.send(mailingList)
							.expect(200)
							.end(function(mailingListUpdateErr, mailingListUpdateRes) {
								// Handle Mailing list update error
								if (mailingListUpdateErr) done(mailingListUpdateErr);

								// Set assertions
								(mailingListUpdateRes.body._id).should.equal(mailingListSaveRes.body._id);
								(mailingListUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Mailing lists if not signed in', function(done) {
		// Create new Mailing list model instance
		var mailingListObj = new MailingList(mailingList);

		// Save the Mailing list
		mailingListObj.save(function() {
			// Request Mailing lists
			request(app).get('/mailing-lists')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Mailing list if not signed in', function(done) {
		// Create new Mailing list model instance
		var mailingListObj = new MailingList(mailingList);

		// Save the Mailing list
		mailingListObj.save(function() {
			request(app).get('/mailing-lists/' + mailingListObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', mailingList.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Mailing list instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Mailing list
				agent.post('/mailing-lists')
					.send(mailingList)
					.expect(200)
					.end(function(mailingListSaveErr, mailingListSaveRes) {
						// Handle Mailing list save error
						if (mailingListSaveErr) done(mailingListSaveErr);

						// Delete existing Mailing list
						agent.delete('/mailing-lists/' + mailingListSaveRes.body._id)
							.send(mailingList)
							.expect(200)
							.end(function(mailingListDeleteErr, mailingListDeleteRes) {
								// Handle Mailing list error error
								if (mailingListDeleteErr) done(mailingListDeleteErr);

								// Set assertions
								(mailingListDeleteRes.body._id).should.equal(mailingListSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Mailing list instance if not signed in', function(done) {
		// Set Mailing list user 
		mailingList.user = user;

		// Create new Mailing list model instance
		var mailingListObj = new MailingList(mailingList);

		// Save the Mailing list
		mailingListObj.save(function() {
			// Try deleting Mailing list
			request(app).delete('/mailing-lists/' + mailingListObj._id)
			.expect(401)
			.end(function(mailingListDeleteErr, mailingListDeleteRes) {
				// Set message assertion
				(mailingListDeleteRes.body.message).should.match('User is not logged in');

				// Handle Mailing list error error
				done(mailingListDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		MailingList.remove().exec();
		done();
	});
});