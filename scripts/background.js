
var itv; //Interval
var tweets = {};
window.checking={};

function checkTimeline(t){
    //var t = 'friends_timeline';
    if(window.checking[t]){ return; }
    window.checking[t] = true;
    var last_id = getLastMsgId(t);
    var params = {count:200, fromplace:30}
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
        if(sinaMsgs && sinaMsgs.length > 0){
            var _last_id = '';
            var c_user = getUser(CURRENT_USER_KEY);
            var _key = c_user.userName + t + '_tweets';
            if(!tweets[_key]){
                tweets[_key] = [];
            }
            tweets[_key] = sinaMsgs.concat(tweets[_key]);
            _last_id = sinaMsgs[0].id;
            
            var popupView = getPopupView();
            if(popupView){
                if(!popupView.addTimelineMsgs(tweets[_key].slice(0, sinaMsgs.length), t)){
                    setUnreadFriendsTimelineCount(sinaMsgs.length, true);
                }
            }

            if(_last_id){
                setLastMsgId(_last_id, t);
            }
        }else{
            setUnreadFriendsTimelineCount(0, true);
        }
        window.checking[t] = false;
    });
};

//function checkSinaFriendsTimeline(){
//    var last_id = getLastFriendsTimeLineMsgId();
//    var params = {count:200, fromplace:30}
//    if(last_id){
//        params['since_id'] = last_id;
//    }
//    sinaApi.friends_timeline(params, function(sinaMsgs, textStatus){
//        if(sinaMsgs && sinaMsgs.length > 0){
//            var tt, m;
//            var last_id = '';
//            var list = [];
//            for(i in sinaMsgs){
//                m = sinaMsgs[i];
//                if(!last_id){
//                    last_id = m.id;
//                }
//                tt = bildMsgLi(m, true);
//                list.push(tt);
//            }
//            var c_user = getUser(CURRENT_USER_KEY);
//            var popupView = getPopupView();
//            if(popupView){
//                if(!popupView.addSinaFriendsTimeline(list)){
//                    setUnreadFriendsTimelineCount(sinaMsgs.length, true);
//                }
//                for(i in list){
//                    list[i] = list[i].replace(/<li class="unread-item/g, '<li class="');
//                }
//                var cache = localStorage.getObject(SINA + c_user.userName + FRIENDS_TIMELINE_KEY + LOCAL_STORAGE_TWEET_LIST_HTML_KEY);
//                if(cache){
//                    list = list.concat(cache);
//                }
//                localStorage.setObject(SINA + c_user.userName + FRIENDS_TIMELINE_KEY + LOCAL_STORAGE_TWEET_LIST_HTML_KEY, 
//                    list);
//            }else{
//                var cache = localStorage.getObject(SINA + c_user.userName + FRIENDS_TIMELINE_KEY + LOCAL_STORAGE_NEW_TWEET_LIST_KEY);
//                if(cache){
//                    list = list.concat(cache);
//                }
//                localStorage.setObject(SINA + c_user.userName + FRIENDS_TIMELINE_KEY + LOCAL_STORAGE_NEW_TWEET_LIST_KEY, 
//                    list);
//                setUnreadFriendsTimelineCount(sinaMsgs.length, true);
//            }
//            if(last_id){
//                setLastFriendsTimeLineMsgId(last_id);
//            }
//        }else{
//            setUnreadFriendsTimelineCount(0, true);
//        }
//    });
//};

