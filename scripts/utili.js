// @author qleelulu@gmail.com

var PAGE_SIZE = 20;
var COMMENT_PAGE_SIZE = 8;

var SINA = 'idi_sina';

var SETTINGS_KEY = 'fawave_SETTINGS_KEY';

var UNSEND_TWEET_KEY = 'idi_UNSEND_TWEET_KEY';//未发送的tweet，保存下次显示

var FRIENDS_TIMELINE_KEY = 'idi_friends_timeline';
var REPLIES_KEY = 'idi_replies';
var MESSAGES_KEY = 'idi_messages';

var USER_LIST_KEY = 'idi_userlist';
var CURRENT_USER_KEY = 'idi_current_user';

var LAST_MSG_ID = 'idi_last_msg_id';
var LAST_CURSOR = '_last_cursor';

var LOCAL_STORAGE_NEW_TWEET_LIST_KEY = 'idi_LOCAL_STORAGE_NEW_TWEET_LIST_KEY';
var LOCAL_STORAGE_TWEET_LIST_HTML_KEY = 'idi_LOCAL_STORAGE_TWEET_LIST_HTML_KEY';

var UNREAD_TIMELINE_COUNT_KEY = 'idi_UNREAD_TIMELINE_COUNT_KEY';

var IS_SYNC_TO_PAGE_KEY = 'idi_IS_SYNC_TO_PAGE_KEY'; //已读消息是否和新浪微博页面同步

var THEME_LIST = {'default':'default', 'simple':'simple', 'pip_io':'pip_io'}; //主题列表

var ALERT_MODE_KEY = 'idi_ALERT_MODE_KEY'; //信息提醒模式key

//['friends_timeline','mentions','comments_timeline','comments_by_me','direct_messages','favorites']
//需要不停检查更新的timeline的分类列表
var T_LIST = {
	'all': ['friends_timeline','mentions','comments_timeline','direct_messages'],
	'digu': ['friends_timeline','mentions', 'direct_messages'],
	'buzz': ['friends_timeline'],
	'douban': ['friends_timeline', 'direct_messages']
};
T_LIST.tsina = T_LIST.tsohu = T_LIST.all;
T_LIST.fanfou = T_LIST.renjian = T_LIST.zuosa = T_LIST.follow5 = T_LIST.leihou = T_LIST.twitter = T_LIST.digu;

var T_NAMES = {
	'tsina': '新浪微博',
	'digu': '嘀咕',
	'fanfou': '饭否',
	'tsohu': '搜狐微博',
//	't163': '网易微博',
	'zuosa': '做啥',
//	'follow5': 'Follow5',
	'twitter': 'Twitter',
	'renjian': '人间网',
	'douban': '豆瓣',
	'buzz': 'Google Buzz',
	'leihou': '雷猴'
};

var Languages = {
	'中文': 'zh',
	'Afrikaans': 'af',
	'Albanian': 'sq',
	'Arabic': 'ar',
	'Basque': 'eu',
	'Belarusian': 'be',
	'Bulgarian': 'bg',
	'Catalan': 'ca',
	'Croatian': 'hr',
	'Czech': 'cs',
	'Danish': 'da',
	'Dutch': 'nl',
	'English': 'en',
	'Estonian': 'et',
	'Filipino': 'tl',
	'Finnish': 'fi',
	'French': 'fr',
	'Galician': 'gl',
	'German': 'de',
	'Greek': 'el',
	'Haitian Creole': 'ht',
	'Hebrew': 'iw',
	'Hindi': 'hi',
	'Hungarian': 'hu',
	'Icelandic': 'is',
	'Indonesian': 'id',
	'Irish': 'ga',
	'Italian': 'it',
	'Japanese': 'ja',
	'Latvian': 'lv',
	'Lithuanian': 'lt',
	'Macedonian': 'mk',
	'Malay': 'ms',
	'Maltese': 'mt',
	'Norwegian': 'no',
	'Persian': 'fa',
	'Polish': 'pl',
	'Portuguese': 'pt',
	'Romanian': 'ro',
	'Russian': 'ru',
	'Serbian': 'sr',
	'Slovak': 'sk',
	'Slovenian': 'sl',
	'Spanish': 'es',
	'Swahili': 'sw',
	'Swedish': 'sv',
	'Thai': 'th',
	'Turkish': 'tr',
	'Ukrainian': 'uk',
	'Vietnamese': 'vi',
	'Welsh': 'cy',
	'Yiddish': 'yi'
};

