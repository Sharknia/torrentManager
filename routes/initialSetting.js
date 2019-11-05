var express = require('express');
var router = express.Router();
var personalData = require('../config/personalData.js');
var sqlite3 = require('sqlite3').verbose();


/*************  GET  *************/
// 초기설정 페이지 접속
router.get('/', function(req, res){	
    console.log("app get initial setting");
    res.render('initialSetting/initialSetting');
});

/*************  POST  *************/
router.post('/settingSave', function(req, res){
    var id = req.body.id;
    var password = req.body.password;
    var password2 = req.body.password2;
    var trId = req.body.trId;
    var trPw = req.body.trPw;
    var trPort = req.body.trPort;
    var torrentDownloadDir = req.body.torrentDownloadDir;
    var tvProgramDir = req.body.tvProgramDir;
    var movieDir = req.body.movieDir;
    var homeDir = req.body.homeDir;
    var torrentWatchDir = req.body.torrentWatchDir;

    var result = '';
    var db = new sqlite3.Database('../db/Setting.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
            result = 'err';
            console.error(err.message);
        }
        else {
            result = 'true';
            console.log('Connected to the chinook database.');
        }
    });

    res.send(result);
});
module.exports = router;