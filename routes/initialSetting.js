var express = require('express');
var router = express.Router();
var personalData = require('../config/personalData.js');
//쉘에 명령어 줄때 필요
var exec =require('child_process').exec;

/*************  GET  *************/
// 초기설정 페이지 접속
router.get('/', function(req, res){	
    console.log("app get initial setting");
    res.render('initialSetting/initialSetting');
});

/*************  POST  *************/

module.exports = router;