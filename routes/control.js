var express = require('express');
var router = express.Router();
var personalData = require('../config/personalData.js');
//쉘에 명령어 줄때 필요
var exec =require('child_process').exec;

/*************  POST  *************/
//쉘 제어. 트랜스미션 명령인 경우 select = tr, 쉘 제어인 경우 select = sh. select와 cmd를 보낸다.
router.post('/', function(req, res){
    var cmd = '';
    if(req.body.select == 'tr') cmd = "transmission-remote "+ personalData.trSetting.port +" -n "+ personalData.trSetting.id +":"+ personalData.trSetting.password +" " + req.body.cmd;
    else if(req.body.select == 'sh') cmd = req.body.cmd;

    exec(cmd, function(err, stdout, stderr){
        var returnData;
        if(err){
            returnData = {
                "result" : "err",
                "data" : err
            }
        }
        else if(stderr){
            returnData = {
                "result" : "stderr",
                "data" : stderr
            }
        }
        else if(stdout){
            returnData = {
                "result" : "true",
                "data" : stdout
            }
        }
        else{ //출력 결과가 없는 경우
            returnData = {
                "result" : "none",
                "data" : "none"
            }
        }
        res.json(returnData);
    });
});

module.exports = router;