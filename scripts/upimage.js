// @author qleelulu@gmail.com

function checkChrome(){
    if(!window.BlobBuilder){
        $("body").html($("#needUpdateChrome")[0].outerHTML);
        $("#needUpdateChrome").show();
        return false;
    }
    return true;
};

function initOnLoad(){
    if(checkChrome()){
        init();
    }
};

function init(){
	initSelectSendAccounts(true);
	
    $("#txtContent").focus();
    
    initTxtContentEven();

    initIamDoing();

    $(window).unload(function(){ initOnUnload(); }); 
};


function sendMsg(){ //覆盖popup.js的同名方法

    var check = true;
    var c_user = getUser();
    if(!c_user){
        _showMsg('用户未指定，请在选项里面添加');
        check = false;
    }
    var msg = $.trim($("#txtContent").val());
    if(!msg){
        _showMsg('请填写内容。');
        check = false;
    }
    var file = $("#imageFile")[0].files[0];
    if(!checkFile(file)){
        check = false;
    }

    if(!check){ return; }
	
    var users = [], selLi = $("#accountsForSend .sel");
    if(selLi.length){
        selLi.each(function(){
            var uniqueKey = $(this).attr('uniqueKey');
            var _user = getUserByUniqueKey(uniqueKey);
            if(_user){
                users.push(_user);
            }
        });
    }else{
        users.push(getUser());
    }
    var userCount = users.length, sendedCount = 0, successCount = 0;
    for(i in users){
        var user = users[i];
        var pic = {file: file};
        var data = {status: msg};
        
        tapi.upload(user, data, pic, 
            function() {
                _showLoading();
                disabledUpload();
            }, 
            function(ev) {
                onprogress(ev);
            }, 
            function(data, textStatus, error_code) {
                //processUploadResult(data, textStatus, error_code);

                sendedCount++;
                if(textStatus != 'error' && data && !data.error){
                    successCount++;
                }else if(data.error){
                    _showMsg('error: ' + data.error);
                }
                if(successCount >= userCount){//全部发送成功
                    _showMsg('发送成功');
                    $("#txtContent").val('');
                    $("#imgPreview").html('');
                    $("#progressInfo").html('');
                    $("#progressBar span").html("");
                }
                if(sendedCount >= userCount){//全部发送完成
                    $("#progressBar")[0].style.width = "0%";
                    enabledUpload();
                    _hideLoading();
                    if(successCount > 0){ //有发送成功的
                        setTimeout(callCheckNewMsg, 1000);
                        if(userCount > 1){ //多个用户的
                            _showMsg(successCount + '发送成功，' + (userCount - successCount) + '失败。');
                        }
                    }
                }
            }
        );
    }
};

var FILECHECK = {maxFileSize: 1024000,
                 fileTypes: '__image/gif__image/jpeg__image/jpg__image/png__'
                };
function checkFile(file){
    var check = true;
    if(file){
        if(file.size > FILECHECK.maxFileSize){
            _showMsg('文件太大，请选择小于1M的文件。');
            check = false;
        }
        if(FILECHECK.fileTypes.indexOf('__'+file.type+'__') < 0){
            _showMsg('文件类型不正确，仅支持JPEG,GIF,PNG图片。');
            check = false;
        }
    }else{
        _showMsg('请选择要上传的图片。');
        check = false;
    }
    return check;
};


function onprogress(rpe){
    $("#progressInfo").html(
        [
         "Sent: " + size(rpe.loaded) + " of " + size(rpe.total)
        ].join("<br />")
    );
    //$("#progressBar")[0].style.width = ((rpe.loaded * 200 / rpe.total) >> 0) + "px";
    var precent = parseInt((rpe.loaded / rpe.total) * 100);
    $("#progressBar")[0].style.width = precent + "%";
    $("#progressBar span").html(precent + "%");
};

function size(bytes){   // simple function to show a friendly size
    var i = 0;
    while(1023 < bytes){
        bytes /= 1024;
        ++i;
    };
    return  i ? bytes.toFixed(2) + ["", " Kb", " Mb", " Gb", " Tb"][i] : bytes + " bytes";
};


function selectFile(fileEle){
    var file = fileEle.files[0];
    if(file){
        $("#imgPreview").html('');
        $("#progressInfo").html('');
        $("#progressBar")[0].style.width = "0%";
        $("#progressBar span").html("");

        var check = checkFile(file);
        if(check){
            var reader = new FileReader();
            reader.onload = function(e){
                $("#imgPreview").html('<img class="pic" src="' + e.target.result + '" />');
            };
            reader.readAsDataURL(file);
        }
    }
};

function disabledUpload(){
    $("#btnSend").attr('disabled', true);
    $("#imageFile").attr('disabled', true);
};

function enabledUpload(){
    $("#btnSend").removeAttr('disabled');
    $("#imageFile").removeAttr('disabled');
}