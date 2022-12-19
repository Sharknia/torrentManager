var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose();
//쉘에 명령어 줄때 필요
var exec = require('child_process').exec;

/*************  POST  *************/
//쉘 제어. 트랜스미션 명령인 경우 select = tr, 쉘 제어인 경우 select = sh. select와 cmd를 보낸다.
router.post('/', function (req, res) {
    var db = new sqlite3.Database('Setting.db', sqlite3.OPEN_READWRITE);
    db.serialize(() => {
        db.get("SELECT trId, trPw, trPort FROM defaultSetting", [], (err, row) => {
            var trId = row.trId;
            var trPw = row.trPw;
            var trPort = row.trPort;
            var cmd = '';
            if (req.body.select == 'tr') cmd = "transmission-remote " + trPort + " -n " + trId + ":" + trPw + " " + req.body.cmd;
            else if (req.body.select == 'sh') cmd = req.body.cmd;

            exec(cmd, function (err, stdout, stderr) {
                var returnData;
                if (err) {
                    returnData = {
                        "result": "err",
                        "data": err.message
                    }
                }
                else if (stderr) {
                    returnData = {
                        "result": "stderr",
                        "data": stderr.toString()
                    }
                }
                else if (stdout) {
                    returnData = {
                        "result": "true",
                        "data": stdout
                    }
                }
                else { //출력 결과가 없는 경우
                    returnData = {
                        "result": "none",
                        "data": "none"
                    }
                }
                console.log("cmd : " + cmd);
                console.log(returnData.data);
                res.json(returnData);
            });
        });
        db.close();
    });
});

module.exports = router;