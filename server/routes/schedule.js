var connection = require('../utiles/connection');

module.exports.getEditInfo = function (req, res, next) {
	var query = "SELECT \
					w.id, \
					way_info.tr_id as transport_id, \
					way_info.tr_number as transport_number, \
					way_info.tr_type as transport_type, \
					st_from.name as station_from_name, \
					st_from.id as station_from_id, \
					st_to.name as station_to_name, \
					st_to.id as station_to_id \
				FROM way AS w \
				INNER JOIN \
				( \
					SELECT tr_id, tr_number, tr_type, tr_to_w.way_1, tr_to_w.way_2 \
					FROM transport_to_way as tr_to_w \
					INNER JOIN \
					( \
						SELECT tr.id as tr_id, tr.number as tr_number, tr_type.name AS tr_type \
						FROM transport as tr \
						INNER JOIN transport_type as tr_type ON tr.transport_type = tr_type.id  \
					) as tr ON tr_to_w.transport = tr.tr_id \
				) as way_info \
				ON w.id = way_info.way_1 OR w.id = way_info.way_2 \
				INNER JOIN station as st_from \
				ON w.station_from = st_from.id \
				INNER JOIN station as st_to \
				ON w.station_to = st_to.id " +
				"WHERE w.id=" + req.params.id;

	connection.query(query, function (err, way) {

		if (err) { return next(); }

		if (!way.length) { return next(); } 

		query = "SELECT st_to_w.id, st.name as station_name, st.id as station_id, st_to_w.queue, st_to_w.duration_to_next  \
					FROM station_to_way as st_to_w \
					INNER JOIN station as st ON st.id = st_to_w.station \
					WHERE st_to_w.way=" + req.params.id +
					" ORDER BY queue";

		connection.query(query, function (err, stations) {
			if (err) { return next(err); }
			
			query = "SELECT * FROM arrival WHERE way = " + req.params.id;

			connection.query(query, function (err, arrivals) {
				if (err) { arrivals = []; }

				var sortedArrivals = {
					weekend: [],
					weekday: []
				}

				arrivals.forEach(function (arr) {
					arr.time_from = arr.time_from.split(':').splice(0, 2).join(':');
					arr.time_to = arr.time_to.split(':').splice(0, 2).join(':');
					if (arr.is_weekend) {
						sortedArrivals.weekend.push(arr);
					} else {
						sortedArrivals.weekday.push(arr);
					}
				});

				res.status(200).send({ way: way[0], stations: stations, arrivals: sortedArrivals });
			})
		});

	});
}

