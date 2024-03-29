/* Torrent Tab */
//마그넷 주소 리스트
function MagnetList() { // var mglist;
    var magnetList;

    this.val = function (val) {
        if (val != null) magnetList = val;
        return magnetList;
    }
}
const magnetList = new MagnetList();

//검색한 파일 명
function TorrentTitle() { // var mglist;
    var torrentTitle = '';

    this.val = function (val) {
        if (val != null) torrentTitle = val;
        return torrentTitle;
    }
}
const torrentTitle = new TorrentTitle();

//검색결과의 총 페이지수
function TotalPage() {   // var totalpage;
    var totalPage = 0;

    this.val = function (val) {
        if (val != null) totalPage = val;
        return totalPage;
    }
}
const totalPage = new TotalPage();

//출력할 페이지 넘버
function Page() {    // var page = 1;
    var page = 1;

    this.increase = function () {
        return ++page;
    }
    this.decrease = function () {
        return --page;
    }
    this.nextPage = function () {
        page += 5;
        if (page > totalPage.val()) page = totalPage.val();
        return page;
    }
    this.prevPage = function () {
        page -= 5;
        if (page < 1) page = 1;
        return page;
    }
    this.val = function (val) {
        if (val != null) page = val;
        return page;
    }
}
const page = new Page();

