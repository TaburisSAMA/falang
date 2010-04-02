var __tt = '<li class="unread-item" did="{{id}}"><div class="usericon"><a target="_blank" href="{{user.url}}"><img src="{{user.profile_image_url.replace("24x24", "32x32")}}" /></a></div>'
			+'	<div class="mainContent">'
			+'		<div class="userName"><a target="_blank" href="{{user.url}}">{{user.screen_name}}</a><span class="edit"><a>回复</a><a>转发</a></span></div>'
			+'		<div class="msg"></div>'
			+'		<div class="msgInfo"></div>'
			+'	</div>'
			+'</li>';

var t_changeUser = '<table id="changeUser" class="tab-none" cellspacing="0" ><tr><td>'
            + '<span class="userName">{{screen_name}}</span>'
            + '<div style="display:none;"><ul>{{user_list}}</lu></div></td>'
            + '<td><img style="width:24px;height:24px;" class="userImg" src="{{profile_image_url}}" /></td></tr></table>';

var pageSize = 20;
var timeline_offset = {};
function getTimelineOffset(t){
    return timeline_offset[t] || pageSize;
}
function setTimelineOffset(t, offset){
    var n = getTimelineOffset(t);
    timeline_offset[t] = n + offset;
}

//var friendsTimeline_offset = replys_offset = messages_offset = pageSize;

function initOnLoad(){
    setTimeout(init, 100);
};

function init(){
    if(!getUser()){
        chrome.tabs.create({url: 'options.html'});
        return;
    }
    //$('a').attr('target', '_blank');
    $('a').live('click', function(){
        var url = $.trim($(this).attr('href'));
        if(url && !url.toLowerCase().indexOf('javascript')==0){
            chrome.tabs.create({url:$(this).attr('href'), selected:false});
            return false;
        }
    });

    $('#ye_dialog_close').click(function(){ hideReplyInput(); });

    initTabs();

    initTxtContentEven();

    initChangeUserList();

    for(i in T_LIST){
        getSinaTimeline(T_LIST[i]);
    }
    //getSinaFriendsTimeline();
    initMsgHover();
    //getSinaReplies();
    //getSinaMessages();

    addUnreadCountToTabs();
    initChangeChannel();
    initIamDoing();

    callCheckNewMsg();

    $(window).unload(function(){ initOnUnload(); }); 
}

function initTabs(){
    window.currentTab = '#friends_timeline_timeline';
    $('.tabs li').click(function() {
        var t = $(this);
        //不进行任何操作							 
        if(t.hasClass('tab-none')) {
            return;
        };
        //添加当前激活的状态
        t.siblings().removeClass('active').end()
                .addClass('active');
        //切换tab
        $('.list_p').hide();
        $(t.attr('href')).show();
        window.currentTab = t.attr('href');
    });
};

function initOnUnload(){
    var c = $("#txtContent").val();
    localStorage.setObject(UNSEND_TWEET_KEY, c||'');
}

function initTxtContentEven(){
//>>>发送嘀咕开始<<<
    var unsendTweet = localStorage.getObject(UNSEND_TWEET_KEY);
    if(unsendTweet){
        $("#txtContent").val(unsendTweet);
        showMsgInput();
        countInputText();
    }

    $("#txtContent").keyup(function(){
        var c = $(this).val();
        if(c){
            showMsgInput();

            countInputText();
        }
    });

    $("#txtContent").blur(function(){
        var c = $.trim($(this).val());
        if(!c){
            hideMsgInput();
        }
    });

    $("#txtContent").keydown(function(event){
        var c = $.trim($(this).val());
        if(event.ctrlKey && event.keyCode==13){
            if(c){
                sendSinaMsg(c);
            }else{
                showMsg('请输入要发送的内容');
            }
            return false;
        }
    });

    $("#btnSend").click(function(){
        var txt = $("#txtContent");
        var c = $.trim(txt.val());
        if(c){
            sendSinaMsg(c);
        }else{
            showMsg('请输入要发送的内容');
        }
    });
//>>>发送嘀咕结束<<<

//>>>回复开始<<<
    $("#replyTextarea").keyup(function(){
        countReplyText();
    });

    $("#replyTextarea").keydown(function(event){
        var c = $.trim($(this).val());
        if(event.ctrlKey && event.keyCode==13){
            sendMsgByActionType(c);
            return false;
        }
    });

    $("#replySubmit").click(function(){
        var txt = $("#replyTextarea");
        var c = $.trim(txt.val());
        sendMsgByActionType(c);
    });
//>>>回复结束<<<
};

