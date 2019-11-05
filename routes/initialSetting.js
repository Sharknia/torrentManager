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
    
    if(torrentDownloadDir == '') torrentDownloadDir = '/';
    if(tvProgramDir == '') tvProgramDir = '/';
    if(movieDir == '') movieDir = '/';
    if(homeDir == '') homeDir = '/';
    if(torrentWatchDir == '') torrentWatchDir = '/';

    var db = new sqlite3.Database('./Setting.db');
    //기본 세팅 테이블 생성
    var sqlDefault = '';
    sqlDefault = "CREATE TABLE 'defaultSetting'(";
    sqlDefault += "'id' TEXT NOT NULL PRIMARY KEY,";
    sqlDefault += "'password' TEXT,";
    sqlDefault += "'trId' TEXT,";
    sqlDefault += "'trPw' TEXT,";
    sqlDefault += "'trPort' TEXT)";
    //즐겨찾기 폴더 경로를 저장할 테이블 생성
    var sqlDirPath = '';
    sqlDirPath = "CREATE TABLE IF NOT EXISTS 'dirPathList'(";
    sqlDirPath += "'idx' INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,";
    sqlDirPath += "'name' TEXT NOT NULL,";
    sqlDirPath += "'path' TEXT NOT NULL)";
    //기본 세팅 테이블에 insert
    var sqlInsertDefault = '';
    sqlInsertDefault += "INSERT INTO defaultSetting(id, password, trId, trPw, trPort) ";
    sqlInsertDefault += "VALUES("+id+","+password+","+trId+","+trPw+",+"+trPort+")";
    //기본 경로 설정 테이블에 insert
    var sqlInsertPathList = '';
    sqlInsertPathList += "INSERT INTO dirPathList(name, path) VALUES ";
    sqlInsertPathList += "(다운로드"+torrentDownloadDir+"),";
    sqlInsertPathList += "(TV 폴더,"+tvProgramDir+"),";
    sqlInsertPathList += "(영화 폴더,"+movieDir+"),";
    sqlInsertPathList += "(홈,"+homeDir+"),";
    sqlInsertPathList += "(WATCH 폴더,"+torrentWatchDir+")";
    db.serialize();
    db.each(sqlDefault);
    db.each(sqlDirPath);
    db.each(sqlInsertDefault);
    db.each(sqlInsertPathList);
    db.all("SELECT * FROM defaultSetting", (err, row) => {
        console.log(row);
    });
    db.all("SELECT * FROM dirPathList", (err, row) => {
        console.log(row);
    });
    res.send("true");
});
module.exports = router;