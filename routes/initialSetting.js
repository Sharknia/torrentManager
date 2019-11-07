var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose();
var crypto = require('crypto');

/*************  GET  *************/
// 초기설정 페이지 접속
router.get('/', function(req, res){	
    console.log("app get initial setting");
    res.render('initialSetting/initialSetting');
});

/*************  POST  *************/
router.post('/settingSave', function(req, res){
    // console.log(req.body.test.test1);
    var data = req.body.data;
    var torrentDownloadDir = data.torrentDownloadDir;
    var tvProgramDir = data.tvProgramDir;
    var movieDir = data.movieDir;
    var homeDir = data.homeDir;
    var torrentWatchDir = data.torrentWatchDir;
    
    if(data.torrentDownloadDir == '') torrentDownloadDir = '/';
    if(data.tvProgramDir == '') tvProgramDir = '/';
    if(data.movieDir == '') movieDir = '/';
    if(data.homeDir == '') homeDir = '/';
    if(data.torrentWatchDir == '') torrentWatchDir = '/';

    var db = new sqlite3.Database('./Setting.db');

    db.serialize(()=>{                        
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
        //기본 세팅 테이블 생성
        db.run("CREATE TABLE 'defaultSetting'('id' TEXT NOT NULL PRIMARY KEY, 'password' TEXT, 'trId' TEXT, 'trPw' TEXT,'trPort' INTEGER, 'salt' TEXT)");
        //salt 만들기
        const buf = crypto.randomBytes(128).toString('base64');
        const salt = crypto.pbkdf2Sync(data.password, buf, 111900, 64, 'sha512').toString('hex');
        const hash = crypto.pbkdf2Sync(data.password, salt, 111900, 64, 'sha512').toString('hex');
        db.run("INSERT INTO defaultSetting(id, password, trId, trPw, trPort, salt) VALUES('"+data.id+"','"+hash+"','"+data.trId+"','"+data.trPw+"','"+data.trPort+"','"+salt+"')");
        db.close();
        res.send("true");
        // crypto.randomBytes(64, (err, buf) =>{
        //     if(err) res.send(err);
        //     crypto.pbkdf2(data.password, buf.toString('base64'), 111900, 64, 'sha512', (err, key) => {
        //         var salt = key.toString('base64');
        //         //비밀번호 암호화
        //         crypto.pbkdf2(data.password, salt, 111900, 64, 'sha512', (err, derivedKey)=>{
        //             if(err) res.send(err);
        //             else{
        //                 //기본 세팅 테이블에 insert
        //                 db.run("INSERT INTO defaultSetting(id, password, trId, trPw, trPort, salt) VALUES('"+data.id+"','"+derivedKey+"','"+data.trId+"','"+data.trPw+"','"+data.trPort+"','"+salt+"')");
        //                 db.close();
        //                 res.send("true");
        //             }
        //         });
        //     });
        // });
    });
});

// router.post('/pathListManager', function(req, res){
//     var name = req.body.name;
//     var path = req.body.path;
//     var sql = '';
//     sql += "INSERT INTO dirPathList(name, path) VALUES ";
//     sql += "("+name+","+path+")";
//     db.serialize(function(){
//         db.run(sql);
//     });
//     db.close();
//     res.send("true");
// });
module.exports = router;