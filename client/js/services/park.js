var app = angular.module('ParkService', []);

app.factory('ParkActions', ['$http', function($http){
	return {
		getParks : function (){
			return $http.get('/parks');
		},
		createPark: function (park){
			return $http.post('/park', park);
		},
		removePark : function (id) {
			return $http.delete('/park/' + id);
		},
		getParkView: function (id) {
			return $http.get('/park/view/' + id);
		},
		updatePark: function (id, park) {
			return $http.put('/park/' + id, park);
		}
	}
}]);