var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose();
//쉘에 명령어 줄때 필요
var exec = require('child_process').exec;
//웹 크롤링에 필요
var client = require('cheerio-httpcli');
var qs = require('querystring'); //url encoding
var request = require('request');

/*************  GET  *************/
// main 페이지 접속
router.get('/', function (req, res) {
    console.log("app get /");
    if (!req.session.info) {
        var today = new Date();
        var message = "접속시도 :" + req.connection.remoteAddress + " ::: " + today.toLocaleString()
        console.log(message);
        //info가 없는 접속시도가 있을 경우 ip와 함께 메모를 남긴다. 
        exec("echo " + message + " >> /HDD/log/HompageConnection.log", function (err, stdout, stderr) { });
        res.redirect('/login');
    }
    else {
        res.render('main/main', { info: req.session.info });
    }
});

//토렌트 상세정보 페이지
router.get('/torrentView/:url', function (req, res) {
    if (!req.session.info) {
        return res.redirect('/login');
    }
    var url = req.params.url.replace(/,/gi, '/');

    //url로부터 필드셋, 파일테이블을 긁어오자
    var fieldset = {};
    var filetable = {};
    var filename = {};
    var param = {};
    var num = 0;
    var setSize = 0;
    var tableSize = 0;
    client.fetch(url, param, function (err, $, response) {
        if (err) {
            console.log(err);
            res.render('main/torrentView', {
                info: req.session.info,
                result: "false"
            });
        }

        //파일테이블 추출
        $('#file_table > tr').each(function (link) {
            filetable[num] = $(this).find("a").attr("href");
            filename[num] = $(this).find("a").text();
            if (filetable[num].indexOf("_filetender") > -1) filename[num] = "[외부링크]" + filename[num];
            //javascript: 명령어가 없다면 붙여준다. 그 꼴로 만들어야 함
            if (filetable[num].indexOf("javascript")) {
                filetable[num] = "javascript:file_download(\'" + filetable[num] + "\',\'" + filename[num] + "\');";
            }
            num++;
        });

        tableSize = num;
        //필드셋 추출
        $("#main_body").each(function (link) {
            setSize = $(this).find("li").length;
            // console.log($(this).find("li"));
            for (var i = 0; i < $(this).find("li").length; i++) {
                fieldset[i] = $(this).find("li")[i].children[0].data;
                // console.log(fieldset[i]);
            }
        });

        //넘길 데이터 정리
        //filetable : 사이트에 올라온 자막/토렌트 파일
        //fieldset : 토렌트 파일 정보
        //setSize : 파일 정보 배열 크기
        //tableSize : 자막/토렌트 파일 자료 개수
        //url : 원본주소, '/'가 ','로 변형된 상태
        //filename : 파일의 이름.
        //watchDir : watch Dir
        //downloadDir : downloadDir
        var data = {
            "filetable": filetable,
            "fieldset": fieldset,
            "setSize": setSize,
            "tableSize": tableSize,
            "url": req.params.url,
            "filename": filename
        }
        // console.log(data);
        res.render('main/torrentView', { data });
    });
});

