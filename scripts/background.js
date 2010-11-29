// @author qleelulu@gmail.com

var itv; //Interval
var tweets = {}, 
    new_win_popup = Object(),
    MAX_MSG_ID = {},
    LAST_PAGES = {};
//var THEME = localStorage.getObject('popup_theme') || 'default';
window.checking={}; //正在检查是否有最新微博
window.paging={}; //正在获取分页微博

//点击的时候，主题选择
//chrome.browserAction.onClicked.addListener(function(tab) {
//    chrome.browserAction.setPopup({popup: 'themes/' + THEME + '/popup.html'});
//});

//function setTheme(theme){
//    THEME = theme;
//    localStorage.setObject('popup_theme', theme);
//};

function getMaxMsgId(t, user_uniqueKey){
    if(!user_uniqueKey){
        user_uniqueKey = getUser().uniqueKey;
    }
    var _key = user_uniqueKey + t + '_max_msg_id';
    return MAX_MSG_ID[_key];
};

function setMaxMsgId(t, id, user_uniqueKey){
    if(!user_uniqueKey){
        user_uniqueKey = getUser().uniqueKey;
    }
    var _key = user_uniqueKey + t + '_max_msg_id';
    MAX_MSG_ID[_key] = Number(id)-1;
};

function getLastPage(t, user_uniqueKey){
    if(!user_uniqueKey){
        user_uniqueKey = getUser().uniqueKey;
    }
    var _key = user_uniqueKey + t + '_last_page';
    return LAST_PAGES[_key];
};

function setLastPage(t, page, user_uniqueKey){
    if(!user_uniqueKey){
        user_uniqueKey = getUser().uniqueKey;
    }
    var _key = user_uniqueKey + t + '_last_page';
    LAST_PAGES[_key] = page;
};

//用户跟随放到background view这里处理
var friendships = {
    create: function(user_id, callback){ //更随某人
    	var user = getUser();
        var params = {id:user_id, user:user};
        tapi.friendships_create(params, function(user_info, textStatus, statuCode){
            if(textStatus != 'error' && user_info.id){
                showMsg('跟随 "' + user_info.screen_name + '" 成功');
                if(callback){ callback(user_info, textStatus, statuCode); }
                return;
            }
            hideLoading();
        });
    },
    destroy: function(user_id, callback){ //取消更随某人
    	var user = getUser();
        var params = {id:user_id, user:user};
        tapi.friendships_destroy(params, function(user_info, textStatus, statuCode){
            if(textStatus != 'error' && user_info.id){
                showMsg('你已经取消跟随 "' + user_info.screen_name + '"');
                if(callback){ callback(user_info, textStatus, statuCode); }
                return;
            }
            hideLoading();
        });
    },
    show: function(user_id){ //查看与某人的更随关系
    	var user = getUser();
        var params = {id:user_id, user:user};
        tapi.friendships_show(params, function(sinaMsgs, textStatus){});
    }
}; 

