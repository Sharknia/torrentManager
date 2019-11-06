var express = require('express');
var router = express.Router();
var personalData = require('../config/personalData.js');
var sqlite3 = require('sqlite3').verbose();
function SelResult(){
    var selResult = false;
    this.val = function(val){
        if(val != null) selResult = val;
        return selResult;
    }
}
const selResult = new SelResult;
function IsFirst(){
    var isFirst = false;
    this.val = function(val){
        if(val != null) isFirst = val;
        return isFirst;
    }
}
const isFirst = new IsFirst;
//로그인 페이지
router.get('/', function(req, res){
    console.log("app get /login/");

    
    //DB 존재유무 검사
    let db = new sqlite3.Database('Setting.db', sqlite3.OPEN_READWRITE, function(err) {
        if (err) {
            console.log('초기 사용자, DB 생성이 필요합니다.');
            isFirst.val(true);
        }
        else {
            console.log('Database 존재');
            isFirst.val(false);
            res.send(row);
        }
    });
    db.close();
    setTimeout(function(){
        if(isFirst.val() == true){
            isFirst.val(false);
            res.redirect('/initialSetting');
        }
        else{
            res.render('login/login');
        }
    }, 2)
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
    db.serialize();

    db.get("SELECT id, password FROM defaultSetting", [], (err, row) => {
        if(err){
            return console.error(err.message);
        }
        else{
            selResult.val(row);
        }
    });

    setTimeout(function(){
        if(id != selResult.val().id){
            console.log(id);
            console.log(selResult.val().id);
            res.send("id");
        }
        else if(password != selResult.val().password){
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
    }, 2)
});

module.exports = router;