var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var connection = require('./connection');
var encryption = require('./encryption');

passport.use(new LocalStrategy(function (username, password, done) {
	var pass = encryption(password);
	console.log('Login', username, password, pass);
	var query = "SELECT username, password, city FROM user " + 
				"WHERE username='" + username +
				"' AND password='" + pass + "' LIMIT 1";

	connection.query(query, function (err, user) {
		if (err) { return  done(null, false, { message: 'Database error.' }); }
		return user.length == 0 
				? done(null, false, { message: 'Check username or password.' }) 
				: done(null, user[0]);
	})

}));

passport.serializeUser(function (user, done) {
	done(null, user);
});

passport.deserializeUser(function (user, done) {
	done(null, user);
});

module.exports = passport;