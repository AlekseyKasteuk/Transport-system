var connection = require('../utiles/connection');

module.exports.getTransports = function (req, res, next) {

	var query = "SELECT tr.id, tr.number, tr_type.name as transport_type_name, p.name as park_name, \
						p.id as park_id, tr_type.id as transport_type_id \
				FROM transport as tr \
				INNER JOIN transport_type as tr_type ON tr_type.id = tr.transport_type \
				INNER JOIN park as p ON p.id = tr.park " + 
				"WHERE tr.city=" + req.session.passport.user.city +
				" ORDER BY tr.number";

	connection.query(query, function (err, transports) {
		if (err) { return next(err); }
		res.status(200).send(transports).end();
	})
}

module.exports.getTypes = function (req, res, next) {

	var query = "SELECT * FROM transport_type";

	connection.query(query, function (err, types) {
		if (err) { return next(err); }
		res.status(200).send(types).end();
	})
}

module.exports.createTransport = function (req, res, next) {

	var query = "INSERT INTO transport (transport_type, number, city, park) VALUES (" + 
		req.body.type + ", '" + req.body.number + "', " + req.session.passport.user.city + ", " +
		req.body.park + ")";

	connection.query(query, function (err) {
		if (err) { return next(err); }
		res.status(200).end();
	});

}

module.exports.deleteTransport = function (req, res, next) {

	var query = "DELETE FROM transport WHERE id=" + req.params.id;

	connection.query(query, function (err) {
		if (err) { return next(err); }
		res.status(200).end();
	})

}

module.exports.getTransportView = function (req, res, next) {

	var query = "SELECT tr.number, tr_type.name as type FROM transport as tr \
				INNER JOIN transport_type as tr_type ON tr.transport_type = tr_type.id \
				WHERE tr.id = " + req.params.id;

	connection.query(query, function (err, transport) {
		if (err) { return next(); }

		if (!transport.length) { return res.status(404).end(); }

		query = "SELECT \
			        tr_to_w.id, \
			        w1.id as way_1_id, \
			        w1.from_to as way_1_from_to, \
			        w2.id as way_2_id, \
			        w2.from_to as way_2_from_to  \
				FROM transport_to_way as tr_to_w \
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
				WHERE tr_to_w.transport = " + req.params.id;
		connection.query(query, function (err, ways) {
			if (err) { return next(); }

			query = "SELECT st_to_w.id, st_to_w.name \
					FROM transport_to_way as tr_to_w \
					INNER JOIN  \
					( \
						SELECT \
							st.id, st.name, st_to_w.way \
					    FROM station_to_way as st_to_w \
					    INNER JOIN station as st \
							ON st_to_w.station = st.id \
					) as st_to_w  \
					ON st_to_w.way = tr_to_w.way_1 OR st_to_w.way = tr_to_w.way_2 " + 
					"WHERE tr_to_w.transport = " + req.params.id +
					" GROUP BY st_to_w.id \
					ORDER BY st_to_w.name"
			connection.query(query, function (err, stations) {
				if (err) { return next(); }

				res.status(200).send({ transport: transport[0], ways: ways[0], stations: stations });
			})
		})
	});

}

module.exports.updateTransport = function (req, res, next) {
	if ( !req.body.id && !req.body.number && req.body.type === '' && req.body.park === '' ) {
		return next();
	}
	var query = "UPDATE transport SET number = " + req.body.number + 
				", transport_type = " + req.body.type +
				", park = " + req.body.park + 
				" WHERE id = " + req.body.id;
	connection.query(query, function (err) {
		if ( err ) { return next(); }

		res.status(200).end();
	})
}









