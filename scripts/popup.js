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

var fawave = {};
//var PAGE_SIZE = 20;
var timeline_offset = {};
function getTimelineOffset(t){
    return timeline_offset[t] || PAGE_SIZE;
}
function setTimelineOffset(t, offset){
    var n = getTimelineOffset(t);
    timeline_offset[t] = n + offset;
}

//var friendsTimeline_offset = replys_offset = messages_offset = PAGE_SIZE;

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

    //for(i in T_LIST){
    //    getSinaTimeline(T_LIST[i]);
    //}
    getSinaTimeline('friends_timeline');

    initMsgHover();

    addUnreadCountToTabs();
    initIamDoing();

    //callCheckNewMsg();

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
        var c_t = t.attr('href').replace('#','').replace(/_timeline$/i,'');
        var c_ul = $(t.attr('href'));
        c_ul.show();
        window.currentTab = t.attr('href');
        if(!c_ul.find('ul.list').html()){
            getSinaTimeline(c_t);
        }
        

        
        removeUnreadTimelineCount(c_t);
        t.find(".unreadCount").html('');
    });
};

function initOnUnload(){
    var c = $("#txtContent").val();
    if(c=='     点此输入您要分享的内容'){
        c='';
    }
    localStorage.setObject(UNSEND_TWEET_KEY, c||'');
}

