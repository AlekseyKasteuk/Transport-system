var app = angular.module('LoginService', []);

app.factory('CheckLogin', ['$http', function($http){
	return function () {
		return $http.get('/login');
	};
}]);

app.factory('Login', ['$http', function($http){
	return function (user) {
		return $http.post('/login', user);
	};
}]);

app.factory('Logout', ['$http', function($http){
	return function () {
		return $http.get('/logout');
	};
}]);