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
    sqlDirPath += "'path' TEXT NOT NULL,";
    sqlDirPath += "'trPw' TEXT NOT NULL,";
    sqlDirPath += "'trPort' TEXT NOT NULL)";
    //기본 세팅 테이블에 insert
    var sqlInsertDefault = '';
    sqlInsertDefault += "INSERT INTO defaultSetting(id, password, trId, trPw, trPort) "
    sqlInsertDefault += "values("+id+","+password+","+trId+","+trPw+",+"+trPort+")"
    db.serialize(()=>{
        db.each(sqlDefault);
        db.each(sqlDirPath);
        db.each(sqlInsertDefault);
    });
    const sql = "SELECT * FROM defaultSetting";
    db.all(sql, (err, row) => {
        console.log(row);
    });
    res.send("wait");
});
module.exports = router;