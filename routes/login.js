var express = require('express');
var router = express.Router();
var personalData = require('../config/personalData.js');

//로그인 페이지
router.get('/', function(req, res){
    console.log("app get /login/");
    res.render('login/login');
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