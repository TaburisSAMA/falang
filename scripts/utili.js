// @author qleelulu@gmail.com

var PAGE_SIZE = 20;

var SINA = 'idi_sina';

var UNSEND_TWEET_KEY = 'idi_UNSEND_TWEET_KEY';//未发送的tweet，保存下次显示

var FRIENDS_TIMELINE_KEY = 'idi_friends_timeline';
var REPLIES_KEY = 'idi_replies';
var MESSAGES_KEY = 'idi_messages';

var USER_LIST_KEY = 'idi_userlist';
var CURRENT_USER_KEY = 'idi_current_user';
var REFRESH_TIME_KEY = 'idi_REFRESH_TIME_KEY';

var LAST_MSG_ID = 'idi_last_msg_id';
//var LAST_FRIENDS_TIMELINE_MSG_ID = 'idi_last_friends_timeline_msg_id';
//var LAST_REPLIES_MSG_ID = 'idi_last_replies_msg_id';
//var LAST_MESSAGES_MSG_ID = 'idi_last_messages_msg_id';

var LOCAL_STORAGE_NUM_KEY = 'idi_LOCAL_STORAGE_NUM_KEY';
var LOCAL_STORAGE_NEW_TWEET_LIST_KEY = 'idi_LOCAL_STORAGE_NEW_TWEET_LIST_KEY';
var LOCAL_STORAGE_TWEET_LIST_HTML_KEY = 'idi_LOCAL_STORAGE_TWEET_LIST_HTML_KEY';

var UNREAD_TIMELINE_COUNT_KEY = 'idi_UNREAD_TIMELINE_COUNT_KEY';
//var UNREAD_FRIENDS_TIMELINE_COUNT_KEY = 'idi_UNREAD_FRIENDS_TIMELINE_COUNT_KEY';
//var UNREAD_REPLIES_COUNT_KEY = 'idi_UNREAD_REPLIES_COUNT_KEY';
//var UNREAD_MESSAGES_COUNT_KEY = 'idi_UNREAD_MESSAGES_COUNT_KEY';

var AUTO_SHORT_URL = 'idi_SHORT_URL';//是否缩短URL
var AUTO_SHORT_URL_WORD_COUNT = 'idi_SHORT_URL_WORD_COUNT'; //URL长度超过多少自动缩短

//['friends_timeline','mentions','comments_timeline','comments_by_me','direct_messages','favorites']
var T_LIST = ['friends_timeline','mentions','comments_timeline','direct_messages']; //timeline的分类列表


function showMsg(msg){
    var popupView = getPopupView();
    if(popupView){
        popupView._showMsg(msg);
    }
}
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
    count += getUnreadTimelineCount(t);
    localStorage.setObject(getUser().userName + t + UNREAD_TIMELINE_COUNT_KEY, count);
    if(setBadgeText){
        var total = 0;
        for(i in T_LIST){
            total += getUnreadTimelineCount(T_LIST[i]);
        }
        if(total > 0){
            total = total.toString();
            chrome.browserAction.setBadgeText({text: total});
        }
    }
};

function removeUnreadTimelineCount(t){
    localStorage.setObject(getUser().userName + t + UNREAD_TIMELINE_COUNT_KEY, 0);
    var total = 0;
    for(i in T_LIST){
        if(T_LIST[i]==t){
            continue;
        }
        total += getUnreadTimelineCount(T_LIST[i]);
    }
    if(total > 0){
        total = total.toString();
        chrome.browserAction.setBadgeText({text: total});
    }else{
        chrome.browserAction.setBadgeText({text: ''});
    }
};

