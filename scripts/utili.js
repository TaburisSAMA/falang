// @author qleelulu@gmail.com

var PAGE_SIZE = 20;
var COMMENT_PAGE_SIZE = 8;

var SINA = 'idi_sina';

var UNSEND_TWEET_KEY = 'idi_UNSEND_TWEET_KEY';//未发送的tweet，保存下次显示

var FRIENDS_TIMELINE_KEY = 'idi_friends_timeline';
var REPLIES_KEY = 'idi_replies';
var MESSAGES_KEY = 'idi_messages';

var USER_LIST_KEY = 'idi_userlist';
var CURRENT_USER_KEY = 'idi_current_user';
var REFRESH_TIME_KEY = 'idi_REFRESH_TIME_KEY';

var LAST_MSG_ID = 'idi_last_msg_id';

var LOCAL_STORAGE_NUM_KEY = 'idi_LOCAL_STORAGE_NUM_KEY';
var LOCAL_STORAGE_NEW_TWEET_LIST_KEY = 'idi_LOCAL_STORAGE_NEW_TWEET_LIST_KEY';
var LOCAL_STORAGE_TWEET_LIST_HTML_KEY = 'idi_LOCAL_STORAGE_TWEET_LIST_HTML_KEY';

var UNREAD_TIMELINE_COUNT_KEY = 'idi_UNREAD_TIMELINE_COUNT_KEY';

var AUTO_SHORT_URL = 'idi_SHORT_URL';//是否缩短URL
var AUTO_SHORT_URL_WORD_COUNT = 'idi_SHORT_URL_WORD_COUNT'; //URL长度超过多少自动缩短

var SET_BADGE_TEXT = 'idi_SET_BADGE_TEXT'; //设置未读信息提示
var IS_SHOW_IN_PAGE = 'idi_IS_SHOW_IN_PAGE_'; //新消息是否在页面提示
var IS_SYNC_TO_PAGE_KEY = 'idi_IS_SYNC_TO_PAGE_KEY'; //已读消息是否和新浪微博页面同步

var THEME_KEY = 'idi_THEME_KEY'; //主题样式的KEY
var THEME_LIST = {'default':'default', 'simple':'simple', 'pip_io':'pip_io'}; //主题列表

var FONT_KEY = 'idi_FONT_KEY'; //字体样式的KEY
var FONT_SIZE_KEY = 'idi_FONT_SIZE_KEY'; //字体大小的KEY

var WIDTH_AND_HEIGHT_KEY = 'idi_WIDTH_AND_HEIGHT_KEY'; //宽高
var DEFAULT_WIDTH_AND_HEIGHT = [480, 520]; //默认宽高

var TP_LOOKING_KEY = 'idi_TP_LOOKING_KEY'; //我正在看的模板key

//['friends_timeline','mentions','comments_timeline','comments_by_me','direct_messages','favorites']
var T_LIST = ['friends_timeline','mentions','comments_timeline','direct_messages']; //timeline的分类列表


function showMsg(msg){
    var popupView = getPopupView();
    if(popupView){
        popupView._showMsg(msg);
    }
};
function _showMsg(msg){
    $('<div class="messageInfo">' + msg + '</div>')
    .appendTo('#msgInfoWarp')
    .fadeIn('slow')
    .animate({opacity: 1.0}, 3000)
    .fadeOut('slow', function() {
      $(this).remove();
    });
};

function showLoading(){
    var popupView = getPopupView();
    if(popupView){
        popupView._showLoading();
    }
};

function hideLoading(){
    var popupView = getPopupView();
    if(popupView){
        popupView._hideLoading();
    }
};

///获取在本地保存的信息数
function getCacheCount(){
    var count = localStorage.getObject(LOCAL_STORAGE_NUM_KEY);
    if(!count){
        count = 200;//默认值
    }
    return count;
};

///获取当前登陆用户信息
function getUser(){
//    if(window.c_user){
//        return window.c_user;
//    }else{
        var c_user = localStorage.getObject(CURRENT_USER_KEY);
        if(c_user && c_user.userName){
            //window.c_user = c_user;
        }else{
            var userList = localStorage.getObject(USER_LIST_KEY);
            if(userList){
                for(key in userList){
                    c_user = userList[key];
                    if(c_user){
                        setUser(c_user);
                        break;
                    }
                }
            }
        }
        return c_user;
//    }

};
//设置当前登陆用户
function setUser(user){
    localStorage.setObject(CURRENT_USER_KEY, user);
    window.c_user = user;
};

function getUnreadTimelineCount(t){
    var count = localStorage.getObject(getUser().userName + t + UNREAD_TIMELINE_COUNT_KEY);
    if(!count){
        count = 0;
    }
    return count;
};

function setUnreadTimelineCount(count, t, setBadgeText){
    setBadgeText = isSetBadgeText(t);
    count += getUnreadTimelineCount(t);
    localStorage.setObject(getUser().userName + t + UNREAD_TIMELINE_COUNT_KEY, count);
    if(setBadgeText){
        var total = 0;
        for(i in T_LIST){
            if(isSetBadgeText(T_LIST[i])){
                total += getUnreadTimelineCount(T_LIST[i]);
            }
        }
        if(total > 0){
            total = total.toString();
            chrome.browserAction.setBadgeText({text: total});
        }
    }
    chrome.browserAction.setTitle({title:getTooltip()});
};

