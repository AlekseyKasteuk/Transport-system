var app = angular.module('HomeService', []);

app.factory('GetHome', ['$http', function($http){
	return function () {
		return $http.get('/home');
	}
}]);