var express = require('express');
var router = express.Router();

router.get('/login', 	require('./authorization').checkLogin);
router.post('/login', 	require('./authorization').login);
router.get('/logout', 	require('./authorization').logout);
router.post('/user', 	require('./authorization').createAccount);

router.post('/country', 	require('./user').addCountry);
router.get('/countries', 	require('./user').getCountries);
router.post('/city', 		require('./user').addCity);

router.get('/parks', 		require('./parks').getParks);
router.post('/park', 		require('./parks').createPark);
router.put('/park/:id', 	require('./parks').updatePark);
router.delete('/park/:id', 	require('./parks').deletePark);
router.get('/park/view/:id', require('./parks').getParkView);

router.get('/transport/types', 	require('./transport').getTypes);
router.get('/transports', 		require('./transport').getTransports);
router.post('/transport', 		require('./transport').createTransport);
router.delete('/transport/:id', require('./transport').deleteTransport);
router.get('/transport/view/:id', require('./transport').getTransportView);
router.put('/change/transport', require('./transport').updateTransport);

router.get('/stations', 			require('./station').getStations);
router.post('/station', 			require('./station').createStation);
router.delete('/station/:id', 		require('./station').deleteStation);
router.post('/available/stations', 	require('./station').getAvailableStations);
router.get('/station/view/:id', 	require('./station').getStationView);
router.put('/change/station', 		require('./station').updateStation);

router.get('/ways', 				require('./way').getWays);
router.get('/fields/way', 			require('./way').getWayFields);
router.post('/way', 				require('./way').createWay);
router.delete('/ways', 				require('./way').deleteWays);
router.get('/way/:id', 				require('./way').getWay);
router.post('/edit/way/stations/:id', require('./way').setStations);
router.put('/change/way/:id', 		require('./way').changeWay);

router.get('/schedule/edit/:id', 	require('./schedule').getEditInfo);
router.post('/schedule/save', 		require('./schedule').saveSchedule);
router.get('/schedule/:id', 		require('./schedule').getScheduleForWay);

router.get('/home', require('./home').getHome);

router.get('/user/info', require('./user').getUserInfo);


module.exports = router;