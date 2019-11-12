var express = require('express');
var router = express.Router();

/*************  GET  *************/
// 리눅스 페이지 접속
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