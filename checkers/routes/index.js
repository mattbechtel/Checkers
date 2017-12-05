var express = require('express');
var router = express.Router();
//var socketIO = require('../modules/socketApi');



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('welcome');
});

router.get('/checkers', function(req, res, next) {
  req.session.guid = guid();
  console.log(req.session);
  res.render('checkers');
});



function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

module.exports = router;
