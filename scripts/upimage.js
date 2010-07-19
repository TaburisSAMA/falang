
function initOnLoad(){
    init();
};

function init(){

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

function imageFileChange(){
    var fileEle = $("#imageFile")[0];
    var file = fileEle.files[0]
    if(file){
        //
    }
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
    
    var xhr = new XMLHttpRequest();
    var upload = xhr.upload;
    xhr.onreadystatechange = function(){
        if(xhr.readyState==4){
            //
        }
    };

　　if(upload){
        upload.onprogress = function(ev){
            onprogress(ev);
        };
    }
    



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
    builder += msg;
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

    var reader = new FileReader();
    reader.onload = r_loaded;
    reader.readAsBinaryString(file);
    /* Append binary data. 
    builder += file.getAsBinary();
    builder += crlf;*/

    /* Write boundary. 
    builder += dashdash;
    builder += boundary;
    builder += crlf;*/
    
    /* Mark end of the request. 
    builder += dashdash;
    builder += boundary;
    builder += dashdash;
    builder += crlf;*/

    xhr.open("POST", apiUrl.sina.upload, true);
    xhr.setRequestHeader('content-type', 'multipart/form-data; boundary=' + boundary);
    //xhr.setRequestHeader('content-type', 'multipart/form-data');
    xhr.setRequestHeader('Authorization', make_base_auth_header(user.userName, user.password));
    //xhr.sendAsBinary(builder);
    //xhr.send('source='+SOURCE + '&status='+msg);
    
    xhr.onload = function(event) { 
        /* If we got an error display it. */
        if (xhr.responseText) {
            console.log(xhr.responseText);
        }
    };

    function r_loaded(evt) {  
        // Obtain the read file data    
        var fileString = evt.target.result;
      
        /* Append binary data. */
        builder += fileString;
        builder += crlf;

        /* Write boundary. 
        builder += dashdash;
        builder += boundary;
        builder += crlf;*/
        
        /* Mark end of the request. */
        builder += dashdash;
        builder += boundary;
        builder += dashdash;
        builder += crlf;

        //xhr.sendAsBinary(builder);     
        xhr.send(builder);
    }










/*
    var btn, txt, data;
    if(isReply){
        btn = $("#replySubmit");
        txt = $("#replyTextarea");
        var userName = $("#ye_dialog_title").text();
        msg = userName + ' ' + msg;
        var tweetId = $("#replyTweetId").val();
        data = {sina_id: tweetId};
    }else{
        btn = $("#btnSend");
        txt = $("#txtContent");
        data = {};
    }
    
    btn.attr('disabled','true');
    txt.attr('disabled','true');
    data['status'] = msg;
    sinaApi.update(data, function(sinaMsg, textStatus){
        if(sinaMsg.id){
            if(isReply){
                hideReplyInput();
            }else{
                hideMsgInput();
            }
            txt.val('');
            setTimeout(callCheckNewMsg, 1000);
            showMsg('发送成功！');
        }else if(sinaMsg.error){
            showMsg('error: ' + sinaMsg.error);
        }
        btn.removeAttr('disabled');
        txt.removeAttr('disabled');
    }); */
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
    $("#progressBar")[0].style.width = ((rpe.loaded * 200 / rpe.total) >> 0) + "px";
};

function size(bytes){   // simple function to show a friendly size
    var i = 0;
    while(1023 < bytes){
        bytes /= 1024;
        ++i;
    };
    return  i ? bytes.toFixed(2) + ["", " Kb", " Mb", " Gb", " Tb"][i] : bytes + " bytes";
};
