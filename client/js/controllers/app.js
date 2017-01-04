var app = angular.module('App', [
	'Login',
	'AppService'
]);

app.controller('AppCtrl', ['$scope', 'Logout', '$location', '$rootScope', 'AppActions', function($scope, $logout, $location, $rootScope, $appActions){
	$scope.logout = function () {
		$logout().success(function () {
			$location.path('/login');
		});
	}

	$scope.getUserInfo = function () {
		$scope.newAccount = {};
		$appActions.getUserInfo().success(function (res) {
			$scope.userInfo = res;
		})
	}

	$scope.getCurrentUserInfo = function () {
		$scope.curentUser = {
			username: $rootScope.user.username,
			password: '',
			passwordRepeat: '',
			city: $rootScope.user.city.id + '',
			role: $rootScope.user.role.id + ''
		}
		$appActions.getUserInfo().success(function (res) {
			$scope.userInfo = res;
		})
	}

	$scope.addAccount = function () {
		if ($scope.newAccount.password != $scope.newAccount.passwordRepeat) {
			return;
		}

		$appActions.createUser($scope.newAccount).success(function () {
			$('#close-add-account-model').click();
		});
	}

	$scope.resetCountry = function () {
		$scope.newCountry = {}	
	}

	$scope.addCountry = function () {
		$appActions.addCountry($scope.newCountry).success(function () {
			$('#close-add-country-model').click();
		});
	}

	$scope.resetCity = function () {
		$scope.newCity = {};
		$appActions.getCountries().success(function (res) {
			$scope.countries = res;
		}).error(function () {
			$scope.countries = [];	
		})
	}

	$scope.addCity = function () {
		$appActions.addCity($scope.newCity).success(function () {
			$('#close-add-city-model').click();
		})
	}

}])