var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose();
var crypto = require('crypto');

/*************  GET  *************/
// 초기설정 페이지 접속
router.get('/', function (req, res) {
    console.log("app get initial setting");
    res.render('initialSetting/initialSetting');
});

/*************  POST  *************/
router.post('/settingSave', function (req, res) {
    var data = req.body.data;
    var homeDir = data.homeDir;
    var downloadDir = data.downloadDir;
    var watchDir = data.watchDir;

    if (homeDir == '' || homeDir == null) homeDir = '/';
    if (downloadDir == '' || downloadDir == null) downloadDir = '/';
    if (watchDir == '' || watchDir == null) watchDir = '/';

    var db = new sqlite3.Database('./Setting.db');

    db.serialize(() => {
        //경로 설정을 저장할 테이블 생성
        db.run("CREATE TABLE 'favoriteList'('idx' INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 'name' TEXT NOT NULL, 'path' TEXT NOT NULL)");
        //경로 설정 테이블에 insert /홈은 필수 지정(main - exlporer에서 보여줄 기본 폴더로 사용), watch 폴더는 torrent 파일 업로드를 위해 이름이 필수로 필요
        var intoDirPath = db.prepare('INSERT INTO favoriteList(name, path) VALUES(?, ?)');
        intoDirPath.run('홈', homeDir);
        intoDirPath.finalize();
        //기본 세팅 테이블 생성
        db.run("CREATE TABLE 'defaultSetting'('id' TEXT NOT NULL PRIMARY KEY, 'password' TEXT, 'trId' TEXT, 'trPw' TEXT,'trPort' INTEGER, 'salt' TEXT)");
        //salt 만들기
        const buf = crypto.randomBytes(128).toString('base64');
        const salt = crypto.pbkdf2Sync(data.password, buf, 111900, 64, 'sha512').toString('hex');
        //비밀번호 암호화
        const hash = crypto.pbkdf2Sync(data.password, salt, 111900, 64, 'sha512').toString('hex');
        db.run("INSERT INTO defaultSetting(id, password, trId, trPw, trPort, salt) VALUES('" + data.id + "','" + hash + "','" + data.trId + "','" + data.trPw + "','" + data.trPort + "','" + salt + "')");
        //필수 폴더 설정
        db.run("CREATE TABLE 'dirList'('idx' INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 'name' TEXT NOT NULL, 'path' TEXT NOT NULL)");
        intoDirPath = db.prepare("INSERT INTO dirList(name, path) VALUES (?, ?)");
        intoDirPath.run('watch', watchDir);
        intoDirPath.run('download', downloadDir);
        intoDirPath.finalize();

        db.close();
        res.send("true");
    });
});
module.exports = router;