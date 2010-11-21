// @author qleelulu@gmail.com

var itv; //Interval
var tweets = {};
var MAX_MSG_ID = {};
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

//用户跟随放到background view这里处理
var friendships = {
    create: function(user_id, callback){ //更随某人
        var params = {user_id:user_id};
        sinaApi.friendships_create(params, function(user_info, textStatus, statuCode){
            if(textStatus != 'error' && user_info.id){
                showMsg('跟随 "' + user_info.screen_name + '" 成功');
                if(callback){ callback(user_info, textStatus, statuCode); }
                return;
            }
            hideLoading();
        });
    },
    destroy: function(user_id, callback){ //取消更随某人
        var params = {user_id:user_id};
        sinaApi.friendships_destroy(params, function(user_info, textStatus, statuCode){
            if(textStatus != 'error' && user_info.id){
                showMsg('你已经取消跟随 "' + user_info.screen_name + '"');
                if(callback){ callback(user_info, textStatus, statuCode); }
                return;
            }
            hideLoading();
        });
    },
    show: function(user_id){ //查看与某人的更随关系
        var params = {user_id:user_id};
        sinaApi.friendships_show(params, function(sinaMsgs, textStatus){});
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
    showLoading();
    var params = {user:c_user, count:100};
    var last_id = getLastMsgId(t, user_uniqueKey);
    if(last_id){
        params['since_id'] = last_id;
    }

    if(p){
        for(var key in p){
            params[key] = p[key];
        }
    }
    var m = '';
    switch(t){
        case 'friends_timeline': //示例，如有特殊才需特别定义
            m = 'friends_timeline';
            break;
        default:
            m = t;
    }

    tapi[m](params, function(sinaMsgs, textStatus){
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
        if(sinaMsgs && sinaMsgs.length > 0){
            
            _last_id = sinaMsgs[0].id;
            _max_id = sinaMsgs[sinaMsgs.length-1].id;
            tweets[_key] = sinaMsgs.concat(tweets[_key]);
            
            var _unreadCount = 0, _msg_user = null;
            for(i in sinaMsgs){
                _msg_user = sinaMsgs[i].user || sinaMsgs[i].sender;
                if(_msg_user.id != c_user.id){
                    _unreadCount += 1;
                }
            }
            var current_user = getUser();
            if(popupView){
                if(!popupView.addTimelineMsgs(tweets[_key].slice(0, sinaMsgs.length), t, user_uniqueKey)){
                    setUnreadTimelineCount(_unreadCount, t, user_uniqueKey);
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

        }else{
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
        }else if(popupView && sinaMsgs && sinaMsgs.length >= PAGE_SIZE){
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
    
    setDoChecking(user_uniqueKey, t, 'paging', true);
    
    showLoading();

    var params = {user:c_user, count:PAGE_SIZE}
    var max_id = getMaxMsgId(t, user_uniqueKey);
    if(max_id){
        params['max_id'] = max_id;
    }
    if(p){
        for(var key in p){
            params[key] = p[key];
        }
    }
    var m = '';
    switch(t){
        case 'friends_timeline': //示例，如有特殊才需特别定义
            m = 'friends_timeline';
            break;
        default:
            m = t;
    }
    tapi[m](params, function(sinaMsgs, textStatus){
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
            for(i in sinaMsgs){
                sinaMsgs[i].readed = true;
            }
            tweets[_key] = tweets[_key].concat(sinaMsgs);
            _max_id = sinaMsgs[sinaMsgs.length-1].id;

            log('get page ' + t + ': ' + sinaMsgs.length);/////
            
            var current_user = getUser();
            //防止获取分页内容后已经切换了用户
            if(current_user.uniqueKey == c_user.uniqueKey){ //TODO:更详细逻辑有待改进
                var popupView = getPopupView();
                if(popupView){
                    popupView.addPageMsgs(sinaMsgs, t);
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
        }else{
            var current_user = getUser();
            if(current_user.uniqueKey == c_user.uniqueKey){ //TODO:更详细逻辑有待改进
                var popupView = getPopupView();
                if(popupView){
                    popupView.hideReadMore(t);
                    popupView.hideLoading();
                }
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
        for(j in userList){
            var user = userList[j];
            for(i in T_LIST[user.blogType]){
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
    for(i in T_LIST[c_user.blogType]){
        setUnreadTimelineCount(0, T_LIST[[c_user.blogType]][i]);
    }
    //checkNewMsg();
    //itv = setInterval(checkNewMsg, getRefreshTime());
};

function refreshInterval(){
    clearInterval(itv);
    itv = setInterval(checkNewMsg, getRefreshTime());
}

checkNewMsg();
itv = setInterval(checkNewMsg, getRefreshTime());



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
        var data = {};
        data['status'] = msg;
        sinaApi.update(data, function(sinaMsg, textStatus){
            if(sinaMsg.id){
                setTimeout(checkNewMsg, 1000);
            }
            sendResponse({msg:sinaMsg, textStatus:textStatus});
        });
    }
};




