var app = angular.module('Login', [
	'LoginService'
]);

app.controller('LoginCtrl', ['$scope', 'Login', '$location', function($scope, $login, $location){
	$scope.submitLogin = function () {
		$login($scope.user).success(function () {
			$location.path('/app/home');
		}).error(function (err) {
			console.log('Error', err);
		});
	}
}])