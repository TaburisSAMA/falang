// @author qleelulu@gmail.com

// 检测是否支持文件上传
function checkChrome(){
    if(!isSupportUpload()){
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
	// 判断是否截图
    var params = decodeForm(window.location.search);
    var is_upload = true;
    if(params.image_url) {
    	is_upload = false;
    }
	initSelectSendAccounts(is_upload);
	initTxtContentEven();
    $("#txtContent").focus();
    at_user_autocomplete('#txtContent');
    $(window).unload(function(){ initOnUnload(); });
    // 文件拖动
    $("#imageFile")[0].addEventListener('dragenter', function(){
    	$("#uploadForm .dragFile").addClass('drag_on');
    }, false);
    $("#imageFile")[0].addEventListener('dragleave', function(){
    	$("#uploadForm .dragFile").removeClass('drag_on');
    }, false);
    $("#imageFile")[0].addEventListener('drop', function(){
    	$("#uploadForm .dragFile").removeClass('drag_on');
    }, false);
    // 设置自动关闭选项的上次状态
    var checked = Settings.get().sent_success_auto_close;
    $('#cb_success_close').change(function() {
        var settings = Settings.get();
        settings.sent_success_auto_close = $(this).attr('checked') ? true : false;
        Settings.save();
    }).attr('checked', checked);
    
	$("#txtContent")[0].onpaste = null;
    window.document.onpaste = function(e){
        var f = null,
            items = e.clipboardData &&
				e.clipboardData.items;
        items = items || [];
		for(var i=0; i<items.length; i++){
            if(items[i].kind == 'file'){
                f = items[i].getAsFile();
                break;
            }
        }
        if(f){
            selectFile({files:[f]});
        }
    };
    
    if(params.tabId) {
    	//$('#uploadForm').hide();
    	chrome.tabs.get(parseInt(params.tabId), function(tab) {
    		// 设置标题和缩短网址
    		var title = tab.title || '';
    		var loc_url = tab.url;
            var $txt = $("#txtContent");
            var settings = Settings.get();
            $txt.val(formatText(settings.lookingTemplate, {title: title, url: loc_url})).focus();
            countInputText();
            _shortenUrl(loc_url, settings, function(shorturl){
	            if(shorturl) {
	                $txt.val($txt.val().replace(loc_url, shorturl)).focus();
	            }
	        });
            // 截图
    		chrome.tabs.captureVisibleTab(tab.windowId, {format: 'png'}, function(dataurl) {
        		$("#imgPreview").html('<img class="pic" src="' + dataurl + '" />');
        	});
    	});
    } else if(params.image_url) {
    	// 有图片
    	var $txt = $("#txtContent");
        var settings = Settings.get();
        countInputText();
        var source_url = params.image_url;
        $("#imgPreview").html('<img class="pic" src="' + source_url + '" />');
        $('#imageUrl').val(source_url);
        if(source_url.indexOf('126.fm') >= 0) {
        	// 163的图片需要先还原
        	ShortenUrl.expand(source_url, function(data) {
        		var longurl = data.url || data;
        		if(longurl) {
        			$('#imageUrl').val(longurl);
        		}
        	});
        } else {
        	_shortenUrl(source_url, settings, function(shorturl){
                if(shorturl) {
                	//$txt.val($txt.val().replace(source_url, shorturl)).focus();
                	$('#imgPreview img').attr('short_url', shorturl);
                }
            });
        }
        
        //$('#uploadForm').hide();
    }
};

var TP_USER_UPLOAD_INFO = '<li id="u_uploadinfo_{{uniqueKey}}">'
    + '<img src="{{profile_image_url}}">{{screen_name}}<img src="/images/blogs/{{blogType}}_16.png" class="blogType">: '
    + '<span class="barWrap"><strong class="bar" style="width: 10%;"><span></span></strong></span>'
    + '<span class="progressInfo"></span>'
    + '</li>';

function sendMsg(){ //覆盖popup.js的同名方法
    var c_user = getUser();
    if(!c_user){
        _showMsg(_u.i18n("msg_need_add_account"));
        check = false;
    }
    var msg = $.trim($("#txtContent").val());
    if(!msg){
        _showMsg(_u.i18n("msg_need_content"));
        check = false;
    }
    var file = $("#imageFile").length > 0 ? $("#imageFile")[0].files[0] : null;
    if(!file) {
    	var image_url = $('#imageUrl').val();
    	if(image_url) {
    		file = getImageBlob(image_url);
    	} else {
    		var dataUrl = $('#imgPreview img').attr('src');
    		if(dataUrl) {
    			file = dataUrlToBlob(dataUrl);
    		} else {
    			// 判断是否长微博
    			var longtext = $('#longtext').val();
    			if(longtext) {
    				file = dataUrlToBlob(LongTextPage.get_data_url());
    			}
    		}
    	}
    }
    
    // 检测是否含有文件，如果没有图片又没有上传过文件，则提示
    if(!file && $('#imageFileWrap').attr('uploaded') !== '1') {
        _showMsg(_u.i18n("msg_need_file_or_pic"));
        return;
    }
	
    var users = [], selLi = $("#accountsForSend .sel");
    if(selLi.length){
        selLi.each(function(){
            var uniqueKey = $(this).attr('uniqueKey');
            var _user = getUserByUniqueKey(uniqueKey, 'send');
            if(_user){
                users.push(_user);
            }
        });
    }else if(!$("#accountsForSend li").length){
        users.push(c_user);
    }else{
        _showMsg(_u.i18n("msg_need_select_account"));
        return;
    }
    var upInfo = $("#uploadinfo").html(''), stat = {uploaded:[]};
    stat.userCount = users.length;
    stat.sendedCount = 0;
    stat.successCount = 0;
    var matchs = tapi.findSearchText(c_user, msg);
    for(var i in users){
        var user = users[i];
        var config = tapi.get_config(user);
        var pic = {file: file};
        var status = msg;
        // 处理主题转化
    	if(matchs.length > 0 && c_user.blogType !== user.blogType) {
    		for(var j = 0; j < matchs.length; j++) {
    			var match = matchs[j];
    			status = status.replace(match[0], tapi.formatSearchText(user, match[1]));
    		}
    	}
        if(config.support_upload && pic.file) {
        	upInfo.append(TP_USER_UPLOAD_INFO.format(user));
        	_uploadWrap(user, status, pic, stat, selLi);
        } else { // only support update
        	_updateWrap(user, status, stat, selLi);
        }
    }
};

function _finish_callback(user, stat, selLi, data, textStatus, error_code) {
    stat.sendedCount++;
    if(textStatus != 'error' && data && !data.error){
        stat.successCount++;
        $("#accountsForSend li[uniquekey=" + user.uniqueKey +"]").removeClass('sel');
        $("#u_uploadinfo_" + user.uniqueKey).find('.progressInfo').append(' (<span>'+ _u.i18n("comm_success") +'</span>)');
    }else if(data.error){
        _showMsg('error: ' + data.error);
        $("#u_uploadinfo_" + user.uniqueKey).addClass('error').find('.progressInfo').append(' (<span style="color:red">'+ _u.i18n("comm_fail") +'</span>)');
    }
    if(stat.successCount >= stat.userCount){//全部发送成功
        _showMsg(_u.i18n("msg_send_success"));
        selLi.addClass('sel');
        var ifw = $("#imageFileWrap");
        ifw.html(ifw.html());
        $("#txtContent").val('');
        $("#btnSend").attr('disabled', true);
        $("#imgPreview").html('');
        $("#imageUrl").val('');
        $("#progressBar span").html("");
        $('#longtext').val('');
        if($('#cb_success_close').attr('checked')) {
            window.close();
        }
    }
    if(stat.sendedCount >= stat.userCount){//全部发送完成
        selLi = null;
        $("#progressBar")[0].style.width = "0%";
        enabledUpload();
        _hideLoading();
        if(stat.successCount > 0){ //有发送成功的
            setTimeout(callCheckNewMsg, 1000);
            var failCount = stat.userCount - stat.successCount;
            if(stat.userCount > 1 && failCount > 0){ //多个用户的
                _showMsg(_u.i18n("msg_send_complete").format({successCount:stat.successCount, errorCount:failCount}));
            }
        }
    }
};

function _updateWrap(user, status, stat, selLi){
	// 增加图片链接
	var image_url = $('#imgPreview img').attr('short_url') || $('#imgPreview img').attr('src');
	if(image_url) {
		var config = tapi.get_config(user);
		status += config.image_shorturl_pre + image_url;
	}
	tapi.update({user: user, status: status}, function(result_data, status_code, error_code) {
		_finish_callback(user, stat, selLi, result_data, status_code, error_code);
	});
};

function _uploadWrap(user, status, pic, stat, selLi){
    tapi.upload(user, {status: status}, pic, 
        function() {
            _showLoading();
            disabledUpload();
        }, 
        function(ev) {
            onprogress(ev, user, stat);
        }, 
        function(data, textStatus, error_code) {
        	_finish_callback(user, stat, selLi, data, textStatus, error_code);
        }
    );
};

var FILECHECK = {
	maxFileSize: 10*1024000,
	maxImageSize: 2*1024000,
    fileTypes: '__image/gif__image/jpeg__image/jpg__image/png__'
};

function checkImage(file){
    var check = true;
    if(file){
        if(file.size > FILECHECK.maxImageSize){
            _showMsg(_u.i18n("msg_pic_too_large"));
            check = false;
        }
        if(file.type && FILECHECK.fileTypes.indexOf('__' + file.type + '__') < 0){
            _showMsg(_u.i18n("msg_pic_type_error"));
            check = false;
        }
    }else{
        //_showMsg(_u.i18n("msg_need_pic"));
        check = false;
    }
    return check;
};

function handleFile(file, handle_image) {
    if(file) {
        if(file.size > FILECHECK.maxFileSize){
            _showMsg(_u.i18n("msg_file_too_large"));
            return true;
        }
        if(!handle_image && file.type && FILECHECK.fileTypes.indexOf('__' + file.type + '__') >= 0){
            return false;
        }
        var settings = Settings.get()
          , user = settings.vdisk_user;
        if(!user) {
            // 提示用戶綁定帳號
            return false;
        }
        disabledUpload();
        VDiskAPI.upload(user, file, function(err, result) {
            enabledUpload();
            resetFileUpload();
            $("#progressBar")[0].style.width = "0%";
            $("#progressBar span").html("");
            if(err) {
                return _showMsg(err.message);
            }
            var url = result.download_page;
            var $txt = $('#txtContent'), text = $txt.val();
            if(text) {
                text += ' ';
            }
            $txt.val(text + file.fileName + ' ' + url).focus();
            $('#imageFileWrap').attr('uploaded', '1');
            _shortenUrl(url, settings, function(shorturl) {
                if(shorturl) {
                    $txt.val($txt.val().replace(url, shorturl));
                }
            });
        }, function onprogress(rpe){
            var precent = parseInt((rpe.loaded / rpe.total) * 100);
            $("#progressBar")[0].style.width = precent + "%";
            $("#progressBar span").html(precent + "%");
        });
        return true;
    }
    return false;
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


function selectFile(fileEle, file_only){
	$("#uploadForm .dragFile").removeClass('drag_on');
    var file = fileEle.files[0];
    $("#progressBar")[0].style.width = "0%";
    $("#progressBar span").html("");
    if(file){
        if(handleFile(file, file_only)) {
            // 已经被处理
            return;
        }
        $("#imgPreview").html('');
        $('#imageUrl').val('');
        var check = checkImage(file);
        if(check){
            var reader = new FileReader();
            reader.onload = function(e){
                $("#imgPreview").html('<img class="pic" src="' + e.target.result + '" />');
            };
            reader.readAsDataURL(file);
        }
    } else {
        $("#imgPreview").html('');
        $('#imageUrl').val('');
    }
};

function selectUrl(ele){
    var url = $(ele).val();
    $("#imgPreview").html('');
    resetFileUpload();
    $('#imageUrl').val(url);
    $("#progressBar")[0].style.width = "0%";
    $("#progressBar span").html("");
    if(url){
    	$("#imgPreview").html('<img class="pic" src="' + url + '" />');
    }
};

function disabledUpload(){
    $("#btnSend").attr('disabled', true);
    $("#imageFile").attr('disabled', true);
    $("#imageUrl").attr('disabled', true);
};

function enabledUpload(){
    $("#btnSend").removeAttr('disabled');
    $("#imageFile").removeAttr('disabled');
    $("#imageUrl").removeAttr('disabled');
};

function resetFileUpload() {
    var $parent = $('#imageFile').parent();
    var clone = $('#imageFile').clone();
    $('#imageFile').remove();
    $parent.append(clone);
}