//file 이름 앞 뒤에 "를 붙여 리눅스가 하나의 이름으로 인식하게 하는 파일명을 만들어주는 함수
var fullname = function fullname(name) {
    if (name.charAt(name.length - 1) == '/') return '\"' + name.slice(0, -1) + '\"/'
    else return '\"' + name + '\"'
}

//체크박스 전체체크 함수
var checkboxAllCheck = function checkboxAllCheck(select) {
    if (select == '1') {
        ($("#torrentListCheckbox").is(":checked") == true) ? $("input[name=torrentListCheck]").prop("checked", true) : $("input[name=torrentListCheck]").prop("checked", false);
    }
    else if (select == '2') {
        ($("#expCheckbox").is(":checked") == true) ? $("input[name=expListCheck]").prop("checked", true) : $("input[name=expListCheck]").prop("checked", false);
    }
}

/*전역 변수 대신 쓰이는 클로저*/
//잘라내고 붙여낼 파일 리스트
function CutFile() {
    var cutFile = '';

    this.val = function (val) {
        if (val != null) cutFile = val;
        return cutFile;
    }
}
const cutFile = new CutFile();

//체크된 목록 관리
function TargetList() {
    var targetList = [];

    this.val = function () {
        return targetList;
    }
    //타겟 리스트를 비운다. 
    this.empty = function (tab) {
        targetList = [];
        return targetList;
    }
    //현재 체크된 목록으로 탭에 따라서 타겟 리스트 최신화
    this.refresh = function (tab) {
        targetList = [];
        if (tab == 'tr') {
            $("input:checkbox[name=torrentListCheck]:checked").each(function () {
                targetList.push($(this).val());
            });
        }
        else if (tab == 'sh') {
            $("input:checkbox[name=expListCheck]:checked").each(function () {
                targetList.push(dir.pwd() + fullname($(this).val()));
            });
        }
        return returnTargetList.val(tab);
    }
    //탭에 따라서 전체 목록 타겟 리스트에 저장
    this.full = function (tab) {
        targetList = [];
        if (tab == 'tr') {
            $("input:checkbox[name=torrentListCheck]").each(function () {
                targetList.push($(this).val());
            });
        }
        else if (tab == 'sh') {
            $("input:checkbox[name=expListCheck]").each(function () {
                targetList.push(dir.pwd() + fullname($(this).val()));
            });
        }
        return returnTargetList.val(tab);
    }
}
const targetList = new TargetList();

//타겟 리스트를 string으로 만들어서 리턴
function ReturnTargetList() {
    //타겟 리스트를 스트링으로 만들어 리턴한다.
    this.val = function (tab) {
        var returnData = '';
        for (var i in targetList.val()) {
            returnData += targetList.val()[i];
            if (tab == 'sh') returnData += ' ';
            else if (tab == 'tr') returnData += ',';
        }
        return returnData;
    }
}
const returnTargetList = new ReturnTargetList();

//URL 리스트
function URLLIST(){
    var urlList = [];   //받아온 urlList;
    var nameList = [];  //받아온 주소의 이름 리스트

    this.nameList = function(val){
        if(val != null) nameList.push(val);
        return nameList;
    }
    this.urlList = function(val){
        if(val != null) urlList.push(val);
        return urlList;
    }
}
const urllist = new URLLIST();

//Dir 세팅 저장, pwd에 대해 pop, push 가능
function DIR() {
    var pwd = '';        //현재폴더
    var watch = '';      //토렌트 Watch 폴더
    var download = '';   //토렌트 다운로드 폴더

    var nameList = [];
    var pathList = [];

    //DB로부터 받아온 폴더들의 이름이 저장됨
    this.nameList = function (val) {
        if (val != null) nameList.push(val);
        return nameList;
    }
    //DB로부터 받아온 폴더들의 경로가 저장됨
    this.pathList = function (val) {
        if (val != null) pathList.push(val);
        return pathList;
    }

    //현재 보고 있는 경로가 저장됨
    this.pwd = function (val) {
        if (val != null) pwd = val;
        return pwd;
    }

    //torrent 파일 업로드 폴더
    this.watch = function (val) {
        if (val != null) watch = val;
        return watch;
    }
    //토렌트 다운로드 폴더
    this.download = function (val) {
        if (val != null) download = val;
        return download;
    }

    //pwd 갱신
    this.pwdPop = function () {
        var temp = pwd.split('/');
        temp.pop();
        pwd = '';
        if (temp.length < 2) {
            pwd = '/';
        }
        else {
            for (var i = 0; i < temp.length - 1; i++) {
                pwd += temp[i] + "/";
            }
        }
        return pwd;
    }
    this.pwdPush = function (pushDir) {
        pwd = pwd + pushDir;
        return pwd;
    }
}
const dir = new DIR();

//명령 내리기 전 한 번 확인용 함수
var isOk = function isOk(cmd) {
    if (confirm("정말로 실행합니까?")) {
        control(cmd);
    };
}

