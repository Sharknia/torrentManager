var express = require("express");
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var app = express();
var sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('Setting.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      // isFirst = true;
      console.log('초기 사용자, DB 생성이 필요합니다.');
      res.redirect('/initialSetting');
    }
    else console.log('Database 존재');
});
db.close();

app.set('view engine', 'ejs');
app.set('views', './views');

//미들웨어
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));
app.use(session({
    secret : '!@#$%^&*()',          //이 값을 통해 세션 암호화
    resave : false,                 //세션을 언제나 저장할 지 정하는 값(false 권장)
    saveUninitialized: true         //세션이 저장되기 전에 Uninitialized 상태로 만들어서 저장
}));

app.get('/', function(req, res){
    res.redirect('/main');
});

//메인화면 - 토렌트 검색, 트랜스미션 제어, 간이 탐색기
var main = require('./routes/main');
app.use('/main', main);

//로그인, 로그아웃 등
var login = require('./routes/login');
app.use('/login', login);

//쇼다운 관리, 로그 등 리눅스 관련 기능
var linux = require('./routes/linux');
app.use('/linux', linux);

//쉘에 명령 내릴 때
var control = require('./routes/control');
app.use('/control', control);

//초기 설정을 위한 페이지
var initialSetting = require('./routes/initialSetting');
app.use('/initialSetting', initialSetting);

app.listen(80, function(){
    console.log("80번 포트 서버 오픈")
});