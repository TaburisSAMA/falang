
var itv; //Interval
var tweets = {};
var MAX_MSG_ID = {};
window.checking={}; //���ڼ���Ƿ�������΢��
window.paging={}; //���ڻ�ȡ��ҳ΢��

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

//��ȡ���µ�(δ����)΢��
// @t : ��ȡtimeline������
function checkTimeline(t){
    //var t = 'friends_timeline';
    if(window.checking[t]){ return; }
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
        var _key = c_user.userName + t + '_tweets';
        if(!tweets[_key]){
            tweets[_key] = [];
            isFirstTime = true;//��������ڣ���Ϊ��һ�λ�ȡ΢��
        }
        var popupView = getPopupView();

        if(sinaMsgs && sinaMsgs.length > 0){
            
            _last_id = sinaMsgs[0].id;
            _max_id = sinaMsgs[sinaMsgs.length-1].id;
            tweets[_key] = sinaMsgs.concat(tweets[_key]);
            
            if(popupView){
                if(!popupView.addTimelineMsgs(tweets[_key].slice(0, sinaMsgs.length), t)){
                    setUnreadTimelineCount(sinaMsgs.length, t, true);
                    popupView._showMsg('����΢��');
                }
            }else{
                setUnreadTimelineCount(sinaMsgs.length, t, true);
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
        if(isFirstTime){//����ǵ�һ��,���ȡ��ǰ��΢��
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

//��ҳ��ȡ��ǰ��΢��
// @t : ��ȡtimeline������
function getTimelinePage(t){
    //var t = 'friends_timeline';
    if(window.paging[t]){ return; }
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
    itv = setInterval(checkNewMsg, 1000 * 60);
};

function refreshInterval(){
    clearInterval(itv);
    itv = setInterval(checkNewMsg, getRefreshTime());
}

checkNewMsg();
itv = setInterval(checkNewMsg, getRefreshTime());










