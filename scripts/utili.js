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
var QUICK_SEND_HOT_KEY_KEY = 'idi_QUICK_SEND_HOT_KEY_KEY'; //快速发送热键key
var ALERT_MODE_KEY = 'idi_ALERT_MODE_KEY'; //信息提醒模式key

//['friends_timeline','mentions','comments_timeline','comments_by_me','direct_messages','favorites']
//需要不停检查更新的timeline的分类列表
var T_LIST = {
	'all': ['friends_timeline','mentions','comments_timeline','direct_messages'],
	'digu': ['friends_timeline','mentions', 'direct_messages']
};
T_LIST.tsina = T_LIST.tsohu = T_LIST.all;
T_LIST.renjian = T_LIST.zuosa = T_LIST.follow5 = T_LIST.leihou = T_LIST.twitter = T_LIST.digu;

var T_NAMES = {
	'tsina': '新浪微博',
	'digu': '嘀咕',
	'tsohu': '搜狐微博',
//	't163': '网易微博',
	'zuosa': '做啥',
//	'follow5': 'Follow5',
	'twitter': 'Twitter',
//	'renjian': '人间网',
	'leihou': '雷猴'
	
};


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

function formatScreenName(user) {
	return '[' + T_NAMES[user.blogType] + ']' + user.screen_name || user.name;
}

///获取当前登陆用户信息
function getUser(){
    var c_user = localStorage.getObject(CURRENT_USER_KEY);
    if(c_user && c_user.uniqueKey){
        window.c_user = c_user;
    }else{
        var userList = getUserList();
        if(userList){
            for(var key in userList){
                c_user = userList[key];
                if(c_user){
                    setUser(c_user);
                    break;
                }
            }
        }
    }
    return c_user;
};

//设置当前登陆用户
function setUser(user){
    localStorage.setObject(CURRENT_USER_KEY, user);
    window.c_user = user;
};

//获取所有用户列表
//@isAll: 默认只返回启用的用户，如果isAll为true，则返回全部用户
function getUserList(isAll){
    var userList = localStorage.getObject(USER_LIST_KEY) || [];
    if(isAll && userList.length != undefined){ // 兼容旧格式
    	return userList;
    }
    var items = [];
    for(var i in userList){
        if(!userList[i].disabled){
        	items.push(userList[i]);
        }
    }
    return items;
};
//保存用户列表
function saveUserList(userlist){
    localStorage.setObject(USER_LIST_KEY, userlist);
};
//根据uniqueKey获取用户
function getUserByUniqueKey(uniqueKey){
    if(!uniqueKey){return null;}
    var userList = getUserList();
    for(var i in userList){
    	if(userList[i].uniqueKey == uniqueKey){
    		return userList[i];
    	}
    }
    return null;
}

//获取用户的全部timeline的未读信息数
function getUserUnreadTimelineCount(user_uniqueKey){
    var user = getUserByUniqueKey(user_uniqueKey);
    if(!user){ return 0; }
    var total = 0;
    for(var i in T_LIST[user.blogType]){
        //key 大概如： tsina#11234598_friends_timeline_UNREAD_TIMELINE_COUNT_KEY
        var count = localStorage.getObject(user_uniqueKey + T_LIST[user.blogType][i] + UNREAD_TIMELINE_COUNT_KEY);
        if(!count){
            count = 0;
        }
        total += count;
    }
    return total;
};

//获取用户的某一timeline的未读信息数
function getUnreadTimelineCount(t, user_uniqueKey){
    if(!user_uniqueKey){
        user_uniqueKey = getUser().uniqueKey;
    }
    //key 大概如： tsina#11234598_friends_timeline_UNREAD_TIMELINE_COUNT_KEY
    var count = localStorage.getObject(user_uniqueKey + t + UNREAD_TIMELINE_COUNT_KEY);
    if(!count){
        count = 0;
    }
    return count;
};

