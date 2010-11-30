// @author qleelulu@gmail.com

var FAWAVE_BASE_URL = chrome.extension.getURL("");

/* 在页面上显示新信息 */
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if(request.method){
        methodManager[request.method](request, sender, sendResponse);
    }
});

var methodManager = {
    showNewMsgInPage: function(request, sender, sendResponse){
        if(request.msgs && request.msgs.length>0){
            var msg_wrap = $("#fa_wave_msg_wrap");
            if(msg_wrap.length < 1){
                msg_wrap = $('<div id="fa_wave_msg_wrap">\
                                <div class="fawave_btns clearFix">\
	                                <a class="fawave_but fawave_logo"><img src="' + chrome.extension.getURL("icons/icon48.png") + '" />信息提示</a>\
	                                <a href="javascript:void(0)" class="close_fawave_remind fawave_but fr">关闭</a>\
                                </div><div class="fa_wave_list"></div></div>').appendTo('body');
                msg_wrap.find('.close_fawave_remind').click(function(){ close_fawave_remind(); });
                msg_wrap.hover(function(){
                    $("#fa_wave_msg_wrap .fa_wave_list > div").stop(true).css('opacity', '1.0');
                }, function(){
                    $("#fa_wave_msg_wrap .fa_wave_list > div")
                        .animate({opacity: 1.0}, 800)      
                        .fadeOut('slow', function() {
                              $(this).remove();
                              if(!$("#fa_wave_msg_wrap .fa_wave_list").html()){
                                  $("#fa_wave_msg_wrap").hide();
                              }
                          });
                });
            }
            var msg_list_wrap = msg_wrap.find('.fa_wave_list');
            var len = request.msgs.length>5 ? 5 : request.msgs.length;
            var showCount = 0;//已经提示的信息数
            var _msg_user = null;
            for(var i=0; i<request.msgs.length; i++){
                _msg_user = request.msgs[i].user || request.msgs[i].sender;
                if(_msg_user.id != request.userId){
                    showCount += 1;
                    if(showCount == 1){msg_wrap.show();}//有可显示的信息，就显示
                    $(builFawaveTip(request.msgs[i]))
                        .appendTo(msg_list_wrap)
                        .fadeIn('slow')
                        .animate({opacity: 1.0}, 8000)
                        .fadeOut('slow', function() {
                          $(this).remove();
                          if(!msg_list_wrap.html()){
                              msg_wrap.hide();
                          }
                        });
                    if(showCount >= 5){break;}
                }
            }
            if(!msg_list_wrap.html()){
                msg_wrap.hide();
            }
        }
    }
};

function builFawaveTip(msg){
    var user = msg.user || msg.sender;
    var picHtml = '', rtHtml = '';
    if(msg.thumbnail_pic){
        picHtml = '<div><a target="_blank" href="'+msg.original_pic+'"> <img class="imgicon pic" src="' + msg.thumbnail_pic + '" /></a> </div>';
    }
    if(msg.retweeted_status){
        rtHtml =  '<div class="retweeted"><span class="username">' + msg.retweeted_status.user.screen_name + ': </span>'
                + processMsg(msg.retweeted_status.text);
        if(msg.retweeted_status.thumbnail_pic){
            rtHtml += '<div><a target="_blank" href="'+msg.retweeted_status.original_pic+'"> <img class="imgicon pic" src="' + msg.retweeted_status.thumbnail_pic + '" /> </a> </div>';
        }
        rtHtml += '</div>';
    }
    var tp =  '<div class="msgRemind">'
            + '  <div class="usericon">'
            + '	   <img src="' + user.profile_image_url.replace('24x24', '48x48') + '" />'
            + '  </div>'
            + '  <div class="maincontent">'
            + '    <div class="msg">'
            + '       <span class="username">' + user.screen_name + ': </span>'
            +         processMsg(msg.text) + picHtml 
            + '    </div>'
            +      rtHtml
            + '  </div>'
            + '</div>';
    return tp;
};

function close_fawave_remind(){
    $("#fa_wave_msg_wrap .fa_wave_list").html('');
    $("#fa_wave_msg_wrap").hide();
};

/**
 * 处理内容
 */
