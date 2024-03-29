function IsFavorite() {
    var isFavorite = "false";

    //pwd가 favorite에 있다면 true
    this.val = function (val) {
        if (val != null) isFavorite = val;
        return isFavorite;
    }
}
const isFavorite = new IsFavorite();

/* Explorer Tab */
//pwd의 내용으로 새로고침한다.
var explorer = function explorer(openDir) {
    targetList.empty();
    
    //....이 입력으로 들어온 경우는 상위 폴더로 이동한다. 
    if (openDir == '....') {
        dir.pwdPop();
    }
    //폴더 이동이 있다 --> 입력이 있다 --> 해당 디렉토리의 이름을 pwd에 푸쉬해서 pwd를 최신화한다.
    else if (openDir != null) {
        // 숫자+// 꼴로 날아오면 해당 숫자의 즐겨찾기 dirPath로 이동한다.(ex: '1//' -> dir.pathList.val()[1]로 이동)
        if (openDir.split('/').length > 2) {
            dir.pwd(dir.pathList()[openDir.split('/')[0]]);
        }
        else {
            dir.pwdPush(fullname(openDir));
        }
    }
    var list = '';  //html에 들어갈 String
    //다운로드 폴더 내 파일 목록
    $('#explorerContents').html('');
    list += '<table class="table table-bordered table-hover"><tr style="background-color:lightgray">';
    list += '<th class="text-center" style="width:5%"><input type="checkbox" onclick="checkboxAllCheck(2);" name="expCheckbox" id="expCheckbox"></th><th>' + dir.pwd().replace(/"/gi, '');
    //즐겨찾기 마크 표시
    isFavorite.val("false");
    for (var i in dir.pathList()) {
        if (dir.pathList()[i] == dir.pwd().replace(/"/gi, '') || dir.pathList()[i] == dir.pwd()) {
            if (i == 0) isFavorite.val("home");
            else isFavorite.val("true");
        }
    }
    //즐찾 목록에 있고 홈이 아니라면 꽉 찬 별
    if (isFavorite.val() == 'true') list += '<a onclick="favoriteCustom();" style="float:right"><i id="favoriteIcon" class="fas fa-star" style="color:black"></i></a>';
    //즐찾 목록에 없다면 빈 별
    else if (isFavorite.val() == "false") list += '<a onclick="favoriteCustom();" style="float:right"><i id="favoriteIcon" class="far fa-star" style="color:black"></i></a>';
    list += '</th></tr>';
    //루트 폴더인 경우 상위폴더로 이동 표시 안함
    if (dir.pwd() != '/') list += '<td class="text-center" style="width:5%"></td><td><a onclick="explorer(\'....\')"><i class="fas fa-level-up-alt"></i>&nbsp;..</a></td></tr>'

    $.ajax({
        type: 'POST',
        url: "/control",
        data: {
            "select": "sh",
            "cmd": 'ls -F ' + dir.pwd()
        },
        success: function (result) {
            if ($.trim(result.result) == "true") {
                var dirList = [];
                var fileList = [];
                //받아온 파일 목록을 \n으로 구분해서 리스트화 한다. 
                var tempList = result.data.split('\n');
                //해당 파일명에 /가 포함되어 있다면 디렉토리, 없다면 파일이다.  
                for (var i = 0; i < tempList.length - 1; i++) {
                    if (tempList[i].indexOf('/') > -1) {
                        dirList.push(tempList[i]);
                    }
                    else {
                        fileList.push(tempList[i].replace(/\*/gi, ''));
                    }
                }
                //디렉토리 목록, 파일 목록을 만든다.
                for (var i in dirList) {
                    list += `
                    <tr>
                        <td class="text-center">
                            <input type="checkbox" class="custom-control custom-checkbox" name="expListCheck" value="${dirList[i]}">
                        </td>
                        <td>
                            <a onclick="explorer('${dirList[i].replace(/'/gi, '\\\'')}')">
                                <i class="far fa-folder"></i>&nbsp;${dirList[i].substr(0, 100).replace('/', '')}
                            </a>
                            <a style="float:right;color:gray;" title="이름바꾸기" onclick="rename(2, '${dirList[i]}')">
                                <i class="far fa-edit"></i>
                            </a>
                        </td>
                    </tr>`;
                }
                for (var i in fileList) {
                    list += `
                    <tr>
                        <td class="text-center">
                            <input type="checkbox" class="custom-control custom-checkbox" name="expListCheck" value="${fileList[i]}">
                        </td>
                        <td style="cursor:default">
                            <i class="far fa-file"></i>&nbsp;${fileList[i].substr(0, 100)}
                            <a style="float:right;color:gray;" title="이름바꾸기" onclick="rename(2, '${fileList[i]}')">
                                <i class="far fa-edit"></i>
                            </a>
                            ${fileList[i].split('.')[fileList[i].split('.').length - 1] === 'zip' ? `
                                <a style="float:right;color:gray;margin-left:1px;margin-right:1px" title="압축풀기" onclick="unzip('${fileList[i]}')">
                                    <i class="far fa-file-archive">&nbsp;</i>
                                </a>` : ''}
                        </td>
                    </tr>`;
                }
                list += '</table>';
            }
            else if ($.trim(result.result) != "none") {
                alert(result.data);
            }
            $('#explorerContents').append(list)
        }
    });
}

//압축 풀기 함수
var unzip = function unzip(zipName) {
    zipName = dir.pwd() + fullname(zipName);
    console.log('unzip ' + zipName);
    $.ajax({
        type: "POST",
        url: "/control",
        data: {
            select: 'sh',
            cmd: 'sudo unzip ' + zipName + ' -d ' + dir.pwd()
        },
        success: function (result) {
            if ($.trim(result.result) == 'err' || $.trim(result.result) == 'stderr') {
                alert(result.data);
            }
            else {
                explorer();
            }
        }
    });
}

//이름 변경 함수
var rename = function rename(select, oldFileName) {
    var names = [];
    //select가 1이라면 이름 통일, 1이 아니라면 단순 이름 변경
    var isUnity = (select == 1) ? true : false;
    var newFileName = '';

    function makingOFN(name) {
        return dir.pwd() + fullname(name);
    }
    function makingNFN(name) {
        var nfn = dir.pwd() + '"';  //fullname 만들기 위해 큰따옴표
        for (var i = 0; i < name.split('.').length - 1; i++) {
            if (i != 0) nfn += '.';
            nfn += name.split('.')[i];
        }
        return nfn;
    }

    if (isUnity) {
        // 파일 이름 통일이라면 체크된 이름이 두개인지 확인한다. 
        // 두개라면 각각의 확장자를 뗀 나머지값을 구한다. 
        // 확장자가 smi가 아닌 것의 이름으로 통일한다..!
        var ext = '';
        $("input:checkbox[name=expListCheck]:checked").each(function () {
            names.push($(this).val());
        });
        if (names.length != 2) {
            alert("파일을 두 개 골라주세요");
            return;
        }

        if (names[0].split('.')[names[0].split('.').length - 1] == 'smi' || names[0].split('.')[names[0].split('.').length - 1] == 'ass' || names[0].split('.')[names[0].split('.').length - 1] == 'srt') {
            //두번째 이름names[0]이 자막이라면
            ext = names[0].split('.')[names[0].split('.').length - 1];
            oldFileName = makingOFN(names[0]);
            newFileName = makingNFN(names[1]);
        }
        else if (names[1].split('.')[names[1].split('.').length - 1] == 'smi' || names[1].split('.')[names[1].split('.').length - 1] == 'ass' || names[1].split('.')[names[1].split('.').length - 1] == 'srt') {
            //두번째 이름names[1]이 자막이라면
            ext = names[1].split('.')[names[1].split('.').length - 1];
            oldFileName = makingOFN(names[1]);
            newFileName = makingNFN(names[0]);
        }
        else {
            alert("자막 파일이 없습니다!");
            return;
        }
        newFileName += '.' + ext + '"';
    }
    else {
        //파일 이름 변경인 경우, 파일 이름이 있다면 파일 이름 변경 메뉴 띄우기
        if (oldFileName != null) {
            var bodyHtml = '';
            //모달 타이틀
            $("#modal-title").html("파일 이름 변경");

            //모달 바디
            bodyHtml = `
            <div class="input-group">
                <input type="hidden" id="oldFileName" value="${oldFileName}">
                <input type="text" class="form-control" value="${oldFileName}" placeholder="${oldFileName}" name="newFileName" id="newFileName">
                <span class="input-group-btn">
                    <button class="btn btn-warning" onclick="rename(2);" type="button" data-dismiss="modal">수정</button>
                </span>
            </div>`;

            $("#modal-body").html(bodyHtml);
            $("#myModal").modal("show");
            return;
        }
        //파일 이름이 없다면 파일 이름 변경
        else {
            // filename이 널인 경우 : 파일 이름 변경
            if ($("#newFileName").val() == '') {
                alert("파일명을 써야지!");
            }
            else if ($("#oldFileName").val() == $("#newFileName").val()) {
                alert("파일명을 바꿔야지!");
            }
            else {
                oldFileName = dir.pwd() + fullname($("#oldFileName").val());
                newFileName = dir.pwd() + fullname($("#newFileName").val());
            }
        }
    }

    $.ajax({
        type: "POST",
        url: "/control",
        data: {
            select: "sh",
            cmd: "sudo mv " + oldFileName + ' ' + newFileName
        },
        success: function (result) {
            if ($.trim(result.result) == "true" || $.trim(result.result) == "none") {
                alert("이름이 변경되었습니다. ");
                explorer();
            }
            else {
                alert(result.data);
            }
        }
    });
}

//새로운 폴더 만드는 함수
var newDirMaking = function newDirMaking(select) {
    var newDirName = '';

    //새로운 폴더 이름 입력 메뉴 띄우기
    if (select == 1) {
        var bodyHtml = '';
        //모달 타이틀
        $("#modal-title").html("새로운 폴더 생성");

        //모달 바디
        bodyHtml += `
        <div class="input-group">
            <input type="text" class="form-control" value="새폴더" placeholder="새폴더" name="newDirName" id="newDirName">
            <span class="input-group-btn">
                <button class="btn btn-primary" onclick="newDirMaking(2);" type="button" data-dismiss="modal">생성</button>
            </span>
        </div>`;

        $("#modal-body").html(bodyHtml);
        $("#myModal").modal("show");
        return;
    }
    else if(select == 2){
        if ($("#newDirName").val() == '') {
            alert("폴더명을 써야지!");
            return;
        }
        newDirName = dir.pwd() + fullname($("#newDirName").val());
        $.ajax({
            type: "POST",
            url: "/control",
            data: {
                select: "sh",
                cmd: "mkdir " + newDirName
            },
            success: function (result) {
                if ($.trim(result.result) == "true" || $.trim(result.result) == "none") {
                    alert(newDirName + "가 생성되었습니다.");
                    explorer();
                }
                else {
                    alert(result.data);
                }
            }
        });
    }
}

//빠른 이동 function
var fastMove = function fastMove(idx) {
    if (targetList.refresh('sh') == '') {
        alert("선택된 항목이 없습니다. ");
        return;
    }
    var sendCmd = "sudo mv " + targetList.refresh('sh') + ' ' + dir.pathList()[idx];
    $.ajax({
        type: "POST",
        url: "/control",
        data: {
            select: "sh",
            cmd: sendCmd
        },
        success: function (result) {
            if ($.trim(result.result) == 'err' || $.trim(result.result) == 'stderr') {
                alert(result.data);
            }
            else {
                explorer();
            }
        }
    });
}

//즐겨찾기 추가/해제 함수
var favoriteCustom = function favoriteCustom(isAdd) {
    var select = '';
    var name = '';
    //isFavorite이 true라면 별을 클릭했을 때 즐겨찾기를 해제한다. 
    if (isFavorite.val() == 'true') {
        if (!confirm("정말로 즐겨찾기를 해제합니까?")) {
            return;
        }
        select = 'del';
    }
    //isFavorite이 false이고 isAdd가 빈 값이면 클릭했을 때 즐겨찾기 추가 메뉴(즐겨찾기 이름 입력)를 띄운다. 
    else if (isAdd == null && isFavorite.val() == 'false') {
        var modalBody = '';
        //모달 타이틀
        $("#modal-title").html("즐겨찾기 추가");

        //모달 바디
        modalBody += `
        <div class="input-group">
            <input type="text" class="form-control" placeholder="즐겨찾기 이름을 입력해주세요." name="favoriteName" id="favoriteName">
            <span class="input-group-btn">
                <button class="btn btn-warning" onclick="favoriteCustom('add');" type="button" data-dismiss="modal">추가</button>
            </span>
        </div>`;

        $("#modal-body").html(modalBody);
        $("#myModal").modal("show");
        return;
    }
    //현재 즐겨찾기가 아니고(false)이고 isAdd가 빈값이 아니라면 즐겨찾기를 등록한다. 
    else if (isFavorite.val() == 'false') {
        if ($("#favoriteName").val() == '') {
            alert("즐겨찾기 이름을 입력해주세요.");
            return;
        }
        select = 'add';
        name = $("#favoriteName").val();
    }

    $.ajax({
        type: "POST",
        url: "/main/favoriteUpdate",
        data: {
            select: select,
            path: dir.pwd().replace(/"/gi, ''),
            name: name
        },
        success: function (result) {
            if ($.trim(result) == 'true') {
                location.href = '/main';
            }
            else {
                alert('err');
                return;
            }
        }
    });
}