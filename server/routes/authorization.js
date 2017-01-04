var passport = require('../utiles/auth');
var connection = require('../utiles/connection');
var encryption = require('../utiles/encryption');

module.exports.login = function (req, res, next) {
	passport.authenticate('local', function (err, user, info) {
		if (err) { return next(err); }

		if (!user) { return res.status(401).end(); }

		req.logIn(user, function (err) {
			
			if (err) { return next(err); }

			return res.status(200).end();

		});

	})(req, res, next);
}

module.exports.checkLogin = function (req, res, next) {
	if(!req.session.passport) { 
		return res.status(401).end();
	}
	if(req.session.passport.user === undefined) {
		return res.status(401).end();
	} else {
		var query = "SELECT user.id, username, password, role, role.name as role_name, city, city.name as city_name FROM user " + 
					"INNER JOIN city ON city.id = user.city " + 
					"INNER JOIN role ON role.id = user.role " +
					"WHERE user.username='" + req.session.passport.user.username +
					"' AND user.password='" + req.session.passport.user.password + "' LIMIT 1";
		connection.query(query, function (err, user) {
			if (err) { return next(err); }
			return user.length == 0 
				? res.status(401).end() 
				: res.status(200).send({
					username: user[0].username, 
					city: {
						name: user[0].city_name, 
						id: user[0].city
					}, 
					role: {
						name: user[0].role_name,
						id: user[0].role
					}
				});
		});
	}
}
	
module.exports.createAccount = function (req, res, next) {
	if (req.body.password != req.body.passwordRepeat) {
		return res.status(400).end();
	}

	var pass = encryption(req.body.password);

	var query = "INSERT INTO user (username, password, city, role) VALUES ('" + 
				req.body.username + 
				"', '" + pass + 
				"', " + req.body.city + ", " + req.body.role + ")";
	connection.query(query, function (err) {
		if (err) { return next(); }

		res.status(200).end();
	})
}

module.exports.updateUserName = function (req, res, next) {
	
}

module.exports.logout = function (req, res, next) {
	req.logout();
	res.status(200).end();
}
