var app = angular.module('TransportSystem', [
	'ui.router',
	'Home',
	'Login',
	'Park',
	'Station',
	'Transport',
    'Way',
	'Schedule',
    'App',
    'LoginService'
]);

app.config(['$httpProvider', '$urlRouterProvider', '$stateProvider', '$locationProvider', function($httpProvider, $urlRouterProvider, $stateProvider, $locationProvider) {
        // $locationProvider.html5Mode({
        // 	enabled: true,
        // 	requireBase: false
        // });
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        $urlRouterProvider.otherwise('/admin/home');

        $stateProvider
        	.state('login', {
        		url: '/login',
        		templateUrl: 'templates/login.html',
        		controller: 'LoginCtrl'
        	})
            .state('app', {
                url: '/admin',
                templateUrl: 'templates/app.html',
                controller: 'AppCtrl'
            })
            .state('app.home', {
                url: '/home',
                templateUrl: 'templates/home.html',
                controller: 'HomeCtrl'
            })
            .state('app.stations', {
                url: '/stations',
                templateUrl: 'templates/stations.html',
                controller: 'StationsCtrl'
            })
            .state('app.station_view', {
                url: '/station/view/:id',
                templateUrl: 'templates/view_station.html',
                controller: 'ViewStationCtrl'
            })
            .state('app.transports', {
                url: '/transports',
                templateUrl: 'templates/transports.html',
                controller: 'TransportsCtrl'
            })
            .state('app.view_transport', {
                url: '/transport/view/:id',
                templateUrl: 'templates/view_transport.html',
                controller: 'ViewTransportCtrl'
            })
            .state('app.ways', {
                url: '/ways',
                templateUrl: 'templates/ways.html',
                controller: 'WaysCtrl'
            })
            .state('app.way_view', {
                url: '/way/view/:id',
                templateUrl: 'templates/view_way.html',
                controller: 'ViewWayCtrl'
            })
            .state('app.ways_edit', {
            	url: '/way/edit/:id',
                templateUrl: 'templates/edit_way.html',
                controller: 'EditWayCtrl'
            })
            .state('app.parks', {
                url: '/parks',
                templateUrl: 'templates/parks.html',
                controller: 'ParksCtrl'
            })
            .state('app.park_view', {
                url: '/park/view/:id',
                templateUrl: 'templates/view_park.html',
                controller: 'ViewParkCtrl'
            })
            .state('app.edit_schedule', {
                url: '/schedule/edit/:id',
                templateUrl: 'templates/edit_schedule.html',
                controller: 'EditScheduleCtrl'
            })
            .state('app.view_schedule', {
                url: '/schedule/view/:id',
                templateUrl: 'templates/view_schedule.html',
                controller: 'ViewScheduleCtrl'
            })
    }
])

app.run(['$rootScope', '$state', '$stateParams', '$location', 'CheckLogin', function ($rootScope, $state, $stateParams, $location, $checkLogin) {
	$rootScope.$on('$stateChangeStart', function () {
		$checkLogin().success(function (user) {
            $rootScope.user = user;
            console.log(user);
            if($location.path() == '/login') {
                $location.path('/app/home');
            }
        }).error(function () {
            if($location.path() != '/login') {
                $location.path('/login');
            }
        });

	});
}]);