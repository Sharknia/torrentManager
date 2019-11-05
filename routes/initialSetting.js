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
    let db = new sqlite3.Database('./Setting.db', (err) => {
        if (err) {
            console.error(err.message);
            res.send('err');
        } else {
            console.log('데이터베이스 생성완료!');
            res.send('true');
        }
    });

    res.send(result);
});
module.exports = router;