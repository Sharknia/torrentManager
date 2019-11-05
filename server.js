var express = require("express");
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var app = express();
var sqlite3 = require('sqlite3').verbose();

var isFirst = false;

let db = new sqlite3.Database('./test.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
      isFirst = true;
      console.log('초기 사용자, DB 생성이 필요합니다.');
    }
    else console.log('DB있네 이미!');
  });

db.serialize(function() {
  db.run("CREATE TABLE lorem (info TEXT)");

  var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
  for (var i = 0; i < 10; i++) {
      stmt.run("Ipsum " + i);
  }
  stmt.finalize();

  db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
      console.log(row.id + ": " + row.info);
  });
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

// /로 접속할 경우 바로 main으로 연결
app.get('/', function(req, res){
    if(isFirst) res.redirect('/HelloWorld');
    else res.redirect('/main');
});

//메인화면 - 토렌트 검색, 트랜스미션 제어, 간이 탐색기
var main = require('./routes/main');
app.use('/main', main);

//회원가입, 로그아웃 등
var login = require('./routes/login');
app.use('/login', login);

//쇼다운 관리, 로그 등 리눅스 관련 기능
var linux = require('./routes/linux');
app.use('/linux', linux);

//쉘에 명령 내릴 때
var linux = require('./routes/control');
app.use('/control', linux);

app.listen(80, function(){
    console.log("80번 포트 서버 오픈")
});