//@count: 增加的未读数
//@t: timeline的类型
function setUnreadTimelineCount(count, t, user_uniqueKey){
    if(!user_uniqueKey){
        user_uniqueKey = getUser().uniqueKey;
    }
    var setBadgeText = isSetBadgeText(t, user_uniqueKey);
    count += getUnreadTimelineCount(t, user_uniqueKey);
    localStorage.setObject(user_uniqueKey + t + UNREAD_TIMELINE_COUNT_KEY, count);
    if(getAlertMode()=='dnd'){ //免打扰模式
        chrome.browserAction.setBadgeText({text: '/'});
    }else{
        if(setBadgeText){
            var total = 0;
            var userList = getUserList();
            for(var j in userList){
                var user = userList[j];
                for(var i in T_LIST[user.blogType]){
                    if(isSetBadgeText(T_LIST[user.blogType][i], user.uniqueKey)){
                        total += getUnreadTimelineCount(T_LIST[user.blogType][i], user.uniqueKey);
                    }
                }
            }
            if(total > 0){
                total = total.toString();
                chrome.browserAction.setBadgeText({text: total});
            }else{
                chrome.browserAction.setBadgeText({text: ''});
            }
        }
    }
    chrome.browserAction.setTitle({title:getTooltip()});
};

function removeUnreadTimelineCount(t, user_uniqueKey){
    if(!user_uniqueKey){
        user_uniqueKey = getUser().uniqueKey;
    }
    localStorage.setObject(user_uniqueKey + t + UNREAD_TIMELINE_COUNT_KEY, 0);
    if(getIsSyncUnread(user_uniqueKey)){ //如果同步未读数
        syncUnreadCountToSinaPage(t, user_uniqueKey);
    }
    if(getAlertMode()=='dnd'){ //免打扰模式
        chrome.browserAction.setBadgeText({text: '/'});
    }else{
        var total = 0;
        var userList = getUserList();
        for(var j in userList){
            var user = userList[j];
            for(var i in T_LIST[user.blogType]){
                if(isSetBadgeText(T_LIST[user.blogType][i], user.uniqueKey)){
                    total += getUnreadTimelineCount(T_LIST[user.blogType][i], user.uniqueKey);
                }
            }
        }
        if(total > 0){
            total = total.toString();
            chrome.browserAction.setBadgeText({text: total});
        }else{
            chrome.browserAction.setBadgeText({text: ''});
        }
    }
    chrome.browserAction.setTitle({title:getTooltip()});
};

//将新浪微博页面的未读信息数清零
function syncUnreadCountToSinaPage(t, user_uniqueKey){
    var c_user = null;
    if(!user_uniqueKey){
        c_user = getUser();
        user_uniqueKey = c_user.uniqueKey;
    }else{
        c_user = getUserByUniqueKey(user_uniqueKey);
    }
    if(!c_user){
        return;
    }
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
        tapi.reset_count({'user':c_user, 'type':tl_type}, function(users, textStatus, statuCode){
            //TODO: reset success
        });
    }
};

//获取在插件icon上显示的tooltip内容
function getTooltip(){
    if(getAlertMode()=='dnd'){
        return 'FaWave(发微): 免打扰模式';
    }
    var tip = '', _new=0, _mention=0, _comment=0, _direct=0;
    var userList = getUserList();
    for(var j in userList){
        var user = userList[j];
        _new = getUnreadTimelineCount('friends_timeline', user.uniqueKey);
        _mention = getUnreadTimelineCount('mentions', user.uniqueKey);
        _comment = getUnreadTimelineCount('comments_timeline', user.uniqueKey);
        _direct = getUnreadTimelineCount('direct_messages', user.uniqueKey);
        var u_tip = '';
        if(_new){ u_tip += _new + '新'; }
        if(_mention){
            u_tip = u_tip ? u_tip + ',  ' : u_tip;
            u_tip += _mention + '@';
        }
        if(_comment){
            u_tip = u_tip ? u_tip + ',  ' : u_tip;
            u_tip += _comment + '评';
        }
        if(_direct){
            u_tip = u_tip ? u_tip + ',  ' : u_tip;
            u_tip += _direct + '私';
        }
        if(u_tip){
            u_tip = '(' + T_NAMES[user.blogType] + ')' + user.screen_name + ': ' + u_tip;
        }
        if(tip && u_tip){
            tip += '\r\n';
        }
        tip = tip + u_tip;
    }
    
    return tip;
};