//获取最新的(未看的)微博
// @t : 获取timeline的类型
// @p : 要附加的请求参数,类型为{}
function checkTimeline(t, p, user_uniqueKey){
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
    //var t = 'friends_timeline';
    if(isDoChecking(user_uniqueKey, t, 'checking')){ return; }
    
    setDoChecking(user_uniqueKey, t, 'checking', true);
    
    var params = {user:c_user, count:PAGE_SIZE};
    var last_id = getLastMsgId(t, user_uniqueKey);
    if(last_id){
        params['since_id'] = last_id;
    }
    if(p){
        for(var key in p){
            params[key] = p[key];
        }
    }
    showLoading();
//	log('start checkTimeline ' + user_uniqueKey + ' ' + t);
    tapi[t](params, function(sinaMsgs, textStatus){
    	if(sinaMsgs == null) {
//    		log(user_uniqueKey + ' ' + m + ': null, hideLoading()');
    		hideLoading();
    		return;
    	}
        var isFirstTime = false;
        var _last_id = '';
        var _max_id = '';
        //TODO: 这里不确定会不会有闭包造成的c_user变量覆盖问题，待测试
        if(!c_user){
            //window.checking[t] = false;
            setDoChecking(user_uniqueKey, t, 'checking', false);
            return;
        }
        var _key = user_uniqueKey + t + '_tweets';
        if(!tweets[_key]){
            tweets[_key] = [];
            isFirstTime = true;//如果不存在，则为第一次获取微博
        }
        var popupView = getPopupView();

        if(sinaMsgs.users){ //粉丝列表
            sinaMsgs = sinaMsgs.users;
        }
//        log('finish checkTimeline ' + user_uniqueKey + ' ' + m + ': ' + (sinaMsgs ? sinaMsgs.length : 0));
        if(sinaMsgs && sinaMsgs.length > 0){
            _last_id = sinaMsgs[0].id;
            var has_news = true;
            if(params.since_id && Number(_last_id) == Number(params.since_id)){
            	has_news = false;
            }
            if(has_news) {
            	_max_id = sinaMsgs[sinaMsgs.length-1].id;
                tweets[_key] = sinaMsgs.concat(tweets[_key]);
                
                var _unreadCount = 0, _msg_user = null;
                for(var i in sinaMsgs){
                    _msg_user = sinaMsgs[i].user || sinaMsgs[i].sender;
                    if(_msg_user && _msg_user.id != c_user.id){
                        _unreadCount += 1;
                    }
                }
                var current_user = getUser();
                if(popupView){
                    if(!popupView.addTimelineMsgs(tweets[_key].slice(0, sinaMsgs.length), t, user_uniqueKey)){
                        setUnreadTimelineCount(_unreadCount, t, user_uniqueKey);
                        popupView.updateDockUserUnreadCount(user_uniqueKey);
                    }else{
                        if(current_user.uniqueKey == c_user.uniqueKey){
                            popupView._showMsg('有新微博');
                        }
                    }
                }else{
                    setUnreadTimelineCount(_unreadCount, t, user_uniqueKey);
                    showNewMsg(sinaMsgs, t, c_user.id); //在页面显示新消息
                }

                if(_last_id){
                    setLastMsgId(_last_id, t, user_uniqueKey);
                }
                if(_max_id && !getMaxMsgId(t, user_uniqueKey)){
                    setMaxMsgId(t, _max_id, user_uniqueKey);
                }
            }
        } else {
            setUnreadTimelineCount(0, t, user_uniqueKey);
        }
        //window.checking[t] = false;
        setDoChecking(user_uniqueKey, t, 'checking', false);
        if(isFirstTime){//如果是第一次,则获取以前的微薄
            if(!tweets[_key] || tweets[_key].length < PAGE_SIZE){
                getTimelinePage(user_uniqueKey, t);
            }else if(popupView){
                popupView.showReadMore(t);
                popupView.setTimelineOffset(t, sinaMsgs.length);
            }
        } else if(popupView && sinaMsgs && sinaMsgs.length >= PAGE_SIZE){
            popupView.showReadMore(t);
            popupView.setTimelineOffset(t, sinaMsgs.length);
        }
        hideLoading();
    });
};

