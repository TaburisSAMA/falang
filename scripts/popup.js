// @author qleelulu@gmail.com

var t_changeUser = '<table id="changeUser" class="tab-none" cellspacing="0" ><tr><td>'
            + '<span class="userName" title="">{{screen_name}}</span>'
            + '<div id="changeUserListWrap" style="display:none;"><ul>{{user_list}}</lu></div></td>'
            + '<td><a target="_blank" class="user_home" href="http://t.sina.com.cn/{{domain}}" title="点击打开我的主页"><img style="width:24px;height:24px;" class="userImg" src="{{profile_image_url}}" /></a></td></tr></table>';

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
function resetTimelineOffset(t){
    timeline_offset[t] = PAGE_SIZE;
}
//var friendsTimeline_offset = replys_offset = messages_offset = PAGE_SIZE;

function initOnLoad(){
    setTimeout(init, 100); //为了打开的时候不会感觉太卡
};

function init(){
    var c_user = getUser();
    if(!c_user){
        chrome.tabs.create({url: 'options.html'});
        return;
    }else if(!c_user.uniqueKey){
        chrome.tabs.create({url: 'options.html#no_uniqueKey'});
        return;
    }
    //$('a').attr('target', '_blank');
    $('a').live('click', function(e){
        var url = $.trim($(this).attr('href'));
        if(url && !url.toLowerCase().indexOf('javascript')==0){
            chrome.tabs.create({url:$(this).attr('href'), selected:false});
            return false;
        }
    }).live('mousedown', function(e){
        if(e.button == 2){ //右键点击
            var url = $.trim($(this).attr('rhref'));
            if(url){
                chrome.tabs.create({url:url, selected:false});
            }
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

    initScrollPaging();

    $(window).unload(function(){ initOnUnload(); }); 
};

function initTabs(){
    window.currentTab = '#friends_timeline_timeline';
    $('#tl_tabs li').click(function() {
        var t = $(this);
        //不进行任何操作							 
        if(t.hasClass('tab-none')) {
            return;
        };
        //添加当前激活的状态
        t.siblings().removeClass('active').end()
                .addClass('active');
        //切换tab前先保护滚动条位置
        var old_t = window.currentTab.replace('#','').replace(/_timeline$/i,'');
        saveScrollTop(old_t);
        //切换tab
        $('.list_p').hide();
        var c_t = t.attr('href').replace('#','').replace(/_timeline$/i,'');
        var c_ul = $(t.attr('href'));
        c_ul.show();
        window.currentTab = t.attr('href');
        if(c_t =='user_timeline'){ //用户自己的微薄，清空内容。防止查看别人的微薄的时候内容混合
            $("#user_timeline_timeline ul.list").html('');
        }else if(c_t =='followers'){
            getFansList('followers');
            return;
        }
        if(!c_ul.find('ul.list').html()){
            getSinaTimeline(c_t);
        }else if(c_t =='user_timeline'){ //用户自己的微薄，不定期自己获取更新，所以要通知后台去取一下
            showLoading();
            var b_view = getBackgroundView();
            b_view.checkTimeline(c_t);
        }
        resetScrollTop(c_t); //复位到上次滚动条的位置
        removeUnreadTimelineCount(c_t);
        t.find(".unreadCount").html('');
        var c_user = getUser();
        var userUnreaded = getUserUnreadTimelineCount(c_user.uniqueKey);
        if(userUnreaded > 0){
            $("#accountListDock ." + c_user.uniqueKey + " .unr").html(userUnreaded).show();
        }else{
            $("#accountListDock ." + c_user.uniqueKey + " .unr").html('').hide();
        }
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
function countInputText() {
    var c = $("#txtContent").val();
    var len = 140 - c.len();
    $("#wordCount").html(len);
}

function countReplyText(){
    var c = $("#replyTextarea").val();
    var len = 140 - c.len();
    if(len > 0){
        len = '(你还可以输入' + len + '字)';
    }else{
        len = '(<em style="color:red;">已超出' + (-len) + '字</em>)';
    }
    $("#replyInputCount").html(len);
}

function cleanTxtContent(){
    $("#txtContent").val('');
    countInputText();
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
                            loc_url = data.shortUrl;
                        }
                        $("#txtContent").val( formatText(getLookingTemplate(), {title:(title||''), url:loc_url}) );
                        showMsgInput();
                        countInputText();
                    },function(xhr, textStatus, errorThrown){
                        $("#txtContent").val( formatText(getLookingTemplate(), {title:(title||''), url:loc_url}) );
                        showMsgInput();
                        countInputText();
                    });
                }else{
                    $("#txtContent").val( formatText(getLookingTemplate(), {title:(title||''), url:loc_url}) );
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
    var c_user = getUser();
    if(c_user){
        var userList = getUserList();
        /*
        var li = [];
        for(i in userList){
            user = userList[i];
            if(user.uniqueKey != c_user.uniqueKey){
                li.push('<li class="tab-none">' + user.screen_name + '</li>');
            }else{
                li.push('<li class="tab-none current">' + user.screen_name + '</li>');
            }
        }
        if(li && li.length>1){
            c_user.screen_name = c_user.screen_name;
            c_user.user_list = li.join('');
            c_user.domain = c_user.domain || c_user.id;
            $('#tl_tabs').append(formatText(t_changeUser, c_user));
            var tl_offset = $('#changeUser').offset();
            $("#changeUserListWrap").appendTo('body').css({top:tl_offset.top+25});
            $("#changeUser .userName").click(function(){
                $("#changeUserListWrap").toggle();
            });
            $("#changeUserListWrap ul li").click(function(){
                var li = $(this);
                if(!li.hasClass('current')){
                    changeUser(li.text());
                    li.siblings().removeClass('current').end()
                    .addClass('current');
                }
                $("#changeUserListWrap").toggle();
            });
        }else if(li){
            c_user.user_list = li.join('');
            $('#tl_tabs').append(formatText(t_changeUser, c_user));
        }
        */
        $('#tl_tabs').append(formatText(t_changeUser, c_user));

        //底部Dock
        var u_tp = '<li class="{{uniqueKey}} {{current}}">\
                        <span class="username">{{screen_name}}</span>\
                        <a href="javascript:" onclick="changeUser(\'{{uniqueKey}}\')"><img src="{{profile_image_url}}" /></a>\
                        <img src="/images/blogs/{{blogType}}_16.png" class="blogType" />\
                        <span class="unr"></span>\
                    </li>';
        var li = [];
        for(i in userList){
            user = userList[i];
            if(user.uniqueKey == c_user.uniqueKey){
                user.current = 'current';
            }else{
                user.current = '';
            }
            li.push(u_tp.format(user));
        }
        $("#accountListDock").html('<ul>' + li.join('') + '</ul>');



    }
};

function changeUser(uniqueKey){
    var c_user = getUser();
    if(c_user.uniqueKey == uniqueKey){
        return;
    }
    friendsTimeline_offset = replys_offset = messages_offset = PAGE_SIZE;//复位分页
    var userList = getUserList();
    var to_user = null;
    for(i in userList){
        var user = userList[i];
        if(user.uniqueKey.toLowerCase() == uniqueKey.toLowerCase()){
            to_user = user;
            break;
        }
    }
    if(to_user){
        for(i in T_LIST.all){
            $("#" + T_LIST.all[i] + '_timeline .readMore').hide();
            $("#" + T_LIST.all[i] + '_timeline .list').html('');
        }
        $("#tl_tabs .unreadCount").html('');
        $("#changeUser .userName").html(to_user.screen_name);
        $("#changeUser .userImg").attr('src', to_user.profile_image_url || '');
        $("#changeUser .user_home").attr('href', "http://t.sina.com.cn/" + (to_user.domain || to_user.id));
        $("#accountListDock").find('.current').removeClass('current')
            .end().find('.'+to_user.uniqueKey).addClass('current');
        setUser(to_user);
        var b_view = getBackgroundView();
        b_view.onChangeUser();
        addUnreadCountToTabs();
        for(i in T_LIST[to_user.blogType]){
            getSinaTimeline(T_LIST[to_user.blogType][i], true);
        }
    }
}; // <<<<<<<<<<<<<========

function addUnreadCountToTabs(){
    var ur = 0;
    var tab = '';
    var userList = getUserList();
    var c_user = getUser();
    for(j in userList){
        var user = userList[j];
        var user_unread = 0;
        for(i in T_LIST[user.blogType]){
            ur = getUnreadTimelineCount(T_LIST[user.blogType][i], user.uniqueKey);
            if(ur>0 && c_user.uniqueKey == user.uniqueKey){ //当前用户，则设置timeline tab上的提示
                tab = $(".tab-" + T_LIST[user.blogType][i]);
                if(tab.length == 1 && !tab.hasClass('active')){
                    tab.find('.unreadCount').html('(' + ur + ')');
                    user_unread += ur;
                }else{
                    removeUnreadTimelineCount(T_LIST[user.blogType][i], user.uniqueKey);
                }
            }else{
                user_unread += ur;
            }
            ur = 0;
        }
        if(user_unread > 0){
            $("#accountListDock ." + user.uniqueKey + " .unr").html(user_unread).show();
        }else{
            $("#accountListDock ." + user.uniqueKey + " .unr").html('').hide();
        }
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

// 用户关系：跟随、取消跟随
function f_create(user_id, ele){
    if(ele){ $(ele).hide(); }
    showLoading();
    var b_view = getBackgroundView();
    b_view.friendships.create(user_id, function(user_info, textStatus, statuCode){
        if(textStatus == 'error' || !user_info.id){
            if(ele){ $(ele).show(); }
        }
    });
};

function f_destroy(user_id, ele){
    if(ele){ $(ele).hide(); }
    showLoading();
    var b_view = getBackgroundView();
    b_view.friendships.destroy(user_id, function(user_info, textStatus, statuCode){
        if(textStatus == 'error' || !user_info.id){
            if(ele){ $(ele).show(); }
        }
    });
};
//====>>>>>>>>>>>>>>>>>>>>>>

//滚动条位置
var SCROLL_TOP_CACHE = {};
//@t : timeline类型
function saveScrollTop(t){
    SCROLL_TOP_CACHE[t] = $("#" + t + "_timeline .list_warp").scrollTop();
};

//复位到上次的位置
//@t : timeline类型
function resetScrollTop(t){
    if(t == 'user_timeline'){
        $("#" + t + "_timeline .list_warp").scrollTop(0);
    }else{
        $("#" + t + "_timeline .list_warp").scrollTop(SCROLL_TOP_CACHE[t]);
    }
};
//====>>>>>>>>>>>>>>>>>>>>>>

/*
* 粉丝列表
*/
var NEXT_CURSOR = {};
var FANS_HTML_CACHE = {};
//获取用户的粉丝列表
function getFansList(t, cursor){
    var list = $("#followers_timeline .list");
    var old_t = $("#fans_tab .active").attr('t');
    FANS_HTML_CACHE[old_t] = list.html();
    if(!cursor){ //点击tab的时候，而不是分页获取
        if(!$("#fans_tab .tab_" + t).hasClass('active')){
            $("#fans_tab span").removeClass('active');
            $("#fans_tab .tab_" + t).addClass('active');
        }
        if(FANS_HTML_CACHE[t]){ //如果已经获取过，直接显示。
            list.html(FANS_HTML_CACHE[t]);
            return;
        }else{
            list.html('');
        }
    }
    cursor = cursor || -1;
    var c_user = getUser();
    if(!c_user){
        return;
    }
    showLoading();
    hideReadMore(t);
    var params = {user_id:c_user.id, cursor:cursor, user:c_user};
    tapi[t](params, function(users, textStatus, statuCode){
        if(textStatus != 'error' && users && !users.error){
            NEXT_CURSOR[t] = users.next_cursor;
            users = users.users;
            var html = '';
            for(i in users){
                html += bildMsgLi(users[i], t); //TODO: 待优化
            }
            list.append(html);
            if(users.length >=20){
                showReadMore(t);
            }else{
                hideReadMore(t);
            }
        }
    });
};
// <<<<<<<<<<<<<<<<====

//查看用户的微薄
function getUserTimeline(screen_name){
    var c_user = getUser();
    if(!c_user){
        return;
    }
    showLoading();
    var params = {count:40, screen_name:screen_name, user: c_user};
    
    var m = 'user_timeline';
    tapi[m](params, function(sinaMsgs, textStatus){
        if(sinaMsgs && sinaMsgs.length > 0){
            var t = $("#tl_tabs .tab-user_timeline");
            //添加当前激活的状态
            t.siblings().removeClass('active').end()
                    .addClass('active');
            //切换tab前先保护滚动条位置
            var old_t = window.currentTab.replace('#','').replace(/_timeline$/i,'');
            saveScrollTop(old_t);
            //切换tab
            $('.list_p').hide();
            
            $("#user_timeline_timeline").show();
            $("#user_timeline_timeline ul.list").html('');

            window.currentTab = "#user_timeline_timeline";

            addTimelineMsgs(sinaMsgs, m);

            hideReadMore('user_timeline');

            var user = sinaMsgs[0].user || sinaMsgs[0].sender;
            var userinfo_html = buildUserInfo(user);
            $("#user_timeline_timeline ul.list").prepend(userinfo_html);

            resetScrollTop(m);
        }

        hideLoading();
    });
};

//获取时间线微博列表
//@t : 类型
function getSinaTimeline(t, notCheckNew){
    showLoading();
    var _ul = $("#" + t + "_timeline ul.list");
    var c_user = getUser();
    var b_view = getBackgroundView();
    var _key = c_user.uniqueKey + t + '_tweets';
    if(b_view && b_view.tweets[_key] != undefined && b_view.tweets[_key].length>0){
        var tweetsAll = b_view.tweets[_key];
        var tweets = tweetsAll.slice(0, PAGE_SIZE);
        var html = '';
        var ids = [];
        for(i in tweets){
            html += bildMsgLi(tweets[i], t); //TODO: 待优化
            ids.push(tweets[i].id);
            if(tweets[i].retweeted_status){
                ids.push(tweets[i].retweeted_status.id);
            }else if(tweets[i].status){
                ids.push(tweets[i].status.id);
            }
        }
        _ul.append(html);
        if(ids.length>0){
            if(ids.length > 100){
                var ids2 = ids.slice(0, 99);
                ids = ids.slice(99, ids.length);
                showCounts(t, ids2.join(','));
            }
            showCounts(t, ids.join(','));
        }
        if(tweetsAll.length >= (PAGE_SIZE/2)){
            showReadMore(t);
        }
        hideLoading();
        if(t=="user_timeline"){ //用户
            b_view.checkTimeline(t);
        }
    }else if(!notCheckNew){
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
    var c_user = getUser();
    if(!c_user){
        return;
    }
    var data = {ids:ids, user:c_user};
    tapi.counts(data, function(counts, textStatus){
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
        var comment_p = $(ele).closest('.commentWrap');
        var commentWrap = comment_p.children('.comments');
        if(!notHide && commentWrap.css('display') != 'none'){
            commentWrap.hide();
            return;
        }else if(!notHide && commentWrap.children('.comment_list').html()){
            commentWrap.show();
            return;
        }
        showLoading();
        page = page || 1;
        var user = localStorage.getObject(CURRENT_USER_KEY);
        var data = {id:tweetId, page:page, count:COMMENT_PAGE_SIZE, user:user};
        tapi.comments(data, function(comments, textStatus){
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
var CAN_SCROLL_PAGING = {};
//有分页
function showReadMore(t){
    //$("#" + t + "ReadMore").css({display:"block"});
    CAN_SCROLL_PAGING[t] = true;
};
//正在获取分页或者没有分页内容了
function hideReadMore(t){
    //$("#" + t + "ReadMore").hide();
    CAN_SCROLL_PAGING[t] = false;
};
//是否可以分页
function isCanReadMore(t){
    //$("#" + t + "ReadMore").hide();
    return CAN_SCROLL_PAGING[t] || false;
};

function scrollPaging(){
    var c_t = window.currentTab;
    var tl = c_t.replace('#','').replace(/_timeline$/i,'');
    if(!isCanReadMore(tl)){
        return;
    }
    var h = $(c_t + ' .list').height();
    var list_warp = $(c_t + ' .list_warp');
    h = h - list_warp.height();
    if(list_warp.scrollTop() >= h){
        if(tl == 'followers'){ //粉丝列表特殊处理
            readMoreFans();
        }else{
            readMore(tl);
        }
    }
};

function initScrollPaging(){
    $(".list_warp").scroll(function(){
        scrollPaging();
    });
};

function readMoreFans(){
    var t = $("#fans_tab .active").attr('t');
    var cursor = NEXT_CURSOR[t];
    getFansList(t, cursor);
};

function readMore(t){
    hideReadMore(t);
    var moreEle = $("#" + t + "ReadMore");
    showLoading();
    var _b_view = getBackgroundView();
    var c_user = getUser();
    var _key = c_user.uniqueKey + t + '_tweets';
    var cache = _b_view.tweets[_key];
    if(getTimelineOffset(t) >= cache.length){
        _b_view.getTimelinePage(c_user.uniqueKey, t);
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
            if(ids.length > 100){
                var ids2 = ids.slice(0, 99);
                ids = ids.slice(99, ids.length);
                showCounts(t, ids2.join(','));
            }
            showCounts(t, ids.join(','));
        }
    }
};
//<<<<<<<<<<<======

//====>>>>>>>>>>>>>>>>>>
/*如果当前tab是激活的，就返回true，否则返回false(即为未读)*/
function addTimelineMsgs(msgs, t, user_uniqueKey){
    var c_user = getUser();
    if(!user_uniqueKey){
        user_uniqueKey = c_user.uniqueKey;
    }
    if(c_user.uniqueKey != user_uniqueKey){
        var unread_count = getUserUnreadTimelineCount(user_uniqueKey) + msgs.length;
        $("#accountListDock ." + user_uniqueKey + " .unr").html(unread_count).show();
        return false;
    }

    var li = $('.tab-' + t);
    if(!li.hasClass('active')){
        //清空，让下次点tab的时候重新取
        $("#" + t + "_timeline ul.list").html('');
        
        var _msg_user = null, _unreadCount = 0;
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
            $("#accountListDock ." + user_uniqueKey + " .unr").html(_unreadCount + getUserUnreadTimelineCount(user_uniqueKey)).show();
        }
        return false;
    }else{
        setTimelineOffset(t, msgs.length);
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
            if(ids.length > 100){
                var ids2 = ids.slice(0, 99);
                ids = ids.slice(99, ids.length);
                showCounts(t, ids2.join(','));
            }
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
        if(ids.length > 100){
            var ids2 = ids.slice(0, 99);
            ids = ids.slice(99, ids.length);
            showCounts(t, ids2.join(','));
        }
        showCounts(t, ids.join(','));
    }
    hideLoading();
};
//<<<<<<<<<<<<<<<<====

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
    
    var user = localStorage.getObject(CURRENT_USER_KEY);
    data['user'] = user;
    tapi.update(data, function(sinaMsg, textStatus){
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
    var user = localStorage.getObject(CURRENT_USER_KEY);
    data['user'] = user;
    btn.attr('disabled','true');
    txt.attr('disabled','true');
    tapi.new_message(data, function(sinaMsg, textStatus){
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
    var user = localStorage.getObject(CURRENT_USER_KEY);
    data['user'] = user;
    btn.attr('disabled','true');
    txt.attr('disabled','true');
    tapi.repost(data, function(sinaMsg, textStatus){
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
        if($('#chk_sendOneMore').attr("checked") && $('#chk_sendOneMore').val()){ //同时给XXX评论
            sendComment(msg, $('#chk_sendOneMore').val(), true);
        }
        if($('#chk_sendOneMore2').attr("checked") && $('#chk_sendOneMore2').val()){ //同时给XXX评论
            sendComment(msg, $('#chk_sendOneMore2').val(), true);
        }
    }
};

function sendComment(msg, commentTweetId, notSendMord){
    var btn, txt, cid, data;
    btn = $("#replySubmit");
    txt = $("#replyTextarea");
    cid = $('#commentCommentId').val();
    commentTweetId = commentTweetId || $('#commentTweetId').val();
    data = {comment: msg, id:commentTweetId, cid:cid};
    var user = localStorage.getObject(CURRENT_USER_KEY);
    data['user'] = user;
    btn.attr('disabled','true');
    txt.attr('disabled','true');
    var m = 'comment';
    if(cid){ m = 'reply';} //如果是回复别人的微博
    tapi[m](data, function(sinaMsg, textStatus){
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
    var h = WH[1] - 40 - 87;
    $(".list_warp").css('height', h);
    $("#doing").removeClass("doing").appendTo('#doingWarp');
    $("#txtContent").attr('rows', 5).removeClass('padDoing');
    $("#submitWarp").show();
};

function hideMsgInput(){
    fawave.face.hide();
    var v = $("#txtContent").val() || '     点此输入您要分享的内容';
    $("#submitWarp").hide();
    $("#txtContent").attr('rows', 1).val(v).addClass('padDoing');
    var h = WH[1] - 40;
    $(".list_warp").css('height', h);
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

    $('#chk_sendOneMore').attr("checked", false).val(tweetId).show();
    $('#txt_sendOneMore').text('同时给 @' + userName + ' 评论').show();
    if(rtUserName && reTweetId){
        $('#chk_sendOneMore2').attr("checked", false).val(reTweetId).show();
        $('#txt_sendOneMore2').text('同时给 @' + rtUserName + ' 评论').show();
    }else{
        $('#chk_sendOneMore2').attr("checked", false).val('').hide();
        $('#txt_sendOneMore2').text('').hide();
    }

    $('#ye_dialog_window').show();
    var d = $(ele).closest('li').find('.msgObjJson').text();
    try{
        d = JSON.parse(d);
    }
    catch(err){
        d = null;
    }
    var v = '';
    if(reTweetId && d && d.retweeted_status){
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

function doComment(ele, userName, tweetId, replyUserName, cid){//评论 cid:回复的评论ID
    $('#actionType').val('comment');
    $('#commentTweetId').val(tweetId);
    $('#replyUserName').val(userName);
    $('#commentCommentId').val(cid||'');
    $('#ye_dialog_title').html('评论@' + userName + ' 的信息');
    $('#ye_dialog_window').show();
    var _txt = replyUserName ? ('回复 @'+replyUserName+':') : '';

    $('#chk_sendOneMore').attr("checked", false).val(tweetId).show();
    $('#txt_sendOneMore').text('同时发一条微博').show();
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
    var user = localStorage.getObject(CURRENT_USER_KEY);
    tapi.destroy({id:tweetId, user:user}, function(data, textStatus){
        if(textStatus != 'error' && data && !data.error){
            $(ele).closest('li').remove();
            var t = window.currentTab.replace('#','').replace(/_timeline$/i,'');
            var c_user = getUser();
            var cacheKey = c_user.uniqueKey + t + '_tweets';
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
    var user = localStorage.getObject(CURRENT_USER_KEY);
    tapi.comment_destroy({id:tweetId, user:user}, function(data, textStatus){
        if(textStatus != 'error' && data && !data.error){
            $(ele).closest('li').remove();
            var t = window.currentTab.replace('#','').replace(/_timeline$/i,'');
            var c_user = getUser();
            var cacheKey = c_user.uniqueKey + t + '_tweets';
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
    var user = localStorage.getObject(CURRENT_USER_KEY);
    tapi.destroy_msg({id:tweetId, user:user}, function(data, textStatus){
        if(textStatus != 'error' && data && !data.error){
            $(ele).closest('li').remove();
            var t = window.currentTab.replace('#','').replace(/_timeline$/i,'');
            var c_user = getUser();
            var cacheKey = c_user.uniqueKey + t + '_tweets';
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
function addFavorites(ele, screen_name, tweetId){//添加收藏
    if(!tweetId){return;}
    showLoading();
    var _a = $(ele);
    var _aHtml = _a[0].outerHTML;
    _a.hide();
    var user = localStorage.getObject(CURRENT_USER_KEY);
    tapi.favorites_create({id:tweetId, user:user}, function(data, textStatus){
        if(textStatus != 'error' && data && !data.error){
            _a.after(_aHtml.replace('addFavorites','delFavorites')
                            .replace('favorites_2.gif','favorites.gif')
                            .replace('点击收藏','点击取消收藏'));
            _a.remove();
            var t = window.currentTab.replace('#','').replace(/_timeline$/i,'');
            var c_user = getUser();
            var cacheKey = c_user.uniqueKey + t + '_tweets';
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
function delFavorites(ele, screen_name, tweetId){//删除收藏
    if(!tweetId){return;}
    showLoading();
    var _a = $(ele);
    var _aHtml = _a[0].outerHTML;
    _a.hide();
    var user = localStorage.getObject(CURRENT_USER_KEY);
    tapi.favorites_destroy({id:tweetId, user:user}, function(data, textStatus){
        if(textStatus != 'error' && data && !data.error){
            _a.after(_aHtml.replace('delFavorites','addFavorites')
                            .replace('favorites.gif','favorites_2.gif')
                            .replace('点击取消收藏','点击收藏'));
            _a.remove();
            var t = window.currentTab.replace('#','').replace(/_timeline$/i,'');
            var c_user = getUser();
            var cacheKey = c_user.uniqueKey + t + '_tweets';
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
    jQuery.facebox({ image: $(ele).attr('bmiddle'), original: $(ele).attr('original') })
}

//====>>>>
//打开上传图片窗口
function openUploadImage(){
    initOnUnload();
    var l = (window.screen.availWidth-510)/2;
    window.open('upimage.html', '_blank', 'left=' + l + ',top=30,width=510,height=600,menubar=no,location=no,resizable=no,scrollbars=yes,status=yes');
};
//<<<<=====

//====>>>>
//表情添加
fawave.face = {
    show: function($this, target_id){
        var f = $("#face_box");
        if(f.css('display')=='none' || $("#face_box_target_id").val()!=target_id){
        	// 初始化表情
        	var $face_icons = $('#face_icons');
        	if(!$face_icons.attr('init_icons')) {
        		var exists = {};
        		$('#face_icons li a').each(function() {
        			exists[$(this).attr('title')] = true;
        		});
        		var tpl = '<li><a href="javascript:void(0)" onclick="fawave.face.insert(this)" value="[{{name}}]" title="{{name}}"><img src="{{url}}" alt="{{name}}"></a></li>';
    			for(var name in TSINA_FACES) {
        			if(exists[name]) continue;
        			$face_icons.append(tpl.format({'name': name, 'url': TSINA_FACE_URL_PRE + TSINA_FACES[name]}));
        			exists[name] = true;
        		}
        		for(var name in emotionalDict) {
        			if(exists[name]) continue;
        			var src = emotionalDict[name];
			        if(src.indexOf('http') != 0){
			            src = '/images/faces/' + src + '.gif';
			        } else {
			        	continue;
			        }
        			$face_icons.append(tpl.format({'name': name, 'url': src}));
        			exists[name] = true;
        		}
        		$face_icons.attr('init_icons', true);
        	}
            $("#face_box_target_id").val(target_id);
            var offset = $($this).offset();
            f.css({"top":offset.top+20, "left":offset.left-25}).show();
        }else{
            f.hide();
        }
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