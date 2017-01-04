var app = angular.module('Transport', [
	'TransportService',
	'ParkService'
]);

app.controller('TransportsCtrl', ['$scope', 'TransportActions', '$location', 'ParkActions', function($scope, $transportActions, $location, $parkActions){
	
	function getTransports () {
		$transportActions.getTransports().success(function (transports) {
			$scope.transports = transports;
			console.log(transports);
		}).error(function () {
			$location.path('/admin/home');
		});	
	}

	getTransports();

	(function () {
		$scope.types = [];
		$transportActions.getTypes().success(function (types) {
			$scope.types = types;
		})
	})();

	$scope.getRelativeElements = function () {
		$parkActions.getParks().success(function (parks) {
			$scope.parks = parks;
		});
	}

	$scope.createTransport = function () {
		try {
			if($scope.newTransport.number && $scope.newTransport.type !== '' && $scope.newTransport.park !== '') {
				$transportActions.createTransport($scope.newTransport)
				.success(function (result) {
					$('#close-model').click();
					getTransports();
				}).error(function () {
					
				});
			} else {
				throw new Error();
			}
			
		} catch (e) {
			console.log('Creation error');
		}
		
	}

	$scope.removeTransport = function (id) {
		if(confirm("Вы уверены, что хотите удалить выбранный транспорт?")) {
			$transportActions.removeTransport(id).success(function () {
				getTransports();
			});
		}
	}

	$scope.setCurrentTransport = function (transport) {
		$scope.currentTransport = {
			id: transport.id,
			number: transport.number,
			type: transport.transport_type_id + '',
			park: transport.park_id + ''
		};
		$scope.getRelativeElements();
	}

	$scope.updateTransport = function () {
		if ($scope.currentTransport.number && $scope.currentTransport.type !== '' && $scope.currentTransport.park !== '') {
			$transportActions.updateTransport($scope.currentTransport).success(function () {
				$('#close-model-edit').click();
				getTransports();
			}).error(function () {
				
			});
		}
	}


}]);

app.controller('ViewTransportCtrl', ['$scope', 'TransportActions', '$stateParams', function($scope, $transportActions, $stateParams){
	
	$transportActions.getTransportView($stateParams.id).success(function (res) {
		console.log(res);
		$scope.transportInfo = res;
	})

}]);