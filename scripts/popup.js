// @author qleelulu@gmail.com

var fawave = {};
function getTimelineOffset(t){
    return $("#" + t + "_timeline ul.list > li").length;
    //return timeline_offset[t] || PAGE_SIZE;
};

function initOnLoad(){
    setTimeout(init, 100); //为了打开的时候不会感觉太卡
};

var POPUP_CACHE = {};
// 方便根据不同用户获取缓存数据的方法
function get_current_user_cache(cache, t) {
	var c_user = getUser();
	var key = c_user.uniqueKey;
	if(t != undefined) {
		key += '_' + t;
	}
	if(!cache) {
		cache = POPUP_CACHE;
	}
	var _cache = cache[key];
	if(!_cache) {
		_cache = {};
		cache[key] = _cache;
	}
	return _cache;
};

var isNewTabSelected = window.is_new_win_popup ? true : false; //如果是弹出窗，则激活新打开的标签

function init(){
    var c_user = getUser();
    if(!c_user){
        chrome.tabs.create({url: 'options.html#user_set'});
        return;
    }else if(!c_user.uniqueKey){
        chrome.tabs.create({url: 'options.html#no_uniqueKey'});
        return;
    }
    //$('a').attr('target', '_blank');
    $('a').live('click', function(e){
        var url = $.trim($(this).attr('href'));
        if(url && !url.toLowerCase().indexOf('javascript')==0){
            chrome.tabs.create({url:$(this).attr('href'), selected:isNewTabSelected});
            return false;
        }
    }).live('mousedown', function(e){
        if(e.button == 2){ //右键点击
            var url = $.trim($(this).attr('rhref'));
            if(url){
                chrome.tabs.create({url:url, selected:isNewTabSelected});
            }
        }
    });

    if(window.is_new_win_popup){
        resizeFawave();
        $(window).resize(function(){
            resizeFawave();
        });
    }

    changeAlertMode(getAlertMode());

    $('#ye_dialog_close').click(function(){ hideReplyInput(); });

    initTabs();

    initTxtContentEven();

    initChangeUserList();

    getSinaTimeline('friends_timeline'); //只显示首页的，其他的tab点击的时候再去获取

    initMsgHover();

    addUnreadCountToTabs();
    initIamDoing();

    initScrollPaging();

    $(window).unload(function(){ initOnUnload(); }); 

    //google map api，为了不卡，最后才载入
    var script = document.createElement("script"); 
    script.type = "text/javascript"; 
    script.src = "http://maps.google.com/maps/api/js?sensor=false&callback=initializeMap"; 
    document.body.appendChild(script);
    
    // 注册 查看原始围脖的按钮事件
    $('a.show_source_status_btn').live('click', function() {
    	var $this = $(this);
    	var user = getUser();
    	var t = window.currentTab.replace('#', '').replace(/_timeline$/i, '');
    	var params = {id: $(this).attr('status_id'), user: user};
    	tapi.status_show(params, function(data) {
    		if(data && data.id) {
    			var html = bildMsgLi(data, t, user);
    			$this.parents('.mainContent').after(html);
    			$this.hide();
    		}
    	});
    });
};

function initializeMap(){};//给载入地图api调用

function initTabs(){
    window.currentTab = '#friends_timeline_timeline';
    $('#tl_tabs li').click(function() {
        var t = $(this);
        //不进行任何操作							 
        if(t.hasClass('tab-none')) {
            return;
        };
        //添加当前激活的状态
        t.siblings().removeClass('active').end().addClass('active');
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
            getUserTimeline();
            checkShowGototop();
            return;
        }else if(c_t =='followers'){
        	showFollowers();
            //getFansList('followers');
            checkShowGototop();
            return;
        } else if(c_t == 'favorites') {
        	getFavorites(true);
            checkShowGototop();
            return;
        }
        if(!c_ul.find('ul.list').html()){
            getSinaTimeline(c_t);
        }
//        else if(c_t =='user_timeline'){ //用户自己的微薄，不定期自己获取更新，所以要通知后台去取一下
//            showLoading();
//            var b_view = getBackgroundView();
//            b_view.checkTimeline(c_t);
//        }
        resetScrollTop(c_t); //复位到上次滚动条的位置
        removeUnreadTimelineCount(c_t);
        t.find(".unreadCount").html('');
        /*
        var c_user = getUser();
        var userUnreaded = getUserUnreadTimelineCount(c_user.uniqueKey);
        if(userUnreaded > 0){
            $("#accountListDock ." + c_user.uniqueKey + " .unr").html(userUnreaded).show();
        }else{
            $("#accountListDock ." + c_user.uniqueKey + " .unr").html('').hide();
        }
        */
        updateDockUserUnreadCount(c_user.uniqueKey);

        checkShowGototop(); //检查是否要显示返回顶部按钮
    });
    
    checkSupportedTabs();
};

function initOnUnload(){
    var c = $("#txtContent").val();
    if(c=='     点此输入您要分享的内容'){
        c='';
    }
    localStorage.setObject(UNSEND_TWEET_KEY, c||'');

    if(Settings.get().sendAccountsDefaultSelected == 'remember'){
        if($("#accountsForSend").data('inited')){
            var keys = '';
            $("#accountsForSend li.sel").each(function(){
                keys += $(this).attr('uniquekey') + '_';
            });
            keys = keys ? '_'+keys : keys;

            localStorage.setObject(LAST_SELECTED_SEND_ACCOUNTS, keys);
        }
    }
};

function initTxtContentEven(){
//>>>发送微博事件初始化 开始<<<
    var unsendTweet = localStorage.getObject(UNSEND_TWEET_KEY);
    var txtContent = $("#txtContent");
    if(unsendTweet){
        txtContent.val(unsendTweet);
    }

    //txtContent.bind('keyup', function(){
    //    countInputText();
    //});

    txtContent[0].oninput = txtContent[0].onfocus = countInputText;

    txtContent.keydown(function(event){
        var c = $.trim($(this).val());
        if(event.ctrlKey && event.keyCode==13){
            if(c){
                sendMsg(c);
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
            sendMsg(c);
        }else{
            showMsg('请输入要发送的内容');
        }
    });
//>>>发送微博事件初始化 结束<<<

//>>>回复事件初始化开始<<<
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
            case 'newmsg': // 私信
                sendWhisper(c);
                break;
            case 'repost': // 转
                sendRepost(c);
                break;
            case 'comment': // 评
                sendComment(c);
                break;
            case 'reply': // @
                sendReplyMsg(c);
                break;
            default:
                showMsg('检查发送类型出错。');
        }
    }else{
        showMsg('请输入要发送的内容');
    }
};

//统计字数
function countInputText() {
    var c = $("#txtContent").val();
    var len = 140 - c.len();
    $("#wordCount").html(len);
    if(len == 140){
        $("#btnSend").attr('disabled', 'disabled');
    }else{
        $("#btnSend").removeAttr('disabled');
    }
};

function countReplyText(){
    var c = $("#replyTextarea").val();
    var len = 140 - c.len();
    if(len > 0){
        len = '(你还可以输入' + len + '字)';
    }else{
        len = '(<em style="color:red;">已超出' + (-len) + '字</em>)';
    }
    $("#replyInputCount").html(len);
};

function cleanTxtContent(){
    $("#txtContent").val('').focus();
    countInputText();
};