//function checkSinaReplies(){
//    var last_id = getLastRepliesMsgId();
//    var params = {count:200, fromplace:30}
//    if(last_id){
//        params['since_id'] = last_id;
//    }
//    sinaApi.mentions(params, function(sinaMsgs, textStatus){
//        if(sinaMsgs && sinaMsgs.length > 0){
//            var popupView = getPopupView();
//            var tt, m;
//            var tts = '';
//            var last_id = '';
//            var list = [];
//            for(i in sinaMsgs){
//                m = sinaMsgs[i];
//                if(!last_id){
//                    last_id = m.id;
//                }
//                tt = bildMsgLi(m, true);
//                list.push(tt);
//            }
//            var c_user = getUser(CURRENT_USER_KEY);
//            var popupView = getPopupView();
//            if(popupView){
//                if(!popupView.addSinaReplies(list)){
//                    setUnreadRepliesCount(sinaMsgs.length, true);
//                }
//                for(i in list){
//                    list[i] = list[i].replace(/<li class="unread-item/g, '<li class="');
//                }
//                var cache = localStorage.getObject(SINA + c_user.userName + REPLIES_KEY + LOCAL_STORAGE_TWEET_LIST_HTML_KEY);
//                if(cache){
//                    list = list.concat(cache);
//                }
//                localStorage.setObject(SINA + c_user.userName + REPLIES_KEY + LOCAL_STORAGE_TWEET_LIST_HTML_KEY, 
//                    list);
//            }else{
//                var cache = localStorage.getObject(SINA + c_user.userName + REPLIES_KEY + LOCAL_STORAGE_NEW_TWEET_LIST_KEY);
//                if(cache){
//                    list = list.concat(cache);
//                }
//                localStorage.setObject(SINA + c_user.userName + REPLIES_KEY + LOCAL_STORAGE_NEW_TWEET_LIST_KEY, 
//                    list);
//                setUnreadRepliesCount(sinaMsgs.length, true);
//            }
//            if(last_id){
//                setLastRepliesMsgId(last_id);
//            }
//        }else{
//            setUnreadRepliesCount(0, true);
//        }
//    });
//};
//
//function checkSinaMessages(){
//    var last_id = getLastMessagesMsgId();
//    var params = {count:200, fromplace:30}
//    if(last_id){
//        params['since_id'] = last_id;
//    }
//    sinaApi.direct_messages(params, function(sinaMsgs, textStatus){
//        if(sinaMsgs && sinaMsgs.length > 0){
//            var popupView = getPopupView();
//            var tt, m;
//            var tts = '';
//            var last_id = '';
//            var list = [];
//            for(i in sinaMsgs){
//                m = sinaMsgs[i];
//                if(!last_id){
//                    last_id = m.id;
//                }
//                tt = bildMsgLi(m, true);
//                list.push(tt);
//            }
//            var c_user = getUser(CURRENT_USER_KEY);
//            var popupView = getPopupView();
//            if(popupView){
//                if(!popupView.addSinaMessages(list)){
//                    setUnreadMessagesCount(sinaMsgs.length, true);
//                }
//                for(i in list){
//                    list[i] = list[i].replace(/<li class="unread-item/g, '<li class="');
//                }
//                var cache = localStorage.getObject(SINA + c_user.userName + MESSAGES_KEY + LOCAL_STORAGE_TWEET_LIST_HTML_KEY);
//                if(cache){
//                    list = list.concat(cache);
//                }
//                localStorage.setObject(SINA + c_user.userName + MESSAGES_KEY + LOCAL_STORAGE_TWEET_LIST_HTML_KEY, 
//                    list);
//            }else{
//                var cache = localStorage.getObject(SINA + c_user.userName + MESSAGES_KEY + LOCAL_STORAGE_NEW_TWEET_LIST_KEY);
//                if(cache){
//                    list = list.concat(cache);
//                }
//                localStorage.setObject(SINA + c_user.userName + MESSAGES_KEY + LOCAL_STORAGE_NEW_TWEET_LIST_KEY, 
//                    list);
//                setUnreadMessagesCount(sinaMsgs.length, true);
//            }
//            if(last_id){
//                setLastMessagesMsgId(last_id);
//            }
//        }else{
//            setUnreadMessagesCount(0, true);
//        }
//    });
//};

function checkNewMsg(){
    try{
        //checkSinaFriendsTimeline();
        //checkSinaReplies();
        //checkSinaMessages();
        checkTimeline('friends_timeline');
        checkTimeline('mentions');
        checkTimeline('direct_messages');
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
    setUnreadFriendsTimelineCount(0, true);
    setUnreadRepliesCount(0, true);
    checkNewMsg();
    itv = setInterval(checkNewMsg, 1000 * 60);
};

function refreshInterval(){
    clearInterval(itv);
    itv = setInterval(checkNewMsg, getRefreshTime());
}

checkNewMsg();
itv = setInterval(checkNewMsg, getRefreshTime());