function removeUnreadTimelineCount(t){
    localStorage.setObject(getUser().userName + t + UNREAD_TIMELINE_COUNT_KEY, 0);
    if(getIsSyncUnread()){ //如果同步未读数
        syncUnreadCountToSinaPage(t);
    }
    var total = 0;
    for(i in T_LIST){
        if(T_LIST[i]==t){
            continue;
        }
        if(isSetBadgeText(T_LIST[i])){
            total += getUnreadTimelineCount(T_LIST[i]);
        }
    }
    if(total > 0){
        total = total.toString();
        chrome.browserAction.setBadgeText({text: total});
    }else{
        chrome.browserAction.setBadgeText({text: ''});
    }
    chrome.browserAction.setTitle({title:getTooltip()});
};

//将新浪微博页面的未读信息数清零
function syncUnreadCountToSinaPage(t){
    var tl_type = false;
    switch(t){
        case 'comments_timeline':
            tl_type = 1;
            break;
        case 'mentions':
            tl_type = 2;
            break;
        case 'direct_messages':
            tl_type = 3;
            break;
        case 'followers':
            tl_type = 4;
            break;
    }
    if(tl_type){
        sinaApi.reset_count({'type':tl_type}, function(users, textStatus, statuCode){
            //TODO: reset success
        });
    }
};

function getTooltip(){
    var c_user = getUser();
    var u = '';
    if(c_user){
        u = (c_user.screen_name||c_user.userName) + ' 的';
    }
    var tip = u + '发微(FaWave)\r\n'
            + '新微博: ' + getUnreadTimelineCount('friends_timeline') + ',    '
            + '新@我: ' + getUnreadTimelineCount('mentions') + '\r\n'
            + '新评论: ' + getUnreadTimelineCount('comments_timeline') + ',    '
            + '新私信: ' + getUnreadTimelineCount('direct_messages');
    return tip;
};

//===>>>>>>>>>>>>>>>>>>>>>>>
function setLastMsgId(id, t){
    localStorage.setObject(getUser().userName + t + LAST_MSG_ID, id);
}

function getLastMsgId(t){
    return localStorage.getObject(getUser().userName + t + LAST_MSG_ID);
}

//<<<<<<<<<<<<<<<<=========

//====>>>>>>>>>>>
function isAutoShortUrl(){
    var asu = localStorage.getObject(AUTO_SHORT_URL);
    if(!asu || asu == 0){
        return false;
    }
    return true;
}

function getAutoShortUrlWordCount(){
    var c = localStorage.getObject(AUTO_SHORT_URL_WORD_COUNT);
    if(c && c>1){
        return c;
    }
    return 15; //默认值
}
//<<<<<<<<<<<====

//-- 未读提示 --
function isSetBadgeText(t){
    return localStorage.getObject(t + SET_BADGE_TEXT) === 0 ? false : true;
};

function setSetBadgeText(t, v){
    return localStorage.setObject(t + SET_BADGE_TEXT, v);
};
//<<--

//-- 在页面提示新消息 --
function isShowInPage(t){
    return localStorage.getObject(t + IS_SHOW_IN_PAGE) === 0 ? false : true;
};

function setShowInPage(t, v){
    return localStorage.setObject(t + IS_SHOW_IN_PAGE, v);
};
//<<--

//-- 主题 --
function getTheme(){
    var t = localStorage.getObject(THEME_KEY);
    if(t){
        if(THEME_LIST[t]){
            return t;
        }
    }
    return 'default';
};

function setTheme(theme){
    localStorage.setObject(THEME_KEY, theme);
};
//<<--

//-- 我正在看模板 --
function getLookingTemplate(){
    var t = localStorage.getObject(TP_LOOKING_KEY);
    return t || '我正在看: {{title}} {{url}} ';
};

function setLookingTemplate(tp){
    localStorage.setObject(TP_LOOKING_KEY, tp);
};
//<<--

//-- 字体 --
function getFont(){
    var t = localStorage.getObject(FONT_KEY);
    return t || '微软雅黑';
};

function setFont(font){
    localStorage.setObject(FONT_KEY, font);
};

function getFontSize(){
    var t = localStorage.getObject(FONT_SIZE_KEY);
    return t || '12';
};

function setFontSize(fontSize){
    localStorage.setObject(FONT_SIZE_KEY, fontSize);
};
//<<--

//-- 未读提示同步 --
function getIsSyncUnread(){
    var t = localStorage.getObject(IS_SYNC_TO_PAGE_KEY);
    return t || 0;
};

function setIsSyncUnread(is_sync){
    localStorage.setObject(IS_SYNC_TO_PAGE_KEY, is_sync);
};
//<<--

//-- 宽高设置 --
function getWidthAndHeight(){
    var wh = localStorage.getObject(WIDTH_AND_HEIGHT_KEY);
    return wh || DEFAULT_WIDTH_AND_HEIGHT;
};

