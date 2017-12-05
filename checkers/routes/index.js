var express = require('express');
var router = express.Router();
//var socketIO = require('../modules/socketApi');



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('welcome');
});

router.get('/checkers', function(req, res, next) {
  res.render('checkers');
});




module.exports = router;
