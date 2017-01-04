var app = angular.module('StationService', []);

app.factory('StationActions', ['$http', function($http){
	return {
		getStations : function (){
			return $http.get('/stations');
		},
		createStation: function (station){
			return $http.post('/station', station);
		},
		removeStation : function (id) {
			return $http.delete('/station/' + id);
		},
		getAvailableStations: function (stations) {
			var sts = stations.map(function (s) {
				return s.station_id;
			});
			return $http.post('/available/stations', sts);
		},
		getStationView: function (id) {
			return $http.get('/station/view/' + id);
		},
		updateStation: function (station) {
			console.log(station);
			return $http.put('/change/station', station);
		}
	}
}]);