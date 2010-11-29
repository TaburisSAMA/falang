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


var TP_USER_UPLOAD_INFO =  '<li id="u_uploadinfo_{{uniqueKey}}">\
                                <img src="{{profile_image_url}}">{{screen_name}}<img src="/images/blogs/{{blogType}}_16.png" class="blogType">: \
                                <span class="barWrap"><strong class="bar" style="width: 10%;"><span></span></strong></span>\
                                <span class="progressInfo"></span>\
                            </li>';
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
    }else if(!$("#accountsForSend li").length){
        users.push(c_user);
    }else{
        _showMsg('请选择要发送的账号');
        return;
    }
    var upInfo = $("#uploadinfo").html(''), stat = {uploaded:[]};
    stat.userCount = users.length;
    stat.sendedCount = 0;
    stat.successCount = 0;
    for(var i in users){
        var user = users[i];
        upInfo.append(TP_USER_UPLOAD_INFO.format(user));
        var pic = {file: file};
        var data = {status: msg};
        
        _uploadWrap(user, data, pic, stat);
    }
};

function _uploadWrap(user, data, pic, stat){
    tapi.upload(user, data, pic, 
        function() {
            _showLoading();
            disabledUpload();
        }, 
        function(ev) {
            onprogress(ev, user, stat);
        }, 
        function(data, textStatus, error_code) {
            //processUploadResult(data, textStatus, error_code);

            stat.sendedCount++;
            if(textStatus != 'error' && data && !data.error){
                stat.successCount++;
                $("#accountsForSend li[uniquekey=" + user.uniqueKey +"]").removeClass('sel');
                $("#u_uploadinfo_" + user.uniqueKey).find('.progressInfo').append(' (<span>成功</span>)');
            }else if(data.error){
                _showMsg('error: ' + data.error);
                $("#u_uploadinfo_" + user.uniqueKey).addClass('error').find('.progressInfo').append(' (<span style="color:red">失败</span>)');
            }
            if(stat.successCount >= stat.userCount){//全部发送成功
                _showMsg('发送成功');
                $("#txtContent").val('');
                $("#imgPreview").html('');
                $("#progressBar span").html("");
            }
            if(stat.sendedCount >= stat.userCount){//全部发送完成
                $("#progressBar")[0].style.width = "0%";
                enabledUpload();
                _hideLoading();
                if(stat.successCount > 0){ //有发送成功的
                    setTimeout(callCheckNewMsg, 1000);
                    if(stat.userCount > 1){ //多个用户的
                        _showMsg(stat.successCount + '发送成功，' + (stat.userCount - stat.successCount) + '失败。');
                    }
                }
            }
        }
    );
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


function onprogress(rpe, user, stat){
    if(!user){return;}
    stat.uploaded[user.uniqueKey] = rpe.loaded;
    //$("#progressBar")[0].style.width = ((rpe.loaded * 200 / rpe.total) >> 0) + "px";
    var precent = parseInt((rpe.loaded / rpe.total) * 100);
    $("#u_uploadinfo_" + user.uniqueKey).find(".bar").css('width', precent + "%")
        .end().find(".progressInfo").html("Sent: " + size(rpe.loaded) + " of " + size(rpe.total));
    var allLoaded = 0;
    for(key in stat.uploaded){
        allLoaded += stat.uploaded[key];
    }
    var allPrecent = parseInt((allLoaded / (rpe.total*stat.userCount) ) * 100);
    $("#progressBar")[0].style.width = allPrecent + "%";
    $("#progressBar span").html(allPrecent + "%");
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