//分页获取以前的微博
// @t : 获取timeline的类型
// @p : 要附加的请求参数,类型为{}
function getTimelinePage(user_uniqueKey, t, p){
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
    if(t == 'followers'){ return; } //忽略粉丝列表
    if(isDoChecking(user_uniqueKey, t, 'paging')){ return; }
    
    var params = {user:c_user, count:PAGE_SIZE};
    var config = tapi.get_config(c_user);
    var support_max_id = config.support_max_id;
    // 判断是否支持max_id形式获取数据
    if(support_max_id) {
	    var max_id = getMaxMsgId(t, user_uniqueKey);
	    if(max_id){
	        params['max_id'] = max_id;
	    }
    } else {
    	// count, page 形式
    	var page = getLastPage(t, user_uniqueKey);
    	if(page == 0) {
    		return; // 到底了
    	} else if(page == undefined) {
    		page = 1;
    	} else {
    		page += 1;
    	}
    	params['page'] = page;
    }
    
    if(p){
        for(var key in p){
            params[key] = p[key];
        }
    }

    setDoChecking(user_uniqueKey, t, 'paging', true);
    
    showLoading();

//    log('start getTimelinePage ' + user_uniqueKey + ' ' + t 
//    	+ ' page:' + params.page + ' max_id:' + params.max_id);
    tapi[t](params, function(sinaMsgs, textStatus){
    	if(sinaMsgs == null || textStatus == 'error') {
    		hideLoading();
    		return;
    	}
        if(sinaMsgs && sinaMsgs.length > 0){
            var _max_id = '';
            //TODO: 这里不确定会不会有闭包造成的c_user变量覆盖问题，待测试
            if(!c_user){
                //window.paging[t] = false;
                setDoChecking(user_uniqueKey, t, 'paging', false);
                return;
            }
            var _key = user_uniqueKey + t + '_tweets';
            if(!tweets[_key]){
                tweets[_key] = [];
            }
            sinaMsgs = sinaMsgs.slice(0, PAGE_SIZE);
            for(var i in sinaMsgs){
                sinaMsgs[i].readed = true;
            }
            tweets[_key] = tweets[_key].concat(sinaMsgs);
            _max_id = sinaMsgs[sinaMsgs.length-1].id;

//            log('finish getTimelinePage ' + user_uniqueKey + ' ' + t + ': ' + sinaMsgs.length 
//            		+ ' page:' + params.page + ' max_id:' + params.max_id);
            
            var current_user = getUser();
            //防止获取分页内容后已经切换了用户
            if(current_user.uniqueKey == c_user.uniqueKey){ //TODO:更详细逻辑有待改进
                var popupView = getPopupView();
                if(popupView){
                    popupView.addPageMsgs(sinaMsgs, t, true);
                    if(sinaMsgs.length >= (PAGE_SIZE/2)){
                        popupView.showReadMore(t);
                    }else{
                        popupView.hideReadMore(t);
                    }
                }
            }

            if(_max_id){
                setMaxMsgId(t, _max_id, user_uniqueKey);
            }
            if(!support_max_id) {
	            setLastPage(t, page, user_uniqueKey);
            }
        } else {
            var current_user = getUser();
            if(current_user.uniqueKey == c_user.uniqueKey){ //TODO:更详细逻辑有待改进
                var popupView = getPopupView();
                if(popupView){
                    popupView.hideReadMore(t);
                    popupView.hideLoading();
                }
            }
            if(!support_max_id) { // 到底了
	            setLastPage(t, 0, user_uniqueKey);
            }
        }

        hideLoading();
        //window.paging[t] = false;
        setDoChecking(user_uniqueKey, t, 'paging', false);
    });
};

//检查是否正在获取
//@t: timeline类型
//@c_t: checking or paging
function isDoChecking(user_uniqueKey, t, c_t){
    if(!user_uniqueKey){
        user_uniqueKey = getUser().uniqueKey;
    }
    if(window[c_t][user_uniqueKey + t]){
        var d = new Date().getTime();
        var _d = d - window[c_t][user_uniqueKey + t + '_time'];
        if(_d < 60*1000){ //如果还没有超过一分钟
            return true;
        }
    }
    return false;
}

function setDoChecking(user_uniqueKey, t, c_t, v){
    if(!user_uniqueKey){
        user_uniqueKey = getUser().uniqueKey;
    }
    window[c_t][user_uniqueKey + t] = v;
    window[c_t][user_uniqueKey + t + '_time'] = new Date().getTime();
}

//在页面显示提示信息
//@userId: 插件当前登录的用户ID
function showNewMsg(msgs, t, userId){
    if(getAlertMode()=='dnd'){ return; } //免打扰模式
    if(isShowInPage(t)){
        chrome.tabs.getSelected(null, function(tab) {
            chrome.tabs.sendRequest(tab.id, {method:'showNewMsgInPage', msgs: msgs, t:t, userId:userId}, function handler(response) {
            });
        });
    }
};