//컨트롤바의 명령 서버에 전달
var control = function control(cmd) {
    var select = '';
    var sendCmd = '';
    //1 : 시작 2 : 정지 3: 삭제 4: 로컬에서도 삭제 5 : 전체 시작 6 : 전체 정지 
    //7: 영화폴더로 8: TV폴더로 9:개인폴더로 10: minidlna 새로고침
    //11 : 잘라내기, 12 : 붙여넣기 14 파일삭제

    //10 미만 : 트랜스미션 명령어
    if (cmd < 10) {
        select = 'tr';
        sendCmd = ' --torrent '
        if (cmd == 5 || cmd == 6) {   //전체 제어(전체정지, 전체삭제)
            sendCmd += targetList.full(select);
        }
        else { //체크된 것만 제어
            sendCmd += targetList.refresh(select);
        }
        // sendCmd += targetList;
        if (cmd == 1 || cmd == 5) sendCmd += ' --start';
        else if (cmd == 2 || cmd == 6) sendCmd += ' --stop';
        else if (cmd == 3) sendCmd += ' --remove';
        else if (cmd == 4) sendCmd += ' --remove-and-delete';
    }
    //10이상 : 쉘 명령어, Explorer 탭
    else {
        select = 'sh';
        //dlna 새로고침
        if (cmd == 10) {
            sendCmd = "sudo service minidlna force-reload";
        }
        //잘라내기
        else if (cmd == 11) {
            cutFile.val(targetList.refresh(select));
            if (cutFile.val() == '') alert("선택된 항목이 없습니다.");
            else alert(cutFile.val());
            return;
        }
        //붙여넣기
        else if (cmd == 12) {
            if (cutFile.val() == '') {
                alert("선택된 항목이 없습니다. ");
                return;
            }
            sendCmd = "sudo mv " + cutFile.val() + ' ' + dir.pwd();
            alert("sendCmd : " + sendCmd);
        }
        //파일 삭제
        else if (cmd == 14) sendCmd = "sudo rm -rf " + targetList.refresh(select);
    }

    if (cmd != 10 && targetList.val().length == 0 && cutFile.val() == '') {
        alert("선택된 항목이 없습니다.")
        return;
    }

    $.ajax({
        type: "POST",
        url: "/control",
        data: {
            select: select,
            cmd: sendCmd
        },
        success: function (result) {
            if ($.trim(result.result) == 'err' || $.trim(result.result) == 'stderr') {
                alert(result.data);
            }
            else {
                if (cmd < 10) transmission();
                else if (cmd == 10) alert("DLNA 새로고침 완료!");
                else explorer();
            }
        }
    });
}

var helpUrl = function helpUrl(){
    var name = "";
    var url = "";
    var noticeUrl = "";
    if ($('input[name="siteSelect"]').val() == "10") name = "토렌튜브";
    else if($('input[name="siteSelect"]').val() == "20") name = "토렌트왈";

    for(var i in urllist.nameList()){
        if(urllist.nameList()[i] == name) url = urllist.urlList()[i];
        if(urllist.nameList()[i] == name + "안내") noticeUrl = urllist.urlList()[i];
    }

    var bodyHtml = '';
    //모달 타이틀
    $("#modal-title").html(name + " 주소 설정");

    //모달 바디
    bodyHtml += '<div class="input-group">';
    bodyHtml += '<input type="hidden" id="oldUrl" value="' + url + '">';
    bodyHtml += '<input type="text" class="form-control" value="' + url + '" placeholder="' + url + '" name="newUrl" id="newUrl">';
    bodyHtml += '<span class="input-group-btn">';
    bodyHtml += '<button class="btn btn-warning" onclick="urlUpdate(\'' + name + '\', $(\'#newUrl\').val()\);" type="button" data-dismiss="modal">수정</button>';
    bodyHtml += '</span></div>'
    bodyHtml += '<div class="col-lg-12 text-right" style="padding-right:0px">';
    bodyHtml += "<a href='" + noticeUrl + "' target='_blank'>" + name + "안내</a></br>";
    bodyHtml += "<span>https부터 쓰고 마지막에 / 를 반드시 붙여주세요!</span>";
    bodyHtml += '</div>';
    bodyHtml += '<div stlye="padding:0px">&nbsp;';
    bodyHtml += '</div>';

    $("#modal-body").html(bodyHtml);
    $("#myModal").modal("show");
    return;
}

var urlUpdate = function urlUpdat(name, nurl){
    $.ajax({
        type: "POST",
        url: "/main/torrentUrlUpdate",
        data: {
            name:name,
            url:nurl
        },
        success: function (result) {
            if ($.trim(result.result) == 'err' || $.trim(result.result) == 'stderr') {
                alert(result.data);
            }
            else {
                alert("토렌트 주소가 갱신되었습니다.");
                location.reload();
            }
        }
    });
}