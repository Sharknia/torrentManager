var express = require('express');
var router = express.Router();
var personalData = require('../config/personalData.js');
//쉘에 명령어 줄때 필요
var exec =require('child_process').exec;
//웹 크롤링에 필요
var client = require('cheerio-httpcli');
var qs = require('querystring'); //url encoding


/*************  GET  *************/
// main 페이지 접속
router.get('/', function(req, res){	
    console.log("app get linux");
    if(!req.session.info){ //세션 정보가 없다면 초기 로그인 화면으로
        res.render('login/login');
    }
    else{
        res.render('linux/linux', {info:req.session.info});
    }
});

/*************  POST  *************/

module.exports = router;