'use strict';

/**
 * Module dependencies.
 */
var errorHandler = require('./errors.server.controller'),
	_ = require('lodash'),
	createsend = require('createsend-node');

/**
	* Add a subscriber
	*/

exports.create = function(req, res) {
  var subscriber = req.body;
  var auth = { apiKey: req.user.APIkey };
  var api = new createsend(auth);
  var details = {
    EmailAddress: subscriber.emailAddress,
    Name: subscriber.name,
		CustomFields : [],
		Resubscribe: true,
		RestartSubscriptionBasedAutoresponders: true };

		api.subscribers.addSubscriber(req.listId, details, function(err, result) {
      if (err) {
			  return res.status(400).send({
				  message: errorHandler.getErrorMessage(err)
				});
			} else {
			  res.jsonp(subscriber);
			}
		});
};


/**
 * Get the details for a subscriber
 */
exports.read = function(req, res) {
	var emailAddress = req.params.emailAddress;
	var auth = { apiKey: req.user.APIkey };
	var api = new createsend(auth);

	api.subscribers.getSubscriberDetails(req.listId, emailAddress, function(err, Details) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			var subscriber = {};
			subscriber.name = Details.Name;
			subscriber.emailAddress = Details.EmailAddress;
			subscriber.date = Details.Date;
			res.jsonp(subscriber);
		}
	});
};


/**
 * Delete an subscriber
 */
exports.delete = function(req, res) {
	var emailAddress = req.params.emailAddress;
	var auth = { apiKey: req.user.APIkey };
	var api = new createsend(auth);

	api.subscribers.deleteSubscriber(req.listId, emailAddress, function(err, Details) {
	  if (err) {
		  return res.status(400).send({
			  message: errorHandler.getErrorMessage(err)
			});
		} else {
		  res.jsonp({});
		}
	});

};

/**
 * Get a list of subscribers
 */

exports.list = function(req, res) {
	var auth = { apiKey: req.user.APIkey };
	var api = new createsend(auth);

	var filter = { pagesize: 1000 };
	api.lists.getActiveSubscribers(req.listId, filter, function(err, Results){
	if (err) {
	  return res.status(400).send({
		  message: errorHandler.getErrorMessage(err)
		});
		} else {
		  var Subscribers = Results.Results;
			res.jsonp(Subscribers);
		}
	});
};

/**
* Middleware to get the user list after each request gets received
*/

exports.getUserList = function (req, res, next) {
	var auth = { apiKey: req.user.APIkey };
	var api = new createsend(auth);

	api.account.getClients(function(err, clients) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			clients.forEach(function(client) {
				if (client.name === req.user.client) {
					var clientId = client.clientId;
					api.clients.getLists(clientId, function(err, lists){
						if (err) {
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
						} else {
							lists.forEach(function(list){
								if(list.Name === req.user.list){
									var listId = list.ListID;
									req.listId = listId;
									next();
								}
							});
							}
						});
					}
			});
		}
	});
};
