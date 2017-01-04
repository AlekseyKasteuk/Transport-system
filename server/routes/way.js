var connection = require('../utiles/connection');

module.exports.getWays = function (req, res, next) {

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

	connection.query(query, function (err, ways) {
		if (err) { return next(err); }
		res.status(200).send(ways).end();
	});

}

module.exports.getWayFields = function (req, res, next) {
	var query = "SELECT tr.id, tr.number, tr_type.name as transport_type_name, \
						tr_type.id as transport_type_id FROM transport as tr \
				INNER JOIN transport_type as tr_type ON tr_type.id = tr.transport_type \
				WHERE tr.city=" + req.session.passport.user.city +
				" AND tr.id NOT IN (SELECT transport FROM transport_to_way)";
	if (req.query.exception) {
		query += " OR tr.id = " + req.query.exception;
	}
	connection.query(query, function (err, transports) {

		if (err) { return next(err); }

		query = "SELECT id, name FROM station WHERE city=" + req.session.passport.user.city;

		connection.query(query, function (err, stations) {
			if (err) { return next(err); }

			res.status(200).send( { transports: transports, stations: stations } );
		});

	});
}

module.exports.createWay = function (req, res, next) {

	var query = "SELECT id FROM transport_to_way WHERE transport=" + req.body.transport;

	connection.query(query, function (err, data) {
		if (err) { return next(); }

		if (data.length > 0) { return next(); }

		query = "INSERT INTO way (station_from, station_to, transport) VALUES (" + req.body.station_from + "," + 
				req.body.station_to + ", " + req.body.transport + ")";

		connection.query(query, function (err, way1) {
			if (err) { return next(); }

			query = "INSERT INTO way (station_from, station_to, transport) VALUES (" + req.body.station_to + "," + 
					req.body.station_from + ", " + req.body.transport + ")";

			connection.query(query, function (err, way2) {
				if (err) { return next(); }

				query = "INSERT INTO transport_to_way (transport, way_1, way_2) VALUES (" + req.body.transport + ", " + 
					way1.insertId + "," + way2.insertId + ");";

				connection.query(query, function (err) {
					if (err) { return next(); }
					
					res.status(200).end();
				})

			})	
		});
	});

}

module.exports.deleteWays = function (req, res, next) {	

	if (req.query.way1 == 'undefined' || req.query.way2 == 'undefined') {
		return next();
	}

	var query = "DELETE FROM way WHERE id=" + req.query.way1;

	connection.query(query, function (err) {
		if (err) { return next(err); }

		query = "DELETE FROM way WHERE id=" + req.query.way2;
		connection.query(query, function (err) {
			if (err) { return next(err); }

			res.status(200).end();
		});
	});

}

module.exports.getWay = function (req, res, next) {

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

		query = "SELECT st_to_w.id, st.name as station_name, st.id as station_id, st_to_w.queue \
					FROM station_to_way as st_to_w \
					INNER JOIN station as st ON st.id = st_to_w.station \
					WHERE st_to_w.way=" + req.params.id +
					" ORDER BY queue";

		connection.query(query, function (err, stations) {
			if (err) { return next(err); }
			res.status(200).send({way: way[0], stations: stations}).end();
		});

	});

}


module.exports.setStations = function (req, res, next) {
	var query = "DELETE FROM station_to_way WHERE way=" + req.params.id;

	var i = 0;
	var stations = req.body.map(function (s) {
		return [s.station_id, req.params.id, i++];
	});


	connection.query(query, function (err) {
		if (err) { return next(); }

		query = "INSERT INTO station_to_way (station, way, queue) VALUES ?";

		connection.query(query, [stations], function (err) {
			if (err) { return next(); }

			res.status(200).end(); 
		})
	});
}

module.exports.changeWay = function (req, res, next) {
	query = "SELECT id, transport, way_1, way_2 FROM transport_to_way WHERE way_1 = " + req.params.id + " OR way_2 = " + req.params.id;
	connection.query(query, function (err, way) {
		if (err) { return next(); }
		if (way.length != 1) { return next(); }

		way = way[0];

		query = "UPDATE transport_to_way SET transport=" + req.body.transport + " WHERE id = " + way.id;
		connection.query(query, function (err) {
			if (err) { return next(); }

			query = "UPDATE way SET station_from = " + req.body.station_from + 
					", station_to = " + req.body.station_to +
					" WHERE id = " + req.params.id;
			connection.query(query, function (err) {
				if (err) { return next(); }

				var id = way.way_1 == req.params.id ? way.way_2 : way.way_1;

				query = "UPDATE way SET station_from = " + req.body.station_to + 
						", station_to = " + req.body.station_from +
						" WHERE id = " + id;
				connection.query(query, function (err) {
					if (err) { return next(); }
					
					res.status(200).end();
				});
			})
		});
	});
}

















