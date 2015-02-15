'use strict';

// Subscribers controller
angular.module('subscribers').controller('SubscribersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Subscribers',
	function($scope, $stateParams, $location, Authentication, Subscribers) {
		$scope.authentication = Authentication;
		$scope.loadingIconPromise = null;

		// Create new Subscriber
		$scope.create = function() {
			// Create new Subscriber object
			var subscriber = new Subscribers ({
				name: this.name,
				emailAddress: this.emailAddress
			});
			// Redirect after save
			$scope.loadingIconPromise = subscriber.$save(function(response) {
				$location.path('subscribers/' + response.emailAddress);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Subscriber
		$scope.remove = function(subscriber) {
			if ( subscriber ) {
				subscriber.$remove();

				for (var i in $scope.subscribers) {
					if ($scope.subscribers [i] === subscriber) {
						$scope.subscribers.splice(i, 1);
					}
				}
			} else {
				$scope.loadingIconPromise = $scope.subscriber.$remove(function() {
					$location.path('subscribers');
				});
			}
		};

		// Find a list of Subscribers
		$scope.find = function() {
			$scope.subscribers = Subscribers.query();
			$scope.loadingIconPromise = $scope.subscribers.$promise;
		};

		// Find existing Subscriber
		$scope.findOne = function() {
			$scope.subscriber = Subscribers.get({
				emailAddress: $stateParams.emailAddress
			});
			$scope.loadingIconPromise = $scope.subscriber.$promise;
		};
	}
]);