function setWidthAndHeight(width, height){
    width = Number(width);
    height = Number(height);
    if(isNaN(width) || width<300){
        width = DEFAULT_WIDTH_AND_HEIGHT[0];
    }
    if(isNaN(height) || height<350){
        height = DEFAULT_WIDTH_AND_HEIGHT[1];
    }
    var wh = [width, height];
    localStorage.setObject(WIDTH_AND_HEIGHT_KEY, wh);
    return wh;
};
//<<--

function setThteme(v){
    return localStorage.setObject(THEME_KEY, v);
};
//<<--

function getRefreshTime(){
    var t = localStorage.getObject(REFRESH_TIME_KEY);
    if(t){
        t = Number(t);
        if(isNaN(t)){
            t = 3;
        }
        t = t * 1000 * 60;
    }else{
        t = 3 * 1000 * 60;//默认3分钟
    }
    return t;
}

//====>>>>>>>>>>>>>>>>>>
function getBackgroundView(){
    var b = chrome.extension.getBackgroundPage();
    if(b){
        return b;
    }else{
        var views = chrome.extension.getViews();
        for (var i = 0; i < views.length; i++) {
            var view = views[i];
            if (view.theViewName && view.theViewName == 'background') {
                return view;
            }
        }
    }
    return null;
};

function getPopupView(){
    var p = chrome.experimental.extension.getPopupView();
    if(p){
        return p;
    }else{
        var views = chrome.extension.getViews();
        for (var i = 0; i < views.length; i++) {
            var view = views[i];
            if (view.theViewName && view.theViewName == 'popup') {
                return view;
            }
        }
    }
    return null;
};
//<<<<<<<<<<<<<<<<=====


//格式化时间输出。示例：new Date().format("yyyy-MM-dd hh:mm:ss");
Date.prototype.format = function(format)
{
	var o = {
		"M+" : this.getMonth()+1, //month
		"d+" : this.getDate(),    //day
		"h+" : this.getHours(),   //hour
		"m+" : this.getMinutes(), //minute
		"s+" : this.getSeconds(), //second
		"q+" : Math.floor((this.getMonth()+3)/3), //quarter
		"S" : this.getMilliseconds() //millisecond
	};
	if(/(y+)/.test(format)) {
		format=format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
	}

	for(var k in o) {
		if(new RegExp("("+ k +")").test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
		}
	}
	return format;
};

//存储
Storage.prototype.setObject = function(key, value) {
    //alert(JSON.stringify(value));
    this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObject = function(key) {
    var v = this.getItem(key);
    if(v)
    {
        try{
            v = JSON.parse(v);
        }
        catch(err){
            v = null;
        }
    }
    return v;
};

/**
 * 格式化字符串 from tbra
 * eg:
 * 	formatText('{0}天有{1}个小时', [1, 24]) 
 *  or
 *  formatText('{{day}}天有{{hour}}个小时', {day:1, hour:24}}
 * @param {Object} msg
 * @param {Object} values
 */
function formatText(msg, values, filter) {
    var pattern = /\{\{([\w\s\.\(\)"',-]+)?\}\}/g;
    return msg.replace(pattern, function(match, key) {
        return jQuery.isFunction(filter) ? filter((values[key] || eval('(values.' +key+')')), key) : (values[key] || eval('(values.' +key+')')); //values[key];
    });	
};

// HTML 编码
function HTMLEnCode(str){
    /*
    var _div = document.createElement('div');
    var _text = document.createTextNode(str);
    _div.appendChild(_text);
    return _div.innerHTML; */
    if(!str){ return ''; }
    str = str.replace(/</ig, '&lt;');
    str = str.replace(/>/ig, '&gt;');
    return str;
};

///UBB内容转换
function ubbCode(str)	{
    var result = "";
    if(str != ""){
        var tmp;
        var reg = new RegExp("(^|[^/=\\]'\">])((www\\.|http[s]?://)[\\w\\.\\?%&\\-/#=;!\\+]+)","ig");
        var reg2 = new RegExp("\\[url=((www\\.|http[s]?://)[\\w\\.\\?%&\\-/#=;:!\\+]+)](.+)\\[/url]","ig");
        result = str;
        tmp = reg.exec(result);
        if (tmp && tmp.length>0){
            result = result.replace(reg,"<a href='" + tmp[2] + "' target='_blank'>" + tmp[2] + "</a>");
        }
        tmp = reg2.exec(result);
        //trace(result);
        if (tmp && tmp.length>0){
            result = result.replace(reg2,"<a href='" + tmp[1] + "' target='_blank'>" + tmp[3] + "</a>");
        }
    }
    reg = null;
    reg2 = null;
    return result;
};

var _u = {
    //向页面写内容
    w: function(s){
        return document.write(s);
    },
    //获取本地化语言
    i18n: function(s, e){
        var re = chrome.i18n.getMessage(s, e);
        if(re){
            return re;
        }else{
            return s;
        }
    }
};

//在Chrome上输出log信息，用于调试
function log(msg){
    console.log(msg);
};