// 封装重用的判断是否需要自动缩址的逻辑
function _shortenUrl(longurl, settings, callback) {
	if(longurl.indexOf('chrome-extension://') == 0) { // 插件地址就不处理了
		return;
	}
	var settings = settings || Settings.get();
	if(settings.isSharedUrlAutoShort && longurl.replace(/^https?:\/\//i, '').length > settings.sharedUrlAutoShortWordCount){
    	ShortenUrl.short(longurl, callback);
    }
};

//我正在看
function initIamDoing(){
    $("#doing").click(function(){
        chrome.tabs.getSelected(null, function(tab){
            var loc_url = tab.url;
            if(loc_url){
                var title = tab.title || '';
                var $txt = $("#txtContent");
                var settings = Settings.get();
                $txt.val(formatText(settings.lookingTemplate, {title: title, url: loc_url}));
                showMsgInput();
                _shortenUrl(loc_url, settings, function(shorturl){
		            if(shorturl) {
		                $txt.val($txt.val().replace(loc_url, shorturl));
		            }
		        });
            } else {
                showMsg('当前页面的URL不正确。');
            }
        });
    });
};

//搜索
var Search = {
    toggleInput: function(){
        $("#searchWrap").toggle();
        $("#txtSearch").focus().keypress(function(event) {
        	if(event.keyCode == '13') {
        		Search.search();
        	}
        });
    },
    search: function(read_more) {
    	var c_user = getUser();
	    var $tab = $("#tl_tabs .tab-user_timeline");
	    $tab.attr('statusType', 'search');
	    var $ul = $("#user_timeline_timeline ul.list");
	    var max_id = null;
	    var q = $("#txtSearch").val();
	    if(read_more) {
	    	// 滚动的话，获取上次的参数
	        max_id = $tab.attr('max_id');
	        q = $tab.attr('q');
	    }  else {
	    	// 第一次搜索
	    	$ul.html('');
	    }
	    var params = {count: PAGE_SIZE, q: q, user: c_user};
	    if(max_id) {
	    	params.max_id = max_id;
	    }
	    showLoading();
	    var m = 'user_timeline';
	    hideReadMore(m);
	    tapi.search(params, function(data, textStatus){
	    	// 如果用户已经切换，则不处理
	    	var now_user = getUser();
	    	if(now_user.uniqueKey != c_user.uniqueKey) {
	    		return;
	    	}
	    	var statuses = data.results || data.items || data;
	        if(statuses && statuses.length > 0){
	        	if(window.currentTab != "#user_timeline_timeline") {
	        		//添加当前激活的状态
	                $tab.siblings().removeClass('active').end().addClass('active');
	                //切换tab前先保护滚动条位置
	                var old_t = window.currentTab.replace('#','').replace(/_timeline$/i,'');
	                saveScrollTop(old_t);
	                //切换tab
	                $('.list_p').hide();
	                
	                $("#user_timeline_timeline").show();
	                $ul.html('');
	
	                window.currentTab = "#user_timeline_timeline";
	        	}
	            addPageMsgs(statuses, m, true);
	            max_id = data.max_id || String(statuses[statuses.length - 1].id);
	            // 保存数据，用于翻页
	            $tab.attr('q', q);
	            $tab.attr('max_id', max_id);
//	            showReadMore(m);
//	            if(!read_more) {
//	            	var user = data.user || statuses[0].user || statuses[0].sender;
//	            	// 是否当前用户
//	            	user.is_me = String(c_user.id) == String(user.id);
//	                var userinfo_html = buildUserInfo(user);
//	                $ul.prepend(userinfo_html);
//	                resetScrollTop(m);
//	            }
	        }
	        hideLoading();
	        checkShowGototop();
	    });
    }
};
function toggleSearch(){};

//隐藏那些不支持的Timeline Tab
function checkSupportedTabs(user){
    if(!user){
        user = getUser();
    }
    var config = tapi.get_config(user);
    var checks = {
    	support_comment: ['#tl_tabs .tab-comments_timeline, #comments_timeline_timeline', // 需要隐藏的
    	                  '#tl_tabs .tab-comments_timeline'], // 需要显示的
    	support_favorites: ['#tl_tabs .tab-favorites, #favorites_timeline',
    	                    '#tl_tabs .tab-favorites'],
    	support_direct_messages: ['#tl_tabs .tab-direct_messages, #direct_messages_timeline',
    	                    '#tl_tabs .tab-direct_messages'],
    	support_mentions: ['#tl_tabs .tab-mentions, #mentions_timeline',
    	                    '#tl_tabs .tab-mentions'],
    	support_search: ['a.search, #searchWrap', 'a.search']
    };
    for(var key in checks) {
    	if(!config[key]){
    		$(checks[key][0]).hide();
        }else{
        	$(checks[key][1]).show();
        }
    }
};

//多用户切换
function initChangeUserList(){
    var c_user = getUser();
    if(c_user){
        showHeaderUserInfo(c_user);

        var userList = getUserList();
        if(userList.length < 2){ return; }
        //底部Dock
        var u_tp = '<li class="{{uniqueKey}} {{current}}">' +
                       '<span class="username">{{screen_name}}</span>' +
                       '<a href="javascript:" onclick="changeUser(\'{{uniqueKey}}\')"><img src="{{profile_image_url}}" /></a>' +
                       '<img src="/images/blogs/{{blogType}}_16.png" class="blogType" />' +
                       '<span class="unr"></span>' +
                   '</li>';
        var li = [];
        for(var i in userList){
            user = userList[i];
            if(user.uniqueKey == c_user.uniqueKey){
                user.current = 'current';
            }else{
                user.current = '';
            }
            li.push(u_tp.format(user));
        }
        $("#accountListDock").html('<ul>' + li.join('') + '</ul>');
        $("#msgInfoWarp").css('bottom', 40); //防止被用户列表遮挡
    }
};

//头部的用户信息
function showHeaderUserInfo(c_user){
    var h_user = $("#header .user");
    h_user.find('.face').attr('href', c_user.t_url);
    h_user.find('.face .icon').attr('src', c_user.profile_image_url);
    h_user.find('.face .bt').attr('src', 'images/blogs/'+c_user.blogType+'_16.png');
    h_user.find('.info .name').html(c_user.screen_name);
    var nums = '';
    if(tapi.get_config(c_user).userinfo_has_counts){
        nums = '粉{{friends_count}}, {{followers_count}}粉, {{statuses_count}}微博'.format(c_user);
    }
    h_user.find('.info .nums').html(nums);
};

function changeUser(uniqueKey){
    var c_user = getUser();
    if(c_user.uniqueKey == uniqueKey){
        return;
    }
    var to_user = getUserByUniqueKey(uniqueKey);
    if(to_user){
        setUser(to_user);
        showHeaderUserInfo(to_user);
        var b_view = getBackgroundView();
        b_view.onChangeUser();
    	// 获取当前的tab
        var activeLi = $("#tl_tabs li.active");
    	var cur_t = activeLi.attr('href').replace(/_timeline$/, '').substring(1);
        
        var userT = T_LIST[to_user.blogType];
        var _li = null, _t = '', cur_t_new = '';
        $("#tl_tabs li").each(function(){
            _li = $(this);
            _t = _li.attr('href').replace(/_timeline$/i,'').substring(1);
            $("#" + _t + '_timeline .list').html('');
            showReadMore(_t); //TODO: show or hide ?
        });
        checkSupportedTabs(to_user);
        if(activeLi.css('display')=='none'){ //如果不支持的tab刚好是当前tab
            activeLi.removeClass('active');
            window.currentTab = '#friends_timeline_timeline';
            cur_t_new = 'friends_timeline';
            $("#tl_tabs .tab-friends_timeline").addClass('active');
            $('#friends_timeline_timeline').show();
        }

        cur_t = cur_t_new || cur_t;
        $("#tl_tabs .unreadCount").html('');
        $("#accountListDock").find('.current').removeClass('current')
            .end().find('.'+to_user.uniqueKey).addClass('current');
        addUnreadCountToTabs();
//        for(var i in T_LIST[to_user.blogType]){
//            getSinaTimeline(T_LIST[to_user.blogType][i], true);
//            if(cur_t == T_LIST[to_user.blogType][i]) {
//            	cur_t = null; // 不用处理了
//            }
//        }
        if(cur_t) { // 需要刷新一下数据
        	$("#tl_tabs li.active").click();
        }
    }
};

// 初始化用户选择视图, is_upload === true 代表是上传
function initSelectSendAccounts(is_upload){
    var afs = $("#accountsForSend");
    if(afs.data('inited')){
        return;
    }
    var userList = getUserList('send');
    if(userList.length < 2){ return; } //多个用户才显示
    var li_tp = '<li class="{{sel}}" uniqueKey="{{uniqueKey}}" onclick="toggleSelectSendAccount(this)">' +
                   '<img src="{{profile_image_url}}" />' +
                   '{{screen_name}}' +
                   '<img src="/images/blogs/{{blogType}}_16.png" class="blogType" />' +
               '</li>';
    var li = [];
    var c_user = getUser();
    for(var i in userList){
        user = userList[i];
        if(is_upload === true && tapi.get_config(user).support_upload === false) {
        	continue;
        }
        user.sel = '';
        switch(Settings.get().sendAccountsDefaultSelected){
            case 'all':
                user.sel = 'sel';
                break;
            case 'current':
                if(user.uniqueKey == c_user.uniqueKey){
                    user.sel = 'sel';
                }
                break;
            case 'remember':
                var lastSend = getLastSendAccounts();
                if(lastSend && lastSend.indexOf('_'+ user.uniqueKey + '_') >= 0){
                    user.sel = 'sel';
                }
                break;
            default:
                break;
        }
        li.push(li_tp.format(user));
    }
    afs.html('TO(<a class="all" href="javascript:" onclick="toggleSelectAllSendAccount()">全</a>): ' + li.join(''));
    afs.data('inited', 'true');
};
function toggleSelectSendAccount(ele){
    var _t = $(ele);
    if(_t.hasClass('sel')){
        _t.removeClass('sel');
    }else{
        _t.addClass('sel');
    }
};
function toggleSelectAllSendAccount(){
    if($("#accountsForSend .sel").length == $("#accountsForSend li").length){ //已全选
        $("#accountsForSend li").removeClass('sel');
        var c_user = getUser();
        $("#accountsForSend li[uniqueKey=" + c_user.uniqueKey +"]").addClass('sel');
    }else{
        $("#accountsForSend li").addClass('sel');
    }
};
// <<-- 多用户 END

function addUnreadCountToTabs(){
    var ur = 0;
    var tab = '';
    var userList = getUserList();
    var c_user = getUser();
    for(var j in userList){
        var user = userList[j];
        var user_unread = 0;
        for(var i in T_LIST[user.blogType]){
            ur = getUnreadTimelineCount(T_LIST[user.blogType][i], user.uniqueKey);
            if(ur>0 && c_user.uniqueKey == user.uniqueKey){ //当前用户，则设置timeline tab上的提示
                tab = $("#tl_tabs .tab-" + T_LIST[user.blogType][i]);
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
        /*
        if(user_unread > 0){
            $("#accountListDock ." + user.uniqueKey + " .unr").html(user_unread).show();
        }else{
            $("#accountListDock ." + user.uniqueKey + " .unr").html('').hide();
        }
        */
        updateDockUserUnreadCount(user.uniqueKey);
    }
};


//更新底部dock上的未读提示数
function updateDockUserUnreadCount(user_uniqueKey){
    if(!user_uniqueKey){ return; }
    //var user_unread = getUserUnreadTimelineCount(user_uniqueKey);
    var user = getUserByUniqueKey(user_uniqueKey);
    var user_unread = 0, count = 0, d_html = '', t = '';
    for(var i in T_LIST[user.blogType]){
        t = T_LIST[user.blogType][i];
        count = getUnreadTimelineCount(t, user_uniqueKey);
        user_unread += count;
        if(count > 0){
            d_html = d_html ? d_html+', ' : d_html;
            d_html += count + unreadDes[t];
        }
    }
    if(user_unread > 0){
        $("#accountListDock ." + user_uniqueKey + " .unr").html(user_unread).show();
    }else{
        $("#accountListDock ." + user_uniqueKey + " .unr").html('').hide();
    }

    d_html = d_html ? ' ('+d_html+')' : d_html;
    $("#accountListDock ." + user_uniqueKey + " .username").html(user.screen_name + d_html);
};

function initMsgHover(){
    /*
    $(".list li").live("mouseenter", function(){ //mouseover
        var li = $(this);
        li.addClass("activeTweet");
        li.find('.edit').show();
    });

    $(".list li").live("mouseleave", function(){ //mouseout
        var li = $(this);
        li.removeClass("activeTweet");
        li.find('.edit').hide();
    });
    */
};

//====>>>>>>>>>>>>>>>>>>>>>>

// 用户关系：跟随、取消跟随
function f_create(user_id, ele, screen_name){
	var $ele = $(ele);
	$ele.hide();
    showLoading();
    var b_view = getBackgroundView();
    b_view.friendships.create(user_id, screen_name, function(user_info, textStatus, statuCode){
        if(!user_info){
        	$ele.show();
        }
    });
};

function f_destroy(user_id, ele, screen_name){
	var $ele = $(ele);
	$ele.hide();
    showLoading();
    var b_view = getBackgroundView();
    b_view.friendships.destroy(user_id, screen_name, function(user_info, textStatus, statuCode){
        if(!user_info){
        	$ele.show();
        }
    });
};
//====>>>>>>>>>>>>>>>>>>>>>>

//滚动条位置
var SCROLL_TOP_CACHE = {};
//@t : timeline类型
function saveScrollTop(t){
	var _cache = get_current_user_cache(SCROLL_TOP_CACHE);
    _cache[t] = $("#" + t + "_timeline .list_warp").scrollTop();
};

//复位到上次的位置
//@t : timeline类型
function resetScrollTop(t){
    if(t == 'user_timeline'){
        $("#" + t + "_timeline .list_warp").scrollTop(0);
    }else{
    	var _cache = get_current_user_cache(SCROLL_TOP_CACHE);
        $("#" + t + "_timeline .list_warp").scrollTop(_cache[t] || 0);
    }
};
//====>>>>>>>>>>>>>>>>>>>>>>

// 显示粉丝列表
function showFollowers(to_t, screen_name, user_id) {
	//添加当前激活的状态
    $t = $('#tl_tabs .tab-followers');
    $t.siblings().removeClass('active').end().addClass('active');
    //切换tab
    $('.list_p').hide();
    $($t.attr('href')).show();
    window.currentTab = $t.attr('href');
    
	to_t = to_t || $("#fans_tab .active").attr('t');
	if(screen_name) {
		$('#followers_timeline').attr('screen_name', screen_name);
	} else {
		$('#followers_timeline').removeAttr('screen_name');
	}
	if(user_id) {
		$('#followers_timeline').attr('user_id', user_id);
	} else {
		$('#followers_timeline').removeAttr('user_id');
	}
	$("#fans_tab span").unbind('click').click(function() {
		_getFansList($(this).attr('t'));
	}).each(function() {
		var $this = $(this);
		$this.removeAttr('loading');
		$this.removeAttr('cursor'); // 删除游标
		if($this.attr('t') == to_t) {
			$this.click();
		}
	});
	var html_cache = get_current_user_cache(FANS_HTML_CACHE);
	for(var k in html_cache) {
		delete html_cache[k];
	}
};

/*
* 粉丝列表
*/
var NEXT_CURSOR = {};
var FANS_HTML_CACHE = {};
//获取用户的粉丝列表
function _getFansList(to_t, read_more){
	to_t = to_t || $("#fans_tab .active").attr('t');
	var c_user = getUser();
    if(!c_user){
        return;
    }
    var $followers_timeline = $('#followers_timeline');
    var screen_name = $followers_timeline.attr('screen_name');
    var user_id = $followers_timeline.attr('user_id');
    var get_c_user_fans = false;
    if(screen_name === undefined) {
    	screen_name = c_user.screen_name;
    	user_id = c_user.id;
    	get_c_user_fans = true;
    	$("#fans_tab span font").html('我');
    }
    if(!get_c_user_fans) {
    	$("#fans_tab span font").html(screen_name);
    }
    var params = {user:c_user, count:PAGE_SIZE, screen_name: screen_name};
    if(user_id) {
    	params.user_id = user_id;
    }
    var $list = $("#followers_timeline .list");
    var $active_t = $("#fans_tab .active");
    var active_t = $active_t.attr('t');
    var $to_t = $("#fans_tab .tab_" + to_t);
    var cursor = $to_t.attr('cursor') || '-1';
    
    // 各微博自己cache
    var html_cache = get_current_user_cache(FANS_HTML_CACHE);
    if($to_t.attr('loading') !== undefined) {
    	return;
    }
    if(!read_more) { // 点击tab
    	if(active_t != to_t) { // 切换
    		html_cache[active_t] = $list.html();
    		$("#fans_tab span").removeClass('active');
	    	$to_t.addClass('active');
	    	if(html_cache[to_t]) {
	    		$list.html(html_cache[to_t]);
	    		return;
	    	}
	    } else if(cursor != '-1') { // 点击当前tab
	    	return;
	    }
	    $list.html('');
    }
	if(cursor == '0'){
    	return;
    }
    params.cursor = cursor;
    hideReadMore(to_t);
    showLoading();
    $to_t.attr('loading', true);
    tapi[to_t](params, function(data, textStatus, statuCode){
    	// 如果用户已经切换，则不处理
    	showReadMore(to_t);
    	var now_user = getUser();
    	if(now_user.uniqueKey != c_user.uniqueKey) {
    		return;
    	}
        if(textStatus != 'error' && data && !data.error){
            var users = data.users || data.items;
            var next_cursor = data.next_cursor;
            var max_id = $("#followers_timeline ul.list .user_info:last").attr('did');
            var result = filterDatasByMaxId(users, max_id, true);
            users = result.news;
            if(users && users.length > 0) {
            	var html = '';
                for(var i in users){
                	if(!get_c_user_fans) {
                		users[i].unfollow = true;
                	}
                }
                html = buildUsersHtml(users, to_t).join('');
                if(to_t == $("#fans_tab .active").attr('t')) {
                	// 还是当前页
                	$list.append(html);
                }
                html_cache[to_t] += html;
            }
            // 设置游标，控制翻页
            if(next_cursor) {
        		$to_t.attr('cursor', next_cursor);
        	}
        }
        $to_t.removeAttr('loading');
    });
};

// 查看用户的微薄
// 支持max_id、page、cursor 3种形式的分页
function getUserTimeline(screen_name, user_id, read_more) {
    var c_user = getUser();
    if(!c_user){
        return;
    }
    var $tab = $("#tl_tabs .tab-user_timeline");
    $tab.attr('statusType', 'user_timeline');
    var $ul = $("#user_timeline_timeline ul.list");
    var max_id = null;
    var cursor = null;
    var page = 1;
    var user_id = user_id || '';
    if(read_more) {
    	// 滚动的话，获取上次的参数
    	max_id = $tab.attr('max_id');
        page = String($tab.attr('page') || 1);
        cursor = $tab.attr('cursor');
        user_id = $tab.attr('user_id');
        screen_name = $tab.attr('screen_name');
    } else if(screen_name === undefined) {
    	// 直接点击tab，获取当前用户的
    	screen_name = c_user.screen_name;
    	user_id = c_user.id;
    	$ul.html('');
    }  else {
    	// 否则就是直接点击查看用户信息了
    	$ul.html('');
    }
    var params = {count: PAGE_SIZE, screen_name: screen_name, user: c_user};
    if(user_id) {
    	params.id = user_id;
    }
    var config = tapi.get_config(c_user);
    var support_cursor_only = config.support_cursor_only; // 只支持游标方式翻页
    if(!support_cursor_only) {
    	var support_max_id = config.support_max_id;
	    if(support_max_id) {
	    	if(max_id) {
	    		params.max_id = max_id;
	    	}
	    } else {
	    	params.page = page;
	    }
    } else {
    	if(cursor == '0') {
    		return;
    	}
    	if(cursor) {
    		params.cursor = cursor;
    	}
    }
    showLoading();
    var m = 'user_timeline';
    hideReadMore(m);
    tapi[m](params, function(data, textStatus){
    	// 如果用户已经切换，则不处理
    	var now_user = getUser();
    	if(now_user.uniqueKey != c_user.uniqueKey) {
    		return;
    	}
    	var sinaMsgs = data.items || data;
    	if(support_cursor_only && data.next_cursor) {
    		$tab.attr('cursor', data.next_cursor);
    	}
        if(sinaMsgs && sinaMsgs.length > 0){
        	if(window.currentTab != "#user_timeline_timeline") {
        		//添加当前激活的状态
                $tab.siblings().removeClass('active').end().addClass('active');
                //切换tab前先保护滚动条位置
                var old_t = window.currentTab.replace('#','').replace(/_timeline$/i,'');
                saveScrollTop(old_t);
                //切换tab
                $('.list_p').hide();
                
                $("#user_timeline_timeline").show();
                $ul.html('');

                window.currentTab = "#user_timeline_timeline";
        	}
            addPageMsgs(sinaMsgs, m, true);
            max_id = String(sinaMsgs[sinaMsgs.length - 1].id);
            page += 1;
            // 保存数据，用于翻页
            $tab.attr('max_id', max_id);
            $tab.attr('page', page);
            $tab.attr('screen_name', screen_name);
            $tab.attr('user_id', user_id);
            showReadMore(m);
            if(!read_more) {
            	var user = data.user || sinaMsgs[0].user || sinaMsgs[0].sender;
            	// 是否当前用户
            	user.is_me = String(c_user.id) == String(user.id);
                var userinfo_html = buildUserInfo(user);
                $ul.prepend(userinfo_html);
                resetScrollTop(m);
            }
        }
        hideLoading();
        checkShowGototop();
    });
};

// 获取用户收藏
var FAVORITE_HTML_CACHE = {};
function getFavorites(is_click){
	var c_user = getUser();
    if(!c_user){
        return;
    }
    var list = $("#favorites_timeline .list");
    var t = $("#tl_tabs .tab-favorites_timeline");
    var cursor = list.attr('cursor');
    var page = list.attr('page');
    var t = 'favorites';
    var user_cache = get_current_user_cache();
    var config = tapi.get_config(c_user);
    var support_cursor_only = config.support_cursor_only; // 只支持游标方式翻页
    if(!is_click) {
    	is_click = support_cursor_only ? !cursor : !page;
    }
    if(is_click) { // 点击或第一次加载
    	page = 1;
    	if(user_cache[t]) {
    		list.html(user_cache[t]);
    		return;
    	} else {
    		list.html('');
    	}
    }
    var params = {user: c_user, count: PAGE_SIZE};
    var support_cursor_only = config.support_cursor_only; // 只支持游标方式翻页
    if(!is_click) {
    	if(support_cursor_only) {
    		if(cursor == '0') {
    			return;
    		}
    		params.cursor = cursor;
    	} else {
    		params.page = page;
    	}
    }
    showLoading();
    hideReadMore(t);
    tapi[t](params, function(data, textStatus, statuCode){
    	if(c_user.uniqueKey != getUser().uniqueKey) {
    		return;
    	}
        if(textStatus != 'error' && data && !data.error){
        	var status = data.items || data;
        	if(data.next_cursor) {
        		list.attr('cursor', data.next_cursor);
        	}
        	list.attr('page', Number(page) + 1);
        	status = addPageMsgs(status, t, true);
	        if(status.length > 0){
	            showReadMore(t);
	            user_cache[t] = list.html();
	        } else {
	            hideReadMore(t);
	        }
        } else {
        	showReadMore(t);
        }
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
    if(b_view && b_view.tweets[_key] && b_view.tweets[_key].length>0){
        var tweetsAll = b_view.tweets[_key];
        var msgs = tweetsAll.slice(0, PAGE_SIZE);
//        var msg_ids = tweetsAll.slice(0, PAGE_SIZE);
//        var msgs = TweetStorage.getItems(msg_ids, t, c_user.uniqueKey);
        var htmls = [];
        var ids = [];
        htmls = buildStatusHtml(msgs, t);
        for(var i in msgs){
            var msg = msgs[i];
//            html += bildMsgLi(msgs[i], t);
        	//_ul.append(bildMsgLi(msg, t)); //TODO: 待优化
            ids.push(msg.id);
            if(msg.retweeted_status){
                ids.push(msg.retweeted_status.id);
                if(msg.retweeted_status.retweeted_status) {
                	ids.push(msg.retweeted_status.retweeted_status.id);
                }
            }else if(msg.status){
                ids.push(msg.status.id);
                if(msg.status.retweeted_status) {
                	ids.push(msg.status.retweeted_status.id);
                }
            }
        }
        _ul.append(htmls.join(''));
        if(ids.length>0){
            if(ids.length > 100){
                var ids2 = ids.slice(0, 99);
                ids = ids.slice(99, ids.length);
                showCounts(t, ids2);
            }
            if(ids.length > 0) {
            	showCounts(t, ids);
            }
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
    } else { // 关闭动画
    	hideLoading();
    }
};
//<<<<<<<<<<<<<<<<<<<<<<<========

//显示评论数和回复数
function showCounts(t, ids){
	if(!ids || ids.length <= 0){
		return;
	}
	ids = ids.join(',');
    if(['direct_messages'].indexOf(t) >= 0){return;}

    showLoading();
    var c_user = getUser();
    if(!c_user || !tapi.get_config(c_user).support_counts){
        return;
    }
    var data = {ids:ids, user:c_user};
    tapi.counts(data, function(counts, textStatus){
        if(textStatus != 'error' && counts && !counts.error){
            if(counts.length && counts.length>0){
                for(var i in counts){
                    $('#'+ t +'_timeline .showCounts_'+counts[i].id).each(function(){
                        var _li = $(this);
                        var _edit = _li.find('.edit:eq(0)');
                        if(_edit){
                            _edit.find('.repostCounts').html('('+ counts[i].rt +')');
                            var _comm_txt = '(0)';
                            if(counts[i].comments > 0){
                                _comm_txt = '(<a href="javascript:void(0);" title="点击查看评论" onclick="showComments(this,' + counts[i].id + ');">' +counts[i].comments + '</a>)';
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
function showComments(ele, tweetId, page, notHide){
    if(tweetId){
    	// 获取status的screen_name
    	var $user_info = $(ele).parents('.userName').find('a:first');
    	var screen_name = $user_info.attr('user_screen_name');
    	var user_id = $user_info.attr('user_id');
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
        var user = getUser();
        var data = {id:tweetId, page:page, count:COMMENT_PAGE_SIZE, user:user};
        tapi.comments(data, function(data, textStatus){
        	var comments = data.items || data;
            if(textStatus != 'error' && comments && !comments.error){
                if(comments.length && comments.length>0){
                    var _html = '';
                    for(var i in comments){
                        var comment_li = buildComment(comments[i], tweetId, screen_name, user_id);
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
    if(isNaN(page)){
    	page = 1;
    }
    if(page == 1 && is_pre){
        $this.hide();
        return;
    }
    page = is_pre ? page - 1 : page + 1;
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
    //var h = $(c_t + ' .list').height();
    var h = $(c_t + ' .list')[0].scrollHeight;
    var list_warp = $(c_t + ' .list_warp');
    h = h - list_warp.height();
    if(list_warp.scrollTop() >= h){
        if(tl == 'followers'){ //粉丝列表特殊处理
            readMoreFans();
        } else if(tl == 'favorites') {
        	getFavorites();
        } else if(tl == 'user_timeline') {
        	var $tab = $("#tl_tabs .tab-user_timeline");
        	if($tab.attr('statusType') == 'search') {
        		Search.search(true);
        	} else {
        		getUserTimeline(null, null, true);
        	}
        } else {
            readMore(tl);
        }
    }
};

function initScrollPaging(){
    $(".list_warp").scroll(function(e){
        scrollPaging();
        checkShowGototop();
    });
};

//检查是否需要显示返回顶部按钮
function checkShowGototop(){
    var c_t = window.currentTab;
    var list_warp = $(c_t + ' .list_warp');
    if(list_warp.scrollTop() > 200){
        $("#gototop").show();
    }else{
        $("#gototop").hide();
    }
};

function setScrollTotop(){
    var c_t = window.currentTab;
    var list_warp = $(c_t + ' .list_warp');
    list_warp.scrollTop(0);
};

function readMoreFans(){
    _getFansList(null, true);
};

function readMore(t){
    hideReadMore(t);
    var moreEle = $("#" + t + "ReadMore");
    showLoading();
    var _b_view = getBackgroundView();
    var c_user = getUser();
    var _key = c_user.uniqueKey + t + '_tweets';
    var cache = _b_view.tweets[_key];
    if(!cache || getTimelineOffset(t) >= cache.length){
        _b_view.getTimelinePage(c_user.uniqueKey, t);
    }else{
//        var msg_ids = cache.slice(getTimelineOffset(t), getTimelineOffset(t) + PAGE_SIZE);
//        var msgs = TweetStorage.getItems(msg_ids, t, c_user.uniqueKey);
        var msgs = cache.slice(getTimelineOffset(t), getTimelineOffset(t) + PAGE_SIZE);
        addPageMsgs(msgs, t, true);
        showReadMore(t);
    }
};

/*如果当前tab是激活的，就返回true，否则返回false(即为未读)*/
function addTimelineMsgs(msgs, t, user_uniqueKey){
    var c_user = getUser();
    if(!user_uniqueKey){
        user_uniqueKey = c_user.uniqueKey;
    }
    if(c_user.uniqueKey != user_uniqueKey){
        return false;
    }

    var li = $('.tab-' + t);
    var _ul = $("#" + t + "_timeline ul.list");
    if(!li.hasClass('active')){
        //清空，让下次点tab的时候重新取
    	_ul.html('');
        var _msg_user = null, _unreadCount = 0;
        for(var i in msgs){
            _msg_user = msgs[i].user || msgs[i].sender;
            if(_msg_user && c_user && _msg_user.id != c_user.id){
                _unreadCount += 1;
            }
        }
        var ur = getUnreadTimelineCount(t);
        ur += _unreadCount;
        if(ur>0){
            li.find('.unreadCount').html('(' + ur + ')');
            //$("#accountListDock ." + user_uniqueKey + " .unr").html(_unreadCount + getUserUnreadTimelineCount(user_uniqueKey)).show();
            updateDockUserUnreadCount(user_uniqueKey);
        }
        return false;
    }else{
    	addPageMsgs(msgs, t, false);
    }
    return true;
};

// 添加分页数据，并且自动删除重复的数据，返回删除重复的数据集
function addPageMsgs(msgs, t, append){
	if(!msgs || msgs.length == 0){
		return [];
	}
    var ids = [];
    var _ul = $("#" + t + "_timeline ul.list"), htmls = [];
    var method = append ? 'append' : 'prepend';
    var direct = append ? 'last' : 'first';
    var max_id = $("#" + t + "_timeline ul.list li.tweetItem:" + direct).attr('did');
    var result = filterDatasByMaxId(msgs, max_id, append);
    msgs = result.news;
//    var start_time = new Date();
    htmls = buildStatusHtml(msgs, t);
//    var end_time = new Date();
//    log(end_time.getTime() - start_time.getTime());
    for(var i in msgs){
//    	_ul[method](htmls[i]);
    	//_ul[method](bildMsgLi(msgs[i], t));
//        html += bildMsgLi(msgs[i], t);
        if(t != 'direct_messages'){
        	ids.push(msgs[i].id);
            if(msgs[i].retweeted_status){
                ids.push(msgs[i].retweeted_status.id);
                if(msgs[i].retweeted_status.retweeted_status) {
                	ids.push(msgs[i].retweeted_status.retweeted_status.id);
                }
            } else if (msgs[i].status){ // 评论
                ids.push(msgs[i].status.id);
                if(msgs[i].status.retweeted_status) {
                	ids.push(msgs[i].status.retweeted_status.id);
                }
            }
        }
    }
    _ul[method](htmls.join(''));
    if(ids.length > 0){
        if(ids.length > 100){
            var ids2 = ids.slice(0, 99);
            ids = ids.slice(99, ids.length);
            showCounts(t, ids2);
        }
        showCounts(t, ids);
    }
    return msgs;
};

//发送 @回复
function sendReplyMsg(msg){
    var btn = $("#replySubmit"),
        txt = $("#replyTextarea"),
        userName = $("#ye_dialog_title").text();
    msg = userName + ' ' + msg;
    var tweetId = $("#replyTweetId").val();
    data = {sina_id: tweetId}; // @回复
    
    btn.attr('disabled','true');
    txt.attr('disabled','true');
    data['status'] = msg;
    
    var user = getUser();
    data['user'] = user;
    tapi.update(data, function(sinaMsg, textStatus){
        if(sinaMsg.id){
            hideReplyInput();
            txt.val('');
            setTimeout(callCheckNewMsg, 1000, 'friends_timeline');
            showMsg(userName + ' 成功！');
        }else if(sinaMsg.error){
//            showMsg('error: ' + sinaMsg.error);
        }
        btn.removeAttr('disabled');
        txt.removeAttr('disabled');
    });
};

//发送微博
function sendMsg(msg){
    var btn = $("#btnSend"),
        txt = $("#txtContent");
        
    
    btn.attr('disabled','true');
    txt.attr('disabled','true');
    
    var users = [], selLi = $("#accountsForSend .sel");
    if(selLi.length){
        selLi.each(function(){
            var uniqueKey = $(this).attr('uniqueKey');
            var _user = getUserByUniqueKey(uniqueKey, 'send');
            if(_user){
                users.push(_user);
            }
        });
    }else if(!$("#accountsForSend li").length){
        users.push(getUser());
    }else{
        showMsg('请选择要发送的账号');
        btn.removeAttr('disabled');
        txt.removeAttr('disabled');
        return;
    }
    var stat = {};
    stat.userCount = users.length;
    stat.sendedCount = 0;
    stat.successCount = 0;
    for(var i in users){
        _sendMsgWraper(msg, users[i], stat, selLi);
    }
};

function _sendMsgWraper(msg, user, stat, selLi){
    var data = {};
    data['status'] = msg; //放到这里重置一下，否则会被编码两次
    data['user'] = user;
    tapi.update(data, function(sinaMsg, textStatus){
        stat.sendedCount++;
        if(sinaMsg === true || sinaMsg.id){
            stat.successCount++;
            $("#accountsForSend li[uniquekey=" + user.uniqueKey +"]").removeClass('sel');
        }else if(sinaMsg.error){
//            showMsg('error: ' + sinaMsg.error);
        }
        if(stat.successCount >= stat.userCount){//全部发送成功
            hideMsgInput();
            selLi.addClass('sel');
            $("#txtContent").val('');
            showMsg('发送成功！');
        }
        if(stat.sendedCount >= stat.userCount){//全部发送完成
            selLi = null;
            $("#btnSend").removeAttr('disabled');
            $("#txtContent").removeAttr('disabled');
            if(stat.successCount > 0){ //有发送成功的
                setTimeout(callCheckNewMsg, 1000, 'friends_timeline');
                var failCount = stat.userCount - stat.successCount;
                if(stat.userCount > 1 && failCount > 0){ //多个用户，并且有发送失败才显示
                    showMsg(stat.successCount + '发送成功，' + failCount + '失败。');
                }
            }
        }
        user = null;
        stat = null;
    });
};

// 发生私信
function sendWhisper(msg){
    var btn = $("#replySubmit");
    var txt = $("#replyTextarea");
    var toUserId = $('#whisperToUserId').val();
    var data = {text: msg, id: toUserId};
    var user = getUser();
    data['user'] = user;
    btn.attr('disabled','true');
    txt.attr('disabled','true');
    tapi.new_message(data, function(sinaMsg, textStatus){
        if(sinaMsg === true || sinaMsg.id){
            hideReplyInput();
            txt.val('');
            showMsg('发送成功！');
        } else if (sinaMsg.error){
//            showMsg('error: ' + sinaMsg.error);
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
    var user = getUser();
    data['user'] = user;
    btn.attr('disabled','true');
    txt.attr('disabled','true');
    tapi.repost(data, function(sinaMsg, textStatus){
        if(sinaMsg.id){
            hideReplyInput();
            txt.val('');
            setTimeout(callCheckNewMsg, 1000, 'friends_timeline');
            showMsg('转发成功！');
        }else if(sinaMsg.error){
//            showMsg('error: ' + sinaMsg.error);
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
    var btn, txt, cid, data, user_id;
    btn = $("#replySubmit");
    txt = $("#replyTextarea");
    cid = $('#commentCommentId').val();
    user_id = $('#commentUserId').val();
    commentTweetId = commentTweetId || $('#commentTweetId').val();
    data = {comment: msg, id: commentTweetId};
    var user = getUser();
    // 判断评论是否需要用到原微博的id
    if(tapi.get_config(user).comment_need_user_id) {
    	data.user_id = user_id;
    }
    data['user'] = user;
    btn.attr('disabled','true');
    txt.attr('disabled','true');
    var m = 'comment';
    if(cid){ //如果是回复别人的微博
    	m = 'reply';
    	data.cid = cid;
        data.comment = data.comment.replace('回复 @'+ $('#replyUserName').val() +':', '');
    	var reply_user_id = $('#replyUserId').val();
    	data.reply_user_id = reply_user_id;
    } 
    tapi[m](data, function(sinaMsg, textStatus){
        if(sinaMsg === true || sinaMsg.id){
            hideReplyInput();
            txt.val('');
            showMsg('发送评论成功！');
        }else if(sinaMsg.error){
//            showMsg('error: ' + sinaMsg.error);
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

function callCheckNewMsg(t, uniqueKey){
    var b_view = getBackgroundView();
    if(b_view){
        b_view.checkNewMsg(t, uniqueKey);
    }
}

function showMsgInput(){
    initSelectSendAccounts();
    var h_submitWrap = $("#submitWarp .w").height();
    var h = window.innerHeight - 70 - h_submitWrap;
    $(".list_warp").css('height', h);
    $("#submitWarp").data('status', 'show').css('height', h_submitWrap);
    var _txt = $("#txtContent").val();
    $("#txtContent").focus().val('').val(_txt); //光标在最后面
    countInputText();
    $("#header .write").addClass('active').find('b').addClass('up');
    $("#doing").appendTo('#doingWarp');
};

function hideMsgInput(){
    fawave.face.hide();
    var h = window.innerHeight - 70;
    $(".list_warp").css('height', h);
    $("#submitWarp").data('status', 'hide').css('height', 0);
    $("#header .write").removeClass('active').find('b').removeClass('up');
    $("#doing").prependTo('#tl_tabs .btns');
};

function toogleMsgInput(ele){
    if($("#submitWarp").data('status') != 'show'){
        showMsgInput();
    }else{
        hideMsgInput();
    }
};

function hideReplyInput(){
    fawave.face.hide();
    $("#ye_dialog_window").hide();
    // 清空旧数据
    $('#ye_dialog_window input[type="hidden"]').val('');
    $('#ye_dialog_window input[type="checkbox"]').val('');
};

function resizeFawave(w, h){
    if(!w){
        w = window.innerWidth;
    }
    if(!h){
        h = window.innerHeight;
    }
    var wh_css = '#wrapper{width:'+ w +'px;}'
                   + '#txtContent{width:'+ (w-2) +'px;}'
				   + '.warp{width:' + w + 'px;} .list_warp{height:' + (h-70) + 'px;}'
                   + '#pb_map_canvas, #popup_box .image img, #popup_box .image canvas{max-width:'+ (w-20) +'px;}';
	$("#styleCustomResize").html(wh_css);
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
	var user = getUser();
    var config = tapi.get_config(user);
    $('#actionType').val('repost');
    $('#repostTweetId').val(tweetId);
    $('#replyUserName').val(userName);
    $('#ye_dialog_title').html('转发@' + userName + ' 的信息');
    if(config.support_comment) {
    	$('#chk_sendOneMore').attr("checked", false).val(tweetId).show();
        $('#txt_sendOneMore').text('同时给 @' + userName + ' 评论').show();
    } else { // 不支持repost，则屏蔽
    	$('#chk_sendOneMore').attr("checked", false).val('').hide();
        $('#txt_sendOneMore').text('').hide();
    }
    if(config.support_comment && rtUserName && reTweetId){
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
    var t = $('#replyTextarea');
    t.focus().val('').blur();
    if(reTweetId && d && d.retweeted_status){
        v = '//@' + userName + ':' + d.text;
    } else {
    	v = '转发微博.';
    }
	// 光标在前
	t.val(v).focus();
    if(v=='转发微博.'){t.select();}
    countReplyText();
};

function doComment(ele, userName, userId, tweetId, replyUserName, replyUserId, cid){//评论 cid:回复的评论ID
    $('#actionType').val('comment');
    $('#commentTweetId').val(tweetId);
    $('#commentUserId').val(userId);
    $('#replyUserName').val(replyUserName);
    $('#replyUserId').val(replyUserId || '');
    $('#commentCommentId').val(cid||'');
    $('#ye_dialog_title').html('评论@' + userName + ' 的信息');
    $('#ye_dialog_window').show();
    var _txt = replyUserName ? ('回复 @'+replyUserName+':') : '';
    //var _txt = '';

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

function doRT(ele, is_rt, is_rt_rt){//RT
    var data = $(ele).closest('li').find('.msgObjJson').text();
    data = JSON.parse(data);
    var t = $("#txtContent");
    showMsgInput();
    t.val('').blur();
    if(is_rt) {
    	data = data.retweeted_status;
    } else if(is_rt_rt) {
    	data = data.retweeted_status.retweeted_status;
    }
    var _msg_user = data.user;
    var repost_pre = tapi.get_config(getUser()).repost_pre;
    var val = repost_pre + ' ' + '@' + _msg_user.screen_name + ' ' + data.text;
    if(data.original_pic) {
    	// 有图片，自动带上图片地址，并尝试缩短
    	var settings = Settings.get();
    	var longurl = data.original_pic;
    	val += ' [图]' + longurl;
        _shortenUrl(longurl, settings, function(shorturl) {
        	if(shorturl){
                t.blur().val(t.val().replace(longurl, shorturl)).focus();
                countInputText();
            }
        });
    }
    t.val(val);
    t.focus(); //光标在头部
};

function _delCache(id, t, unique_key) {
	var cache_key = unique_key + t + '_tweets';
    var b_view = getBackgroundView();
    if(b_view && b_view.tweets[cache_key]){
        var cache = b_view.tweets[cache_key];
        id = String(id);
        for(var i in cache){
//        	if(String(cache[i]) == id){
            if(String(cache[i].id) == id){
                cache.splice(i, 1);
//                TweetStorage.removeItem(id);
                break;
            }
        }
    }
};

function doDelTweet(tweetId, ele){//删除自己的微博
    if(!tweetId){return;}
    showLoading();
    var user = getUser();
    var t = window.currentTab.replace('#','').replace(/_timeline$/i,'');
    tapi.destroy({id:tweetId, user:user}, function(data, textStatus){
        if(textStatus != 'error' && data && !data.error){
        	$(ele).closest('li').remove();
            _delCache(tweetId, t, user.uniqueKey);
            showMsg('删除成功');
        }else{
            showMsg('删除失败');
        }
    });
};
function doDelComment(ele, screen_name, tweetId){//删除评论
    if(!tweetId){return;}
    showLoading();
    var user = getUser();
    var t = window.currentTab.replace('#','').replace(/_timeline$/i,'');
    tapi.comment_destroy({id:tweetId, user:user}, function(data, textStatus){
        if(textStatus != 'error' && data && !data.error){
        	$(ele).closest('li').remove();
            _delCache(tweetId, t, user.uniqueKey);
            showMsg('删除成功');
        }else{
            showMsg('删除失败');
        }
    });
};
function delDirectMsg(ele, screen_name, tweetId){//删除私信
    if(!tweetId){return;}
    showLoading();
    var user = getUser();
    var t = window.currentTab.replace('#','').replace(/_timeline$/i,'');
    tapi.destroy_msg({id:tweetId, user:user}, function(data, textStatus){
        if(textStatus != 'error' && data && !data.error){
        	$(ele).closest('li').remove();
            _delCache(tweetId, t, user.uniqueKey);
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
    var user = getUser();
    var t = window.currentTab.replace('#','').replace(/_timeline$/i,'');
    tapi.favorites_create({id:tweetId, user:user}, function(data, textStatus){
        if(textStatus != 'error' && data && !data.error){
            _a.after(_aHtml.replace('addFavorites','delFavorites')
                            .replace('favorites_2.gif','favorites.gif')
                            .replace('点击收藏','点击取消收藏'));
            _a.remove();
//            var item = TweetStorage.getItems([tweetId], t, user.uniqueKey)[0];
//            item.favorited = True;
//            TweetStorage.setItems([item], t, user.uniqueKey);
            var cacheKey = user.uniqueKey + t + '_tweets';
            var b_view = getBackgroundView();
            if(b_view && b_view.tweets[cacheKey]){
                var cache = b_view.tweets[cacheKey];
                tweetId = String(tweetId);
                for(var i in cache){
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
    var user = getUser();
    var t = window.currentTab.replace('#','').replace(/_timeline$/i,'');
    tapi.favorites_destroy({id:tweetId, user:user}, function(data, textStatus){
        if(textStatus != 'error' && data && !data.error && data.id){
            _a.after(_aHtml.replace('delFavorites','addFavorites')
                            .replace('favorites.gif','favorites_2.gif')
                            .replace('点击取消收藏','点击收藏'));
            _a.remove();
//            var item = TweetStorage.getItems([tweetId], t, user.uniqueKey)[0];
//            item.favorited = True;
//            TweetStorage.setItems([item], t, user.uniqueKey);
            var c_user = getUser();
            var cacheKey = c_user.uniqueKey + t + '_tweets';
            var b_view = getBackgroundView();
            if(b_view && b_view.tweets[cacheKey]){
                var cache = b_view.tweets[cacheKey];
                for(var i in cache){
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

function sendOretweet(ele, screen_name, tweetId){//twitter锐推
    if(!tweetId){return;}
    showLoading();
    var _a = $(ele);
    var _aHtml = _a[0].outerHTML;
    _a.hide();
    var user = getUser();
    var t = window.currentTab.replace('#','').replace(/_timeline$/i,'');
    tapi.retweet({id:tweetId, user:user}, function(data, textStatus){
        if(textStatus != 'error' && data && !data.error && data.id){
            _a.removeAttr('onclick').addClass('orted').attr('title', '已成功锐推').show();

            var c_user = getUser();
            var cacheKey = c_user.uniqueKey + t + '_tweets';
            var b_view = getBackgroundView();
            if(b_view && b_view.tweets[cacheKey]){
                var cache = b_view.tweets[cacheKey];
                for(var i in cache){
                    if(cache[i].id == tweetId){
                        cache[i].retweeted = true;
                        break;
                    }else if(cache[i].retweeted_status && cache[i].retweeted_status.id == tweetId){
                        cache[i].retweeted_status.retweeted = true;
                        break;
                    }
                }
            }

            showMsg('锐推成功');
        }else{
            showMsg('锐推失败');
            _a.show();
        }
    });
};
//<<<<<<<<<<<<<=====

// 获取预览图片地址
function previewPic(ele, get_method) {
	var url = $(ele).unbind('click').attr('rhref');
	get_method(url, function(pics) {
		var tpl = '<div><a target="_blank" onclick="showFacebox(this);return false;" href="javascript:void(0);" bmiddle="{{bmiddle_pic}}" original="{{original_pic}}" onmousedown="rOpenPic(event, this)" title="右键点击打开原图"><img class="imgicon pic" src="{{thumbnail_pic}}"></a></div>';
		$(ele).hide().parent().after(tpl.format(pics));
	});
};

//查看图片
function showFacebox(ele){
    var _t = $(ele);
    if(!_t.find('.img_loading').lenght){
        _t.append('<img class="img_loading" src="images/loading.gif" />');
    }else{
        _t.find('.img_loading').show();
    }
    popupBox.showImg(_t.attr('bmiddle'), _t.attr('original'), function(){
        _t.find('.img_loading').hide();
    });
};

//显示地图
function showGeoMap(user_img, latitude, longitude){
    if(google && google.maps){
        popupBox.showMap(user_img, latitude, longitude);
    }else{
        showMsg('地图API正在载入中，请稍后再试');
    }
};

//====>>>>
//打开上传图片窗口
function openUploadImage(){
    initOnUnload();
    var l = (window.screen.availWidth-510)/2;
    window.open('upimage.html', '_blank', 'left=' + l + ',top=30,width=510,height=600,menubar=no,location=no,resizable=no,scrollbars=yes,status=yes');
};
//<<<<=====

//====>>>>
//在新窗口打开popup页
function openPopupInNewWin(){
    initOnUnload();
    /*
    if(getNewWinPopupView()){
        getNewWinPopupView().blur();
        getNewWinPopupView().focus();
        return;
    } */
    var W = Settings.get().popupWidth, H = Settings.get().popupHeight;
    var l = (window.screen.availWidth-W)/2;
    window.theViewName = 'not_popup';
    getBackgroundView().new_win_popup.window = window.open('popup.html?is_new_win=true', 'FaWave', 'left=' + l + ',top=30,width=' + W + ',height=' + (H+10) + ',menubar=no,location=no,resizable=no,scrollbars=yes,status=yes');
};

//====>>>>
//新消息提示模式：提示模式、免打扰模式
function changeAlertMode(to_mode){
    var btn = $("#btnAlertMode");
    if(!to_mode){
        var mode = btn.attr('mode');
        to_mode = (mode == 'alert') ? 'dnd' : 'alert';
    }
    setAlertMode(to_mode);
    var tip = (to_mode=='alert') ? '提示模式。点击切换到免打扰模式' : '已开启免打扰模式。点击切换到提示模式';
    btn.attr('mode', to_mode).attr('title', tip).find('img').attr('src', 'images/' + to_mode + '_mode.png');
    setUnreadTimelineCount(0, 'friends_timeline');
};

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

function rOpenPic(event, ele){
    if(event.button == 2){ //右键点击直接打开原图
        var url = $.trim($(ele).attr('original'));
        if(url){
            chrome.tabs.create({url:url, selected:isNewTabSelected});
        }
    }
};

//平滑滚动
/*
 t: current time（当前时间）；
 b: beginning value（初始值）；
 c: change in value（变化量）；
 d: duration（持续时间）。
*/
var SmoothScroller = {
    T: '', //setTimeout引用
    c_t: '', //当前tab
    list_warp: '',
    list_warp_height: 0, //当前的列表窗口高度
    ease_type: 'easeOut',
    tween_type: 'Quad',
    status:{t:0, b:0, c:0, d:0},
    resetStatus: function(){
        SmoothScroller.status.t = 0;
        SmoothScroller.status.b = 0;
        SmoothScroller.status.c = 0;
        SmoothScroller.status.d = 0;
    },
    start: function(e){
        if(e.wheelDelta == 0){ return; }
        clearTimeout(this.T);
        e.preventDefault();
        this.c_t = window.currentTab;
        this.list_warp = $(this.c_t + ' .list_warp');
        this.list_warp_height = this.list_warp.height(); //算好放缓存，免得每次都要算
        this.ease_type = Settings.get().smoothSeaeType;
        this.tween_type = Settings.get().smoothTweenType;
        var hasDo = this.status.t>0 ? (Math.ceil(Tween[this.tween_type][this.ease_type](this.status.t-1, this.status.b, this.status.c, this.status.d)) - this.status.b) : 0;
        this.status.c = -e.wheelDelta + this.status.c - hasDo; 
        this.status.d = (this.status.d/2) - (this.status.t/2) + 13;
        this.status.t = 0;
        this.status.b = this.list_warp.scrollTop();
        if(this.status.b <= 0 && this.status.c < 0){//在顶部还往上滚动，直接无视
            this.resetStatus();
            return;
        } 
        this.run();
    },
    run: function(){
        var _t = SmoothScroller;
        var _top = Math.ceil(Tween[_t.tween_type][_t.ease_type](_t.status.t, _t.status.b, _t.status.c, _t.status.d));
        _t.list_warp.scrollTop( _top );
        //var h = $(_t.c_t + ' .list').height();
        var h = $(_t.c_t + ' .list')[0].scrollHeight;
        h = h - _t.list_warp_height;
        if(_top >= h && _t.status.c > 0){
            _t.resetStatus();
            return;
        }
        if(_t.status.t < _t.status.d){
            _t.status.t++; _t.T = setTimeout(_t.run, 10);
        }
    }
};

$(function(){
    if(Settings.get().isSmoothScroller){
        $('.list_warp').bind('mousewheel', function(e){
            SmoothScroller.start(e);
        });
    }
});// <<=== 平滑滚动结束

//强制刷新
function forceRefresh(ele){
    $(ele).attr('disabled', true).fadeOut();
    var bg = getBackgroundView();
    var user = getUser();
    bg.RefreshManager.refreshUser(user);
    setTimeout(showRefreshBtn, 10*1000);
};
function showRefreshBtn(){
    $("#btnForceRefresh").attr('disabled', true).fadeIn();
};// <<=== 强制刷新结束

function _showLoading(){
    $("#loading").show();
};

function _hideLoading(){
    $("#loading").hide();
};

// 翻译
function translate(ele) {
	var $ele = $(ele).parents('.userName').next();
	if(!$ele.hasClass('tweet_text')) {
		$ele = $ele.find('.tweet_text');
	}
	$(ele).hide();
	var settings = Settings.get();
	var target = settings.translate_target;
	tapi.translate(getUser(), $ele.html(), target, function(translatedText) {
		if(translatedText) {
			$ele.after('<hr /><div class="tweet_text_old">' + translatedText + '</div>');
		}
	});
};