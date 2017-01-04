var app = angular.module('WayService', []);

app.factory('WayActions', ['$http', function($http){
	return {
		getWays : function (){
			return $http.get('/ways');
		},
		createWay: function (way){
			return $http.post('/way', way);
		},
		removeWay: function (ways) {
			return $http.delete('/ways?way1=' + ways.way1 + '&way2=' + ways.way2);
		},
		getFields: function (id) {
			return $http.get('/fields/way' + (id ? '?exception=' + id : ''));
		},
		getWay: function (id) {
			return $http.get('/way/' + id);
		},
		saveWay: function (data) {
			return $http.post('/edit/way/stations/' + data.id, data.stations);
		},
		changeWay: function (id, way) {
			return $http.put('/change/way/' + id, way);
		}
	}
}]);