var connection = require('../utiles/connection');

module.exports.getParks = function (req, res, next) {

	var query = "SELECT * FROM park WHERE city=" + req.session.passport.user.city;

	connection.query(query, function (err, parks) {
		if (err) { return next(err); }
		res.status(200).send(parks).end();
	})

}

module.exports.createPark = function (req, res, next) {

	var query = "INSERT INTO park (name, city) VALUES ('" + req.body.name + "', " + req.session.passport.user.city + ")";

	connection.query(query, function (err, parks) {
		if (err) { return next(err); }
		res.status(200).end();
	});

}

module.exports.deletePark = function (req, res, next) {

	var query = "DELETE FROM park WHERE id=" + req.params.id;

	connection.query(query, function (err, parks) {
		if (err) { return next(err); }
		res.status(200).send(parks).end();
	})

}

module.exports.getParkView = function (req, res, next) {

	var query = "SELECT id, name FROM park WHERE id = " + req.params.id;

	connection.query(query, function (err, park) {
		if (err || !park.length) { return next(); }

		query = "SELECT tr.id, tr.number, tr_type.name as type FROM transport as tr \
				INNER JOIN transport_type as tr_type ON tr_type.id = tr.transport_type \
				WHERE tr.park = " + req.params.id;
		connection.query(query, function (err, transports) {
			if(err) { return next(); }

			res.status(200).send({park: park[0], transports: transports});
		});
	})

}

module.exports.updatePark = function (req, res, next) {

	if (!req.body.name) { return next(); }
	
	var query = "UPDATE park SET name = '" + req.body.name + "' WHERE id = " + req.params.id;

	connection.query(query, function (err) {
		if (err) { return next(); }

		res.status(200).end();
	})

}