//===>>>>>>>>>>>>>>>>>>>>>>>
function setLastMsgId(id, t, user_uniqueKey){
    if(!user_uniqueKey){
        user_uniqueKey = getUser().uniqueKey;
    }
    localStorage.setObject(user_uniqueKey + t + LAST_MSG_ID, id);
}

function getLastMsgId(t, user_uniqueKey){
    if(!user_uniqueKey){
        user_uniqueKey = getUser().uniqueKey;
    }
    return localStorage.getObject(user_uniqueKey + t + LAST_MSG_ID);
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
    return 'pip_io';
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

//-- 快捷发送热键 --
//保存的格式为： 33,34,35 用逗号分隔的keycode
function getQuickSendHotKey(){
    var keys = localStorage.getObject(QUICK_SEND_HOT_KEY_KEY);
    return keys || '113'; //默认 F2
};

function setQuickSendHotKey(keys){
    localStorage.setObject(QUICK_SEND_HOT_KEY_KEY, keys);
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
    if(isNaN(width) || width<350){
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

//-- 信息提示模式 (alert or dnd ) --
function getAlertMode(){
    var mode = localStorage.getObject(ALERT_MODE_KEY);
    return mode || 'alert';
};

function setAlertMode(mode){
    localStorage.setObject(ALERT_MODE_KEY, mode);
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
    var views = chrome.extension.getViews();
    for (var i = 0; i < views.length; i++) {
        var view = views[i];
        if (view.theViewName && view.theViewName == 'popup') {
            return view;
        }
    }
    return null;
};

//获取弹出窗的popup view
function getNewWinPopupView(){
    var views = chrome.extension.getViews();
    for (var i = 0; i < views.length; i++) {
        var view = views[i];
        if (view.is_new_win_popup) {
            return view;
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
    	var value = values[key] || eval('(values.' +key+')');
        return jQuery.isFunction(filter) ? filter(value, key) : value;
    });	
};

// 让所有字符串拥有模板格式化
String.prototype.format = function(data) {
	return formatText(this, data);
};

// HTML 编码
function HTMLEnCode(str){
    if(!str){ return ''; }
    str = str.replace(/</ig, '&lt;').replace(/>/ig, '&gt;');
//    str = str.replace(/\&lt;br\s*\/?\&gt;/ig, '<br />');
    // 支持<br/>
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

// 微博字数
String.prototype.len = function(){
	return this.length;
//	return Math.round(this.replace(/[^\x00-\xff]/g, "qq").length / 2);
};

// 将字符串参数变成dict参数
// form: oauth_token_secret=a26e895ca88d3ddbb5ec4d9d1780964b&oauth_token=b7cbcc0dc5056509a6b85967639924df
function decodeForm(form) {
    var d = {};
    var nvps = form.split('&');
    for (var n = 0; n < nvps.length; ++n) {
        var nvp = nvps[n];
        if (nvp == '') {
            continue;
        }
        var equals = nvp.indexOf('=');
        if (equals < 0) {
            d[nvp] = null;
        } else {
        	d[nvp.substring(0, equals)] = nvp.substring(equals + 1);
        }
    }
    return d;
}

// 获取一个字典的长度
function getDictLength(d) {
	var length = d.length;
	if(length === undefined){
		length = 0;
		for(var i in d) {
			length++;
		}
	}
	return length;
};

// 根据maxid删除重复的数据
// 如果是prepend
// 判断最后一个等于最大id的，将它和它后面的删除
// 如果是append
// 判断最后一个等于最大id的，将它和它前面的删除，twitter很强大，id大到js无法计算
function filterDatasByMaxId(datas, max_id, append){
    if(max_id && datas && datas.length > 0){
    	var found = false;
    	var index = 0;
    	while(datas[index] && max_id == String(datas[index].id)){
    		index++;
    		found = true;
    	}
    	if(found){
    		if(append){
    			datas = datas.slice(index);
    		} else {
    			datas = datas.slice(0, index);
    		}
    	}
    }
    return datas;
}