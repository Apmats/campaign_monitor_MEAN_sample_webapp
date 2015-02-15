'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var subscribers = require('../../app/controllers/subscribers.server.controller');


	// Subscriber routes with some middleware
	//Each of the subscriber routes requires user to be logged in and an actual list being found

	app.route('/subscribers')
		.get(users.requiresLogin,subscribers.getUserList,subscribers.list)
		.post(users.requiresLogin,subscribers.getUserList,subscribers.create);

	app.route('/subscribers/:emailAddress')
		.get(users.requiresLogin,subscribers.getUserList,subscribers.read)
		.post(users.requiresLogin,subscribers.getUserList,subscribers.create)
		.delete(users.requiresLogin,subscribers.getUserList,subscribers.delete);
};
