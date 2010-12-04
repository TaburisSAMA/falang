// @author qleelulu@gmail.com

window._settings = Settings.init(); //载入设置

Settings.get = function(){ return window._settings; }; //重写get，直接返回，不用再获取background view

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
    var _key = user_uniqueKey + t + '_tweets';
    var _t_tweets = tweets[_key];
    var _last_id = null;
    if(_t_tweets && _t_tweets.length){
    	var _last_id = _t_tweets[_t_tweets.length-1].id;
    	if(typeof(_last_id) === 'number'){
    		_last_id--;
    	}
    }
    return _last_id;
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
//    if(t == 'friends_timeline'){
//    	log('start checkTimeline ' + user_uniqueKey + ' ' + t + ' last_id: ' + last_id);
//    }
	
    tapi[t](params, function(sinaMsgs, textStatus){
    	if(!sinaMsgs) {
    		hideLoading();
    		return;
    	}
        var isFirstTime = false;
        //TODO: 这里不确定会不会有闭包造成的c_user变量覆盖问题，待测试
        if(!c_user){
            setDoChecking(user_uniqueKey, t, 'checking', false);
            return;
        }
        var _key = user_uniqueKey + t + '_tweets';
        if(!tweets[_key]){
            tweets[_key] = [];
            isFirstTime = true;//如果不存在，则为第一次获取微博
        }
        if(sinaMsgs.length > 0){
        	if(tweets[_key].length > 0){
        		sinaMsgs = filterDatasByMaxId(sinaMsgs, String(tweets[_key][0].id), false);
        	}
        }
        var current_user = getUser();
        var popupView = getPopupView();
        if(sinaMsgs.length > 0){
            setLastMsgId(sinaMsgs[0].id, t, user_uniqueKey);
            tweets[_key] = sinaMsgs.concat(tweets[_key]);
            var _unreadCount = 0, _msg_user = null;
            for(var i in sinaMsgs){
                _msg_user = sinaMsgs[i].user || sinaMsgs[i].sender;
                if(_msg_user && _msg_user.id != c_user.id){
                    _unreadCount += 1;
                }
            }
        	if(popupView){
        		// 判断是否还是当前用户
                if(!popupView.addTimelineMsgs(sinaMsgs, t, user_uniqueKey)){
//                	log('addTimelineMsgs false' + t + user_uniqueKey);
                    setUnreadTimelineCount(_unreadCount, t, user_uniqueKey);
                    popupView.updateDockUserUnreadCount(user_uniqueKey);
                } else {
                    if(current_user.uniqueKey == user_uniqueKey){
                        popupView._showMsg('有新微博');
                    } else {
//                    	log('addTimelineMsgs true not current' + t + user_uniqueKey);
                    	setUnreadTimelineCount(_unreadCount, t, user_uniqueKey);
                    	popupView.updateDockUserUnreadCount(user_uniqueKey);
                    }
                }
            } else { //在页面显示新消息
                setUnreadTimelineCount(_unreadCount, t, user_uniqueKey);
                showNewMsg(sinaMsgs, t, c_user); 
            }
    	}
    	setDoChecking(user_uniqueKey, t, 'checking', false);
        if(isFirstTime){//如果是第一次(启动插件时),则获取以前的微薄
            if(tweets[_key].length < PAGE_SIZE){ //如果第一次(启动插件时)获取的新信息少于分页大小，则加载一页以前的微薄，做缓冲
                getTimelinePage(user_uniqueKey, t);
            }else if(popupView){
                popupView.showReadMore(t);
            }
        } else if(popupView && sinaMsgs.length >= PAGE_SIZE){
            popupView.showReadMore(t);
        }
        hideLoading();
//        if(t == 'friends_timeline'){
//        	log('finish checkTimeline ' + user_uniqueKey + ' ' + t + ': ' + sinaMsgs.length + ' max_id: ' + getMaxMsgId(t, user_uniqueKey));
//        }
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
//	if(t == 'friends_timeline'){
//		log('start getTimelinePage ' + user_uniqueKey + ' ' + t 
//    		+ ' page:' + params.page + ' max_id:' + params.max_id);
//	}
    
    tapi[t](params, function(sinaMsgs, textStatus){
    	if($.isArray(sinaMsgs) && textStatus != 'error') {
    		if(sinaMsgs.length > 0){
                //TODO: 这里不确定会不会有闭包造成的c_user变量覆盖问题，待测试
                if(!c_user){
                    setDoChecking(user_uniqueKey, t, 'paging', false);
                    return;
                }
                var _key = user_uniqueKey + t + '_tweets';
                if(!tweets[_key]){
                    tweets[_key] = [];
                }
                var max_id = getMaxMsgId(t, user_uniqueKey);
                sinaMsgs = filterDatasByMaxId(sinaMsgs, max_id, true);
                for(var i in sinaMsgs){
                    sinaMsgs[i].readed = true;
                }
                tweets[_key] = tweets[_key].concat(sinaMsgs);
            } else {
            	page = 0;
            }
            if(!support_max_id) {
                setLastPage(t, page, user_uniqueKey);
            }
    	}
        // 设置翻页和填充新数据到ui列表的后面显示
        _showReadMore(t, user_uniqueKey, sinaMsgs);
        hideLoading();
        setDoChecking(user_uniqueKey, t, 'paging', false);
//        if(t == 'friends_timeline'){
//        	log('finish getTimelinePage ' + user_uniqueKey + ' ' + t + ': ' + sinaMsgs.length 
//        		+ ' page:' + params.page + ' max_id:' + params.max_id + ' new maxid: ' + getMaxMsgId(t, user_uniqueKey));
//        }
    });
};

// 设置可以继续翻页
// 如果datas是数组类型，则根据长度是否大于页数的一半判断是否可以继续翻页
function _showReadMore(t, user_uniqueKey, datas) {
	var current_user = getUser();
    //防止获取分页内容后已经切换了用户
    if(current_user.uniqueKey == user_uniqueKey) { //TODO:更详细逻辑有待改进
        var popupView = getPopupView();
        if(popupView) {
        	if($.isArray(datas)) {
        		popupView.addPageMsgs(datas, t, true);
                if(datas.length >= (PAGE_SIZE / 2)) {
                    popupView.showReadMore(t);
                } else {
                    popupView.hideReadMore(t);
                }
        	} else { // 获取数据异常
        		popupView.showReadMore(t);
        	}
        }
    }
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
//@user: 当前用户
function showNewMsg(msgs, t, user){
    if(getAlertMode()=='dnd'){ return; } //免打扰模式
    if(Settings.get().isShowInPage[t]){
        chrome.tabs.getSelected(null, function(tab) {
            if(!tab){ return; }
            chrome.tabs.sendRequest(tab.id, {method:'showNewMsgInPage', msgs: msgs, t:t, user:user}, function handler(response) {
            });
        });
    }
};

var RefreshManager = {
    itv: {},
    /*
    * 启动定时器
    * @getFirst: 如果为true， 则先发送一次请求，再启动定时器.
    */
    start: function(getFirst){
        //try{
            var userList = getUserList(), refTime = 90;
            for(var j in userList){
                var user = userList[j];
                for(var i in T_LIST[user.blogType]){
                    var uniqueKey = user.uniqueKey, t = T_LIST[user.blogType][i];
                    refTime = Settings.getRefreshTime(user, t);
                    if(getFirst){ checkTimeline(t, null, uniqueKey); }
                    this.itv[uniqueKey+t] = setInterval(checkTimeline, 1000*refTime, t, null, uniqueKey);
                }
            }
        //}catch(err){

        //}
    },
    stop: function(){
        for(var i in this.itv){
            clearInterval(this.itv[i]);
        }
    },
    restart: function(){
        this.stop();
        this.start();
    }
};

setUnreadTimelineCount(0, 'friends_timeline'); //设置提示信息（上次关闭前未读）

RefreshManager.start(true);



function checkNewMsg(t, uniqueKey){
    try{
        checkTimeline(t, null, uniqueKey);
    }catch(err){

    }
}

function onChangeUser(){
    window.c_user = null;
    var c_user = getUser();
    if(c_user){
        window.c_user = c_user;
    }
};

//刷新账号信息
function refreshAccountInfo(){
    var stat = {errorCount: 0, successCount: 0};
    // 获取排序信息
    stat.userList = getUserList(true);
    $("#refresh-account").attr("disabled", true);
    for(var i in stat.userList){
        refreshAccountWarp(stat.userList[i], stat);//由于闭包会造成变量共享问题，所以写多一个包装函数。
    }
};

function refreshAccountWarp(user, stat){
    tapi.verify_credentials(user, function(data, textStatus, errorCode){
    	user.blogType = user.blogType || 'tsina'; //兼容单微博版
        user.authType = user.authType || 'baseauth'; //兼容单微博版
        if(errorCode){
            stat.errorCount++;
        } else {
            $.extend(user, data); //合并，以data的数据为准
            user.uniqueKey = user.blogType + '_' + user.id;
            stat.successCount++;
        }
        if((stat.errorCount + stat.successCount) == stat.userList.length){
        	// 全部刷新完，更新
            saveUserList(stat.userList);
            var c_user = getUser();
            if(c_user){
                if(!c_user.uniqueKey){ //兼容单微博版本
                    c_user.uniqueKey = (c_user.blogType||'tsina') + '_' + c_user.id;
                }
                $.each(stat.userList, function(index, item){
                	if(c_user.uniqueKey.toLowerCase() == item.uniqueKey){
                		c_user = item;
                		return false;
                	}
                });
                setUser(c_user);
            }
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
        var _l_tp = Settings.get().lookingTemplate;
        sendResponse({lookingTemplate: _l_tp});
    },
    getQuickSendInitInfos: function(request, sender, sendResponse){
        var hotkeys = Settings.get().quickSendHotKey;
        var c_user = getUser();
        var userList = getUserList();
        sendResponse({hotkeys: hotkeys, c_user:c_user, userList:userList});
    },
    publicQuickSendMsg: function(request, sender, sendResponse){
        var msg = request.sendMsg;
        var user = request.user;
        var data = {status: msg, user:user};
        tapi.update(data, function(sinaMsg, textStatus){
            if(sinaMsg.id){
                setTimeout(checkNewMsg, 1000, 'friends_timeline');
            }
            sendResponse({msg:sinaMsg, textStatus:textStatus});
        });
    },
    notifyCheckNewMsg: function(request, sender, sendResponse){
        setTimeout(checkNewMsg, 1000, 'friends_timeline');
    }
};




