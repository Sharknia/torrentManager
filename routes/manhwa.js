var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose();
var request = require('request');
const client = require('cheerio-httpcli');

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3';
/*************  GET  *************/
// 리눅스 페이지 접속
router.get('/', function (req, res) {
    if (!req.session.info) { //세션 정보가 없다면 초기 로그인 화면으로
        res.render('login/login');
    }
    else {
        res.render('manhwa/manhwa', { info: req.session.info });
    }
});


/*************  POST  *************/
router.post('/getUrl', function (req, res) {
    let count = 0;

    var db = new sqlite3.Database('Setting.db', sqlite3.OPEN_READWRITE);
    db.get("SELECT * FROM tcode WHERE code='manhwa'", [], (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: err.message });
            return;
        }

        let currentNum = parseInt(row.codename);
        let url = `https://manatoki${currentNum}.net/`;

        const attemptConnection = () => {
            request(url, { timeout: 1000, headers: { 'User-Agent': userAgent } }, (err, response, body) => {
                if (err || response.statusCode !== 200) {
                    count++;

                    if (count < 5) {
                        url = `https://manatoki${currentNum}.net/`;
                        console.log(`Trying next url: ${url}`);
                        setTimeout(attemptConnection, 1000);
                        currentNum++;
                    } else {
                        console.log('All attempts failed.');
                        res.json({ message: "다섯번 시도했지만 접속에 실패했습니다. 주소를 수동으로 확인해주세요." });
                    }
                } else {
                    console.log('Connection successful!');
                    const newUrl = url;
                    const newValue = { $codevalue: newUrl, $codename: currentNum };
                    db.run(`UPDATE tcode SET codevalue = $codevalue, codename = $codename WHERE code = 'manhwa'`, newValue, function (err) {
                        if (err) {
                            console.error(err.message);
                            res.status(500).json({ error: err.message });
                            return;
                        }
                        console.log(`New URL: ${newUrl}`);
                        db.close();
                        res.json({ url: newUrl });
                        return;
                    });
                }
            });
        };
        attemptConnection();
    });
});

router.post('/list', function (req, res) {
    const itemsPerPage = 50;
    const page = parseInt(req.body.page) || 1;
    const offset = (page - 1) * itemsPerPage;

    var db = new sqlite3.Database('Setting.db', sqlite3.OPEN_READWRITE);
    db.all(`SELECT * FROM manhwamaster ORDER BY TITLE ASC LIMIT ${itemsPerPage} OFFSET ${offset}`, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (rows.length === 0) {
            res.json({ message: "저장된 데이터가 없습니다" });
            return;
        }

        res.json(rows);
    });
});

router.post('/cmd', function (req, res) {
    const { idx, cmd } = req.body;
    if (cmd === 'update') {
        var db = new sqlite3.Database('Setting.db', sqlite3.OPEN_READONLY);
        db.get("SELECT * FROM tcode WHERE code='manhwa'", [], async (err, row) => {
            if (err) {
                console.error(err.message);
                res.status(500).json({ error: err.message });
                return;
            }

            const url = `https://manatoki${row.codename}.net/comic/${idx}`;
            client.fetch(url, { headers: { 'User-Agent': userAgent }, encoding: 'utf-8' }, (err, $, response) => {
                if (err) {
                    console.error(err.message);
                    res.status(500).json({ error: err.message });
                    return;
                }

                const links = $('a.item-subject').get().reverse();
                const results = [];

                const masteridx = idx;
                db.all("SELECT * FROM manhwalist WHERE masteridx=?", [masteridx], async (err, rows) => {
                    if (err) {
                        console.error(err.message);
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    const existingIds = new Set(rows.map(row => row.idx));

                    // for 반복문을 for...of 반복문으로 수정
                    for (const link of links) {
                        const href = $(link).attr('href');
                        const id = href.match(/\/(\d+)\?/)[1];
                        if (existingIds.has(id)) {
                            // manhwalist 테이블에 있는 것이면 skip
                            continue;
                        }
                        const title = $(link).contents().filter((_, el) => el.nodeType === 3).text().trim();
                        //한 번에 너무 많이 접근하면 밴 됨
                        await SaveManhwa(idx, id);
                        results.push({ id: id, title: title });
                    }
                    console.log("완료")
                    // 결과 전송
                    res.json({ results: results });
                });
            });
        });
    }
});

async function SaveManhwa(masteridx, idx) {
    try {
        var db = new sqlite3.Database('Setting.db', sqlite3.OPEN_READONLY);

        db.get("SELECT * FROM tcode WHERE code='manhwa'", [], async (err, row) => {
            if (err) {
                console.error(err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            const url = `https://manatoki${row.codename}.net/comic/${idx}`;
            console.log(url);
            // 한 번에 너무 많이 접근하면 밴 됨
            await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 1000) + 1000)); // 실행 시간 랜덤하게 대기
            client.fetch(url, { headers: { 'User-Agent': userAgent }, encoding: 'utf-8' }, async (err, $, response) => {
                if (err) {
                    console.error(err.message);
                    return;
                }
                //URL 로드 직후에는 이미지가 없는 것 같다.. 진짜 없는것인지 확인해야함..
                const imgs = $('img');
                if (imgs.length === 0) {
                    console.log('No images found.');
                } else {
                    imgs.each((_, img) => {
                        const src = $(img).attr('src');
                        if (src.includes(idx)) {
                            console.log(src);
                        }
                    });
                }
            });
        });
    } catch (error) {
        console.error(`Error accessing : ${error.message}`);
    }
}

// function SaveManhwa(masteridx, idx) {
//     var db = new sqlite3.Database('Setting.db', sqlite3.OPEN_READONLY);

//     db.get("SELECT * FROM tcode WHERE code='manhwa'", [], (err, row) => {
//         if (err) {
//             console.error(err.message);
//             res.status(500).json({ error: err.message });
//             return;
//         }

//         const url = `https://manatoki${row.codename}.net/comic/${idx}`;
//         console.log(url)
//         //한 번에 너무 많이 접근하면 밴 됨
//         // client.fetch(url, { headers: { 'User-Agent': userAgent } }, (err, $, response) => {
//         //     if (err) {
//         //         console.error(err.message);
//         //         return;
//         //     }
//         //     const imgs = $('#html_encoder_div img');
//         //     if (imgs.length === 0) {
//         //         console.log('No images found.');
//         //     } else {
//         //         imgs.each((idx, img) => {
//         //             const src = $(img).attr('src');
//         //             console.log(src);
//         //         });
//         //     }
//         // });
//     });
// }


module.exports = router;