//Torrent 검색
var torrentSearch = function torrentSearch(trListPaging) {
    alert("서비스 종료");
    return;
    //선택된 사이트 10 : 토렌튜브, 20 : 토렌트왈
    var siteSelect = $("#siteSelect").val();

    if ($("#torrentTitle").val() == '' && torrentTitle.val() == '') {
        alert("검색어 입력은 필수입니다.");
        $("#torrentTitle").focus();
        return;
        ////테스트용 코드 입력 없을 경우 스파이더맨
        // torrentTitle.val("스파이더맨")
    }

    //검색중이 아니면 새로운 검색값 입력
    if (torrentTitle.val() == '' && $("#torrentTitle").val() != '') {
        torrentTitle.val($("#torrentTitle").val());
    }

    //페이징이 아니고 검색중인 값과 새로운 검색값이 다르다면 새로운 검색
    else if (torrentTitle.val() != $("#torrentTitle").val() && trListPaging == null) {
        torrentTitle.val($("#torrentTitle").val());
    }

    //1080체크버튼에 체크 되어 있다면 1080p 검색
    if($("#check1080").is(":checked")) torrentTitle.val(torrentTitle.val() + " 1080p");

    //페이징
    if (trListPaging == null) page.val(1);
    else if (trListPaging == "Pre") page.prevPage();
    else if (trListPaging == "Next") page.nextPage();
    else page.val(trListPaging);

    //로딩화면 출력
    $('#torrentList').html("");
    var list = "<div class='text-center'>";
    list += "<img src='/img/loading.gif' width='400' height='300'>";
    list += "</div>"
    $('#torrentList').append(list);

    $.ajax({
        type: "POST",
        url: "/main/torrentSearch",
        data: {
            "torrentTitle": torrentTitle.val(),
            "page": page.val(),
            "siteSelect" : siteSelect
        },
        success: function (result) {
            if ($.trim(result.result) == "false") {
                alert("ERROR!! : " + url);
                return;
            }
            else {
                //토렌트왈을 선택한 경우
                $('#torrentList').html("");
                list = '';
                if(siteSelect == 20){
                    //데이터 수신
                    magnetList.val(result.mglist);
                    totalPage.val(parseInt(result.count / 20 + 1));

                    $('#torrentList').append("검색 결과는 " + result.num * page.val() + " / " + result.count + "건 입니다.<br/>");
                    $('#torrentList').append("<a target='_blink' href='" + result.url + "'>검색 결과 상세보기</a>");

                    //검색결과 출력 파트
                    list += '<div class="col-lg-12"><ul class="list-group">';
                    for (var i = 0; i < result.num; i++) {
                        list += '<li class="list-group-item">' + '<a href="' + result.urllist[i] + '" style="color:black;" target="_blank">' + result.subject[i] + "</a>";
                        list += '<a onclick="addMagnet(\'' + result.mglist[i] + '\');" style="float:right;color:gray" aria-hidden="true"><i class="fas fa-magnet"></i></a>'
                        list += '<span style="float:right">' + result.datelist[i] + '&nbsp&nbsp&nbsp;</span>';
                        list += '</li>'
                    }
                    list += '</ul></div>';
                    //검색결과 출력 파트 끝
                }
                //토렌튜브를 선택한 경우
                else if(siteSelect == 10){
                    var url = result.url;
                    list += '<div class="col-lg-12">';
                    list += "<a target='_blink' href='" + url + "kt/search?page=" + page.val() + "&q=" + torrentTitle.val() + "'>검색 결과 상세보기</a>";
                    
                    //검색결과 출력 파트
                    var cnt = 0;
                    list += '<ul class="list-group">';
                    for (var key of result.result){
                        var size = `${key.sz}`;
                        size = (size / 1073741824).toFixed(1);
                        list += '<li class="list-group-item">' + '<a href="' + url + 'kt/read?p=' + `${key.id}` + '" style="color:black;" target="_blank">' + `${key.fn}` + "</a>";
                        list += '<a onclick="addMagnet(\'magnet:?xt=urn:btih:' + `${key.hs}` + '\');" style="float:right;color:gray" aria-hidden="true"><i class="fas fa-magnet"></i></a>'
                        list += '<span style="float:right">' + `${key.dt}` + ' / ' + size + 'G&nbsp&nbsp&nbsp;</span>';
                        list += '</li>'
                        cnt++;
                    }
                    list += '</ul></div>';
                    //검색결과 출력 파트 끝
                    
                    //페이징 파트
                    if(cnt < 15){
                        //현재 출력 결과물이 15개가 안된다면 다음장은 없다. 
                        totalPage.val(page.val());
                    }
                    else{
                        //현재 출력물이 15개라면 다음장은 있을 가능성이 높다.
                        totalPage.val(page.val() + 2);
                    }
                }
                //페이징 파트
                list += '<nav class="text-center"><ul class="pagination"><li>';
                list += '<a onclick="torrentSearch(\'Pre\')" aria-label="Previous">';
                list += '<span aria-hidden="true">&laquo;</span></a></li>';
                var temp;
                if (page.val() > 2) {
                    temp = page.val() - 2;
                    list += '<li><a onclick="torrentSearch(' + temp + ')">' + temp + '</a></li>';
                }
                if (page.val() > 1) {
                    temp = page.val() - 1;
                    list += '<li><a onclick="torrentSearch(' + temp + ')">' + temp + '</a></li>';
                }
                list += '<li class="active"><a>' + page.val() + '</a></li>';
                if (page.val() < totalPage.val()) {
                    temp = page.val() + 1;
                    list += '<li><a onclick="torrentSearch(' + temp + ')">' + temp + '</a></li>';
                }
                if (page.val() < totalPage.val() - 1) {
                    temp = page.val() + 2;
                    list += '<li><a onclick="torrentSearch(' + temp + ')">' + temp + '</a></li>';
                }
                list += '<li>';
                list += '<a onclick="torrentSearch(\'Next\')" aria-label="Next">';
                list += '<span aria-hidden="true">&raquo;</span>';
                list += '</a></li></ul></nav>';
                //페이징 파트 끝
                $('#torrentList').append(list);
            }
        }
    });
}

//토렌트 상세 정보 페이지를 모달로 띄우는 함수
var torrentView = function torrentView(url, torrentTitle) {
    url = url.split("/");
    var detail_html = "<iframe src=\"/main/torrentView/" + url + "\" id=\"hide_frame\" frameborder=0 style=\"width:100%;height:600px;\" ></iframe>";

    $("#modal-body").html(detail_html);
    $("#modal-title").html(torrentTitle);
    $("#myModal").modal("show");
}

//토렌트 목록에서 자석 아이콘을 누르면 마그넷 주소를 transmission에 추가
var addMagnet = function addMagnet(i) {
    var cmd = '';
    if(i.length > 6){
        //토렌튜브에서 마그넷 주소를 바로 넘긴 경우
        cmd = '-a ' + i;
    }
    else{
        //토렌트왈에서 magnetList의 i값을 넘긴 경우
        cmd = '-a ' + magnetList.val()[i];
    }
    
    $.ajax({
        type: "POST",
        url: "/control",
        data: {
            "select": 'tr',
            "cmd": cmd
        },
        success: function (result) {
            if ($.trim(result.result) == "true") {
                alert("Transmission에 마그넷 주소가 추가되었습니다.");
            }
            else {
                alert(result.data);
            }
        }
    });
}