function createSchedule (info) {
	var i,
		weekend = info.arrivals.weekend,
		weekday = info.arrivals.weekday;

	var validateWeekend = false;
	var validateWeekday = false;

	for(i = 0; i < weekend.length; i++) {

		if ( weekend[i].time_from > '02:00' && weekend[i].time_from < '04:00' &&
			weekend[i].time_to > '02:00' && weekend[i].time_to < '04:00' ) {
			validateWeekend = true;
			break;
		}

		if ( weekend[i].time_from > weekend[i].time_to && 
			!(
				weekend[i].time_from >= '04:00' && weekend[i].time_from <= '23:59' &&
				weekend[i].time_to >= '00:00' && weekend[i].time_to <= '02:00'
			) ) {

			validateWeekend = true;
			break;

		}
		if (i == 0) { continue; }

		if ( weekend[i].time_from < weekend[i - 1].time_to && 
			!(
				weekend[i - 1].time_to >= '04:00' && weekend[i - 1].time_to <= '23:59' &&
				weekend[i].time_from >= '00:00' && weekend[i].time_from <= '02:00'
			) ) {

			validateWeekend = true;
			break;

		}
	}

	for(i = 0; i < weekday.length; i++) {

		if ( weekday[i].time_from > '02:00' && weekday[i].time_from < '04:00' &&
			weekday[i].time_to > '02:00' && weekday[i].time_to < '04:00' ) {
			validateWeekday = true;
			break;
		}

		if ( weekday[i].time_from > weekday[i].time_to && 
			!(
				weekday[i].time_from >= '04:00' && weekday[i].time_from <= '23:59' &&
				weekday[i].time_to >= '00:00' && weekday[i].time_to <= '02:00'
			) ) {

			validateWeekday = true;
			break;

		}
		if (i == 0) { continue; }

		if ( weekday[i].time_from < weekday[i - 1].time_to && 
			!(
				weekday[i - 1].time_to >= '04:00' && weekday[i - 1].time_to <= '23:59' &&
				weekday[i].time_from >= '00:00' && weekday[i].time_from <= '02:00'
			) ) {

			validateWeekday = true;
			break;

		}
	}

	if (validateWeekday || validateWeekend) {
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

	for (i = 0; i < info.stations.length; i++) {
		k = 0;
		for(j = 0; j < i; j++) {
			k += +info.stations[j].duration_to_next;
		}
		wendTimes = [];
		wdayTimes = [];

		for (j = 0; j < info.arrivals.weekday.length; j++) {
			weekday = info.arrivals.weekday[j];
			var count = calculateTimeByTime(weekday.time_from, weekday.time_to, +weekday.interval);
			var time = weekday.time_from;
			for (var h = 0; h < count; h++) {
				wdayTimes.push(calculateTime(time, k));
				time = calculateTime(time, +weekday.interval);
			}
		}

		for (j = 0; j < info.arrivals.weekend.length; j++) {
			weekend = info.arrivals.weekend[j];
			var count = calculateTimeByTime(weekend.time_from, weekend.time_to, +weekend.interval);
			var time = weekend.time_from;
			for (var h = 0; h < count; h++) {
				wendTimes.push(calculateTime(time, k));
				time = calculateTime(time, +weekend.interval);
			}
		}
		stations.push({
			transport: info.way.transport_id,
			station: info.stations[i].id,
			weekend: wendTimes,
			weekday: wdayTimes
		});

	}

	return stations;
}

module.exports.saveSchedule = function (req, res, next) {
	var query = "";
	var i;
	for(i = 0; i < req.body.stations.length; i++) {
		query += "UPDATE station_to_way SET duration_to_next = " + req.body.stations[i].duration_to_next + " WHERE id = " + req.body.stations[i].id + "; "
	}
	connection.query(query, function (err) {
		if (err) { return next(); }

		query = "DELETE FROM arrival WHERE way = " + req.body.way.id;

		connection.query(query, function (err) {
			if (err) { return next(); }

			var arrivals = req.body.arrivals.weekend.map(function (arr) {
				return [arr.time_from, arr.time_to, req.body.way.id, arr.interval, 1];
			});

			arrivals = arrivals.concat(req.body.arrivals.weekday.map(function (arr) {
					return [arr.time_from, arr.time_to, req.body.way.id, arr.interval, 0];
				})
			);

			if (!arrivals.length) { res.status(200).end(); }

			query = "INSERT INTO arrival (time_from, time_to, way, `interval`, is_weekend) VALUES ?";

			connection.query(query, [arrivals], function (err) {
				if (err) { return next(); }

				query = '';

				for(i = 0; i < req.body.stations.length; i++) {
					query += "DELETE FROM schedule WHERE station_to_way = " + req.body.stations[i].id + "; "
				}

				connection.query(query, function (err) {
					if (err) { return next(); }

					var schedules = createSchedule(req.body);
					var scheduleElements = [];
					query = "INSERT INTO schedule (transport, station_to_way, time, is_weekend) VALUES ?";

					schedules.forEach(function (schedule) {
						schedule.weekend.forEach(function (time) {
							scheduleElements.push([schedule.transport, schedule.station, time, 1]);
						});
						schedule.weekday.forEach(function (time) {
							scheduleElements.push([schedule.transport, schedule.station, time, 0]);
						});
					});

					connection.query(query, [scheduleElements], function (err) {
						if (err) { return next(); }

						res.status(200).end();
					});

				});
			})
		})

	})
}

module.exports.getScheduleForWay = function (req, res, next) {
	var query = "SELECT \
					w.id, \
					way_info.tr_id as transport_id, \
					way_info.tr_number as transport_number, \
					way_info.tr_type as transport_type, \
					st_from.name as station_from_name, \
					st_from.id as station_from_id, \
					st_to.name as station_to_name, \
					st_to.id as station_to_id \
				FROM way AS w \
				INNER JOIN \
				( \
					SELECT tr_id, tr_number, tr_type, tr_to_w.way_1, tr_to_w.way_2 \
					FROM transport_to_way as tr_to_w \
					INNER JOIN \
					( \
						SELECT tr.id as tr_id, tr.number as tr_number, tr_type.name AS tr_type \
						FROM transport as tr \
						INNER JOIN transport_type as tr_type ON tr.transport_type = tr_type.id  \
					) as tr ON tr_to_w.transport = tr.tr_id \
				) as way_info \
				ON w.id = way_info.way_1 OR w.id = way_info.way_2 \
				INNER JOIN station as st_from \
				ON w.station_from = st_from.id \
				INNER JOIN station as st_to \
				ON w.station_to = st_to.id " +
				"WHERE w.id=" + req.params.id;

	connection.query(query, function (err, way) {

		if (err) { return next(); }

		if (!way.length) { return next(); } 

		query = "SELECT station.name as station_name, station.id as station_id, GROUP_CONCAT(DISTINCT sch_weekend.time ORDER BY sch_weekend.time) as 'weekend', GROUP_CONCAT(DISTINCT sch_weekday.time ORDER BY sch_weekday.time) as 'weekday' \
				FROM station_to_way \
				INNER JOIN station ON station.id = station_to_way.station \
				INNER JOIN schedule as sch_weekend ON sch_weekend.station_to_way = station_to_way.id AND sch_weekend.is_weekend = 1 \
				INNER JOIN schedule as sch_weekday ON sch_weekday.station_to_way = station_to_way.id AND sch_weekday.is_weekend = 0 \
				WHERE station_to_way.way = " + req.params.id + 
				" GROUP BY station_to_way.id  \
				ORDER BY station_to_way.queue;";

		connection.query(query, function (err, schedules) {
			if (err) { return next(err); }
			
			for (var k = 0; k < schedules.length; k++) {
				schedules[k].weekend = schedules[k].weekend.split(',');
				schedules[k].weekday = schedules[k].weekday.split(',');

				var weekend = [];
				var weekday = [];
				var temp;

				for(var i = 0; i < schedules[k].weekend.length; i++) {
					var j = i + 1;
					temp = schedules[k].weekend[i].split(':');
					temp.splice(2, 1);
					var arr = [temp.join(':')];
					while (j < schedules[k].weekend.length) {
						if (schedules[k].weekend[j].split(':')[0] > schedules[k].weekend[i].split(':')[0] ||
							(schedules[k].weekend[j].split(':')[0] == '00' && schedules[k].weekend[i].split(':')[0] == '23')) { break; }
						else {
							temp = schedules[k].weekend[j].split(':');
							temp.splice(2, 1);
							arr.push(temp.join(':'));
							i++;
							j++;
						}
					}
					weekend.push(arr.join(' '));
				}

				for(var i = 0; i < schedules[k].weekday.length; i++) {
					var j = i + 1;
					temp = schedules[k].weekday[i].split(':');
					temp.splice(2, 1);
					var arr = [temp.join(':')];
					while (j < schedules[k].weekday.length) {
						if (schedules[k].weekday[j].split(':')[0] > schedules[k].weekday[i].split(':')[0] ||
							(schedules[k].weekday[j].split(':')[0] == '00' && schedules[k].weekday[i].split(':')[0] == '23')) { break; }
						else {
							temp = schedules[k].weekday[j].split(':');
							temp.splice(2, 1);
							arr.push(temp.join(':'));
							i++;
							j++;
						}
					}
					weekday.push(arr.join(' '));
				}

				schedules[k].weekend = weekend;
				schedules[k].weekday = weekday;
			}

			res.status(200).send({way: way[0], schedules: schedules});
		});
	});
}

