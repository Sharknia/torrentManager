/* Transmission Tab */
var transmission = function transmission() {
    var torrentList = {};
    var subjectList = {};
    var stateList = {};
    var percentList = {};
    var volumeList = {};
    var idxList = {};
    var remaintimeList = {};
    var downspeedList = {};

    //타겟 리스트 초기화
    targetList.empty();

    //로딩화면 출력
    $('#transmission_contents').html("");
    var list = "<div class='text-center'>";
    list += "<img src='/img/loading.gif' width='400' height='300'>";
    list += "</div>"
    $('#transmission_contents').append(list);

    $.ajax({
        type: "POST",
        url: "/control",
        data: {
            "select": 'tr',
            "cmd": "-l |  sed -e '1d;$d;s/^ *//'"
        },
        success: function (result) {
            if ($.trim(result.result) == "stderr" || $.trim(result.result) == "err") {
                alert(result.data);
            }
            else if ($.trim(result.result) == 'none') {
                var list = '<h3 class="text-center">현재 작업중인 토렌트가 없습니다.</h3>';
                $('#transmission_contents').html(list)
            }
            else if ($.trim(result.result) == 'true') {
                var list = '';
                var torrentList = $.trim(result.data).split("\n");
                var j = 0;
                for (var a in torrentList) {
                    var temp = torrentList[a].split(" ");
                    //visit 기준
                    var visit = -1;
                    var volnum = 2;
                    var remaintimenum = 4;
                    var downspeednum = 6;
                    var statenum = 8;
                    var subnum = 9;
                    for (var i in temp) {
                        if (temp[i] != '') {
                            visit++;
                            //뭐가 몇번인지 알아보는 코드
                            // list += "[(v)"+visit+"]" + "[(i)"+i+"]" + temp[i] + "<br>"; 
                            // console.log("visit : " + visit + " // value: " + temp[i]);
                            if (visit == 0) idxList[j] = temp[i];
                            else if (visit == 1) percentList[j] = temp[i];
                            else if (visit == volnum) {
                                volumeList[j] = temp[i];
                                if (temp[i] == "None") {
                                    statenum = statenum - 1;
                                    subnum = subnum - 1;
                                    remaintimenum = remaintimenum - 1;
                                    downspeednum -= 1;
                                }
                                else volumeList[j] += temp[i * 1 + 1];
                            }
                            else if (visit == remaintimenum) {
                                if (!isNaN(temp[i] * 1)) {
                                    statenum = statenum + 1;
                                    subnum = subnum + 1;
                                    downspeednum += 1;
                                    remaintimeList[j] = temp[i] + temp[i * 1 + 1];
                                }
                                else remaintimeList[j] = temp[i];
                            }
                            else if (visit == downspeednum) {
                                try{
                                    if (temp[i] == '0.0') {
                                        downspeedList[j] = '-';
                                    }
                                    else if (temp[i] * 1 > 1000) {
                                        downspeedList[j] = (temp[i] * 1 / 1024).toFixed(2) + "Mb/s";
                                    }
                                    else downspeedList[j] = temp[i].toFixed(2) + "Kb/s";
                                }catch{
                                    //다운로드 속도가 언노운으로 잡힐 경우가 있음, 그런 경우 fixed에서 에러가 남
                                    downspeedList[j] = "-";
                                }
                            }
                            else if (visit == statenum) {
                                if (temp[i].indexOf('Up') > -1) {
                                    stateList[j] = "다운로드중";
                                    subnum += 2;
                                }
                                else if (temp[i] == "Idle") stateList[j] = "다운로드중";
                                else if (temp[i] == "Stopped") stateList[j] = "정지";
                                else stateList[j] = temp[i];
                            }
                            else if (visit == subnum) subjectList[j] = temp[i];
                            else if (visit > subnum) {
                                subjectList[j] += temp[i];
                            }
                        }
                    }
                    j++; //j가 넘어온 행의 개수가 된다. 
                }

                //토렌트 리스트 테이블
                list += `
                <table class="table table-bordered table-hover">
                    <tr style="background-color:lightgray">
                        <th class="text-center">
                            <input type="checkbox" onclick="checkboxAllCheck(1);" name="torrentListCheckbox" id="torrentListCheckbox">
                        </th>
                        <th>제목</th>
                        <th>용량</th>
                        <th>진행상황</th>
                        <th>남은시간</th>
                        <th>속도</th>
                        <th>상태</th>
                    </tr>
                `;
                
                for (let i = 0; i < j; i++) {
                    list += `
                        <tr>
                            <td class="text-center">
                                <input type="checkbox" class="custom-control custom-checkbox" name="torrentListCheck" value="${idxList[i]}">
                            </td>
                            <td>${subjectList[i].substr(0, 50)}</td>
                            <td>${volumeList[i]}</td>
                            <td>
                                <div class="progress">
                                    <div class="progress-bar" aria-valuenow="${percentList[i]}" aria-valuemin="0" aria-valuemax="100" style="width:${percentList[i]}%">
                                        ${percentList[i]}
                                    </div>
                                </div>
                            </td>
                            <td>${remaintimeList[i]}</td>
                            <td>${downspeedList[i]}</td>
                            <td>${stateList[i]}</td>
                        </tr>
                    `;
                }
                
                list += '</table>';
                //토렌트 리스트 테이블 끝

                $('#transmission_contents').html(list);
            }
        }
    });
}

//토렌트 파일 업로드 함수
var torrentUpload = function torrentUpload(select) {
    //select가 1이면 모달 띄움
    if (select == '1') {
        $("#modal-title").html("torrent 파일 업로드");
        let modalBody = `
        <form id="torrentUpload" method="POST" enctype="multipart/form-data" action="/main/torrentUpload">
            <div class="input-group">
                <input multiple="multiple" type="file" class="form-control" name="fileForm[]" id="fileForm">
                <span class="input-group-btn">
                    <button class="btn btn-warning" onclick="torrentUpload('2');" type="button" data-dismiss="modal">업로드</button>
                </span>
            </div>
        </form>
        `;
        $("#modal-body").html(modalBody);
        $("#myModal").modal("show");
        return;
    }
    else if (select == '2') {
        // .torrent 파일인지 검사
        let isTorrent = true;
        const files = $('#fileForm')[0].files;

        for(let i = 0; i < files.length; i++) {
            const fileName = files[i].name;
            const fileExt = fileName.split('.').pop();

            if (fileExt.toLowerCase() !== 'torrent') {
                isTorrent = false;
                break;
            }
        }

        if (!isTorrent) {
            alert('업로드할 파일은 .torrent 형식이어야 합니다.');
            return;
        }

        const formData = new FormData($('#torrentUpload')[0]);
        $.ajax({
            url: '/main/torrentUpload',
            type: 'POST',
            data: formData,
            processData: false,  // 필수: FormData를 사용할 때는 false로 설정해야 합니다.
            contentType: false,  // 필수: FormData를 사용할 때는 false로 설정해야 합니다.
            success: function (data) {
                //성공
                transmission();
            },
            error: function (error) {
                console.error(error); 
            }
        });
    }
}