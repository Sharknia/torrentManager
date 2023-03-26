/* Manhwa Tab */

//마나토끼 주소
function ManaURL() {
    var manaUrl = '';

    this.val = function (val) {
        if (val != null) manaUrl = val;
        return manaUrl;
    }
}
const manaUrl = new ManaURL();

function listManhwa(idx){
    alert(idx);
}

function updateManhwa(idx){
    $.ajax({
        type: 'post',
        url: "/manhwa/cmd",
        data:{
            idx:idx,
            cmd:"update"
        },
        success: function (json) {
            console.log(json)
        }
    });
}

//만화 컨트롤 바
var manhwaControl = function manhwaControl(cmd, page) {
    if (cmd == "List") {
        $.ajax({
            type: 'post',
            url: "/manhwa/list",
            data: {
                "cmd": cmd,
                "page": page
            },
            success: function (result) {
                var table = $('#manhwa-list');
                table.find('tr:gt(0)').remove(); // 헤더를 제외한 모든 행 삭제
                if (result.hasOwnProperty('message')) {
                    var row = $('<tr>').appendTo(table);
                    $('<td>').attr('colspan', 3).text(result.message).appendTo(row);
                } else {
                    for (var i = 0; i < result.length; i++) {
                        var manhwa = result[i];
                        var row = $('<tr>').appendTo(table);
                        $('<td class="text-center">')
                            .html(`<input type="checkbox" name="manhwaListCheckbox" value="${manhwa.ID}">`)
                            .appendTo(row);
                        //타이틀
                        $('<td>')
                            .html(`<a onclick="listManhwa('${manhwa.ID}');">${manhwa.TITLE}</a>`)
                            .appendTo(row);
                        //관리
                        $('<td>').appendTo(row)
                            .append(
                                $('<button class="btn btn-info btn-xs">업데이트</button>')
                                    .on('click', function () {
                                        updateManhwa(manhwa.ID);
                                    })
                            )
                            .append(
                                $('<button class="btn btn-danger btn-xs">삭제</button>')
                            );
                    }
                }
            }
        });
    }
    else if (cmd == "getUrl") {
        $.ajax({
            type: 'post',
            url: "/manhwa/getUrl",
            success: function (json) {
                if (json.message) {
                    alert(json.message);
                } else {
                    manaUrl.val(json.url);
                }
            }
        });
    }
    else {
        alert("제작중입니다.");
        return;
    }
}

function init() {
    manhwaControl('List');
    // manhwaControl('getUrl');
}

function visitTokki(){
    window.open(manaUrl.val(), '_blank');
}

init();