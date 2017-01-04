var app = angular.module('AppService', []);

app.factory('AppActions', ['$http', function($http){
	return {
		getUserInfo : function () {
			return $http.get('/user/info');
		},
		createUser: function (acc) {
			return $http.post("/user", acc);
		},
		updateUser: function (user) {
			return $http.put('/user' + user);
		},
		addCountry: function (country) {
			return $http.post('/country', country);
		},
		getCountries: function () {
			return $http.get('/countries');
		},
		addCity: function (city) {
			return $http.post('/city', city);
		}
	}
}]);