//function getUnreadFriendsTimelineCount(){
//    var count = localStorage.getObject(getUser().userName + UNREAD_FRIENDS_TIMELINE_COUNT_KEY);
//    if(!count){
//        count = 0;
//    }
//    return count;
//};
//
//function setUnreadFriendsTimelineCount(count, setBadgeText){
//    count += getUnreadFriendsTimelineCount();
//    localStorage.setObject(getUser().userName + UNREAD_FRIENDS_TIMELINE_COUNT_KEY, count);
//    if(setBadgeText){
//        var total = count + getUnreadRepliesCount() + getUnreadMessagesCount();
//        if(total > 0){
//            total = total.toString();
//            chrome.browserAction.setBadgeText({text: total});
//        }
//    }
//};
//
//function removeUnreadFriendsTimelineCount(){
//    localStorage.setObject(getUser().userName + UNREAD_FRIENDS_TIMELINE_COUNT_KEY, 0);
//    var total = getUnreadRepliesCount() + getUnreadMessagesCount();
//    if(total > 0){
//        total = total.toString();
//        chrome.browserAction.setBadgeText({text: total});
//    }else{
//        chrome.browserAction.setBadgeText({text: ''});
//    }
//};
//
//function getUnreadRepliesCount(){
//    var count = localStorage.getObject(getUser().userName + UNREAD_REPLIES_COUNT_KEY);
//    if(!count){
//        count = 0;
//    }
//    return count;
//};
//
//function setUnreadRepliesCount(count, setBadgeText){
//    count += getUnreadRepliesCount();
//    localStorage.setObject(getUser().userName + UNREAD_REPLIES_COUNT_KEY, count);
//    if(setBadgeText){
//        var total = count + getUnreadFriendsTimelineCount() + getUnreadMessagesCount();
//        if(total > 0){
//            total = total.toString();
//            chrome.browserAction.setBadgeText({text: total});
//        }
//    }
//};
//
//function removeUnreadRepliesCount(){
//    localStorage.setObject(getUser().userName + UNREAD_REPLIES_COUNT_KEY, 0);
//    var total = getUnreadFriendsTimelineCount() + getUnreadMessagesCount();
//    if(total > 0){
//        total = total.toString();
//        chrome.browserAction.setBadgeText({text: total});
//    }else{
//        chrome.browserAction.setBadgeText({text: ''});
//    }
//};
//
//function getUnreadMessagesCount(){
//    var count = localStorage.getObject(getUser().userName + UNREAD_MESSAGES_COUNT_KEY);
//    if(!count){
//        count = 0;
//    }
//    return count;
//};
//
//function setUnreadMessagesCount(count, setBadgeText){
//    count += getUnreadMessagesCount();
//    localStorage.setObject(getUser().userName + UNREAD_MESSAGES_COUNT_KEY, count);
//    if(setBadgeText){
//        var total = count + getUnreadFriendsTimelineCount() + getUnreadRepliesCount();
//        if(total > 0){
//            total = total.toString();
//            chrome.browserAction.setBadgeText({text: total});
//        }
//    }
//};
//
//function removeUnreadMessagesCount(){
//    localStorage.setObject(getUser().userName + UNREAD_MESSAGES_COUNT_KEY, 0);
//    var total = getUnreadFriendsTimelineCount() + getUnreadRepliesCount();
//    if(total > 0){
//        total = total.toString();
//        chrome.browserAction.setBadgeText({text: total});
//    }else{
//        chrome.browserAction.setBadgeText({text: ''});
//    }
//};

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
    if(!asu && asu == 0){
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

function getRefreshTime(){
    var t = localStorage.getObject(REFRESH_TIME_KEY);
    if(t){
        t = Number(t);
        if(isNaN(t)){
            t = 3;
        }
        t = t * 1000 * 60;
    }else{
        t = 5 * 1000 * 60;//默认5分钟
    }
    return t;
}

//====>>>>>>>>>>>>>>>>>>
function getBackgroundView(){
    //var popupUrl = chrome.extension.getURL('background.html');
    var views = chrome.extension.getViews();
    for (var i = 0; i < views.length; i++) {
        var view = views[i];
        if (view.theViewName && view.theViewName == 'background') {
            return view;
        }
    }
    return null;
};

function getPopupView(){
    //var popupUrl = chrome.extension.getURL('popup.html');
    var views = chrome.extension.getViews();
    for (var i = 0; i < views.length; i++) {
        var view = views[i];
        if (view.theViewName && view.theViewName == 'popup') {
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
	}
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

//在Chrome上输出log信息，用于调试
function log(msg){
    console.log(msg);
}