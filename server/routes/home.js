var connection = require('../utiles/connection');

module.exports.getHome = function (req, res, next) {
	if (!req.session.passport) { 
		res.status(404).send([]);
		return;
	}

	if (!req.session.passport.user) { 
		res.status(404).send([]);
		return;
	}

	if (!req.session.passport.user.city) { 
		res.status(400).send([]);
		return;
	}

	var query = "SELECT \
					tr.number as transport_number, \
					tr.id as transport_id, \
			        tr.transport_type as transport_type, \
			        tr_to_w.id, \
			        w1.id as way_1_id, \
			        w1.from_to as way_1_from_to, \
			        w2.id as way_2_id, \
			        w2.from_to as way_2_from_to  \
				FROM transport_to_way as tr_to_w \
				INNER JOIN \
					( \
				    SELECT tr.id, tr.number, tr_type.name as transport_type, tr.city \
				    FROM transport as tr \
				    INNER JOIN transport_type as tr_type ON tr.transport_type = tr_type.id \
					) as tr ON tr.id = tr_to_w.transport \
				INNER JOIN ( \
					SELECT w.id, CONCAT_WS(' - ', st_from.name, st_to.name) as from_to \
				    FROM way as w \
					INNER JOIN station as st_from ON w.station_from = st_from.id \
					INNER JOIN station as st_to ON w.station_to = st_to.id \
				) as w1 ON w1.id = tr_to_w.way_1 \
				INNER JOIN ( \
					SELECT w.id, CONCAT_WS(' - ', st_from.name, st_to.name) as from_to \
				    FROM way as w \
					INNER JOIN station as st_from ON w.station_from = st_from.id \
					INNER JOIN station as st_to ON w.station_to = st_to.id \
				) as w2 ON w2.id = tr_to_w.way_2 \
				WHERE tr.city = " + req.session.passport.user.city;

	connection.query(query, function (err, transports) {
		if (err) { 
			res.send(400).send([]).end(); 
			return; 
		}

		if (!transports.length) {
			res.status(200).send([]);
			return;
		}

		query = "SELECT station.name as station_name, station_to_way.way as station_way, station.id as station_id, GROUP_CONCAT(DISTINCT sch_weekend.time ORDER BY sch_weekend.time) as 'weekend', GROUP_CONCAT(DISTINCT sch_weekday.time ORDER BY sch_weekday.time) as 'weekday' \
				FROM station_to_way \
				INNER JOIN station ON station.id = station_to_way.station \
				LEFT JOIN schedule as sch_weekend ON sch_weekend.station_to_way = station_to_way.id AND sch_weekend.is_weekend = 1 \
				LEFT JOIN schedule as sch_weekday ON sch_weekday.station_to_way = station_to_way.id AND sch_weekday.is_weekend = 0 \
				WHERE ";

				var subquery = [];

				transports.forEach(function (tr) {
					subquery.push('station_to_way.way = ' + tr.way_1_id);
					subquery.push('station_to_way.way = ' + tr.way_2_id);
				});

				query += subquery.join(' OR ') + 
				" GROUP BY station_to_way.id  \
				ORDER BY station_to_way.queue;";

		connection.query(query, function (err, schedules) {
			if (err) { return next(err); }
			
			for (var k = 0; k < schedules.length; k++) {
				schedules[k].weekend = schedules[k].weekend ? schedules[k].weekend.split(',') : [];
				schedules[k].weekday = schedules[k].weekday ? schedules[k].weekday.split(',') : [];

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

			var result = [];

			transports.forEach(function (tr) {

				var way_1 = {
					name: tr.way_1_from_to,
					stations: []
				}

				var way_2 = {
					name: tr.way_2_from_to,
					stations: []
				}

				for(var i = schedules.length - 1; i >= 0; i--) {

					if (schedules[i].station_way == tr.way_1_id) {
						way_1.stations.unshift(schedules[i]);
						schedules.splice(i, 1);
					}

				}

				for(var i = schedules.length - 1; i >= 0; i--) {

					if (schedules[i].station_way == tr.way_2_id) {
						way_2.stations.unshift(schedules[i]);
						schedules.splice(i, 1);
					}

				}

				result.push({
					transport: {
						number: tr.transport_number,
						type: tr.transport_type
					},
					way_1 : way_1,
					way_2: way_2
				});
			});

			res.status(200).send(result);
		});
	})

}