function sendMsgByActionType(c){//c:要发送的内容
    if(c){
        var actionType = $('#actionType').val();
        switch(actionType){
            case 'newmsg':
                sendWhisper(c);
                break;
            case 'repost':
                sendRepost(c);
                break;
            case 'comment':
                sendComment(c);
                break;
            case 'reply':
                sendSinaMsg(c, true);
                break;
            default:
                showMsg('检查发送类型出错。');
        }
    }else{
        showMsg('请输入要发送的内容');
    }
}

//统计字数
function countInputText(){
    var c = $("#txtContent").val();
    var len = c.length || 0;
    len = 140 - len;
    $("#wordCount").html(len);
}

function countReplyText(){
    var c = $("#replyTextarea").val();
    var len = c.length || 0;
    len = 140 - len;
    if(len>0){
        len = '你还可以输入' + len + '字';
    }else{
        len = '<em style="color:red;">已超出' + (-len) + '字</em>';
    }
    $("#replyInputCount").html(len);
}

//我正在看
function initIamDoing(){
    $("#doing").click(function(){
        chrome.tabs.getSelected(null, function(tab){
            var loc_url = tab.url;
            if(loc_url){
                var title = tab.title;
                if(isAutoShortUrl() && loc_url.replace(/^https?:\/\//i, '').length > getAutoShortUrlWordCount()){
                    s8Api.shorten({longUrl: loc_url}, function(data){
                        if(data && data.shortUrl){
                            $("#txtContent").val('我正在看 [url=' + data.shortUrl + ']' + (title||data.shortUrl) + '[/url]');
                        }else{
                            $("#txtContent").val('我正在看 [url=' + loc_url + ']' + (title||loc_url) + '[/url]');
                        }
                        showMsgInput();
                        countInputText();
                    },function(xhr, textStatus, errorThrown){
                        $("#txtContent").val('我正在看 [url=' + loc_url + ']' + (title||loc_url) + '[/url]');
                        showMsgInput();
                        countInputText();
                    });
                }else{
                    $("#txtContent").val('我正在看 [url=' + loc_url + ']' + (title||loc_url) + '[/url]');
                    showMsgInput();
                    countInputText();
                }
            }else{
                showMsg('当前页面的URL不正确。');
            }
        });
    });
}

//多用户切换
function initChangeUserList(){
    var c_user = getUser(CURRENT_USER_KEY);
    if(c_user){
        var userList = localStorage.getObject(USER_LIST_KEY);
        var li = [];
        for(i in userList){
            user = userList[i];
            if(user.userName != c_user.userName){
                li.push('<li class="tab-none">' + user.userName + '</li>');
            }else{
                li.push('<li class="tab-none current">' + user.userName + '</li>');
            }
        }
        if(li && li.length>1){
            c_user.screen_name = c_user.screen_name || c_user.userName;
            c_user.user_list = li.join('');
            $('.tabs').append(formatText(t_changeUser, c_user));
            $("#changeUser").click(function(){
                $(this).find('div').toggle();
            });
            $("#changeUser ul li[class!=current]").click(function(){
                var li = $(this);
                changeUser(li.text());
                li.siblings().removeClass('current').end()
                .addClass('current');
            });
        }else if(li){
            c_user.screen_name = c_user.screen_name || c_user.userName;
            c_user.user_list = li.join('');
            $('.tabs').append(formatText(t_changeUser, c_user));
        }

    }
};

//切换tab
function initChangeChannel(){
    $(".tab-friends_timeline").click(function(){
        removeUnreadTimelineCount('friends_timeline');
        $(".tab-friends_timeline .unreadCount").html('');
    });

    $(".tab-mentions").click(function(){
        removeUnreadTimelineCount('mentions');
        $(".tab-mentions .unreadCount").html('');
    });

    $(".tab-direct_messages").click(function(){
        removeUnreadTimelineCount('direct_messages');
        $(".tab-direct_messages .unreadCount").html('');
    });
}

function addUnreadCountToTabs(){
    var ur = 0;
    var tab = '';
    for(i in T_LIST){
        ur = getUnreadTimelineCount(T_LIST[i]);
        if(ur>0){
            tab = $(".tab-" + T_LIST[i]);
            if(tab.length == 1 && !tab.hasClass('active')){
                tab.find('.unreadCount').html('(' + ur + ')');
            }
        }
        ur = 0;
    }
}

function initMsgHover(){
    $(".list li").live("mouseover", function(){
        var li = $(this);
        li.addClass("activeTweet");
        li.find('.edit').show();
    });

    $(".list li").live("mouseout", function(){
        var li = $(this);
        li.removeClass("activeTweet");
        li.find('.edit').hide();
    });
};

//====>>>>>>>>>>>>>>>>>>>>>>

//获取时间线微博列表
//@t : 类型
function getSinaTimeline(t){
    showLoading();
    var _ul = $("#" + t + "_timeline ul.list");
    var c_user = getUser(CURRENT_USER_KEY);
    var b_view = getBackgroundView();
    var _key = c_user.userName + t + '_tweets';
    if(b_view && b_view.tweets[_key]){
        var tweetsAll = b_view.tweets[_key];
        var tweets = tweetsAll.slice(0, pageSize);
        var html = '';
        for(i in tweets){
            html += bildMsgLi(tweets[i], t);
        }
        _ul.append(html);
        if(tweetsAll.length>pageSize){
            showReadMore(t);
        }
    }else{
        b_view.checkTimeline(t);
    }
    hideLoading();
};

//function getSinaFriendsTimeline(){
//    showLoading();
//    var sina_ul = $("#sinaFriendsTimeline");
//    var c_user = getUser(CURRENT_USER_KEY);
//    var cacheNew = localStorage.getObject(SINA + c_user.userName + FRIENDS_TIMELINE_KEY + LOCAL_STORAGE_NEW_TWEET_LIST_KEY);
//    if(cacheNew){
//        sina_ul.append(cacheNew.join(''));
//        localStorage.setObject(SINA + c_user.userName + FRIENDS_TIMELINE_KEY + LOCAL_STORAGE_NEW_TWEET_LIST_KEY, '');
//    }
//    var cache = localStorage.getObject(SINA + c_user.userName + FRIENDS_TIMELINE_KEY + LOCAL_STORAGE_TWEET_LIST_HTML_KEY);
//    if(cache){
//        sina_ul.append(cache.slice(0, pageSize).join(''));
//        if(cache.length > pageSize){
//            showFReadMore();
//        }
//    }
//    if(cacheNew){
//        for(i in cacheNew){
//            var temp = cacheNew[i].replace(/<li class="unread-item/g, '<li class="');
//            cacheNew[i] = temp;
//        }
//        friendsTimeline_offset += cacheNew.length;
//        if(!cache){ cache = []; }
//        cacheNew = cacheNew.concat(cache);
//        cacheNew = cacheNew.slice(0, getCacheCount());
//        localStorage.setObject(SINA + c_user.userName + FRIENDS_TIMELINE_KEY + LOCAL_STORAGE_TWEET_LIST_HTML_KEY, 
//                cacheNew);
//    }
//    removeUnreadFriendsTimelineCount();
//    hideLoading();
//};
//
//function getSinaReplies(){
//    showLoading();
//    var sina_ul = $("#sinaReplies");
//    var c_user = getUser(CURRENT_USER_KEY);
//    var cacheNew = localStorage.getObject(SINA + c_user.userName + REPLIES_KEY + LOCAL_STORAGE_NEW_TWEET_LIST_KEY);
//    if(cacheNew){
//        sina_ul.append(cacheNew.join(''));
//        localStorage.setObject(SINA + c_user.userName + REPLIES_KEY + LOCAL_STORAGE_NEW_TWEET_LIST_KEY, '');
//    }
//    var cache = localStorage.getObject(SINA + c_user.userName + REPLIES_KEY + LOCAL_STORAGE_TWEET_LIST_HTML_KEY);
//    if(cache){
//        sina_ul.append(cache.slice(0, pageSize).join(''));
//        if(cache.length > pageSize){
//            showRReadMore();
//        }
//    }
//    if(cacheNew){
//        for(i in cacheNew){
//            cacheNew[i] = cacheNew[i].replace(/<li class="unread-item/g, '<li class="');
//        }
//        replys_offset += cacheNew.length;
//        if(!cache){ cache = []; }
//        cacheNew = cacheNew.concat(cache);
//        cacheNew = cacheNew.slice(0, getCacheCount());
//        localStorage.setObject(SINA + c_user.userName + REPLIES_KEY + LOCAL_STORAGE_TWEET_LIST_HTML_KEY, 
//                cacheNew );
//    }
//    //removeUnreadRepliesCount();
//    hideLoading();
//};
//
//function getSinaMessages(){
//    showLoading();
//    var sina_ul = $("#sinaMessages");
//    var c_user = getUser(CURRENT_USER_KEY);
//    var cacheNew = localStorage.getObject(SINA + c_user.userName + MESSAGES_KEY + LOCAL_STORAGE_NEW_TWEET_LIST_KEY);
//    if(cacheNew){
//        sina_ul.append(cacheNew.join(''));
//        localStorage.setObject(SINA + c_user.userName + MESSAGES_KEY + LOCAL_STORAGE_NEW_TWEET_LIST_KEY, '');
//    }
//    var cache = localStorage.getObject(SINA + c_user.userName + MESSAGES_KEY + LOCAL_STORAGE_TWEET_LIST_HTML_KEY);
//    if(cache){
//        sina_ul.append(cache.slice(0, pageSize).join(''));
//        if(cache.length > pageSize){
//            showMReadMore();
//        }
//    }
//    if(cacheNew){
//        for(i in cacheNew){
//            cacheNew[i] = cacheNew[i].replace(/<li class="unread-item/g, '<li class="');
//        }
//        messages_offset = cacheNew.length;
//        if(!cache){ cache = []; }
//        cacheNew = cacheNew.concat(cache);
//        cacheNew = cacheNew.slice(0, getCacheCount());
//        localStorage.setObject(SINA + c_user.userName + MESSAGES_KEY + LOCAL_STORAGE_TWEET_LIST_HTML_KEY, 
//                cacheNew );
//    }
//    //removeUnreadMessagesCount();
//    hideLoading();
//};
//<<<<<<<<<<<<<<<<<<<<<<<========

//======>>>>>>>>>>>>>>>>
function showReadMore(t){
    $('<a href="javascript:void(0);" id="' + t + 'ReadMore" class="readMore">更多</a>')
        .appendTo("#" + t + '_timeline .list').css("display", "block");
    $("#" + t + "ReadMore").click(function(){
        //var cache = localStorage.getObject(SINA + getUser().userName + FRIENDS_TIMELINE_KEY + LOCAL_STORAGE_TWEET_LIST_HTML_KEY);
        var _key = getUser().userName + t + '_tweets';
        var cache = getBackgroundView().tweets[_key];
        var tweets = cache.slice(getTimelineOffset(t), getTimelineOffset(t) + pageSize);
        var _html = '';
        for(i in tweets){
            _html += bildMsgLi(tweets[i], t);
        }
        $(this).before(_html);
        setTimelineOffset(t, pageSize);
        if(getTimelineOffset(t) > cache.length){
            $(this).hide();
        }
    });
};

//function showFReadMore(){
//    $('<a href="javascript:void(0);" id="FReadMore" class="readMore">更多</a>')
//        .appendTo("#sinaFriendsTimeline").css("display", "block");
//    $("#FReadMore").click(function(){
//        var cache = localStorage.getObject(SINA + getUser().userName + FRIENDS_TIMELINE_KEY + LOCAL_STORAGE_TWEET_LIST_HTML_KEY);
//        $(this).before(cache.slice(friendsTimeline_offset, friendsTimeline_offset + pageSize).join(''));
//        friendsTimeline_offset += pageSize;
//        if(friendsTimeline_offset > cache.length){
//            $(this).hide();
//        }
//    });
//};
//
//function showRReadMore(){
//    $('<a href="javascript:void(0);" id="RReadMore" class="readMore">更多</a>')
//        .appendTo("#sinaReplies").css("display", "block");
//    $("#RReadMore").click(function(){
//        var cache = localStorage.getObject(SINA + getUser().userName + REPLIES_KEY + LOCAL_STORAGE_TWEET_LIST_HTML_KEY);
//        $(this).before(cache.slice(friendsTimeline_offset, friendsTimeline_offset + pageSize).join(''));
//        friendsTimeline_offset += pageSize;
//        if(friendsTimeline_offset > cache.length){
//            $(this).hide();
//        }
//    });
//};
//
//function showMReadMore(){
//    $('<a href="javascript:void(0);" id="MReadMore" class="readMore">更多</a>')
//        .appendTo("#sinaMessages").css("display", "block");
//    $("#MReadMore").click(function(){
//        var cache = localStorage.getObject(SINA + getUser().userName + MESSAGES_KEY + LOCAL_STORAGE_TWEET_LIST_HTML_KEY);
//        $(this).before(cache.slice(friendsTimeline_offset, friendsTimeline_offset + pageSize).join(''));
//        friendsTimeline_offset += pageSize;
//        if(friendsTimeline_offset > cache.length){
//            $(this).hide();
//        }
//    });
//};
//<<<<<<<<<<<======

//====>>>>>>>>>>>>>>>>>>
/*如果当前tab是激活的，就返回true，否则返回false(即为未读)*/
function addTimelineMsgs(msgs, t){
    var html = '';
    for(i in msgs){
        html += bildMsgLi(msgs[i]);
    }
    var _ul = $("#" + t + "_timeline ul.list");
    _ul.prepend(html);
    var li = $('.tab-' + t);
    if(!li.hasClass('active')){
        var ur = getUnreadTimelineCount(t);
        ur += msgs.length;
        if(ur>0){
            li.find('.unreadCount').html('(' + ur + ')');
        }
        return false;
    }
    return true;
};

//function addSinaFriendsTimeline(msgs){
//    $("#sinaFriendsTimeline").prepend(msgs.join(''));
//    var li = $('.tab-0');
//    if(!li.hasClass('active')){
//        var ur = getUnreadFriendsTimelineCount();
//        ur += msgs.length;
//        if(ur>0){
//            li.find('.unreadCount').html('(' + ur + ')');
//        }
//        return false;
//    }
//    return true;
//};
//
//function addSinaReplies(msgs){
//    $("#sinaReplies").prepend(msgs.join(''));
//    var li = $('.tab-1');
//    if(!li.hasClass('active')){
//        var ur = getUnreadRepliesCount();
//        ur += msgs.length;
//        if(ur>0){
//            li.find('.unreadCount').html('(' + ur + ')');
//        }
//        return false;
//    }
//    return true;
//};
//
//function addSinaMessages(msgs){
//    $("#sinaMessages").prepend(msgs.join(''));
//    var li = $('.tab-2');
//    if(!li.hasClass('active')){
//        var ur = getUnreadMessagesCount();
//        ur += msgs.length;
//        if(ur>0){
//            li.find('.unreadCount').html('(' + ur + ')');
//        }
//        return false;
//    }
//    return true;
//};
//<<<<<<<<<<<<<<<<====

function changeUser(userName){
    friendsTimeline_offset = replys_offset = messages_offset = pageSize;//复位分页
    var userList = localStorage.getObject(USER_LIST_KEY);
    var to_user = null;
    for(i in userList){
        var user = userList[i];
        if(user.userName.toLowerCase() == userName.toLowerCase()){
            to_user = user;
        }
    }
    if(to_user){
        for(i in T_LIST){
            $("#" + T_LIST[i] + '_timeline .list').html('');
        }
        $("#changeUser .userName").html(to_user.screen_name || to_user.userName);
        $("#changeUser .userImg").attr('src', to_user.profile_image_url || '');
        setUser(to_user);
        for(i in T_LIST){
            getSinaTimeline(T_LIST[i]);
        }
        //getSinaFriendsTimeline();
        //getSinaReplies();
        //getSinaMessages();
        var b_view = getBackgroundView();
        b_view.onChangeUser();
    }
}

function sendSinaMsg(msg, isReply){
    var btn, txt, data;
    if(isReply){
        btn = $("#replySubmit");
        txt = $("#replyTextarea");
        var userName = $("#ye_dialog_title").text();
        msg = userName + ' ' + msg;
        var tweetId = $("#replyTweetId").val();
        data = {sina_id: tweetId};
    }else{
        btn = $("#btnSend");
        txt = $("#txtContent");
        data = {};
    }
    
    btn.attr('disabled','true');
    txt.attr('disabled','true');
    data['status'] = msg;
    sinaApi.update(data, function(sinaMsg, textStatus){
        if(sinaMsg.id){
            if(isReply){
                hideReplyInput();
            }else{
                hideMsgInput();
            }
            txt.val('');
            setTimeout(callCheckNewMsg, 1000);
            showMsg('发送成功！');
        }else if(sinaMsg.error){
            showMsg('error: ' + sinaMsg.error);
        }
        btn.removeAttr('disabled');
        txt.removeAttr('disabled');
    });
};

function sendWhisper(msg){
    var btn, txt, data;
    btn = $("#replySubmit");
    txt = $("#replyTextarea");
    var toUserId = $('#whisperToUserId').val();
    data = {text: msg, id:toUserId};
    
    btn.attr('disabled','true');
    txt.attr('disabled','true');
    sinaApi.new_message(data, function(sinaMsg, textStatus){
        if(sinaMsg.id){
            hideReplyInput();
            txt.val('');
            //setTimeout(callCheckNewMsg, 1000);
            showMsg('发送成功！');
        }else if(sinaMsg.error){
            showMsg('error: ' + sinaMsg.error);
        }
        btn.removeAttr('disabled');
        txt.removeAttr('disabled');
    });
};

function sendRepost(msg){
    var btn, txt, data;
    btn = $("#replySubmit");
    txt = $("#replyTextarea");
    var repostTweetId = $('#repostTweetId').val();
    data = {status: msg, id:repostTweetId};
    
    btn.attr('disabled','true');
    txt.attr('disabled','true');
    sinaApi.repost(data, function(sinaMsg, textStatus){
        if(sinaMsg.id){
            hideReplyInput();
            txt.val('');
            setTimeout(callCheckNewMsg, 1000);
            showMsg('发送成功！');
        }else if(sinaMsg.error){
            showMsg('error: ' + sinaMsg.error);
        }
        btn.removeAttr('disabled');
        txt.removeAttr('disabled');
    });
};

function sendComment(msg){
    var btn, txt, data;
    btn = $("#replySubmit");
    txt = $("#replyTextarea");
    var commentTweetId = $('#commentTweetId').val();
    data = {comment: msg, id:commentTweetId};
    
    btn.attr('disabled','true');
    txt.attr('disabled','true');
    sinaApi.comment(data, function(sinaMsg, textStatus){
        if(sinaMsg.id){
            hideReplyInput();
            txt.val('');
            //setTimeout(callCheckNewMsg, 1000);
            showMsg('发送成功！');
        }else if(sinaMsg.error){
            showMsg('error: ' + sinaMsg.error);
        }
        btn.removeAttr('disabled');
        txt.removeAttr('disabled');
    });
};

function callCheckNewMsg(){
    var b_view = getBackgroundView();
    if(b_view){
        b_view.checkNewMsg();
    }
}

function showMsgInput(){
    $(".list").css('height', '320');
    $("#doing").removeClass("doing").appendTo('#doingWarp');
    $("#txtContent").attr('rows', 5).removeClass('padDoing');
    $("#submitWarp").show();
};

function hideMsgInput(){
    $("#submitWarp").hide();
    $("#txtContent").attr('rows', 1).val('').addClass('padDoing');
    $(".list").css('height', '400');
    $("#doing").addClass("doing").appendTo('body');
};

function hideReplyInput(){
    $("#ye_dialog_window").hide();
};

//====>>>>>>>>>>>>>>>
function doReply(ele, userName, tweetId){//回复
    $('#actionType').val('reply');
    $('#replyTweetId').val(tweetId);
    $('#replyUserName').val(userName);
    $('#ye_dialog_title').html('@' + userName);
    $('#ye_dialog_window').show();
    $('#replyTextarea').val('').focus();
    countReplyText();
};

function doRepost(ele, userName, tweetId){//转发
    $('#actionType').val('repost');
    $('#repostTweetId').val(tweetId);
    $('#replyUserName').val(userName);
    $('#ye_dialog_title').html('转发@' + userName + ' 的信息');
    $('#ye_dialog_window').show();
    var d = $(ele).parent().parent().parent().parent().find('.msgObjJson').text();
    try{
        d = JSON.parse(d);
    }
    catch(err){
        d = null;
    }
    var v = '';
    if(d && d.retweeted_status){
        v = '//' + d.text;
    }
    var t = $('#replyTextarea');
    t.focus().val('').blur();
    t.val(v).focus();
    countReplyText();
};

function doComment(ele, userName, tweetId){//评论
    $('#actionType').val('comment');
    $('#commentTweetId').val(tweetId);
    $('#replyUserName').val(userName);
    $('#ye_dialog_title').html('评论@' + userName + ' 的信息');
    $('#ye_dialog_window').show();
    $('#replyTextarea').val('').focus();
    countReplyText();
};

function doNewMessage(ele, userName, toUserId){//悄悄话
    $('#actionType').val('newmsg');
    $('#whisperToUserId').val(toUserId);
    $('#replyUserName').val(userName);
    $('#ye_dialog_title').html('给@' + userName + ' 悄悄话');
    $('#ye_dialog_window').show();
    $('#replyTextarea').val('').focus();
    countReplyText();
};

function doRT(ele){//转嘀
    var data = $(ele).closest('li').find('.msgObjJson').text();
    data = JSON.parse(data);
    var t = $("#txtContent");
    t.focus();
    t.val('转: ' + '@' + data.user.name + ' ' + data.text);
    showMsgInput();

    countInputText();
};

function doDelTweet(tweetId, ele){//删除自己的嘀咕
    if(!tweetId){return;}
    sinaApi.destroy({id:tweetId}, function(data, textStatus){
        if(data && !data.error){
            $(ele).closest('li').remove();
            var cacheKey = '';
            if(window.currentTab.toLowerCase() == '#sinafriendstimeline'){
                cacheKey = FRIENDS_TIMELINE_KEY + LOCAL_STORAGE_TWEET_LIST_HTML_KEY;
            }else if(window.currentTab.toLowerCase() == '#sinareplies'){
                cacheKey = REPLIES_KEY + LOCAL_STORAGE_TWEET_LIST_HTML_KEY;
            }else if(window.currentTab.toLowerCase() == '#sinamessages'){
                cacheKey = MESSAGES_KEY + LOCAL_STORAGE_TWEET_LIST_HTML_KEY;
            }
            if(cacheKey){
                var c_user = getUser(CURRENT_USER_KEY);
                var cache = localStorage.getObject(SINA + c_user.userName + cacheKey);
                if(cache){
                    var idi = 'did="' + tweetId + '"';
                    for(i in cache){
                        if(cache[i].indexOf(idi) > -1){
                            cache.splice(i, 1);
                            break;
                        }
                    }
                    localStorage.setObject(SINA + c_user.userName + cacheKey, 
                        cache );
                }
            }
        }
    });
};
//<<<<<<<<<<<<<=====