/*************  POST  *************/
//토렌트 검색
router.post('/torrentSearch', function (req, res) {
    var isOk = false;
    var title = req.body.torrentTitle;
    var page = req.body.page;
    //사이트 선택 10 : 토렌튜브, 20 : 토렌트왈
    var siteSelect = req.body.siteSelect;
    title = qs.escape(title);
    var param = {};
    var num = 0;
    var subject = {};
    var mglist = {};
    var volumelist = {};
    var datelist = {};
    var urllist = {};
    var isSmi = {};
    let url = 'https://torrentwal.com/bbs/s.php?k=' + title + '&page=' + page;
    var count = '';

    // unable to verify the first certificate 에러 해결 (2020-01-26)
    // 출처 : https://bbokkun.tistory.com/137
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    //토렌트왈인 경우
    if (siteSelect == 20){
        client.fetch(url, param, function (err, $, response, body) {
            console.log("url : " + url);
            console.log("param : " + param);
            console.log("err : " + err);
            console.log("$ : " + $);
            console.log("response : " + response);
            console.log("body : " + body);
            if (err) {
                console.log(err);
            }
            try {
                //title 검색 결과 추출
                $('.subject > a').each(function (link) {
                    if (num % 2 != 0) {
                        urllist[num / 2 - 0.5] = $(this).attr("href");
                        urllist[num / 2 - 0.5] = urllist[num / 2 - 0.5].replace("..", "https://torrentwal.com");
                        var temp = ($(this).text().replace('\n\t\t\t\t\t\t\n\t\t\t', ''));
                        subject[num / 2 - 0.5] = temp.replace('\t\t\t', '');
                        subject[num / 2 - 0.5] = isSmi[num / 2 - 0.5] + subject[num / 2 - 0.5];
                    }
                    else {
                        isSmi[num / 2] = $(this).parent().children("font").text();
                    }
                    num++;
                });
                num = 0;
    
                //검색결과의 magnet 추출
                $('td.num > a').each(function (link) {
                    var mgnet = $(this).attr("href");
                    mgnet = mgnet.replace("javascript:Mag_dn(", "");
                    var regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
                    mgnet = mgnet.replace(regExp, "");
                    mglist[num] = 'magnet:?xt=urn:btih:' + mgnet;
                    num++;
                });
                num = 0;
    
                //검색결과의 파일 크기 추출
                $('td.hit').each(function (link) {
                    volumelist[num] = $(this).text();
                    num++;
                })
                num = 0;
    
                //검색결과의 업로드 날짜 추출
                $('td.datetime').each(function (link) {
                    datelist[num] = $(this).text();
                    num++;
                })
    
                //총 검색결과 숫자 추출
                $('#blist').each(function (link) {
                    count = $(this).text().substring(0, 30);
                    count = count.replace(new RegExp("[^(0-9)]", "gi"), "");
                });
            }
            catch (e) {
                console.log(e.stack);
            }
            finally {
                var data = {
                    "subject": subject,
                    "mglist": mglist,
                    "datelist": datelist,
                    "volumelist": volumelist,
                    "num": num,
                    "count": count,
                    "urllist": urllist,
                    "url":url
                }
                res.json(data);
            }
        });
    }
    //토렌튜브인 경우
    else if (siteSelect == 10){
        var db = new sqlite3.Database('Setting.db', sqlite3.OPEN_READWRITE);
        db.serialize(() => {
            db.all("SELECT * FROM urlList WHERE NAME='토렌튜브' LIMIT 1", [], (err, row) => {
                url = row[0].url + "search/kt?page=" + page + "&q=" + title;
                request.get(url, function(err, result, body){
                    try{
                        res.json(JSON.parse(body).pageItems);
                    }
                    catch(e){
                        console.log(url);
                        var data ={
                            "result":"false",
                            "url":url
                        }
                        res.json(data);
                    }
                });
            });
        });
    }
});

//main 페이지 기본 세팅값 반환
router.post('/getDefaultSetting', function (req, res) {
    var db = new sqlite3.Database('Setting.db', sqlite3.OPEN_READWRITE);
    db.serialize(() => {
        db.all("SELECT idx, name, path FROM favoriteList ORDER BY idx", [], (err, row) => {
            //Default Setting에서 꺼낸 값 중 path는 폴더 이름 앞뒤로 ""를 붙인 풀 네임으로 바꿔준다. 
            for (var i in row) {
                var temp = '/';
                for (var j in row[i].path.split('/')) {
                    if (row[i].path.split('/')[j] != '') {
                        temp += '"' + row[i].path.split('/')[j] + '"/';
                    }
                }
                row[i].path = temp;
            }
            db.all("SELECT * FROM dirList", [], (err, rowDir) => {
                //path는 폴더 이름 앞뒤로 ""를 붙인 풀 네임으로 바꿔준다. 
                for (var i in rowDir) {
                    temp = '/';
                    for (var j in rowDir[i].path.split('/')) {
                        if (rowDir[i].path.split('/')[j] != '') {
                            temp += '"' + rowDir[i].path.split('/')[j] + '"/';
                        }
                    }
                    rowDir[i].path = temp;
                }
                //urlList에서 저장된 url들을 꺼내온다.
                db.all("select * from urlList", [], (err, rowUrl) => {
                    var data = {};
                    if (err) {
                        data = {
                            "result": "false",
                            "data": err.message
                        }
                    }
                    else {
                        data = {
                            "result": "true",
                            "favoriteData": row,
                            "dirListData": rowDir,
                            'urlListData':rowUrl
                        }
                    }
                    db.close();
                    res.json(data);
                });
            });
        });
    });
});

//즐겨찾기 커스텀 기능
router.post('/favoriteUpdate', function (req, res) {
    var db = new sqlite3.Database('Setting.db', sqlite3.OPEN_READWRITE);
    var select = req.body.select;
    var path = req.body.path;
    var name = req.body.name;
    var sql = '';

    db.serialize(() => {
        if (select == 'add') {
            sql = 'INSERT INTO favoriteList(name, path) VALUES ';
            sql += "('" + name + "', '" + path + "')";
        }
        else if (select == 'del') {
            sql = "DELETE FROM favoriteList WHERE path = '" + path + "'";
        }

        db.run(sql);
        db.close();
        res.send("true");
    });
});
module.exports = router;