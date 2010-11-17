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
    $("#txtContent").focus();

    initTxtContentEven();

    initIamDoing();

    $(window).unload(function(){ initOnUnload(); }); 
};

function initTxtContentEven(){
//>>>发送微博开始<<<
    var unsendTweet = localStorage.getObject(UNSEND_TWEET_KEY);
    if(unsendTweet){
        $("#txtContent").val(unsendTweet);
        //showMsgInput();
        //countInputText();
    }

    $("#txtContent").keyup(function(){
        var c = $(this).val();
        countInputText();
        //if(c){
        //    showMsgInput();
        //}
    });

    $("#txtContent").focus(function(){
        showMsgInput();
        countInputText();
    });

    $("#txtContent").keydown(function(event){
        var c = $.trim($(this).val());
        if(event.ctrlKey && event.keyCode==13){
            if(c){
                sendSinaMsg(c);
            }else{
                _showMsg('请输入要发送的内容');
            }
            return false;
        }
    });

    $("#btnSend").click(function(){
        sendSinaMsg();
    });
//>>>发送嘀咕结束<<<
};


function sendSinaMsg(){

    var check = true;
    var user = localStorage.getObject(CURRENT_USER_KEY);
    if(!user){
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

    var boundary = '----multipartformboundary' + (new Date).getTime();
    var dashdash = '--';
    var crlf     = '\r\n';

    /* Build RFC2388 string. */
    var builder = '';

    builder += dashdash;
    builder += boundary;
    builder += crlf;

    /* Generate headers. [SOURCE KEY] */            
    builder += 'Content-Disposition: form-data; name="source"';
    builder += crlf;
    builder += crlf; 

    /* Append form data. */
    builder += SOURCE;
    builder += crlf;

    /* Write boundary. */
    builder += dashdash;
    builder += boundary;
    builder += crlf;

    /* Generate headers. [STATUS] */            
    builder += 'Content-Disposition: form-data; name="status"';
    builder += crlf;
    builder += crlf; 

    /* Append form data. */
    builder += encodeURIComponent(msg);
    builder += crlf;

    /* Write boundary. */
    builder += dashdash;
    builder += boundary;
    builder += crlf;

    /* Generate headers. [PIC] */            
    builder += 'Content-Disposition: form-data; name="pic"';
    if (file.fileName) {
      builder += '; filename="' + file.fileName + '"';
    }
    builder += crlf;

    builder += 'Content-Type: '+file.type;
    builder += crlf;
    builder += crlf; 

    //var reader = new FileReader();
    //reader.onload = r_loaded;
    //reader.readAsBinaryString(file);
    /* Append binary data.
    builder += file.getAsBinary();
    builder += crlf;*/ 

    
    var bb = new BlobBuilder(); //NOTE
    bb.append(builder);
    bb.append(file);
    builder = crlf;
    
    /* Mark end of the request.*/ 
    builder += dashdash;
    builder += boundary;
    builder += dashdash;
    builder += crlf;

    bb.append(builder);
    
    _showLoading();
    disabledUpload();

    $.ajax({
        url: apiUrl.sina.upload,
        username: user.userName,
        password: user.password,
        cache: false,
        timeout: 5*60*1000, //5分钟超时
        type : 'post',
        data: bb.getBlob(),
        dataType: 'text',
        contentType: 'multipart/form-data; boundary=' + boundary,
        processData: false,
        beforeSend: function(req) {
            req.setRequestHeader('Authorization', make_base_auth_header(user.userName, user.password));
            if(req.upload){
                req.upload.onprogress = function(ev){
                    onprogress(ev);
                };
            }
        },
        success: function (data, textStatus) {
            try{
                data = JSON.parse(data);
            }
            catch(err){
                //data = null;
                data = {error:'服务器返回结果错误，本地解析错误。', error_code:500};
                textStatus = 'error';
            }
            var error_code = null;
            if(data){
                if(data.error || data.error_code){
                    _showMsg('error: ' + data.error + ', error_code: ' + data.error_code);
                    error_code = data.error_code || error_code;
                }
            }else{error_code = 400;}
            processUploadResult(data, textStatus, error_code);
            _hideLoading();
        },
        error: function (xhr, textStatus, errorThrown) {
            var r = null, status = 'unknow';
            if(xhr){
                if(xhr.status){
                    status = xhr.status;
                }
                if(xhr.responseText){
                    var r = xhr.responseText
                    try{
                        r = JSON.parse(r);
                    }
                    catch(err){
                        r = null;
                    }
                    if(r){_showMsg('error_code:' + r.error_code + ', error:' + r.error);}
                }
            }
            if(!r){
                textStatus = textStatus ? ('textStatus: ' + textStatus + '; ') : '';
                errorThrown = errorThrown ? ('errorThrown: ' + errorThrown + '; ') : '';
                _showMsg('error: ' + textStatus + errorThrown + 'statuCode: ' + status);
            }
            processUploadResult({}, 'error', status); //不管什么状态，都返回 error
            _hideLoading();
        }
    });

    /*var xhr = new XMLHttpRequest();
    var upload = xhr.upload;

　　if(upload){
        upload.onprogress = function(ev){
            onprogress(ev);
        };
    }

    xhr.onreadystatechange = function(){
        if(xhr.readyState==4){
            if(xhr.status==200) //http状态200表示OK
            {
                _showMsg('发送成功');
                processUploadResult(xhr);
            }
            else //http返回状态失败
            {
                _showMsg("发送失败。服务端返回状态" + req.statusText);
            }
            $("#btnSend").removeAttr('disabled');
        }
    };

    xhr.open("POST", apiUrl.sina.upload, true);
    xhr.setRequestHeader('content-type', 'multipart/form-data; boundary=' + boundary);
    xhr.setRequestHeader('Authorization', make_base_auth_header(user.userName, user.password));
    //xhr.sendAsBinary(builder);
    //$("#btnSend").attr('disabled', true);
    //xhr.send(bb.getBlob());
    
    xhr.onload = function(event) { 
        if (xhr.responseText) {
            //console.log(xhr.responseText);
        }
    }; */
};

var FILECHECK = {maxFileSize: 1024000,
                 fileTypes: '__image/gif__image/jpeg__image/jpg__image/png__',
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

function processUploadResult(tweet, textStatus, statusCode){
    if(textStatus != 'error' && tweet && !tweet.error){
        _showMsg('发送成功');
        $("#txtContent").val('');
        $("#imgPreview").html('');
        $("#progressInfo").html('');
        $("#progressBar")[0].style.width = "0%";
        $("#progressBar span").html("");
    }else{
    }
    enabledUpload();
};


function disabledUpload(){
    $("#btnSend").attr('disabled', true);
    $("#imageFile").attr('disabled', true);
};

function enabledUpload(){
    $("#btnSend").removeAttr('disabled');
    $("#imageFile").removeAttr('disabled');
}