var connection = require('../utiles/connection');

module.exports.getUserInfo = function (req, res) {
	var query = "SELECT name, id FROM city";

	connection.query(query, function (err, cities) {
		if (err) { cities = []; }

		query = "SELECT id, name FROM role";

		connection.query(query, function (err, roles) {
			if (err) { roles = [] }

			res.status(200).send({
				cities: cities,
				roles: roles
			});
		});
	});
}

module.exports.addCountry = function (req, res, next) {
	if (!req.body.name) {
		return next();
	}
	var query = "INSERT INTO country (name) VALUES ('" + req.body.name + "')";

	connection.query(query, function (err) {
		if (err) { return next(); }

		res.status(200).end();
	})
}

module.exports.getCountries = function (req, res, next) {
	var query = "SELECT * FROM country";

	connection.query(query, function (err, countries) {
		if (err) { return next(); }

		res.status(200).send(countries);
	});
}

module.exports.addCity = function (req, res, next) {
	if (!req.body.name) {
		return next();
	}
	
	var query = "INSERT INTO city (name, country) VALUES ('" + req.body.name + "', " + req.body.country + ")";

	connection.query(query, function (err) {
		if (err) { return next(); }

		res.status(200).end();
	})
}