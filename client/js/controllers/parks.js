var app = angular.module('Park', [
	'ParkService'
]);

app.controller('ParksCtrl', ['$scope', 'ParkActions', '$location', function($scope, $parkActions, $location){
	
	function getParks () {
		$parkActions.getParks().success(function (parks) {
			$scope.parks = parks;
		}).error(function () {
			$location.path('/admin/home');
		});	
	}

	getParks();

	$scope.createPark = function () {
		try {
			if($scope.newPark.name) {
				$parkActions.createPark($scope.newPark).success(function (result) {
					$('#close-model').click();
					getParks();
				}).error(function () {
					
				});
			} else {
				throw new Error();
			}
			
		} catch (e) {
			console.log('Creation error');
		}
		
	}

	$scope.removePark = function (id) {
		if(confirm("Вы уверены, что хотите удалить выбранный парк?")) {
			$parkActions.removePark(id).success(function () {
				getParks();
			});
		}
	}

	$scope.setCurrentPark = function (park) {
		$scope.currentPark = { name: park.name, id: park.id };
	}

	$scope.updatePark = function () {
		if ($scope.currentPark.name && $scope.currentPark.id) {
			$parkActions.updatePark($scope.currentPark.id, $scope.currentPark).success(function () {
				$('#close-model-edit').click();
				getParks();
			})
		}
	}

}]);

app.controller('ViewParkCtrl', ['$scope', 'ParkActions', '$stateParams', '$location', function($scope, $parkActions, $stateParams, $location){
	$parkActions.getParkView($stateParams.id).success(function (result) {
		$scope.parkInfo = result;
	}).error(function () {
		$location.path('/admin/parks');
	});
}]);

app.controller('EditParkCtrl', ['$scope', function($scope){
	
}]);