var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose();
var crypto = require('crypto');

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
    var db = new sqlite3.Database('Setting.db', sqlite3.OPEN_READWRITE);
    db.serialize(() => {
        db.get("SELECT id, password, salt FROM defaultSetting", [], (err, row) => {
            if(err){
                return console.error(err.message);
            }
            else{
                const hash = crypto.pbkdf2Sync(password, row.salt, 111900, 64, 'sha512').toString('hex');
                if(id != row.id) res.send('id');
                else if(hash != row.password) res.send('password');
                else{
                    req.session.info = {
                        id : id,
                        lastConnTime : new Date,
                        ip : req.connection.remoteAddress
                    }
                    console.log(req.session.info);
                    req.session.save(function(){});
                    db.close();
                    res.send("true");
                }
                // crypto.pbkdf2(password, row.salt, 111900, 64, 'sha512', (err, derivedKey)=>{
                //     if(id != row.id){
                //         res.send("id");
                //     }
                //     else if(derivedKey != row.password){
                //         res.send("password")
                //     }
                //     else{
                //         req.session.info = {
                //             id : id,
                //             lastConnTime : date,
                //             ip : req.connection.remoteAddress
                //         }
                //         console.log(req.session.info);
                //         req.session.save(function(){});
                //         db.close();
                //         res.send("true");
                //     };
                // });
            }
        });
    });
});

module.exports = router;