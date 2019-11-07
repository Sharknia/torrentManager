var express = require('express');
var router = express.Router();
var personalData = require('../config/personalData.js');
var sqlite3 = require('sqlite3').verbose();

//로그인 페이지
router.get('/', function(req, res){
    console.log("app get /login/");

    //DB 존재유무 검사
    let db = new sqlite3.Database('Setting.db', sqlite3.OPEN_READWRITE, function(err) {
        if (err) {
            console.log('초기 사용자, DB 생성이 필요합니다.');
            res.redirect('/initialSetting');
        }
        else {
            console.log('Database 존재');
            res.render('login/login');
        }
    });
    db.close();
});

//로그아웃
router.get('/logout', function(req, res){
    console.log("app get /login/logout");
    req.session.destroy(function(err){});
    res.redirect("/login/");
});

//로그인
router.post('/login', function(req, res){
    var id = req.body.id;
    var password = req.body.password;
    var date = new Date;
    var db = new sqlite3.Database('Setting.db', sqlite3.OPEN_READWRITE);
    db.serialize(() => {
        db.get("SELECT id, password FROM defaultSetting", [], (err, row) => {
            if(err){
                return console.error(err.message);
            }
            else{
                if(id != row.id){
                    res.send("id");
                }
                else if(password != row.password){
                    res.send("password")
                }
                else{
                    var ip = req.connection.remoteAddress;
                    req.session.info = {
                        id : id,
                        lastConnTime : date,
                        ip : ip
                    }
                    console.log(req.session.info);
                    req.session.save(function(){});
                    res.send("true");
                };
            }
        });
    });
    db.close();
});

module.exports = router;