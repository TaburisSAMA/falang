
var itv; //Interval
var tweets = {};
var MAX_MSG_ID = {};
window.checking={}; //正在检查是否有最新微博
window.paging={}; //正在获取分页微博

function getMaxMsgId(t){
    var c_user = getUser(CURRENT_USER_KEY);
    var _key = c_user.userName + t + '_max_msg_id';
    return MAX_MSG_ID[_key];
}

function setMaxMsgId(t, id){
    var c_user = getUser(CURRENT_USER_KEY);
    var _key = c_user.userName + t + '_max_msg_id';
    MAX_MSG_ID[_key] = Number(id)-1;
}

//获取最新的(未看的)微博
// @t : 获取timeline的类型
function checkTimeline(t){
    //var t = 'friends_timeline';
    if(window.checking[t]){ return; }
    var c_user = getUser(CURRENT_USER_KEY);
    if(!c_user){
        return;
    }
    window.checking[t] = true;
    showLoading();
    var params = {count:100}
    var last_id = getLastMsgId(t);
    if(last_id){
        params['since_id'] = last_id;
    }
    var m = ''
    switch(t){
        case 'friends_timeline':
            m = 'friends_timeline';
            break;
        case 'mentions':
            m = 'mentions';
            break;
        case 'comments_timeline':
            m = 'comments_timeline';
            break;
        case 'comments_by_me':
            m = 'comments_by_me';
            break;
        case 'direct_messages':
            m = 'direct_messages';
            break;
        case 'favorites':
            m = 'favorites';
            break;
        default:
            //
    }
    sinaApi[m](params, function(sinaMsgs, textStatus){
        var isFirstTime = false;
        var _last_id = '';
        var _max_id = '';
        var c_user = getUser(CURRENT_USER_KEY);
        if(!c_user){
            window.checking[t] = false;
            return;
        }
        var _key = c_user.userName + t + '_tweets';
        if(!tweets[_key]){
            tweets[_key] = [];
            isFirstTime = true;//如果不存在，则为第一次获取微博
        }
        var popupView = getPopupView();

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
            if(popupView){
                if(!popupView.addTimelineMsgs(tweets[_key].slice(0, sinaMsgs.length), t)){
                    setUnreadTimelineCount(_unreadCount, t, true);
                }else{
                    popupView._showMsg('有新微博');
                }
            }else{
                setUnreadTimelineCount(_unreadCount, t, true);
                showNewMsg(sinaMsgs, t, c_user.id);
            }

            if(_last_id){
                setLastMsgId(_last_id, t);
            }
            if(_max_id && !getMaxMsgId(t)){
                setMaxMsgId(t, _max_id);
            }

        }else{
            setUnreadTimelineCount(0, t, true);
        }
        window.checking[t] = false;
        if(isFirstTime){//如果是第一次,则获取以前的微薄
            if(!tweets[_key] || tweets[_key].length < PAGE_SIZE){
                getTimelinePage(t);
            }else{
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
function getTimelinePage(t){
    //var t = 'friends_timeline';
    if(window.paging[t]){ return; }
    var c_user = getUser(CURRENT_USER_KEY);
    if(!c_user){
        return;
    }
    window.paging[t] = true;
    
    showLoading();

    var params = {count:PAGE_SIZE}
    var max_id = getMaxMsgId(t);
    if(max_id){
        params['max_id'] = max_id;
    }
    var m = ''
    switch(t){
        case 'friends_timeline':
            m = 'friends_timeline';
            break;
        case 'mentions':
            m = 'mentions';
            break;
        case 'comments_timeline':
            m = 'comments_timeline';
            break;
        case 'comments_by_me':
            m = 'comments_by_me';
            break;
        case 'direct_messages':
            m = 'direct_messages';
            break;
        case 'favorites':
            m = 'favorites';
            break;
        default:
            //
    }
    sinaApi[m](params, function(sinaMsgs, textStatus){
        if(sinaMsgs && sinaMsgs.length > 0){
            var _max_id = '';
            var c_user = getUser(CURRENT_USER_KEY);
            if(!c_user){
                window.paging[t] = false;
                return;
            }
            var _key = c_user.userName + t + '_tweets';
            if(!tweets[_key]){
                tweets[_key] = [];
            }
            sinaMsgs = sinaMsgs.slice(0, PAGE_SIZE);
            for(i in sinaMsgs){
                sinaMsgs[i].readed = true
            }
            tweets[_key] = tweets[_key].concat(sinaMsgs);
            _max_id = sinaMsgs[sinaMsgs.length-1].id;

            log('get page ' + t + ': ' + sinaMsgs.length);/////
            
            var popupView = getPopupView();
            if(popupView){
                popupView.addPageMsgs(sinaMsgs, t);
                if(sinaMsgs.length >= (PAGE_SIZE/2)){
                    popupView.showReadMore(t);
                }else{
                    popupView.hideReadMore(t);
                }
            }

            if(_max_id){
                setMaxMsgId(t, _max_id);
            }
        }else{
            var popupView = getPopupView();
            if(popupView){
                popupView.hideReadMore(t);
                popupView.hideLoading();
            }
        }

        hideLoading();
        window.paging[t] = false;
    });
};

//@userId: 插件当前登录的用户ID
function showNewMsg(msgs, t, userId){
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendRequest(tab.id, {msgs: msgs, t:t, userId:userId}, function handler(response) {
        });
    });
};

function checkNewMsg(){
    try{
        //checkTimeline('friends_timeline');
        //checkTimeline('mentions');
        //checkTimeline('direct_messages');
        for(i in T_LIST){
            checkTimeline(T_LIST[i]);
        }
    }catch(err){

    }
}

function onChangeUser(){
    clearInterval(itv);
    window.c_user = null;
    var c_user = localStorage.getObject(CURRENT_USER_KEY);
    if(c_user){
        //window.c_user = c_user;
    }
    for(i in T_LIST){
        setUnreadTimelineCount(0, T_LIST[i], true);
    }
    checkNewMsg();
    itv = setInterval(checkNewMsg, getRefreshTime());
};

function refreshInterval(){
    clearInterval(itv);
    itv = setInterval(checkNewMsg, getRefreshTime());
}

checkNewMsg();
itv = setInterval(checkNewMsg, getRefreshTime());










