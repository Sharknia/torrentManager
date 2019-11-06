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
    // console.log(req.body.test.test1);
    var id = req.body.id;
    var password = req.body.password;
    var trId = req.body.trId;
    var trPw = req.body.trPw;
    var trPort = req.body.trPort;
    var torrentDownloadDir = req.body.torrentDownloadDir;
    var tvProgramDir = req.body.tvProgramDir;
    var movieDir = req.body.movieDir;
    var homeDir = req.body.homeDir;
    var torrentWatchDir = req.body.torrentWatchDir;
    
    if(torrentDownloadDir == '') torrentDownloadDir = '/';
    if(tvProgramDir == '') tvProgramDir = '/';
    if(movieDir == '') movieDir = '/';
    if(homeDir == '') homeDir = '/';
    if(torrentWatchDir == '') torrentWatchDir = '/';

    var db = new sqlite3.Database('./Setting.db');

    db.serialize(function(){
        //기본 세팅 테이블 생성
        db.run("CREATE TABLE 'defaultSetting'('id' TEXT NOT NULL PRIMARY KEY, 'password' TEXT, 'trId' TEXT, 'trPw' TEXT,'trPort' INTEGER)");
        //기본 세팅 테이블에 insert
        db.run("INSERT INTO defaultSetting(id, password, trId, trPw, trPort) VALUES('"+id+"','"+password+"','"+trId+"','"+trPw+"','"+trPort+"')");
        //경로 설정을 저장할 테이블 생성
        db.run("CREATE TABLE 'dirPathList'('idx' INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 'name' TEXT NOT NULL, 'path' TEXT NOT NULL, 'sortNum' INTEGER NOT NULL)");
        //경로 설정 테이블에 insert
        var intoDirPath = db.prepare('INSERT INTO dirPathList(name, path, sortNum) VALUES(?, ?, ?)');
        intoDirPath.run('홈' , homeDir , 1);
        intoDirPath.run('다운로드' , torrentDownloadDir , 2);
        intoDirPath.run('TV 폴더' , tvProgramDir , 3);
        intoDirPath.run('영화 폴더' , movieDir , 4);
        intoDirPath.run('WATCH 폴더' , torrentWatchDir , 5);
        intoDirPath.finalize();
    });
    db.close();
    res.send("true");
});

router.post('/pathListManager', function(req, res){
    var name = req.body.name;
    var path = req.body.path;
    var sql = '';
    sql += "INSERT INTO dirPathList(name, path) VALUES ";
    sql += "("+name+","+path+")";
    db.serialize(function(){
        db.run(sql);
    });
    db.close();
    res.send("true");
});
module.exports = router;