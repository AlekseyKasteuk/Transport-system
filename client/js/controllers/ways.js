var app = angular.module('Way', [
	'WayService',
	'StationService'
]);

app.controller('WaysCtrl', ['$scope', 'WayActions', '$location', function($scope, $wayActions, $location){

	function getWays () {
		$wayActions.getWays().success(function (ways) {
			console.log(ways);
			$scope.ways = ways;
		}).error(function () {
			$location.path('/admin/home');
		});	
	}

	getWays();

	$scope.getFields = function () {
		$wayActions.getFields().success(function (res) {
			console.log(res);
			$scope.fields = res;
		}).error(function (err) {
			console.log(err);
		});
	}

	$scope.createWay = function () {
		try {
			if($scope.newWay.transport !== undefined && 
			$scope.newWay.station_to !== undefined && 
			$scope.newWay.station_from !== undefined) {
				$wayActions.createWay($scope.newWay).success(function (result) {
					$('#close-model').click();
					getWays();
				}).error(function () {
					
				});
			} else {
				throw new Error();
			}
			
		} catch (e) {
			console.log(e);
		}
		
	}

	$scope.removeWay = function (ways) {
		if(confirm("Вы уверены, что хотите удалить выбранный маршрут?")) {
			$wayActions.removeWay(ways).success(function () {
				getWays();
			});
		}
	}

}]);

app.controller('ViewWayCtrl', ['$scope', '$stateParams', 'WayActions', '$location', function($scope, $stateParams, $wayActions, $location){
	$wayActions.getWay($stateParams.id).success(function (wayInfo) {
		$scope.wayInfo = wayInfo;
	}).error(function () {
		$location.path('/admin/home');
	});
}]);

app.controller('EditWayCtrl', ['$scope', '$stateParams', 'WayActions', '$location', 'StationActions', function($scope, $stateParams, $wayActions, $location, $stationActions){
	var getWay = function () {
		$wayActions.getWay($stateParams.id).success(function (wayInfo) {
			$scope.wayInfo = wayInfo;
		}).error(function () {
			$location.path('/admin/home');
		});
	}

	getWay();

	$scope.getStations = function () {
		$scope.newStation = undefined;
		$stationActions.getAvailableStations($scope.wayInfo.stations).success(function (stations) {
			$scope.availibleStations = stations;
		})
	}

	$scope.addStation = function () {
		var s = JSON.parse($scope.newStation);
		var station = {station_id: s.id, station_name: s.name};
		console.log(station);
		$scope.wayInfo.stations.splice(1, 0, station);
		console.log($scope.wayInfo.stations);
	}

	$scope.swapStations = function (index1, index2) {
		var station = $scope.wayInfo.stations[index1];
		$scope.wayInfo.stations[index1] = $scope.wayInfo.stations[index2];
		$scope.wayInfo.stations[index2] = station;
	}

	$scope.removeStation = function (index) {
		$scope.wayInfo.stations.splice(index, 1);
	}

	$scope.saveWay = function () {
		if (confirm("Вы уверены сохранить текущий маршрут? При сохранении расписание для данного маршрута удалится.")) {
			$wayActions.saveWay({id: $scope.wayInfo.way.id, stations: $scope.wayInfo.stations}).success(function () {
				$location.path('/admin/way/view/' + $scope.wayInfo.way.id);
			})
		}
	}

	$scope.getFields = function () {

		$scope.currentWay = { 
			transport: $scope.wayInfo.way.transport_id + '', 
			station_from: $scope.wayInfo.way.station_from_id + '', 
			station_to: $scope.wayInfo.way.station_to_id + ''
		};
		
		$wayActions.getFields($scope.wayInfo.way.transport_id).success(function (res) {
			$scope.fields = res;
		}).error(function (err) {
			console.log(err);
		});
	}

	$scope.editWay = function () {
		if(!$scope.currentWay.transport || !$scope.currentWay.station_from || !$scope.currentWay.station_to) {
			return;
		}
		if (confirm("Вы уверены, что хотите изменить данный путь?")) {
			$wayActions.changeWay($scope.wayInfo.way.id, $scope.currentWay).success(function () {
				getWay();
			}).error(function () {
				
			});
		}
	}

}]);



