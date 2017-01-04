var app = angular.module('Schedule', [
	'ScheduleService'
]);

app.controller('EditScheduleCtrl', ['$scope', 'ScheduleActions', '$location', '$stateParams', function($scope, $scheduleActions, $location, $stateParams){
	
	function getSchedule () {
		$scheduleActions.getEditInfo($stateParams.id).success(function (res) {
			console.log(res);
			$scope.scheduleInfo = res;
		}).error(function () {
			
		});	
	}

	getSchedule();

	$scope.validateWeekend = false;
	$scope.validateWeekday = false;

	$scope.getSchedule = function () {
		if (confirm("Вы уверены, что хотите сбросить свои изменения?")) {
			getSchedule();
		}
	}

	$scope.removeArrival = function (index, isWeekend) {
		isWeekend ? $scope.scheduleInfo.arrivals.weekend.splice(index, 1) :
					$scope.scheduleInfo.arrivals.weekday.splice(index, 1)
	}

	$scope.addArrival = function (isWeekend) {
		var newArrival = {
			time_from: '08:00',
			time_to: '22:00',
			interval: 10
		}
		isWeekend ? $scope.scheduleInfo.arrivals.weekend.push(newArrival) :
					$scope.scheduleInfo.arrivals.weekday.push(newArrival);
	}

	$scope.saveSchedule = function () {
		var i,
			weekend = $scope.scheduleInfo.arrivals.weekend,
			weekday = $scope.scheduleInfo.arrivals.weekday;

		$scope.validateWeekend = false;
		$scope.validateWeekday = false;

		$scope.showPreview = false;

		for(i = 0; i < weekend.length; i++) {

			if ( weekend[i].time_from > '02:00' && weekend[i].time_from < '04:00' &&
				weekend[i].time_to > '02:00' && weekend[i].time_to < '04:00' ) {
				$scope.validateWeekend = true;
				break;
			}

			if ( weekend[i].time_from > weekend[i].time_to && 
				!(
					weekend[i].time_from >= '04:00' && weekend[i].time_from <= '23:59' &&
					weekend[i].time_to >= '00:00' && weekend[i].time_to <= '02:00'
				) ) {

				$scope.validateWeekend = true;
				break;

			}
			if (i == 0) { continue; }

			if ( weekend[i].time_from < weekend[i - 1].time_to && 
				!(
					weekend[i - 1].time_to >= '04:00' && weekend[i - 1].time_to <= '23:59' &&
					weekend[i].time_from >= '00:00' && weekend[i].time_from <= '02:00'
				) ) {

				$scope.validateWeekend = true;
				break;

			}
		}

		for(i = 0; i < weekday.length; i++) {

			if ( weekday[i].time_from > '02:00' && weekday[i].time_from < '04:00' &&
				weekday[i].time_to > '02:00' && weekday[i].time_to < '04:00' ) {
				$scope.validateWeekday = true;
				break;
			}

			if ( weekday[i].time_from > weekday[i].time_to && 
				!(
					weekday[i].time_from >= '04:00' && weekday[i].time_from <= '23:59' &&
					weekday[i].time_to >= '00:00' && weekday[i].time_to <= '02:00'
				) ) {

				$scope.validateWeekday = true;
				break;

			}
			if (i == 0) { continue; }

			if ( weekday[i].time_from < weekday[i - 1].time_to && 
				!(
					weekday[i - 1].time_to >= '04:00' && weekday[i - 1].time_to <= '23:59' &&
					weekday[i].time_from >= '00:00' && weekday[i].time_from <= '02:00'
				) ) {

				$scope.validateWeekday = true;
				break;

			}
		}

		if ($scope.validateWeekday || $scope.validateWeekend) {
			$scope.showPreview = false;
			return;
		}

		var schedule = [];
		var stations = [];
		var j, k, wendTimes, wdayTimes;

		function calculateTime (time, plus) {
			var t = time.split(':').map(function (val) {
				return +val;
			});
			t[1] += plus;
			t[0] = (t[0] + Math.floor(t[1] / 60)) % 24;
			t[1] %= 60;

			if (t[0] < 10){ t[0] = '0' + t[0] } 
			if (t[1] < 10){ t[1] = '0' + t[1] } 

			return t.join(':');
		}

		function calculateTimeByTime (time_from, time_to, interval) {
			var time = time_from;
			var i = 0;
			while (time < time_to || 
				(
					time >= '04:00' && time <= '23:59' &&
					time_to >= '00:00' && time_to <= '02:00'
				) ) {
				time = calculateTime(time, +interval);
				i++;
			}
			return i;
		}

		for (i = 0; i < $scope.scheduleInfo.stations.length; i++) {
			k = 0;
			for(j = 0; j < i; j++) {
				k += +$scope.scheduleInfo.stations[j].duration_to_next;
			}
			wendTimes = [];
			wdayTimes = [];

			for (j = 0; j < $scope.scheduleInfo.arrivals.weekday.length; j++) {
				weekday = $scope.scheduleInfo.arrivals.weekday[j];
				var count = calculateTimeByTime(weekday.time_from, weekday.time_to, +weekday.interval);
				var time = weekday.time_from;
				for (var h = 0; h < count; h++) {
					wdayTimes.push(calculateTime(time, k));
					time = calculateTime(time, +weekday.interval);
				}
			}

			for (j = 0; j < $scope.scheduleInfo.arrivals.weekend.length; j++) {
				weekend = $scope.scheduleInfo.arrivals.weekend[j];
				var count = calculateTimeByTime(weekend.time_from, weekend.time_to, +weekend.interval);
				var time = weekend.time_from;
				for (var h = 0; h < count; h++) {
					wendTimes.push(calculateTime(time, k));
					time = calculateTime(time, +weekend.interval);
				}
			}
			stations.push({
				station: $scope.scheduleInfo.stations[i],
				weekend: wendTimes.join(' '),
				weekday: wdayTimes.join(' ')
			});
		}

		$scope.stations = stations;

		console.log(stations);

		$scope.showPreview = true;
	}

	$scope.swap = function (index1, index2, isWeekend) {
		var arrival = isWeekend ? $scope.scheduleInfo.arrivals.weekend :
							  $scope.scheduleInfo.arrivals.weekday;
		
		var tempArrival = arrival[index1];
		arrival[index1] = arrival[index2];
		arrival[index2] = tempArrival;
	}

	$scope.actualSave = function () {
		$scheduleActions.save($scope.scheduleInfo).success(function () {
			
		}).error(function () {
			
		});
	}

}]);

app.controller('ViewScheduleCtrl', ['$scope', 'ScheduleActions', '$location', '$stateParams', function($scope, $scheduleActions, $location, $stateParams){
	(function () {
		$scheduleActions.getSchedule($stateParams.id).success(function (res) {
			console.log(res);

			$scope.scheduleInfo = res;
		}).error(function () {
			$location.path('/admin/home');
		});
	})();
}]);