function initTxtContentEven(){
//>>>发送微博开始<<<
    var unsendTweet = localStorage.getObject(UNSEND_TWEET_KEY);
    if(unsendTweet){
        $("#txtContent").val(unsendTweet);
        //showMsgInput();
        //countInputText();
    }

    $("#txtContent").keyup(function(){
        var c = $(this).val();
        countInputText();
        //if(c){
        //    showMsgInput();
        //}
    });

    $("#txtContent").blur(function(){
        var c = $.trim($(this).val());
        if(!c){
            //hideMsgInput();
        }
    });

    $("#txtContent").focus(function(){
        if($(this).val()=='     点此输入您要分享的内容'){
            $(this).val('');
        }
        showMsgInput();
        countInputText();
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
        len = '(你还可以输入' + len + '字)';
    }else{
        len = '(<em style="color:red;">已超出' + (-len) + '字</em>)';
    }
    $("#replyInputCount").html(len);
}

function cleanTxtContent(){
    $("#txtContent").val('');
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
                            $("#txtContent").val('我正在看: ' + (title||'') + ' ' + data.shortUrl + ' ');
                            //$("#txtContent").val('我正在看 [url=' + data.shortUrl + ' ]' + (title||data.shortUrl) + '[/url]');
                        }else{
                            $("#txtContent").val('我正在看: ' + (title||'') + ' ' + loc_url + ' ');
                            //$("#txtContent").val('我正在看 [url=' + loc_url + ' ]' + (title||loc_url) + '[/url]');
                        }
                        showMsgInput();
                        countInputText();
                    },function(xhr, textStatus, errorThrown){
                        $("#txtContent").val('我正在看: ' + (title||'') + ' ' + loc_url + ' ');
                        //$("#txtContent").val('我正在看 [url=' + loc_url + ' ]' + (title||loc_url) + '[/url]');
                        showMsgInput();
                        countInputText();
                    });
                }else{
                    $("#txtContent").val('我正在看: ' + (title||'') + ' ' + loc_url + ' ');
                    //$("#txtContent").val('我正在看 [url=' + loc_url + ' ]' + (title||loc_url) + '[/url]');
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

function addUnreadCountToTabs(){
    var ur = 0;
    var tab = '';
    for(i in T_LIST){
        ur = getUnreadTimelineCount(T_LIST[i]);
        if(ur>0){
            tab = $(".tab-" + T_LIST[i]);
            if(tab.length == 1 && !tab.hasClass('active')){
                tab.find('.unreadCount').html('(' + ur + ')');
            }else{
                removeUnreadTimelineCount(T_LIST[i]);
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
    if(b_view && b_view.tweets[_key] != undefined && b_view.tweets[_key].length>0){
        var tweetsAll = b_view.tweets[_key];
        var tweets = tweetsAll.slice(0, PAGE_SIZE);
        var html = '';
        var ids = [];
        for(i in tweets){
            html += bildMsgLi(tweets[i], t);
            ids.push(tweets[i].id);
            if(tweets[i].retweeted_status){
                ids.push(tweets[i].retweeted_status.id);
            }else if(tweets[i].status){
                ids.push(tweets[i].status.id);
            }
        }
        _ul.append(html);
        if(ids.length>0){
            showCounts(t, ids.join(','));
        }
        if(tweetsAll.length >= (PAGE_SIZE/2)){
            showReadMore(t);
        }
        hideLoading();
    }else{
        b_view.checkTimeline(t);
    }
    //hideLoading();
};
//<<<<<<<<<<<<<<<<<<<<<<<========

//显示评论数和回复数
function showCounts(t, ids){
    //if(window.currentTab != '#'+t+'_timeline'){return;}
    if(['direct_messages'].indexOf(t) >= 0){return;}

    showLoading();
    var data = {ids:ids}
    sinaApi.counts(data, function(counts, textStatus){
        if(textStatus != 'error' && counts && !counts.error){
            if(counts.length && counts.length>0){
                for(i in counts){
                    $('#'+ t +'_timeline .showCounts_'+counts[i].id).each(function(){
                        var _li = $(this);
                        var _edit = _li.find('.edit:eq(0)');
                        if(_edit){
                            _edit.find('.repostCounts').html('('+ counts[i].rt +')');
                            var _comm_txt = '(0)';
                            if(counts[i].comments>0){
                                _comm_txt = '(<a href="javascript:void(0);" title="点击查看评论" onclick="showComments(this,' + counts[i].id + ')">' +counts[i].comments + '</a>)';
                            }
                            _edit.find('.commentCounts').html(_comm_txt);
                        }
                    });
                }
            }
        }
        hideLoading();
    });
}//<<<<<===========

//======>>>>>>> 查看评论 <<<<<<<
//@ele: 触发该事件的元素
//@tweetId: 微博ID
//@page: 分页
//@notHide: 不要隐藏评论列表
function showComments(ele,tweetId, page, notHide){
    if(tweetId){
        var tweetItem = $(ele).closest('.tweetItem');
        var tweetWrap = tweetItem.children('.mainContent');
        tweetWrap = tweetWrap.length>0 ? tweetWrap : tweetItem;
        var commentWrap = tweetWrap.children('.comments');
        if(!notHide && commentWrap.css('display') != 'none'){
            commentWrap.hide();
            return;
        }else if(!notHide && commentWrap.children('.comment_list').html()){
            commentWrap.show();
            return;
        }
        showLoading();
        page = page || 1;
        var data = {id:tweetId, page:page, count:COMMENT_PAGE_SIZE};
        sinaApi.comments(data, function(comments, textStatus){
            if(textStatus != 'error' && comments && !comments.error){
                if(comments.length && comments.length>0){
                    var _html = '';
                    for(i in comments){
                        var comment_li = buildComment(comments[i]);
                        _html += comment_li;
                    }
                    commentWrap.children('.comment_list').html(_html);
                    commentWrap.show();
                    if(page<2){
                        commentWrap.find('.comment_paging a:eq(0)').hide();
                    }else{
                        commentWrap.find('.comment_paging a:eq(0)').show();
                    }
                    if(comments.length < COMMENT_PAGE_SIZE){
                        commentWrap.find('.comment_paging a:eq(1)').hide();
                    }else{
                        commentWrap.find('.comment_paging a:eq(1)').show();
                    }
                    commentWrap.find('.comment_paging').attr('page',page).show();
                }else{
                    if(page==1){
                        commentWrap.find('.comment_paging').hide();
                    }else{
                        commentWrap.find('.comment_paging a:eq(1)').hide();
                    }
                }
            }
            hideLoading();
        });
    }
};

function commentPage(ele, tweetId, is_pre){
    var $this = $(ele);
    var page_wrap = $this.parent();
    var page = Number(page_wrap.attr('page'));
    if(isNaN(page)){page=1;}
    if(page==1 && is_pre){
        $this.hide();
        return;
    }
    page = is_pre ? page-1 : page+1;
    page_wrap.hide();
    showComments(ele, tweetId, page, true);
}
//<<<<<<<<<<<======

//======>>>>>>> 更多(分页) <<<<<<<
function showReadMore(t){
    $("#" + t + "ReadMore").css({display:"block"});
};

function hideReadMore(t){
    $("#" + t + "ReadMore").hide();
}

function readMore(t){
    var moreEle = $("#" + t + "ReadMore");
    hideReadMore(t);
    showLoading();
    var _b_view = getBackgroundView();
    var _key = getUser().userName + t + '_tweets';
    var cache = _b_view.tweets[_key];
    if(getTimelineOffset(t) >= cache.length){
        _b_view.getTimelinePage(t);
    }else{
        var tweets = cache.slice(getTimelineOffset(t), getTimelineOffset(t) + PAGE_SIZE);
        var _html = '';
        var ids = [];
        for(i in tweets){
            _html += bildMsgLi(tweets[i], t);
            ids.push(tweets[i].id);
            if(tweets[i].retweeted_status){
                ids.push(tweets[i].retweeted_status.id);
            }else if(tweets[i].status){
                ids.push(tweets[i].status.id);
            }
        }
        //moreEle.before(_html);
        $("#" + t + "_timeline ul.list").append(_html);
        setTimelineOffset(t, PAGE_SIZE);
        showReadMore(t);
        hideLoading();
        if(ids.length>0){
            showCounts(t, ids.join(','));
        }
    }
};
//<<<<<<<<<<<======

//====>>>>>>>>>>>>>>>>>>
/*如果当前tab是激活的，就返回true，否则返回false(即为未读)*/
function addTimelineMsgs(msgs, t){
    
    var li = $('.tab-' + t);
    if(!li.hasClass('active')){
        $("#" + t + "_timeline ul.list").html('');
        var c_user = getUser(CURRENT_USER_KEY), _msg_user = null, _unreadCount = 0;
        for(i in msgs){
            _msg_user = msgs[i].user || msgs[i].sender;
            if(_msg_user.id != c_user.id){
                _unreadCount += 1;
            }
        }
        var ur = getUnreadTimelineCount(t);
        ur += _unreadCount;
        if(ur>0){
            li.find('.unreadCount').html('(' + ur + ')');
        }
        return false;
    }else{
        var html = '';
        var ids = [];
        var _unreadCount = 0;
        for(i in msgs){
            html += bildMsgLi(msgs[i], t);
            ids.push(msgs[i].id);
            if(msgs[i].retweeted_status){
                ids.push(msgs[i].retweeted_status.id);
            }else if(msgs[i].status){
                ids.push(msgs[i].status.id);
            }
        }
        var _ul = $("#" + t + "_timeline ul.list");
        _ul.prepend(html);
        if(ids.length>0){
            showCounts(t, ids.join(','));
        }
    }
    return true;
};

function addPageMsgs(msgs, t){
    setTimelineOffset(t, msgs.length);
    var html = '';
    var ids = [];
    for(i in msgs){
        html += bildMsgLi(msgs[i], t);
        ids.push(msgs[i].id);
        if(msgs[i].retweeted_status){
            ids.push(msgs[i].retweeted_status.id);
        }else if(msgs[i].status){
            ids.push(msgs[i].status.id);
        }
    }
    var _ul = $("#" + t + "_timeline ul.list");
    _ul.append(html);
    if(ids.length>0){
        showCounts(t, ids.join(','));
    }
    hideLoading();
};
//<<<<<<<<<<<<<<<<====

function changeUser(userName){
    friendsTimeline_offset = replys_offset = messages_offset = PAGE_SIZE;//复位分页
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
            $("#" + T_LIST[i] + '_timeline .readMore').hide();
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

function sendRepost(msg, repostTweetId, notSendMord){
    var btn, txt, data;
    btn = $("#replySubmit");
    txt = $("#replyTextarea");
    repostTweetId = repostTweetId || $('#repostTweetId').val();
    data = {status: msg, id:repostTweetId};
    
    btn.attr('disabled','true');
    txt.attr('disabled','true');
    sinaApi.repost(data, function(sinaMsg, textStatus){
        if(sinaMsg.id){
            hideReplyInput();
            txt.val('');
            setTimeout(callCheckNewMsg, 1000);
            showMsg('转发成功！');
        }else if(sinaMsg.error){
            showMsg('error: ' + sinaMsg.error);
        }
        btn.removeAttr('disabled');
        txt.removeAttr('disabled');
    });

    if(!notSendMord){
        if($('#chk_sendOneMore').attr("checked") && $('#chk_sendOneMore').val()){
            sendComment(msg, $('#chk_sendOneMore').val(), true);
        }
        if($('#chk_sendOneMore2').attr("checked") && $('#chk_sendOneMore2').val()){
            sendComment(msg, $('#chk_sendOneMore2').val(), true);
        }
    }
};

function sendComment(msg, commentTweetId, notSendMord){
    var btn, txt, data;
    btn = $("#replySubmit");
    txt = $("#replyTextarea");
    commentTweetId = commentTweetId || $('#commentTweetId').val();
    data = {comment: msg, id:commentTweetId};
    
    btn.attr('disabled','true');
    txt.attr('disabled','true');
    sinaApi.comment(data, function(sinaMsg, textStatus){
        if(sinaMsg.id){
            hideReplyInput();
            txt.val('');
            //setTimeout(callCheckNewMsg, 1000);
            showMsg('发送评论成功！');
        }else if(sinaMsg.error){
            showMsg('error: ' + sinaMsg.error);
        }
        btn.removeAttr('disabled');
        txt.removeAttr('disabled');
    });

    if(!notSendMord){
        if($('#chk_sendOneMore').attr("checked") && $('#chk_sendOneMore').val()){
            sendRepost(msg, $('#chk_sendOneMore').val(), true);
        }
    }
};

function callCheckNewMsg(){
    var b_view = getBackgroundView();
    if(b_view){
        b_view.checkNewMsg();
    }
}

function showMsgInput(){
    $(".list_warp").css('height', '390');
    $("#doing").removeClass("doing").appendTo('#doingWarp');
    $("#txtContent").attr('rows', 5).removeClass('padDoing');
    $("#submitWarp").show();
};

function hideMsgInput(){
    fawave.face.hide();
    var v = $("#txtContent").val() || '     点此输入您要分享的内容';
    $("#submitWarp").hide();
    $("#txtContent").attr('rows', 1).val(v).addClass('padDoing');
    $(".list_warp").css('height', '470');
    $("#doing").addClass("doing").appendTo('body');
};

function hideReplyInput(){
    fawave.face.hide();
    $("#ye_dialog_window").hide();
};

//====>>>>>>>>>>>>>>>
function doReply(ele, userName, tweetId){//@回复
    $('#actionType').val('reply');
    $('#replyTweetId').val(tweetId);
    $('#replyUserName').val(userName);
    $('#ye_dialog_title').html('@' + userName);

    $('#chk_sendOneMore').attr("checked", false).val('').hide();
    $('#txt_sendOneMore').text('').hide();
    $('#chk_sendOneMore2').attr("checked", false).val('').hide();
    $('#txt_sendOneMore2').text('').hide();

    $('#ye_dialog_window').show();
    $('#replyTextarea').val('').focus();
    countReplyText();
};

/*
    @ele: 触发该事件的元素
    @userName: 当前微博的用户名
    @tweetId: 微博的id
    @rtUserName: 转发微博的用户名
    @reTweetId: 转发的微薄id
*/
function doRepost(ele, userName, tweetId, rtUserName, reTweetId){//转发
    $('#actionType').val('repost');
    $('#repostTweetId').val(tweetId);
    $('#replyUserName').val(userName);
    $('#ye_dialog_title').html('转发@' + userName + ' 的信息');

    $('#chk_sendOneMore').attr("checked", false).val(tweetId);
    $('#txt_sendOneMore').text('同时给 @' + userName + ' 评论');
    if(rtUserName && reTweetId){
        $('#chk_sendOneMore2').attr("checked", false).val(reTweetId).show();
        $('#txt_sendOneMore2').text('同时给 @' + rtUserName + ' 评论').show();
    }else{
        $('#chk_sendOneMore2').attr("checked", false).val('').hide();
        $('#txt_sendOneMore2').text('').hide();
    }

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
        v = '//@' + userName + ':' + d.text;
    }else{
        v = '转发微博.';
    }
    var t = $('#replyTextarea');
    t.focus().val('').blur();
    t.val(v).focus();
    if(v=='转发微博.'){t.select();}
    countReplyText();
};

function doComment(ele, userName, tweetId, replyUserName){//评论
    $('#actionType').val('comment');
    $('#commentTweetId').val(tweetId);
    $('#replyUserName').val(userName);
    $('#ye_dialog_title').html('评论@' + userName + ' 的信息');
    $('#ye_dialog_window').show();
    var _txt = replyUserName ? ('回 @'+replyUserName+':') : '';

    $('#chk_sendOneMore').val(tweetId);
    $('#txt_sendOneMore').text('同时发一条微博');
    $('#chk_sendOneMore2').val('').hide();
    $('#txt_sendOneMore2').text('').hide();

    $('#replyTextarea').focus().val(_txt);
    countReplyText();
};

function doNewMessage(ele, userName, toUserId){//悄悄话
    $('#actionType').val('newmsg');
    $('#whisperToUserId').val(toUserId);
    $('#replyUserName').val(userName);
    $('#ye_dialog_title').html('给@' + userName + ' 发送私信');

    $('#chk_sendOneMore').attr("checked", false).val('').hide();
    $('#txt_sendOneMore').text('').hide();
    $('#chk_sendOneMore2').attr("checked", false).val('').hide();
    $('#txt_sendOneMore2').text('').hide();

    $('#ye_dialog_window').show();
    $('#replyTextarea').val('').focus();
    countReplyText();
};

function doRT(ele){//RT
    var data = $(ele).closest('li').find('.msgObjJson').text();
    data = JSON.parse(data);
    var t = $("#txtContent");
    t.focus();
    var _msg_user = data.user || data.sender;
    t.val('转: ' + '@' + _msg_user.screen_name + ' ' + data.text);
    showMsgInput();

    countInputText();
};

function doDelTweet(tweetId, ele){//删除自己的微博
    if(!tweetId){return;}
    showLoading();
    sinaApi.destroy({id:tweetId}, function(data, textStatus){
        if(textStatus != 'error' && data && !data.error){
            $(ele).closest('li').remove();
            var t = window.currentTab.replace('#','').replace(/_timeline$/i,'');
            var c_user = getUser(CURRENT_USER_KEY);
            var cacheKey = c_user.userName + t + '_tweets';
            var b_view = getBackgroundView();
            if(b_view && b_view.tweets[cacheKey]){
                var cache = b_view.tweets[cacheKey];
                for(i in cache){
                    if(cache[i].id == tweetId){
                        cache.splice(i, 1);
                        break;
                    }
                }
            }
            showMsg('删除成功');
        }else{
            showMsg('删除失败');
        }
    });
};
function doDelComment(ele, screen_name, tweetId){//删除评论
    if(!tweetId){return;}
    showLoading();
    sinaApi.comment_destroy({id:tweetId}, function(data, textStatus){
        if(textStatus != 'error' && data && !data.error){
            $(ele).closest('li').remove();
            var t = window.currentTab.replace('#','').replace(/_timeline$/i,'');
            var c_user = getUser(CURRENT_USER_KEY);
            var cacheKey = c_user.userName + t + '_tweets';
            var b_view = getBackgroundView();
            if(b_view && b_view.tweets[cacheKey]){
                var cache = b_view.tweets[cacheKey];
                for(i in cache){
                    if(cache[i].id == tweetId){
                        cache.splice(i, 1);
                        break;
                    }
                }
            }
            showMsg('删除成功');
        }else{
            showMsg('删除失败');
        }
    });
};
function delDirectMsg(ele, screen_name, tweetId){//删除私信
    if(!tweetId){return;}
    showLoading();
    sinaApi.destroy_msg({id:tweetId}, function(data, textStatus){
        if(textStatus != 'error' && data && !data.error){
            $(ele).closest('li').remove();
            var t = window.currentTab.replace('#','').replace(/_timeline$/i,'');
            var c_user = getUser(CURRENT_USER_KEY);
            var cacheKey = c_user.userName + t + '_tweets';
            var b_view = getBackgroundView();
            if(b_view && b_view.tweets[cacheKey]){
                var cache = b_view.tweets[cacheKey];
                for(i in cache){
                    if(cache[i].id == tweetId){
                        cache.splice(i, 1);
                        break;
                    }
                }
            }
            showMsg('删除成功');
        }else{
            showMsg('删除失败');
        }
    });
};
function addFavorites(ele, screen_name, tweetId){//删除私信
    if(!tweetId){return;}
    showLoading();
    var _a = $(ele);
    var _aHtml = _a[0].outerHTML;
    _a.hide();
    sinaApi.favorites_create({id:tweetId}, function(data, textStatus){
        if(textStatus != 'error' && data && !data.error){
            _a.after(_aHtml.replace('addFavorites','delFavorites')
                            .replace('favorites_2.gif','favorites.gif')
                            .replace('点击收藏','点击取消收藏'));
            _a.remove();
            var t = window.currentTab.replace('#','').replace(/_timeline$/i,'');
            var c_user = getUser(CURRENT_USER_KEY);
            var cacheKey = c_user.userName + t + '_tweets';
            var b_view = getBackgroundView();
            if(b_view && b_view.tweets[cacheKey]){
                var cache = b_view.tweets[cacheKey];
                for(i in cache){
                    if(cache[i].id == tweetId){
                        cache[i].favorited = true;
                        break;
                    }
                }
            }
            showMsg('成功收藏');
        }else{
            showMsg('收藏失败');
            _a.show();
        }
    });
};
function delFavorites(ele, screen_name, tweetId){//删除私信
    if(!tweetId){return;}
    showLoading();
    var _a = $(ele);
    var _aHtml = _a[0].outerHTML;
    _a.hide();
    sinaApi.favorites_destroy({id:tweetId}, function(data, textStatus){
        if(textStatus != 'error' && data && !data.error){
            _a.after(_aHtml.replace('delFavorites','addFavorites')
                            .replace('favorites.gif','favorites_2.gif')
                            .replace('点击取消收藏','点击收藏'));
            _a.remove();
            var t = window.currentTab.replace('#','').replace(/_timeline$/i,'');
            var c_user = getUser(CURRENT_USER_KEY);
            var cacheKey = c_user.userName + t + '_tweets';
            var b_view = getBackgroundView();
            if(b_view && b_view.tweets[cacheKey]){
                var cache = b_view.tweets[cacheKey];
                for(i in cache){
                    if(cache[i].id == tweetId){
                        cache[i].favorited = false;
                        break;
                    }
                }
            }
            showMsg('成功取消收藏');
        }else{
            showMsg('取消收藏失败');
            _a.show();
        }
    });
};
//<<<<<<<<<<<<<=====

function showFacebox(ele){
    jQuery.facebox({ image: $(ele).attr('bmiddle') })
}

//====>>>>
//表情插入
fawave.face = {
    show: function($this, target_id){
        $("#face_box_target_id").val(target_id);
        var offset = $($this).offset();
        $("#face_box").css({"top":offset.top+20, "left":offset.left-25}).show();
    },
    hide: function(){
        $("#face_box").hide();
        $("#face_box_target_id").val('');
    },
    insert: function($this){
        var target_textbox = $("#" + $("#face_box_target_id").val());
        if(target_textbox.length==1){
            var tb = target_textbox[0], str = $($this).attr('value');
            var newstart = tb.selectionStart+str.length;
            tb.value=tb.value.substr(0,tb.selectionStart)+str+tb.value.substring(tb.selectionEnd);
            tb.selectionStart = newstart;
            tb.selectionEnd = newstart;
        }
        this.hide();
    }
};
//<<<<=====

//====>>>>
function _showLoading(){
    $("#loading").show();
};

function _hideLoading(){
    $("#loading").hide();
};
//<<<<=====