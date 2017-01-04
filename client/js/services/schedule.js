var app = angular.module('ScheduleService', []);

app.factory('ScheduleActions', ['$http', function($http){
	return {
		getEditInfo: function (id) {
			return $http.get('/schedule/edit/' + id);
		},
		save: function (info) {
			return $http.post('/schedule/save', info);
		},
		getSchedule : function (id) {
			return $http.get('/schedule/' + id);
		}
	}
}]);