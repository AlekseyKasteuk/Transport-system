var connection = require('../utiles/connection');

module.exports.getStations = function (req, res, next) {

	var query = "SELECT id, name FROM station WHERE city=" + req.session.passport.user.city;

	connection.query(query, function (err, stations) {
		if (err) { return next(err); }
		res.status(200).send(stations).end();
	})
}

module.exports.createStation = function (req, res, next) {

	var query = "INSERT INTO station (name, city) VALUES ('" + req.body.name + "', " + req.session.passport.user.city + ")";

	connection.query(query, function (err) {
		if (err) { return next(err); }
		res.status(200).end();
	});

}

module.exports.deleteStation = function (req, res, next) {

	var query = "DELETE FROM station WHERE id=" + req.params.id;

	connection.query(query, function (err) {
		if (err) { return next(err); }
		res.status(200).end();
	})

}

module.exports.getStationView = function (req, res, next) {

	var query = "SELECT name, id FROM station WHERE id = " + req.params.id;

	connection.query(query, function (err, station) {
		if (err) { return next(); }

		if (!station.length) { return res.status(404).end(); }

		query = "SELECT  \
					tr_to_w.transport_id as id,  \
					tr_to_w.transport_number as number,  \
					tr_to_w.transport_type as type, \
					tr_to_w.park_id, \
					tr_to_w.park_name \
				FROM station_to_way as st_to_w \
				INNER JOIN  \
				( \
					SELECT  \
						tr_to_w.way_1,  \
						tr_to_w.way_2,  \
						tr.id as transport_id,  \
						tr.number as transport_number,  \
						tr.type as transport_type, \
						tr.park_id, \
						tr.park_name \
				    FROM transport_to_way as tr_to_w \
				    INNER JOIN  \
				    ( \
						SELECT tr.id, tr.number, tr_type.name as type, p.id as park_id, p.name as park_name\
				        FROM transport as tr \
				        INNER JOIN transport_type as tr_type ON tr.transport_type = tr_type.id \
				        INNER JOIN park as p ON p.id = tr.park \
				    )as tr ON tr.id = tr_to_w.transport \
				) as tr_to_w \
				ON tr_to_w.way_1 = st_to_w.way OR tr_to_w.way_2 = st_to_w.way \
				WHERE st_to_w.station = " + req.params.id + 
				" GROUP BY tr_to_w.transport_id, tr_to_w.park_name";
		connection.query(query, function (err, transports) {
			if (err) { transports = []; }

			query = "SELECT  \
						st_to_w.station,  \
						w.way_1_id, w.way_1_from_to,  \
						w.way_2_id, w.way_2_from_to,  \
						w.transport_id,  \
						w.transport_number,  \
						w.transport_type \
					FROM station_to_way as st_to_w \
					INNER JOIN  \
					( \
						SELECT  \
							tr.id as transport_id, \
					        tr.number as transport_number, \
					        tr.type as transport_type, \
							w1.id as way_1_id,  \
							w1.from_to as way_1_from_to,  \
							w2.id as way_2_id,  \
							w2.from_to as way_2_from_to   \
						FROM transport_to_way as tr_to_w  \
						INNER JOIN (  \
							SELECT w.id, CONCAT_WS(' - ', st_from.name, st_to.name) as from_to  \
							FROM way as w  \
							INNER JOIN station as st_from ON w.station_from = st_from.id  \
							INNER JOIN station as st_to ON w.station_to = st_to.id  \
						) as w1 ON w1.id = tr_to_w.way_1  \
						INNER JOIN (  \
							SELECT w.id, CONCAT_WS(' - ', st_from.name, st_to.name) as from_to  \
							FROM way as w  \
							INNER JOIN station as st_from ON w.station_from = st_from.id  \
							INNER JOIN station as st_to ON w.station_to = st_to.id  \
						) as w2 ON w2.id = tr_to_w.way_2 \
					    INNER JOIN  \
					    ( \
							SELECT tr.id, tr.number, tr_type.name as type \
					        FROM transport as tr \
					        INNER JOIN transport_type as tr_type ON tr.transport_type = tr_type.id \
					    ) as tr ON tr_to_w.transport = tr.id \
					) as w ON w.way_1_id = st_to_w.way OR w.way_2_id = st_to_w.way \
					WHERE st_to_w.station = " + req.params.id + 
					" GROUP BY w.way_1_id, w.way_2_id";
			connection.query(query, function (err, ways) {
				if ( err ) { ways = []; }

				res.status(200).send({station: station[0], transports: transports, ways: ways});
			})
		});
	});

}

module.exports.getAvailableStations = function (req, res, next) {
	var query = "SELECT id, name FROM station WHERE city=" + req.session.passport.user.city;
	req.body.forEach(function (id) {
		query += " AND id != " + id;
	});
	connection.query(query, function (err, stations) {
		if(err) { return next(); }

		res.status(200).send(stations);

	});
}


module.exports.updateStation = function (req, res, next) {
	if ( !req.body.id && !req.body.name) {
		return next();
	}
	var query = "UPDATE station SET name = '" + req.body.name +
				"' WHERE id = " + req.body.id;
	connection.query(query, function (err) {
		if ( err ) { return next(); }

		res.status(200).end();
	})
}