var unreadDes = {
    'friends_timeline': '新', 
    'mentions': '@', 
    'comments_timeline': '评', 
    'direct_messages': '私'
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

//设置选项
var Settings = {
    defaults: {
        globalRefreshTime:{ //全局的刷新间隔时间
            friends_timeline: 90,
            mentions: 120,
            comments_timeline: 120,
            direct_messages: 120
        },
        isSetBadgeText:{ //是否提醒未读信息数
            friends_timeline: true,
            mentions: true,
            comments_timeline: true,
            direct_messages: true
        },
        isShowInPage:{ //是否在页面上提示新信息
            friends_timeline: true,
            mentions: true,
            comments_timeline: true,
            direct_messages: true
        },
        isEnabledSound:{ //是否开启播放声音提示新信息
            friends_timeline: false,
            mentions: false,
            comments_timeline: false,
            direct_messages: false
        },
        soundSrc: '/sound/d.mp3',
        isDesktopNotifications:{ //是否在桌面提示新信息
            friends_timeline: false,
            mentions: false,
            comments_timeline: false,
            direct_messages: false
        },
        desktopNotificationsTimeout: 5, //桌面提示的延迟关闭时间
        isSyncReadedToSina: false, //已读消息是否和新浪微博页面同步
        isSharedUrlAutoShort: true, //分享正在看的网址时是否自动缩短
        sharedUrlAutoShortWordCount: 15, //超过多少个字则自动缩短URL
        quickSendHotKey: '113', //快速发送微博的快捷键。默认 F2。保存的格式为： 33,34,35 用逗号分隔的keycode
        isSmoothScroller: false, //是否启用平滑滚动
        smoothTweenType: 'Quad', //平滑滚动的动画类型
        smoothSeaeType: 'easeOut', //平滑滚动的ease类型

        font: '微软雅黑', //字体
        fontSite: 12, //字体大小
        popupWidth: 480, //弹出窗大小
        popupHeight: 520, 
        theme: 'pip_io', //主题样式
        translate_target: 'zh', // 默认翻译语言
        shorten_url_service: 'is.gd', // 默认缩址服务
        isGeoEnabled: false, //默认不开启上报地理位置信息
        geoPosition: null, //获取到的地理位置信息，默认为空

        lookingTemplate: '我正在看: {{title}} {{url}} '
    },
    init: function(){ //只在background载入的时候调用一次并给 _settings 赋值就可以
        var _sets = localStorage.getObject(SETTINGS_KEY);
        _sets = _sets || {};
        _sets = $.extend({}, this.defaults, _sets);

        if(!THEME_LIST[_sets.theme]){
            _sets.theme = this.defaults.theme;
        }

        return _sets;
    },
    get: function(){
        var bg = getBackgroundView();
        //不用判断，已确保init会在background载入的时候调用
        //if(!bg._settings){
        //    bg._settings = this.init();
        //}
        return bg._settings;
    },
    save: function(){
        var _sets = this.get();
        localStorage.setObject(SETTINGS_KEY, _sets);
    },
    /*
    * 获取刷新间隔时间
    */
    getRefreshTime: function(user, t){
        if(user && user.refreshTime && user.refreshTime[t]){
            return user.refreshTime[t];
        }
        return this.get().globalRefreshTime[t];
    }
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
//@t: all: 全部， send:用于发送的用户列表， show:正常显示的用户。默认为show
function getUserList(t){
    t = t || 'show'; //默认，获取用于显示的列表
    var userList = localStorage.getObject(USER_LIST_KEY) || [];
    if(t==='all' && userList.length != undefined){ // 兼容旧格式
    	return userList;
    }
    var items = [], user = null;
    for(var i in userList){
        user = userList[i];
        if(!user.disabled){
            if(t==='show' && user.only_for_send){ continue; }
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
//@t: all: 全部， send:用于发送的用户列表， show:正常显示的用户。默认为show
function getUserByUniqueKey(uniqueKey, t){
    if(!uniqueKey){return null;}
    var userList = getUserList(t);
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
    var setBadgeText = Settings.get().isSetBadgeText[t];
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
                    if(Settings.get().isSetBadgeText[ T_LIST[user.blogType][i] ]){
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
    if(Settings.get().isSyncReadedToSina){ //如果同步未读数
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
                if(Settings.get().isSetBadgeText[T_LIST[user.blogType][i]]){
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

// 保存最新的cursor
function setLastCursor(cursor, t, user_uniqueKey) {
    localStorage.setObject(user_uniqueKey + t + LAST_CURSOR, cursor);
}
// 获取最新的cursor
function getLastCursor(t, user_uniqueKey) {
    return localStorage.getObject(user_uniqueKey + t + LAST_CURSOR);
}
//<<<<<<<<<<<<<<<<=========


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
    var t = false;
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

String.prototype.endswith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
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
// 支持完整url
function decodeForm(form) {
	var index = form.indexOf('?');
	if(index > -1) {
		form = form.substring(index+1);
	}
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
        	d[nvp.substring(0, equals)] = decodeURIComponent(nvp.substring(equals + 1));
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
function filterDatasByMaxId(datas, max_id, append) {
	var news = datas, olds = [];
    if(max_id && datas && datas.length > 0){
    	max_id = String(max_id);
    	var found_index = null;
    	$.each(datas, function(i, item){
    		if(max_id == String(item.id)){
    			found_index = i;
    			return false;
    		}
    	});
    	if(found_index !== null){
    		if(append){
    			// id等于最大id的数据位于found_index，所以获取found_index+1开始往后的数据
    			news = datas.slice(found_index+1);
    			olds = datas.slice(0, found_index+1);
    		} else {
    			// 如果不是append的，id等于最大id的数据位于found_index，
    			// 只需要从开始到found_index(不包含结束边界)
    			news = datas.slice(0, found_index);
    			olds = datas.slice(found_index);
    		}
    	}
    }
    return {news: news, olds: olds};
};

/*
* 缓动函数
* t: current time（当前时间）；
* b: beginning value（初始值）；
* c: change in value（变化量）；
* d: duration（持续时间）。
*/
var Tween = {
    Quad: {
        easeIn: function(t,b,c,d){
            return c*(t/=d)*t + b;
        },
        easeOut: function(t,b,c,d){
            return -c *(t/=d)*(t-2) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return c/2*t*t + b;
            return -c/2 * ((--t)*(t-2) - 1) + b;
        }
    },
    Cubic: {
        easeIn: function(t,b,c,d){
            return c*(t/=d)*t*t + b;
        },
        easeOut: function(t,b,c,d){
            return c*((t=t/d-1)*t*t + 1) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return c/2*t*t*t + b;
            return c/2*((t-=2)*t*t + 2) + b;
        }
    },
    Quart: {
        easeIn: function(t,b,c,d){
            return c*(t/=d)*t*t*t + b;
        },
        easeOut: function(t,b,c,d){
            return -c * ((t=t/d-1)*t*t*t - 1) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
            return -c/2 * ((t-=2)*t*t*t - 2) + b;
        }
    },
    Quint: {
        easeIn: function(t,b,c,d){
            return c*(t/=d)*t*t*t*t + b;
        },
        easeOut: function(t,b,c,d){
            return c*((t=t/d-1)*t*t*t*t + 1) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
            return c/2*((t-=2)*t*t*t*t + 2) + b;
        }
    },
    Sine: {
        easeIn: function(t,b,c,d){
            return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
        },
        easeOut: function(t,b,c,d){
            return c * Math.sin(t/d * (Math.PI/2)) + b;
        },
        easeInOut: function(t,b,c,d){
            return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
        }
    },
    Expo: {
        easeIn: function(t,b,c,d){
            return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
        },
        easeOut: function(t,b,c,d){
            return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
        },
        easeInOut: function(t,b,c,d){
            if (t==0) return b;
            if (t==d) return b+c;
            if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
            return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
        }
    },
    Circ: {
        easeIn: function(t,b,c,d){
            return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
        },
        easeOut: function(t,b,c,d){
            return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
            return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
        }
    },
    Elastic: {
        easeIn: function(t,b,c,d,a,p){
            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
            if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
        },
        easeOut: function(t,b,c,d,a,p){
            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
            if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            return (a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b);
        },
        easeInOut: function(t,b,c,d,a,p){
            if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
            if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
            return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
        }
    },
    Back: {
        easeIn: function(t,b,c,d,s){
            if (s == undefined) s = 1.70158;
            return c*(t/=d)*t*((s+1)*t - s) + b;
        },
        easeOut: function(t,b,c,d,s){
            if (s == undefined) s = 1.70158;
            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
        },
        easeInOut: function(t,b,c,d,s){
            if (s == undefined) s = 1.70158; 
            if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
            return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
        }
    },
    Bounce: {
        easeIn: function(t,b,c,d){
            return c - Tween.Bounce.easeOut(d-t, 0, c, d) + b;
        },
        easeOut: function(t,b,c,d){
            if ((t/=d) < (1/2.75)) {
                return c*(7.5625*t*t) + b;
            } else if (t < (2/2.75)) {
                return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
            } else if (t < (2.5/2.75)) {
                return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
            } else {
                return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
            }
        },
        easeInOut: function(t,b,c,d){
            if (t < d/2) return Tween.Bounce.easeIn(t*2, 0, c, d) * .5 + b;
            else return Tween.Bounce.easeOut(t*2-d, 0, c, d) * .5 + c*.5 + b;
        }
    }
};

// getPageScroll() by quirksmode.com
function getPageScroll() {
    var xScroll, yScroll;
    if (self.pageYOffset) {
      yScroll = self.pageYOffset;
      xScroll = self.pageXOffset;
    } else if (document.documentElement && document.documentElement.scrollTop) {	 // Explorer 6 Strict
      yScroll = document.documentElement.scrollTop;
      xScroll = document.documentElement.scrollLeft;
    } else if (document.body) {// all other Explorers
      yScroll = document.body.scrollTop;
      xScroll = document.body.scrollLeft;	
    }
    return new Array(xScroll,yScroll);
};

  // Adapted from getPageSize() by quirksmode.com
function getPageHeight() {
    var windowHeight;
    if (self.innerHeight) {	// all except Explorer
      windowHeight = self.innerHeight;
    } else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
      windowHeight = document.documentElement.clientHeight;
    } else if (document.body) { // other Explorers
      windowHeight = document.body.clientHeight;
    }	
    return windowHeight;
};

//浮动层
var popupBox = {
    tp: '<div id="popup_box">\
            <div class="pb_title clearFix"><span class="t"></span><a href="javascript:" onclick="popupBox.close()" class="pb_close">关闭</a></div>\
            <div class="pb_content"></div>\
        </div>\
        <div id="popup_box_overlay"></di>',
    box: null,
    checkBox: function(){
        if(!this.box){
            $("body").append(this.tp);
            this.box = $("#popup_box");
            this.overlay = $("#popup_box_overlay ");
        }
    },
    close: function(){
        this.box.hide();
        this.overlay.hide();
    },
    show: function(img_width, img_height){
        this.overlay.show();
        var w = img_width;
        if(w){
            var max_w = Number($("#facebox_see_img").css('max-width').replace('px', '')) + 10;
            w = Math.min(w, max_w);
        }else{
            w = this.box.width();
        }
        var h = img_height;
        if(!h){
            h = this.box.height();
        }
        this.box.css({
            top: getPageScroll()[1] + (Math.max(10, $("body").height() / 2 - h / 2)),
            left: $("body").width() / 2 - w / 2
        }).show();
    },
    showOverlay: function(){},
    showImg: function(imgSrc, original, callbackFn){
        this.checkBox();
        var image = new Image();
        image.onload = function() {
            popupBox.showOverlay();
            if(original){
                popupBox.box.find('.pb_title .t, .pb_footer .t').html('<a target="_blank" href="' + original +'">查看原图</a>');
            }else{
                popupBox.box.find('.pb_title .t, .pb_footer .t').html('');
            }
            popupBox.box.find('.pb_content').html('<div class="image"><span class="rotate_btn">'
              + '<a href="javascript:" onclick="$(\'#facebox_see_img\').rotateLeft(90);"><img src="/images/rotate_l.png"></a>'
              + '<a href="javascript:" onclick="$(\'#facebox_see_img\').rotateRight(90);" style="margin-left:10px;"><img src="/images/rotate_r.png"></a></span>'
              + '<img id="facebox_see_img" src="' + image.src + '" class="cur_min" onclick="popupBox.close()" /></div>');
            popupBox.show(image.width, image.height);
            image.onload = null;
            image.onerror = null;
            if(callbackFn){ callbackFn('success'); }
        };
        image.onerror = function(){
            image.onload = null;
            image.onerror = null;
            if(callbackFn){ callbackFn('error'); }
        };
        image.src = imgSrc;
    },
    showMap: function(user_img, myLatitude, myLongitude){
        this.checkBox();
        var latlng = new google.maps.LatLng(myLatitude, myLongitude);
        var myOptions = {
          zoom: 13,
          center: latlng,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map_canvas = $("#pb_map_canvas");
        if(!map_canvas.length){
            this.box.find('.pb_content').html('<div id="pb_map_canvas"></div>');
            map_canvas = $("#pb_map_canvas");
        }
        popupBox.show();
        var map = new google.maps.Map(map_canvas[0], myOptions);
        var marker = new google.maps.Marker({map: map, position:latlng});
        

        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({'latLng': latlng}, function(results, status) {//根据经纬度查找地理位置
            if (status == google.maps.GeocoderStatus.OK) {//判断查找状态
                if (results[0]) {//查找成功
                    /*
                        InfoWindow 信息窗口类。显示标记位置的信息
                    */
                    var infowindow = new google.maps.InfoWindow({
                        content: '<img class="map_user_icon" src="'+user_img+'" />' + results[0].formatted_address,
                        maxWidth: 60
                    });
                    infowindow.open(map, marker);//打开信息窗口。一般与map和标记关联
                    google.maps.event.addListener(marker, 'click', function() {
                      infowindow.open(map,marker);
                    });
                }
            } else {
                showMsg("Geocoder failed due to: " + status);
            }
        });
    }
};

// shorturl
var ShortenUrl = {
	services: {
		'goo.gl': {api: 'http://goo.gl/api/url', format: 'json', method: 'post', param_name: 'url', result_name: 'short_url'},
//		'v.gd':  'http://v.gd/create.php?format=simple&url={{url}}',
		'is.gd': 'http://is.gd/api.php?longurl={{url}}',
		'tinyurl.com': 'http://tinyurl.com/api-create.php?url={{url}}',
		'to.ly': 'http://to.ly/api.php?longurl={{url}}',
		'zi.mu': 'http://zi.mu/api.php?format=simple&action=shorturl&url={{url}}',
		'fa.by': 'http://fa.by/?module=ShortURL&file=Add&mode=API&url={{url}}',
		'sqze.it': {api: 'http://long-shore.com/api/squeeze/', format: 'json', method: 'post', param_name: 'long_url', result_name: 'url'},
		'2.ly': {api: 'http://2.ly/api/short', format: 'json', method: 'get', param_name: 'longurl', result_name: 'url'},
		'2.gp': {api: 'http://2.gp/api/short', format: 'json', method: 'get', param_name: 'longurl', result_name: 'url'},
		'7.ly': {api: 'http://7.ly/api/short', format: 'json', method: 'get', param_name: 'longurl', result_name: 'url'},
		'aa.cx': 'http://aa.cx/api.php?url={{url}}',
		'lnk.by': {api: 'http://lnk.by/Shorten', 
			format_name: 'format', 
			format: 'json', 
			method: 'get', 
			param_name: 'url', result_name: 'shortUrl'}
	},
	short: function(longurl, callback, name) {
		var name = name || Settings.get().shorten_url_service;
		var service = this.services[name];
		var format = 'text';
		var format_name = null;
		var method = 'get';
		var data = {};
		var result_name = null;
		if(typeof(service) !== 'string') {
			format_name = service.format_name || format_name;
			format = service.format || format;
			method = service.method || method;
			data[service.param_name] = longurl;
			if(format_name) {
				data[format_name] = format;
			}
			result_name = service.result_name;
			if(name == 'goo.gl') {
				data.user = 'toolbar@google.com';
				data.auth_token = this._create_googl_auth_token(longurl);
			} 
//			user:'toolbar@google.com',
//                url: LongUrl,
//                auth_token: this.Auth(LongUrl)
			service = service.api;
		} else {
			service = service.format({url: encodeURIComponent(longurl)});
		}
		$.ajax({
			url: service,
			type: method,
			data: data,
			dataType: format,
			success: function(data, status, xhr) {
				if(result_name) {
					data = data[result_name];
				}
				callback(data);
			}, 
			error: function(xhr, status) {
				callback(null);
			}
		});
	},
	
	// goo.gl的认证token计算函数
	_create_googl_auth_token: function(f){function k(){for(var c=0,b=0;b<arguments.length;b++)c=c+arguments[b]&4294967295;return c}function m(c){c=c=String(c>0?c:c+4294967296);var b;b=c;for(var d=0,i=false,j=b.length-1;j>=0;--j){var g=Number(b.charAt(j));if(i){g*=2;d+=Math.floor(g/10)+g%10}else d+=g;i=!i}b=b=d%10;d=0;if(b!=0){d=10-b;if(c.length%2==1){if(d%2==1)d+=9;d/=2}}b=String(d);b+=c;return b}function n(c){for(var b=5381,d=0;d<c.length;d++)b=k(b<<5,b,c.charCodeAt(d));return b}function o(c){for(var b=0,d=0;d<c.length;d++)b=k(c.charCodeAt(d),b<<6,b<<16,-b);return b}f={byteArray_:f,charCodeAt:function(c){return this.byteArray_[c]}};f.length=f.byteArray_.length;var e=n(f.byteArray_);e=e>>2&1073741823;e=e>>4&67108800|e&63;e=e>>4&4193280|e&1023;e=e>>4&245760|e&16383;var l="7";f=o(f.byteArray_);var h=(e>>2&15)<<4|f&15;h|=(e>>6&15)<<12|(f>>8&15)<<8;h|=(e>>10&15)<<20|(f>>16&15)<<16;h|=(e>>14&15)<<28|(f>>24&15)<<24;l+=m(h);return l}
};

// 图片服务
var Instagram = {
	/* 
	 * http://instagr.am/p/BWp/ => 
	 * big: <img src="http://distillery.s3.amazonaws.com/media/2010/10/03/ca65a1ad211140c8ac97e2d2439a1376_7.jpg" class="photo" /> 
	 * middle: http://distillery.s3.amazonaws.com/media/2010/10/03/ca65a1ad211140c8ac97e2d2439a1376_6.jpg
	 * small: http://distillery.s3.amazonaws.com/media/2010/10/03/ca65a1ad211140c8ac97e2d2439a1376_5.jpg
	 */
	get: function(url, callback) {
		$.ajax({
			url: url,
			success: function(html, status, xhr) {
				var src = $(html).find('.photo').attr('src');
				var pics = {
					thumbnail_pic: src.replace('_7.', '_5.'),
					bmiddle_pic: src.replace('_7.', '_6.'),
					original_pic: src
				};
				callback(pics);
			}
		});
	}
};

// https://groups.google.com/group/plixi/web/fetch-photos-from-url
var Plixi = {
	/*
	 * http://api.plixi.com/api/tpapi.svc/imagefromurl?size=thumbnail&url=http://tweetphoto.com/5527850
	 * http://api.plixi.com/api/tpapi.svc/imagefromurl?size=medium&url=http://tweetphoto.com/5527850
	 * http://api.plixi.com/api/tpapi.svc/imagefromurl?size=big&url=http://tweetphoto.com/5527850
	 */
	get: function(url, callback) {
		var tpl = 'http://api.plixi.com/api/tpapi.svc/imagefromurl?size={{size}}&url=' + url;
		var pics = {
			thumbnail_pic: tpl.format({size: 'thumbnail'}),
			bmiddle_pic: tpl.format({size: 'medium'}),
			original_pic: url//tpl.format({size: 'big'})
		};
		callback(pics);
	}
};

// 缓存数据存储器
//var TweetStorage = {
//		_get_pre: function(t, unique_key){
//			return unique_key + '_' + t;
//	},
//	
//	getItems: function(ids, t, unique_key) {
//		var pre = this._get_pre(t, unique_key);
//		return $.map(ids, function(id){
//			var key = pre + '_' + id;
//			return localStorage.getObject(key);
//		});
//	},
//	
//	setItems: function(items, t, unique_key) {
//		var pre = this._get_pre(t, unique_key);
//		return $.map(items, function(item){
//			var key = pre + '_' + item.id;
//			localStorage.setObject(key, item);
//			return item.id;
//		});
//	},
//	
//	removeItem: function(id, t, unique_key) {
//		var key = this._get_pre(t, unique_key)+ '_' + id;
//		return localStorage.removeItem(key);
//	}
//};