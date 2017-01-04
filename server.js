var express = require('express');
var session = require('express-session');
var SessionStore = require('express-mysql-session');
var app = express();
var morgan = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var routes = require('./server/routes/index');
var configs = require('./server/config');
var passport = require('./server/utiles/auth');
var errorHandler = require('./server/utiles/error');

var PORT = 8866;

app.use(express.static('./client'));
app.use('/node_modules', express.static('./node_modules'))

app.use(morgan('dev'));

app.use(cookieParser());

app.use(
    session ({
        key: 'transport_system',
        secret: 'transport_system_secret',
        cookie: {
            path: "/",
            httpOnly: true,
            maxAge: null
        },
        resave: true,
        saveUninitialized: true,
        store: new SessionStore(configs.database)
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

var server = app.listen(PORT, function (err) {
	console.log("Server run on port", PORT);
});


app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,DELETE');
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    if ('OPTIONS' == req.method){
        return res.send(200);
    }
    next();
});
app.use(errorHandler);
app.use('/', routes);