var processMsg = function (str, notEncode) {
    if(!str){ return ''; }
    if(!notEncode){
        str = HTMLEnCode(str);
    }
    var domain_sina = 'http://t.sina.com.cn';
    var re = new RegExp('(?:\\[url\\s*=\\s*|)((?:www\\.|http[s]?://)[\\w\\.\\?%&\-/#=;:!\\+]+)(?:\\](.+)\\[/url\\]|)', 'ig');
    str = str.replace(re, replaceUrl);
    str = str.replace(/^@([\w\-\u4e00-\u9fa5|\_]+)/g, ' <a target="_blank" href="javascript:getUserTimeline(\'$1\');" rhref="'+ domain_sina +'/n/$1" title="左键查看微薄，右键打开主页">@$1</a>');
    str = str.replace(/([^\w#])@([\w\-\u4e00-\u9fa5|\_]+)/g, '$1<a target="_blank" href="javascript:getUserTimeline(\'$2\');" rhref="'+ domain_sina +'/n/$2" title="左键查看微薄，右键打开主页">@$2</a>');
    str = str.replace(/#([^#]+)#/g, '<a target="_blank" href="'+ domain_sina +'/k/$1" title="Search #$1">#$1#</a>');
    
    //str = str.replace(/\[([\u4e00-\u9fff,\uff1f]{1,4})\]/g, replaceEmotional);
    
    return str;
};

// HTML 编码
function HTMLEnCode(str){
    if(!str){ return ''; }
    str = str.replace(/</ig, '&lt;');
    str = str.replace(/>/ig, '&gt;');
    return str;
};

function replaceUrl(m, g1, g2){
    if(g1.indexOf('http') != 0){
        g1 = 'http://' + g1;
    }
    return '<a target="_blank" href="' + g1 + '" title="' + g1 + '">' + (g2||g1) + '</a>';
};

/*
<li class="tweetItem showCounts_${status.id}" id="tweet${status.id}" did="${status.id}">
	<div class="usericon">
		<a target="_blank" href="" title="">
			<img src="${status.user.profile_image_url.replace('24x24', '48x48')}" />
		</a>
	</div>
	<div class="mainContent">
		<div class="userName">
			<a target="_blank" href="" title="">${status.user.screen_name}</a>
		</div>
		<div class="msg">
			<div class="tweet">${status.text}
				<?py if(status.thumbnail_pic): ?>
				<div>
					<a target="_blank" onclick="showFacebox(this);return false;" href="javascript:void(0);" bmiddle="#{status.bmiddle_pic}" >
						<img class="imgicon pic" src="#{status.thumbnail_pic}" />
					</a>
				</div>
				<?py #endif ?>
			</div>
		</div>
		<div class="retweet"></div>
		<div class="msgInfo">${status.created_at} 通过 #{status.source}</div>
	</div>
</li>
*/


/**
 * 格式化字符串 from tbra
 * eg:
 * 	formatText('{0}天有{1}个小时', [1, 24]) 
 *  or
 *  formatText('{{day}}天有{{hour}}个小时', {day:1, hour:24}}
 * @param {Object} msg
 * @param {Object} values
 */
function fawaveFormatText(msg, values, filter) {
    var pattern = /\{\{([\w\s\.\(\)"',-]+)?\}\}/g;
    return msg.replace(pattern, function(match, key) {
        return jQuery.isFunction(filter) ? filter((values[key] || eval('(values.' +key+')')), key) : (values[key] || eval('(values.' +key+')')); //values[key];
    });	
};
/* 在页面上显示新信息 end */


/* 快速发微博 */
var QUICK_SEND_TEMPLATE = ' \
    <div id="fawaveSendMsgWrap" style="display:none;"> \
        <div class="fawave-model-container">\
            <div class="modal-title" id="modalTitle">快捷发送微博--FaWave(发微)</div> \
            <div class="close"><a href="javascript:" class="fawavemodal-close">x</a></div> \
            <div class="modal-data"> \
                <div>\
                    <input type="checkbox" id="fawave-share-page-chk" /><label for="fawave-share-page-chk">分享当前网页</label>\
                    <span class="fawave-wordCount">140</span>\
                    <textarea id="fawaveTxtContentInp" style="width:100%;" rows="5" ></textarea>\
                </div>\
                <ul id="fawave_accountsForSend"></ul>\
                <div class="fawaveSubmitWarp">\
                    <button id="btnFawaveQuickSend" class="btn-positive" title="Ctrl + 回车 发送">\
                        <img src="/images/tick.png" alt="">发微\
                    </button>\
                    <button class="btn-negative">\
                        <img src="/images/cross.png" alt="">取消\
                    </button>\
                    <span class="fawaveQuickSendTip"></span>\
                </div>\
            <!-- \
                <span class="fawaveUserInfo">\
                    <span></span>\
                    <a target="_blank"><img src="" /></a><img src="" class="blogType" />\
                </span>\
            -->\
            </div> \
            <div class="fawaveInfoMsg"></div>\
        </div>\
    </div>';

QUICK_SEND_TEMPLATE = QUICK_SEND_TEMPLATE.replace('/images/tick.png', chrome.extension.getURL("/images/tick.png"))
                                         .replace('/images/cross.png', chrome.extension.getURL("/images/cross.png"));

var QUICK_SEND_HOT_KEYS = '', QUICK_SEND_HOT_KEYS_COUNT = 0, PRESSED_KEY = [], CURRENT_USER = '', USER_LIST = '';

// 微博字数
String.prototype.len = function(){
	return Math.round(this.replace(/[^\x00-\xff]/g, "qq").length / 2);
};

function fawaveCountInputText(){
    $("#fawaveSendMsgWrap .fawave-wordCount").html(140 - $("#fawaveTxtContentInp").val().len());
};

function showFawaveSendMsg(msg){
    $('<div class="fawaveMessageInfo">' + msg + '</div>')
        .appendTo('#fawaveSendMsgWrap .fawaveInfoMsg')
        .fadeIn('slow')
        .animate({opacity: 1.0}, 5000)
        .fadeOut('slow', function() {
          $(this).remove();
        });
};

function fawaveInitTemplate(){
    if($("#fawaveSendMsgWrap").length){ return; }

    $('body').append(QUICK_SEND_TEMPLATE);

    //initSelectSendAccounts();

    $("#fawaveSendMsgWrap .fawavemodal-close").click(function(){
        //showFawaveAlertMsg('');
        $("#fawaveSendMsgWrap").hide();
    });

    $("#fawaveSendMsgWrap .btn-negative").click(function(){
        $("#fawaveTxtContentInp").val('');
        $("#fawave-share-page-chk").attr("checked", false);
        //showFawaveAlertMsg('');
        $("#fawaveSendMsgWrap").hide();
    });

    $("#fawaveTxtContentInp").bind('keyup', function(){
        fawaveCountInputText();
    });

    $("#fawaveTxtContentInp").keydown(function(event){
        if(event.ctrlKey && event.keyCode==13){
            sendFawaveMsg();
            return false;
        }
    });

    var chkLooking = document.getElementById("fawave-share-page-chk");
    if(chkLooking){
        chkLooking.addEventListener("click", function() {
            fawaveToggleLooking(this);
        }, false);
    }

    var btnSend = document.getElementById("btnFawaveQuickSend");
    if(btnSend){
        btnSend.addEventListener("click", function() {
            sendFawaveMsg();
        }, false);
    }
};

// 初始化用户选择视图, is_upload === true 代表是上传
function initSelectSendAccounts(is_upload){
    if(!USER_LIST || !CURRENT_USER){ return; }
    var afs = $("#fawave_accountsForSend");
    if(afs.data('inited')){
        return;
    }
    var userList = USER_LIST; // userList 的类型是 {} 而不是 []
    var userLength = 0;
    for(var k in userList){ 
        userLength++;
        if(userLength > 1){
            break; //我只想看看是否有多个用户而已，为什么为什么要这么麻烦
        }
    }
    if(userLength < 2){ return; } //多个用户才显示
    var li_tp = '<li class="{{sel}}" uniqueKey="{{uniqueKey}}" >' +
                   '<img src="{{profile_image_url}}" />' +
                   '{{screen_name}}' +
                   '<img src="{{fawave_base_url}}images/blogs/{{blogType}}_16.png" class="blogType" />' +
               '</li>';
    var li = [];
    var c_user = CURRENT_USER;
    for(var i in userList){
        user = userList[i];
        user.fawave_base_url = FAWAVE_BASE_URL;
        if(is_upload === true && tapi.get_config(user).support_upload === false) {
        	continue;
        }
        if(user.uniqueKey == c_user.uniqueKey){
            user.sel = 'sel';
        }else{
            user.sel = '';
        }
        li.push(fawaveFormatText(li_tp, user));
    }
    afs.html('TO: ' + li.join(''));
    afs.data('inited', 'true');
    afs.find('li').click(function(){ toggleSelectSendAccount(this); });
};

function toggleSelectSendAccount(ele){
    var _t = $(ele);
    if(_t.hasClass('sel')){
        if($("#fawave_accountsForSend .sel").length > 1){
            _t.removeClass('sel');
        }
    }else{
        _t.addClass('sel');
    }
};

function fawaveToggleLooking(ele){
    chrome.extension.sendRequest({method:'getLookingTemplate'}, function(response){
        var fawaveLookingTemplate = response.lookingTemplate;
        var loc_url = window.location.href;
        var title = document.title;
        result = fawaveFormatText(fawaveLookingTemplate, {title:(title||''), url:loc_url});
        //countInputText();
        if($(ele).attr('checked')){
            $("#fawaveTxtContentInp").val(result);
        }else{
            $("#fawaveTxtContentInp").val($("#fawaveTxtContentInp").val().replace(result, ''));
        }
        fawaveCountInputText();
    });
};

function sendFawaveMsg(){
    var msg = $.trim($("#fawaveTxtContentInp").val());
    if(!msg){
        showFawaveSendMsg('请输入内容');
        return;
    }
    var users = [], selLi = $("#fawave_accountsForSend .sel");
    if(selLi.length){
        selLi.each(function(){
            var uniqueKey = $(this).attr('uniqueKey');
            var _user = USER_LIST[uniqueKey];
            if(_user){
                users.push(_user);
            }
        });
    }else if(!$("#fawave_accountsForSend li").length){
        users.push(CURRENT_USER);
    }else{
        showFawaveSendMsg('请选择要发送的账号');
        return;
    }
    var stat = {};
    stat.userCount = users.length;
    stat.sendedCount = 0;
    stat.successCount = 0;
    $("#fawaveSendMsgWrap input, #fawaveSendMsgWrap button, #fawaveSendMsgWrap textarea").attr('disabled', true);
    for(var i in users){
        _sendFawaveMsgWrap(msg, users[i], stat, selLi);
    }
};

function _sendFawaveMsgWrap(msg, user, stat, selLi){
    chrome.extension.sendRequest({method:'publicQuickSendMsg', user:user, sendMsg:msg}, function(response){
        stat.sendedCount++;
        var msg = response.msg;
        if(msg && msg.id){
            stat.successCount++;
            $("#fawave_accountsForSend li[uniquekey=" + user.uniqueKey +"]").removeClass('sel');
        }else if(msg && msg.error){
            showFawaveSendMsg('error: ' + msg.error);
        }
        else{
            showFawaveSendMsg(user.screen_name + ' 发送出错.');
        }
        if(stat.successCount >= stat.userCount){//全部发送成功
            selLi.addClass('sel');
            $("#fawaveSendMsgWrap .btn-negative").click();
        }
        if(stat.sendedCount >= stat.userCount){//全部发送完成
            selLi = null;
            $("#fawaveSendMsgWrap input, #fawaveSendMsgWrap button, #fawaveSendMsgWrap textarea").removeAttr('disabled');
            if(stat.successCount > 0){ //有发送成功的
                //setTimeout(callCheckNewMsg, 1000);
                chrome.extension.sendRequest({method:'notifyCheckNewMsg'}, function(response){});
                
                if(stat.userCount > 1){ //多个用户的
                    showFawaveSendMsg(stat.successCount + '发送成功，' + (stat.userCount - stat.successCount) + '失败。');
                }
            }
        }
        user = null;
        stat = null;
    });
};

$(function(){
    
    chrome.extension.sendRequest({method:'getQuickSendInitInfos'}, function(response){
        QUICK_SEND_HOT_KEYS = response.hotkeys;
        QUICK_SEND_HOT_KEYS_COUNT = QUICK_SEND_HOT_KEYS.split(',').length;

        USER_LIST = response.userList;
        CURRENT_USER = response.c_user;
    });

    document.addEventListener("keydown", function(e) {
        if(!QUICK_SEND_HOT_KEYS){ return; }

        PRESSED_KEY.push(e.keyCode);
        if(PRESSED_KEY.length > QUICK_SEND_HOT_KEYS_COUNT){
            PRESSED_KEY.shift();
        }
        if(PRESSED_KEY.toString() == QUICK_SEND_HOT_KEYS ){
            fawaveInitTemplate();
            var fsw = $("#fawaveSendMsgWrap");
            if(fsw.css('display')=='none'){
                //更新用户列表，避免切换用户或者修改用户列表
                chrome.extension.sendRequest({method:'getQuickSendInitInfos'}, function(response){
                    CURRENT_USER = response.c_user;
                    USER_LIST = response.userList;
                    initSelectSendAccounts();
                });
                fsw.show();
                //注意下面三句的顺序，不能乱
                var sText = window.getSelection().toString();
                $("#fawaveTxtContentInp").focus();
                if(sText){ $("#fawaveTxtContentInp").val(sText); }
            }else{
                //showFawaveSendMsg('');
                fsw.hide();
            }
        }
    }, false);
});
/* 快速发微博 end */