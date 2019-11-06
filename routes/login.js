var express = require('express');
var router = express.Router();
var personalData = require('../config/personalData.js');
var sqlite3 = require('sqlite3').verbose();
var isFirst = false;

//로그인 페이지
router.get('/', function(req, res){
    console.log("app get /login/");
    //DB 존재유무 검사
    let db = new sqlite3.Database('Setting.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            isFirst = true;
          console.log('초기 사용자, DB 생성이 필요합니다.');
        }
        else console.log('Database 존재');
    });
    db.close();
    if(isFirst) res.redirect('/initialSetting');
    else res.render('login/login');
});

//로그아웃
router.get('/logout', function(req, res){
    console.log("app get /login/logout");
    req.session.destroy(function(err){
    });
    res.redirect("/login/");
});

//로그인
router.post('/login', function(req, res){
    var id = req.body.id;
    var password = req.body.password;
    var date = new Date;

    if(id != personalData.site.id){
        res.send("id");
    }
    else if(password != personalData.site.password){
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
    }
});

module.exports = router;