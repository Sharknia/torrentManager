var express = require("express");
var bodyParser = require('body-parser');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var app = express();

//MySQL 연결
var mysqlDB = require('./config/dbConnect')();
var conn = mysqlDB.init();
mysqlDB.test_open(conn);

//"Error: Connection lost: The server closed the connection." node 죽는 것 해결
conn.on('error', function(err) {
   console.log(err.code)
});
//시간이 지나면  code: 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR', fatal: false 에러와 함께 뻗는 것 임시변통
setInterval(function () { conn.query('SELECT 1'); }, 5000);

app.set('view engine', 'ejs');
app.set('views', './views');

//미들웨어
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));
app.use(session({
    secret : "1234567890!@#$%^&*()",
    store : new MySQLStore(require('./config/dbConfig')),
    resave : false,
    saveUninitialized : false
}));

// /로 접속할 경우 바로 main으로 연결
app.get('/', function(req, res){
    res.redirect('/main');
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

app.listen(80, function(){
    console.log("80번 포트 서버 오픈")
});