function checkNewMsg(){
    try{
        //checkTimeline('friends_timeline');
        //checkTimeline('mentions');
        //checkTimeline('direct_messages');
        var userList = getUserList();
        for(var j in userList){
            var user = userList[j];
            for(var i in T_LIST[user.blogType]){
                checkTimeline(T_LIST[user.blogType][i], null, user.uniqueKey);
            }
        }
    }catch(err){

    }
}

function onChangeUser(){
    //clearInterval(itv);
    window.c_user = null;
    var c_user = getUser();
    if(c_user){
        window.c_user = c_user;
    }
    for(var i in T_LIST[c_user.blogType]){
        setUnreadTimelineCount(0, T_LIST[[c_user.blogType]][i]);
    }
    //checkNewMsg();
    //itv = setInterval(checkNewMsg, getRefreshTime());
};

function refreshInterval(){
    clearInterval(itv);
    itv = setInterval(checkNewMsg, getRefreshTime());
};

checkNewMsg();
itv = setInterval(checkNewMsg, getRefreshTime());


//刷新账号信息
function refreshAccountInfo(){
    var stat = {};
    stat.len = 0;
    stat.errorCount = 0;
    stat.successCount = 0;
    var userList = getUserList(true); //不管账号启用还是停用，都更新
    if(userList){
        var temp_userList = {};
        for(var key in userList){
            stat.len++;
        }
        var user;
        for(var key in userList){
            user = userList[key];
            refreshAccountWarp(temp_userList, user, stat);//由于闭包会造成变量共享问题，所以写多一个包装函数。
        }
    }
};

function refreshAccountWarp(userList, r_user, stat){
    var user = r_user;
    tapi.verify_credentials(user,function(data, textStatus, errorCode){
        if(errorCode){
            userList[user.uniqueKey] = user;
            stat.errorCount++;
        }else{
            user.blogType = user.blogType || 'tsina'; //兼容单微博版
            user.authType = user.authType || 'baseauth'; //兼容单微博版
            data = $.extend({},user, data); //合并，以data的数据为准
            data.uniqueKey = data.blogType + '_' + data.id;
            userList[data.uniqueKey] = data;
            stat.successCount++;
        }
        if((stat.errorCount + stat.successCount) == stat.len){
            saveUserList(userList);
            var c_user = getUser();
            if(c_user){
                if(!c_user.uniqueKey){ //兼容单微博版本
                    c_user.uniqueKey = (c_user.blogType||'tsina') + '_' + c_user.id;
                }
                c_user = userList[c_user.uniqueKey.toLowerCase()];
                setUser(c_user);
            }
            stat = null;
            userList = null;
            user = null;
        }
    });
};

refreshAccountInfo(); //每次启动的时候都刷新一下用户信息


//与page.js通讯
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    // sender.tab ? sender.tab.url
    if(request.method){
        r_method_manager[request.method](request, sender, sendResponse);
    }
});

r_method_manager = {
    test: function(request, sender, sendResponse){
        sendResponse({farewell: "goodbye"});
    },
    getLookingTemplate: function(request, sender, sendResponse){
        var _l_tp = getLookingTemplate();
        sendResponse({lookingTemplate: _l_tp});
    },
    getQuickSendInitInfos: function(request, sender, sendResponse){
        var hotkeys = getQuickSendHotKey();
        var c_user = getUser();
        sendResponse({hotkeys: hotkeys, c_user:c_user});
    },
    publicQuickSendMsg: function(request, sender, sendResponse){
        var msg = request.sendMsg;
        var user = getUser();
        var data = {status: msg, user:user};
        tapi.update(data, function(sinaMsg, textStatus){
            if(sinaMsg.id){
                setTimeout(checkNewMsg, 1000);
            }
            sendResponse({msg:sinaMsg, textStatus:textStatus});
        });
    }
};




