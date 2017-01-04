var app = angular.module('Station', [
	'StationService'
]);

app.controller('StationsCtrl', ['$scope', 'StationActions', '$location', function($scope, $stationActions, $location){
	
	function getStations () {
		$stationActions.getStations().success(function (stations) {
			$scope.stations = stations;
		}).error(function () {
			$location.path('/admin/home');
		});	
	}

	getStations();

	$scope.createStation = function () {
		try {
			if($scope.newStation.name) {
				$stationActions.createStation({ name: $scope.newStation.name })
				.success(function (result) {
					$('#close-model').click();
					getStations();
				}).error(function () {
					
				});
			} else {
				throw new Error();
			}
			
		} catch (e) {
			console.log('Creation error');
		}
		
	}

	$scope.removeStation = function (id) {
		if(confirm("Вы уверены, что хотите удалить выбранную остановку?")) {
			$stationActions.removeStation(id).success(function () {
				getStations();
			});
		}
	}

	$scope.setCurrentStation = function (station) {
		$scope.currentStation = {
			id: station.id,
			name: station.name
		};
	}

	$scope.updateStation = function () {
		if ($scope.currentStation.name) {
			$stationActions.updateStation($scope.currentStation).success(function () {
				$('#close-model-edit').click();
				getStations();
			}).error(function () {
				
			});
		}
	}

}]);

app.controller('ViewStationCtrl', ['$scope', 'StationActions', '$location', '$stateParams', function($scope, $stationActions, $location, $stateParams){
	$stationActions.getStationView($stateParams.id).success(function (res) {
		console.log(res);
		$scope.stationInfo = res;
	}).error(function () {
		$location.path('/admin/stations');
	});
}]);