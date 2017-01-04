var app = angular.module('Home', [
	'HomeService'
]);

app.controller('HomeCtrl', ['$scope', 'GetHome', function($scope, $getHome){
	$getHome().success(function (res) {
		console.log(res);
		$scope.home = res;
	})
}])