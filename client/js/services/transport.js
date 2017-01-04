var app = angular.module('TransportService', []);

app.factory('TransportActions', ['$http', function($http){
	return {
		getTransports : function (){
			return $http.get('/transports');
		},
		createTransport: function (transport){
			return $http.post('/transport', transport);
		},
		removeTransport : function (id) {
			return $http.delete('/transport/' + id);
		},
		getTypes: function () {
			return $http.get('/transport/types');
		},
		getTransportView: function (id) {
			return $http.get('/transport/view/' + id);
		},
		updateTransport: function (transport) {
			return $http.put('/change/transport', transport);
		}
	}
}]);