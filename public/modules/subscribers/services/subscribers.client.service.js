'use strict';

//Subscribers service used to communicate Subscribers REST endpoints
angular.module('subscribers').factory('Subscribers', ['$resource',
	function($resource) {
		return $resource('subscribers/:emailAddress', {emailAddress: '@emailAddress'
		}, {
			//Just in case we decide to implement this at some point
			update: {
				method: 'PUT'
			}
		});
	}
]);
