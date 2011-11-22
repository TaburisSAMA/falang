// @author qleelulu@gmail.com

var fawave = {};
function getTimelineOffset(t){
    return $("#" + t + "_timeline ul.list > li").length;
    //return timeline_offset[t] || PAGE_SIZE;
};

function initOnLoad(){
    setTimeout(init, 10); //为了打开的时候不会感觉太卡
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
    changeAutoInsertMode(getAutoInsertMode());

    $('#ye_dialog_close').click(function(){ hideReplyInput(); });

    initTabs();
    initTxtContentEven();

    initChangeUserList();
    
    // 显示上次打开的tab
    var b_view = getBackgroundView();
    var last_data_type = b_view.get_last_data_type(c_user.uniqueKey) || 'friends_timeline';
    _change_tab(last_data_type);

    initMsgHover();
    
    addUnreadCountToTabs();
    initIamDoing();

    initScrollPaging();

    // 注册 查看原始围脖的按钮事件
    $('a.show_source_status_btn').live('click', function() {
    	var $this = $(this);
    	var user = getUser();
    	var t = getCurrentTab().replace('#', '').replace(/_timeline$/i, '');
    	var params = {id: $(this).attr('status_id'), user: user};
    	$this.hide();
    	tapi.status_show(params, function(data) {
    		if(data && data.id) {
    			var html = buildStatusHtml([data], t, user).join('');
    			$this.parents('.mainContent').after(html);
    			// 处理缩址
        		ShortenUrl.expandAll();
    		} else {
    			$this.show();
    		}
    	});
    });
    
    // support @ autocomplete
    at_user_autocomplete("#txtContent", false, function() {
    	// 计数
    	countInputText();
    });
    at_user_autocomplete("#replyTextarea", false, function() {
    	countReplyText();
    });
    at_user_autocomplete("#direct_message_user", true, function(user){
    	// 选中则发私信
    	doNewMessage($("#direct_message_user").get(0), user.screen_name, user.id);
    });
    
    adShow();
    
    restoreActionCache();
    
    // 绑定缩短网址事件
    var $urlshorten_span = $("#urlShortenInp").parent();
    if($urlshorten_span.length > 0) {
        $urlshorten_span.mouseenter(function() {
            $("#urlShortenInp").addClass('long').select();
        }).mouseleave(function() {
            $("#urlShortenInp").removeClass('long');
        }).keypress(function(event) {
            if(event.which === 13) {
                addShortenUrl();
            }
        });
    }
    
    $(window).unload(function(){ initOnUnload(); }); 
    
    //google map api，为了不卡，最后才载入
    var script = document.createElement("script"); 
    script.type = "text/javascript"; 
    script.src = "http://maps.google.com/maps/api/js?sensor=false&callback=initializeMap"; 
    document.body.appendChild(script);
};

function initializeMap(){};//给载入地图api调用

function initTabs() {
    window.currentTab = '#friends_timeline_timeline';
    $('#tl_tabs li').click(function() {
        var t = $(this), currentIsActive = t.hasClass('active');
        //不进行任何操作							 
        if(t.hasClass('tab-none')) {
            return;
        };
        //切换tab前先保护滚动条位置
        var old_t = getCurrentTab().replace('#', '').replace(/_timeline$/i, '');
        var c_t = t.attr('href').replace('#','').replace(/_timeline$/i,'');
        if(!currentIsActive) { // 如果是数据类型不一样了，才需要记录当前位置
            saveScrollTop(old_t);
        }
        //添加当前激活的状态
        t.siblings().removeClass('active').end().addClass('active');
        //切换tab
        $('.list_p').hide();
        var c_ul = $(t.attr('href'));
        c_ul.show();
        window.currentTab = t.attr('href');
        if(c_t === 'user_timeline') { //用户自己的微薄，清空内容。防止查看别人的微薄的时候内容混合
            getUserTimeline();
            checkShowGototop();
            return;
        }else if(c_t === 'followers') {
        	window.currentTab = ''; // 防止自动滚动
        	showFollowers();
            checkShowGototop();
            return;
        } else if(c_t === 'favorites') {
        	getFavorites(true);
            checkShowGototop();
            return;
        }
        var load_new = _load_new_data(c_t, currentIsActive);
        if(!load_new) {
            // 未加载新数据
            if(!c_ul.find('ul.list').html()){
                // 加载缓存着的数据
                getSinaTimeline(c_t);
            } else if(currentIsActive) {
                // 如果没有更新又是当前tab，则等价于滚动到最顶的操作
                setScrollTotop();
            } else {
                resetScrollTop(c_t);
            }
        }
        checkShowGototop(); // 检查是否要显示返回顶部按钮
    });
    
    checkSupportedTabs();
};

// 判断是否需要加载新数据
function _load_new_data(t, is_current_tab) {
    var b_view = getBackgroundView();
    var view_status = b_view.get_view_status(t);
    view_status.index = view_status.index || 0;
    var load_new = view_status.index !== 0; // 判断是否有新数据
    var settings = Settings.get();
    if(settings.remember_view_status) {
        if(load_new && !is_current_tab && isNotAutoInsertMode()) { 
            // 非自动插入模式，如果不是当前tab，则需根据上次的位置来判断是否要获取新的
            if(view_status.scrollTop && view_status.scrollTop > 50) {
                load_new = false;
            }
        }
    } else {
        load_new = true;
    }
    if(load_new) {
        view_status.index = 0;
        view_status.size = 0;
        view_status.scrollTop = 0;
        if(view_status.clean_cache) {
            // 清空分页数据
            b_view.clean_timeline_cache_data(t);
        }
        view_status.clean_cache = false;
        b_view.set_view_status(t, view_status);
        $("#" + t + "_timeline ul.list").html('');
        getSinaTimeline(t);
    }
    return load_new;
};

function initOnUnload(){
    var c = $("#txtContent").val(), $reply_text = $("#replyTextarea");
    if(!c || !$reply_text.is(':hidden')) {
        // 没有输入或者是对话框模式，则隐藏文本输入
        ActionCache.set('showMsgInput', null);
    }
    localStorage.setObject(UNSEND_TWEET_KEY, c || '');
    localStorage.setObject(UNSEND_REPLY_KEY, $("#replyTextarea").val() || '');
    if(Settings.get().sendAccountsDefaultSelected === 'remember') {
        if($("#accountsForSend").data('inited')){
            var keys = '';
            $("#accountsForSend li.sel").each(function(){
                keys += $(this).attr('uniquekey') + '_';
            });
            keys = keys ? '_'+keys : keys;

            localStorage.setObject(LAST_SELECTED_SEND_ACCOUNTS, keys);
        }
    }
    // 保持当前滚动条位置
    var c_t = getCurrentTab();
    if(c_t) {
        c_t = c_t.replace('#','').replace(/_timeline$/i,'');
        saveScrollTop(c_t);
    }
};

function _get_clipboard_file(e, callback) {
    var f = null, items = e.clipboardData && e.clipboardData.items;
    items = items || [];
    for(var i = 0; i < items.length; i++){
        if(items[i].kind === 'file'){
            f = items[i].getAsFile();
            break;
        }
    }
    if(f){
        var reader = new FileReader();
        reader.onload = function(event){
            callback(f, event.target.result);
        };
        reader.readAsDataURL(f);
    } else {
        callback();
    }
};

function _init_image_preview(image_src, size, preview_id, btn_id, top_padding, left_padding) {
    $("#" + preview_id + " .img").html('<img class="pic" src="' + image_src + '" />');
    left_padding = left_padding || -30;
    top_padding = top_padding || 20;
    var offset = $('#' + btn_id).offset();
    $("#" + preview_id).data('uploading', false).css({
        left:offset.left + left_padding, 
        top:offset.top + top_padding
    }).show()
    .find('.loading_bar div').css({'border-left-width': '0px'})
    .find('span').html(display_size(size));
};

function initTxtContentEven(){
    //>>>发送微博事件初始化 开始<<<
    var unsendTweet = localStorage.getObject(UNSEND_TWEET_KEY);
    var $txtContent = $("#txtContent"), $replyText = $("#replyTextarea");
    if(unsendTweet) {
        $txtContent.val(unsendTweet);
    }

    $txtContent[0].oninput = $txtContent[0].onfocus = countInputText;
    
    //黏贴图片
    $txtContent[0].onpaste = function(e) {
        _get_clipboard_file(e, function(file, image_src) {
            if(file){
                window.imgForUpload = file;
                window.imgForUpload.fileName = 'fawave.png';
                _init_image_preview(image_src, file.size, 'upImgPreview', 'btnUploadPic');
            }
        });
    };

    $txtContent.keydown(function(event){
        var c = $.trim($(this).val());
        if(((event.ctrlKey || event.metaKey) && event.keyCode==13) || (event.altKey && event.which === 83)) {
            if(c){
                sendMsg(c);
            }else{
                showMsg(_u.i18n("msg_need_content"));
            }
            return false;
        }
    });

    $("#btnSend").click(function(){
        var c = $.trim($("#txtContent").val());
        if(c){
            sendMsg(c);
        }else{
            showMsg(_u.i18n("msg_need_content"));
        }
    });
    //>>>发送微博事件初始化 结束<<<

    //>>>回复事件初始化开始<<<
    if($replyText.length > 0) {
        var unsendReply = localStorage.getObject(UNSEND_REPLY_KEY);
        if(unsendReply) {
            $replyText.val(unsendReply);
        }
        $replyText.keyup(function(){
            countReplyText();
        }).keydown(function(event){
            var c = $.trim($(this).val());
            var send = false;
            if((event.ctrlKey || event.metaKey) && event.which === 13){ // ctrl[command] + enter
                send = true;
            } else if(event.altKey && event.which === 83) { // alt + s
                send = true;
            }
            if(send) {
                sendMsgByActionType(c);
                return false;
            }
        });
        
        $replyText[0].onpaste = function(e){
            _get_clipboard_file(e, function(file, image_src) {
                if(file){
                    window.imgForUpload_reply = file;
                    window.imgForUpload_reply.fileName = 'fawave_reply.png';
                    _init_image_preview(image_src, file.size, 'upImgPreview_reply', 'btnAddReplyEmotional', 60);
                    countReplyText();
                }
            });
        };

        $("#replySubmit").click(function(){
            sendMsgByActionType($.trim($("#replyTextarea").val()));
        });
    }
    //>>>回复结束<<<
};

function sendMsgByActionType(c) { // c:要发送的内容
    if(!c) {
        return showMsg(_u.i18n("msg_need_content"));
    }
    $("#replySubmit, #replyTextarea").attr('disabled', true);
    if(window.imgForUpload_reply) {
        // 增加图片链接
        Nodebox.upload({}, window.imgForUpload_reply, function(error, info) {
            if(info && (info.link || info.url)) {
                var picurl = info.link || info.url;
                if($('#repostTweetId').val()) {
                    // repost
                    c = picurl + ' ' + c; // 图片放前面
                } else {
                    c += ' ' + picurl;
                }
            }
            __sendMsgByActionType(c);
        }, function(rpe) {
            // progress
            var $loading_bar = $('#upImgPreview_reply .loading_bar');
            var html = display_size(rpe.loaded) + "/" + display_size(rpe.total);
            var width = parseInt((rpe.loaded / rpe.total) * $loading_bar.width());
            $loading_bar.find('div').css({'border-left-width': width + 'px'}).find('span').html(html);
        });
    } else {
        __sendMsgByActionType(c);
    }
};

function __sendMsgByActionType(c){ // c:要发送的内容
    var actionType = $('#actionType').val();
    switch(actionType) {
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
            showMsg('Wrong Send Type');
            $("#replySubmit, #replyTextarea").attr('disabled', false);
            break;
    }
};

// return text, left_length, max_length
function _countText(text_id) {
	var $text = $("#" + text_id);
	var value = $text.val()
	  , max_length = +($text.data('max_text_length') || 140)
	  , len = max_length - ($text.data('support_double_char') ? value.len() : value.length);
    return [value, len, max_length];
}

//统计字数
function countInputText() {
    var values = _countText('txtContent', 'wordCount');
    if(values[1] === values[2]) {
        $("#btnSend").attr('disabled', 'disabled');
    } else {
        $("#btnSend").removeAttr('disabled');
    }
    var text = values[0], wlength = text.len(); //, length = text.length;
    $('#wordCount_double').html(140 - wlength);
    $('#wordCount').html(values[1]);
};

function countReplyText(){
	var values = _countText('replyTextarea'), len = values[1], html = null;
	if(window.imgForUpload_reply) {
	    // 有图片，则自动增加20字符
	    len -= 20;
	}
	if(len > 0){
        html = _u.i18n("msg_word_count").format({len: len});
    }else{
        html = '(<em style="color:red;">'+ _u.i18n("msg_word_overstep").format({len:len}) +'</em>)';
    }
    $('#replyInputCount').html(html);
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
	settings = settings || Settings.get();
	if(settings.isSharedUrlAutoShort 
	        && longurl.replace(/^https?:\/\//i, '').length > settings.sharedUrlAutoShortWordCount) {
    	ShortenUrl.short(longurl, callback);
    }
};

// 添加缩短url
function addShortenUrl(){
    var $btn = $("#urlShortenBtn");
    var status = $btn.data('status');
    switch(status){
        case 'shorting':
            showMsg(_u.i18n("msg_shorting_and_wait"));
            break;
        default:
            var $text = $("#urlShortenInp");
            var long_url = $text.addClass('long').val();
            if(!long_url) {
                $text.focus();
                return;
            }
            $btn.data('status', 'shorting');
            $text.val(_u.i18n("msg_shorting")).attr('disabled', true);
            ShortenUrl.short(long_url, function(shorturl){
                if(shorturl){
                    var $content = $("#txtContent");
                    $content.val($content.val() + ' ' + shorturl + ' ');
                    $text.val('');
                }else{
                    showMsg(_u.i18n("msg_shorten_fail"));
                    $text.val(long_url);
                }
                $btn.data('status', null);
                $text.removeAttr('disabled');
            });
            break;
    }
};

//我正在看
function initIamDoing(){
	function shareDoing(capture) {
		return function() {
			var params = decodeForm(window.location.search);
			if(params.windowId) {
				params.windowId = parseInt(params.windowId);
			}
			chrome.tabs.getSelected(params.windowId, function(tab){
	            var loc_url = tab.url;
	            if(loc_url){
	                var title = tab.title || '';
                    var $txt = $("#txtContent")
                      , value = $txt.val();
                    if(value) {
                        value += ' ';
                    }
                    var settings = Settings.get();
                    $txt.val(value + formatText(settings.lookingTemplate, {title: title, url: loc_url}))
                        .data({source_url: '', short_url: ''});
                    showMsgInput();
                    _shortenUrl(loc_url, settings, function(shorturl){
                        if(shorturl) {
                            $txt.val($txt.val().replace(loc_url, shorturl))
                                .data({source_url: loc_url, short_url: shorturl}); // 记录下原始url
                            countInputText();
                        }
                    });
                    if(capture) {
                        chrome.tabs.captureVisibleTab(tab.windowId, {format: 'png'}, function(dataurl) {
                            var file = window.imgForUpload = dataUrlToBlob(dataurl);
                            _init_image_preview(dataurl, file.size, 'upImgPreview', 'btnUploadPic');
                        });
                    }
	            } else {
	                showMsg(_u.i18n("msg_wrong_page_url"));
	            }
	        });
		};
	};
    $("#doing").click(shareDoing(false));
    // 分享正在查看，并带上截图
    $("#doingWithCapture").click(shareDoing(true));
};

//搜索
var Search = {
	current_search: '', // 默认当前搜索类型 search, search_user
	current_keyword: '',
    toggleInput: function(ele){
		$('.searchWrap').hide();
		var $search_wrap = $(ele).nextAll('.searchWrap');
		var search_type = $search_wrap.hasClass('searchUserWrap') ? 'search_user' : 'search';
		if(search_type == Search.current_search) {
			Search.current_search = '';
			return;
		}
		Search.current_search = search_type;
		$search_wrap.toggle();
		var $text = $search_wrap.find(".txtSearch").focus().keyup(function(event) {
			Search.current_keyword = $(this).val();
        	if(event.keyCode == '13') {
        		Search.search();
        	}
        });
		Search.current_keyword = $text.val();
    },
    search: function(read_more) {
    	var c_user = getUser();
    	var q = $.trim(Search.current_keyword);
    	if(!q) {
    		return;
    	}
    	// http://www.google.com/search?q=twitter&source=fawave&tbs=mbl:1
//    	if(c_user.blogType == 'twitter') {
//    		chrome.tabs.create({url: 'http://www.google.com/search?q=' + q + '&source=fawave&tbs=mbl:1', selected: false});
//    		return;
//    	}
	    var $tab = $("#tl_tabs .tab-user_timeline");
	    $tab.attr('statusType', 'search');
	    var $ul = $("#user_timeline_timeline ul.list");
	    var max_id = null;
	    var page = 1;
	    var cursor = null;
	    var config = tapi.get_config(c_user);
	    var support_search_max_id = config.support_search_max_id;
	    var support_cursor_only = config.support_cursor_only;
	    if(read_more) {
	    	// 滚动的话，获取上次的参数
	        max_id = $tab.attr('max_id');
	        cursor = $tab.attr('cursor');
	        page = Number($tab.attr('page') || 1);
	    }  else {
	    	// 第一次搜索
	    	$ul.html('');
	    }
	    var params = {count: PAGE_SIZE, q: q, user: c_user};
	    if(support_cursor_only) { // 只支持cursor方式分页
	    	if(cursor) {
	    		params.cursor = cursor;
	    	}
	    } else {
	    	if(support_search_max_id) {
		    	if(max_id) {
			    	params.max_id = max_id;
			    }
		    } else {
		    	params.page = page;
		    }
	    }
	    showLoading();
	    var timeline_type = 'user_timeline';
	    var method = 'search';
	    var data_type = 'status';
	    if(Search.current_search === 'search_user') {
	    	method = 'user_search';
	    	data_type = 'user';
	    }
	    hideReadMore(timeline_type);
	    tapi[method](params, function(data, textStatus) {
	    	hideLoading();
            hideReadMoreLoading(timeline_type);
	    	// 如果用户已经切换，则不处理
	    	var now_user = getUser();
	    	if(now_user.uniqueKey != c_user.uniqueKey) {
	    		return;
	    	}
	    	var statuses = data.results || data.items || data;
	    	if(!statuses) { // 异常
	    		return;
	    	}
	    	if(data.next_cursor !== undefined) {
	    		$tab.attr('cursor', data.next_cursor);
	    	}
	        if(statuses.length > 0){
	        	var c_tb = getCurrentTab();
	        	var want_tab = "#" + timeline_type + "_timeline";
	        	if(c_tb != want_tab) {
	        		//添加当前激活的状态
	                $tab.siblings().removeClass('active').end().addClass('active');
	                //切换tab前先保护滚动条位置
	                var old_t = c_tb.replace('#','').replace(/_timeline$/i,'');
	                saveScrollTop(old_t);
	                //切换tab
	                $('.list_p').hide();
	                
	                $(want_tab).show();
	                $ul.html('');
	
	                window.currentTab = want_tab;
	        	}
	            statuses = addPageMsgs(statuses, timeline_type, true, data_type);
	            // 保存数据，用于翻页
//	            $tab.attr('q', q);
	            $tab.attr('page', page + 1);
	        }
	        if(statuses.length >= PAGE_SIZE / 2) {
            	max_id = data.max_id || String(statuses[statuses.length - 1].id);
            	$tab.attr('max_id', max_id);
            	showReadMore(timeline_type);
            } else {
            	hideReadMore(timeline_type, true); //没有分页了
            }
	        checkShowGototop();
	    });
    }
};

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
    	support_search: ['.search_span', '.search_span'],
    	support_user_search: ['.user_search_span', '.user_search_span']
    };
    for(var key in checks) {
    	if(!config[key]){
    		$(checks[key][0]).hide();
        }else{
        	$(checks[key][1]).show();
        }
    }
    // 如果是buzz，则隐藏评论tab，但是它可以评论
    if(user.blogType == 'buzz') {
    	$('#tl_tabs .tab-comments_timeline, #comments_timeline_timeline').hide();
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
    h_user.find('.face, .name_link').attr('href', c_user.t_url);
    h_user.find('.face .icon').attr('src', c_user.profile_image_url);
    h_user.find('.face .bt').attr('src', 'images/blogs/'+c_user.blogType+'_16.png');
    h_user.find('.info .name').html(c_user.screen_name);
    var nums = '', config = tapi.get_config(c_user);
    if(config.show_fullname) {
        nums += c_user.name + '&nbsp;&nbsp;&nbsp;&nbsp;';
    }
    if(config.userinfo_has_counts){
        nums += _u.i18n("comm_counts_info").format(c_user);
        if(c_user.favourites_count != undefined) {
            nums += ', ' + c_user.favourites_count + ' ' + _u.i18n("comm_favourite");
        }
    }
    h_user.find('.info .nums').html(nums);
};

function _change_tab(data_type) {
    var $tab = $("#tl_tabs .tab-" + data_type);
    if($tab.length === 0) {
        data_type = 'friends_timeline';
        $tab = $("#tl_tabs .tab-" + data_type);
    }
    if($tab.hasClass('only_click')) {
        $tab.click();
    } else {
        $tab.siblings().removeClass('active').end().addClass('active');
        // 切换tab
        $('.list_p').hide();
        $($tab.attr('href')).show();
        window.currentTab = $tab.attr('href');
        if(!_load_new_data(data_type, false)) {
            // 未加载新数据，则添加久数据
            getSinaTimeline(data_type);
        }
    }
}

function changeUser(uniqueKey){
    var c_user = getUser();
    // 获取当前的tab
    var activeLi = $("#tl_tabs li.active");
    if(c_user.uniqueKey === uniqueKey) {
        activeLi.click();
        return;
    }
    var to_user = getUserByUniqueKey(uniqueKey);
    if(to_user) {
        if(activeLi.length === 0) {
            activeLi = $("#tl_tabs li:first");
        }
        var cur_t = activeLi.attr('href').replace(/_timeline$/, '').substring(1);
        // 记录位置和记录当前tab
        saveScrollTop(cur_t);
        activeLi.removeClass('active');
        
        setUser(to_user);
        showHeaderUserInfo(to_user);
        var b_view = getBackgroundView();
        b_view.onChangeUser();
        var _li = null, _t = '';
        $("#tl_tabs li").each(function(){
            _li = $(this);
            _t = _li.attr('href').replace(/_timeline$/i,'').substring(1);
            $("#" + _t + '_timeline .list').html('');
            hideReadMore(_t);
        });
        // 清空ui缓存数据
        TWEETS = {};
        checkSupportedTabs(to_user);
        
        // TODO: 获取上次正在查看的tab
        var last_data_type = b_view.get_last_data_type(uniqueKey) || 'friends_timeline';
        activeLi = $("#tl_tabs .tab-" + last_data_type);
        if(activeLi.css('display') == 'none'){ //如果不支持的tab刚好是当前tab
            window.currentTab = '#friends_timeline_timeline';
            last_data_type = 'friends_timeline';
        }
        $("#tl_tabs .unreadCount").html('');
        $("#accountListDock").find('.current').removeClass('current')
            .end().find('.'+to_user.uniqueKey).addClass('current');
        addUnreadCountToTabs();
        _change_tab(last_data_type);
    }
};

// 初始化用户选择视图
function initSelectSendAccounts(){
    var settings = Settings.get();
    var afs = $("#accountsForSend");
    if(afs.data('inited')){
        if(settings.sendAccountsDefaultSelected === 'current' && afs.find('li.sel').length < 2){
            afs.find('li').removeClass('sel');
            var c_user = getUser();
            $("#accountsForSend li[uniqueKey=" + c_user.uniqueKey +"]").addClass('sel');
        }
        shineSelectedSendAccounts(afs.find('li.sel'));
        return;
    }
    var userList = getUserList('send');
    if(userList.length < 2){ return; } //多个用户才显示
    var li_tpl = '<li class="{{sel}}" uniqueKey="{{uniqueKey}}" blogType="{{blogType}}" onclick="toggleSelectSendAccount(this)">' +
        '<img src="{{profile_image_url}}" />' +
        '{{screen_name}}' +
        '<img src="/images/blogs/{{blogType}}_16.png" class="blogType" /></li>';
    var li = [];
    var c_user = getUser(), has_sina = false, has_other = false;
    for(var i = 0, len = userList.length; i < len; i++) {
        var user = userList[i];
        user.sel = '';
        var is_sina = user.blogType === 'tsina';
        if(!has_sina && is_sina) {
            has_sina = true;
        }
        if(!has_other && !is_sina) {
            has_other = true;
        }
        switch(settings.sendAccountsDefaultSelected){
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
        li.push(li_tpl.format(user));
    }
    if(has_sina && has_other) {
        // 只有同时有新浪微博和其他类型，才显示保留数据的选项
        var $keep_data_btn = $('<span id="remember_send_data_ctr"><input type="checkbox" id="remember_send_data" /><label for="remember_send_data">' 
            + _u.i18n("abb_keep_send_data") + '</label></span>');
        var $sendBtn = $('#btnSend');
        $sendBtn.before($keep_data_btn.css({right: ($sendBtn.width() + 30) + 'px'}));
    }
    afs.html('TO(<a class="all" href="javascript:" onclick="toggleSelectAllSendAccount()">' 
        + _u.i18n("abb_all") +'</a>): ' + li.join(''));
    afs.data('inited', 'true');
    shineSelectedSendAccounts();
};
function shineSelectedSendAccounts(sels){
    if(!sels){
        sels = $("#accountsForSend li.sel");
    }
    sels.css('-webkit-transition', 'none').removeClass('sel');
    function _highlightSels(){
        sels.css('-webkit-transition', 'all 0.8s ease').addClass('sel');
    }
    setTimeout(_highlightSels, 150);
};
function toggleSelectSendAccount(ele){
    var _t = $(ele);
    var is_tsina = (_t.attr('blogType') || 'tsina') === 'tsina';
    if(_t.hasClass('sel')){
        _t.removeClass('sel');
    }else{
        var settings = Settings.get();
        if(settings.__allow_select_all !== true) {
            if(is_tsina) {
                _t.siblings().each(function() {
                    var $this = $(this);
                    if($this.attr('blogType') !== 'tsina') {
                        $this.removeClass('sel');
                    }
                });
             } else {
                 _t.siblings().each(function() {
                     var $this = $(this);
                     if($this.attr('blogType') === 'tsina') {
                         $this.removeClass('sel');
                     }
                 });
             }
        }
        _t.addClass('sel');
    }
};
function toggleSelectAllSendAccount() {
    var $selected = $("#accountsForSend .sel");
    if($selected.length === 0) {
        $selected = $("#accountsForSend li[uniqueKey=" + getUser().uniqueKey +"]");
    }
    var $sinas = $('#accountsForSend li[blogType="tsina"]');
    var $others = $('#accountsForSend li[blogType!="tsina"]');
    var is_tsina = $selected.attr('blogType') === 'tsina';
    if(is_tsina) {
        if($selected.length < $sinas.length) {
            return $sinas.addClass('sel') && $others.removeClass('sel');
        }
        if($others.length > 0) {
            return $sinas.removeClass('sel') && $others.addClass('sel');
        }
    }
    if($selected.length < $others.length) {
        return $sinas.removeClass('sel') && $others.addClass('sel');
    }
    $("#accountsForSend li").removeClass('sel');
    var c_user = getUser();
    $("#accountsForSend li[uniqueKey=" + c_user.uniqueKey +"]").addClass('sel');
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
        var is_not_auto_insert = isNotAutoInsertMode();
        for(var i in T_LIST[user.blogType]){
            ur = getUnreadTimelineCount(T_LIST[user.blogType][i], user.uniqueKey);
            if(ur>0 && c_user.uniqueKey == user.uniqueKey){ //当前用户，则设置timeline tab上的提示
                tab = $("#tl_tabs .tab-" + T_LIST[user.blogType][i]);
                // 判断是否自动加载新数据
                if(tab.length == 1 && (is_not_auto_insert || !tab.hasClass('active'))){
                    tab.find('.unreadCount').html(ur);
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
        } else {
            $ele.parent().find('.follow_button_destroy').show();
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
        } else {
            var $parent = $ele.parent();
            $parent.find('.followed').hide();
            $parent.find('.follow_button_create').show();
        }
    });
};
//====>>>>>>>>>>>>>>>>>>>>>>

//滚动条位置
var SCROLL_TOP_CACHE = {};
//@t : timeline类型
function saveScrollTop(t) {
    var b_view = getBackgroundView();
    var view_status = b_view.get_view_status(t);
    var scrollTop = view_status.scrollTop = $("#" + t + "_timeline .list_warp").scrollTop();
    var total_height = 0, item_index = 0;
    $("#" + t + "_timeline .list_warp ul.list > li").each(function(index) {
        var height = $(this).height();
        item_index = index;
        if(total_height <= scrollTop && (total_height + height) > scrollTop) {
            return false;
        }
        total_height += height;
    });
    var $comments = $('div.comments:visible');
    if($comments.length > 0) {
        $comments.each(function() {
            view_status.scrollTop -= $(this).height();
        });
    }
    view_status.size = item_index + 5;
    b_view.set_view_status(t, view_status);
};

//复位到上次的位置
//@t : timeline类型
//返回上次位置
function resetScrollTop(t, top) {
    var last_top = top || 0;
    var $warp = $("#" + t + "_timeline .list_warp");
    if(t !== 'user_timeline') {
        if(top === undefined) {
            var b_view = getBackgroundView();
            var _cache = b_view.get_view_status(t);
            last_top = _cache.scrollTop || 0;
        }
    }
    $warp.scrollTop(last_top);
    return last_top;
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
    	$("#fans_tab span font").html(_u.i18n("comm_my"));
    }
    if(!get_c_user_fans) {
    	$("#fans_tab span font").html(screen_name + _u.i18n("comm_de"));
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
    var last_user = $followers_timeline.attr('last_user');
    if(c_user.uniqueKey != last_user) { // 用户切换了
    	cursor = '-1';
    }
    $followers_timeline.attr('last_user', c_user.uniqueKey);
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
    	cursor = '-1';
	    $list.html('');
    }
	if(cursor == '0'){
		hideReadMore(to_t, true);
    	return;
    }
    params.cursor = cursor;
    hideReadMore(to_t);
    window.currentTab = to_t;
    showLoading();
    $to_t.attr('loading', true);
//    log(c_user.uniqueKey + ': ' + cursor + ' ' + read_more);
    tapi[to_t](params, function(data, textStatus, statuCode){
    	// 如果用户已经切换，则不处理
    	var now_user = getUser();
    	if(now_user.uniqueKey != c_user.uniqueKey) {
    		return;
    	}
        if(data){
            var users = data.users || data.items || data;
            var next_cursor = data.next_cursor;
//            log(c_user.uniqueKey + ': next_cursor ' + next_cursor);
            var $last_item = $("#followers_timeline ul.list .user_info:last");
            var max_id = $last_item.attr('did');
            var result = filterDatasByMaxId(users, max_id, true);
            users = result.news;
            if(users && users.length > 0) {
            	var html = '';
                for(var i in users){
                	if(!get_c_user_fans) {
                	    // 查看其他用的粉丝，无法判断关系，全部默认为未关注
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
            if(users && users.length > 0) {
                showReadMore(to_t);
            } else {
                hideReadMore(to_t, true);
            }
            // 设置游标，控制翻页
            if(next_cursor !== undefined) {
        		$to_t.attr('cursor', next_cursor);
        	}
        } else {
        	// 异常
        	showReadMore(to_t);
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
    if($tab.data('is_loading')) {
        return;
    }
    $tab.data('is_loading', true);
    $tab.attr('statusType', 'user_timeline');
    var $ul = $("#user_timeline_timeline ul.list");
    var max_id = null;
    var cursor = null;
    var page = 1;
    user_id = user_id || '';
    var params = {count: PAGE_SIZE, user: c_user, need_friendship: true};
    if(read_more) {
    	// 滚动的话，获取上次的参数
    	max_id = $tab.attr('max_id');
        page = String($tab.attr('page') || 1);
        cursor = $tab.attr('cursor');
        user_id = $tab.attr('user_id');
        screen_name = $tab.attr('screen_name');
        params.need_friendship = false;
    } else if(screen_name === undefined) {
    	// 直接点击tab，获取当前用户的
    	screen_name = c_user.screen_name;
    	user_id = c_user.id;
    	$ul.html('');
    	params.need_friendship = false;
    }  else {
    	// 否则就是直接点击查看用户信息了
    	$ul.html('');
    }
    params.screen_name = screen_name;
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
    tapi[m](params, function(data, textStatus) {
        $tab.data('is_loading', false);
    	// 如果用户已经切换，则不处理
    	var now_user = getUser();
    	if(now_user.uniqueKey != c_user.uniqueKey) {
    		return;
    	}
    	if(data) {
    		var sinaMsgs = data.items || data;
        	if(support_cursor_only && data.next_cursor) {
        		$tab.attr('cursor', data.next_cursor);
        	}
            if(sinaMsgs && sinaMsgs.length > 0){
            	var c_tab = getCurrentTab();
            	if(c_tab !== "#user_timeline_timeline") {
            		//添加当前激活的状态
                    $tab.siblings().removeClass('active').end().addClass('active');
                    //切换tab前先保护滚动条位置
                    var old_t = c_tab.replace('#','').replace(/_timeline$/i,'');
                    saveScrollTop(old_t);
                    //切换tab
                    $('.list_p').hide();
                    
                    $("#user_timeline_timeline").show();
                    $ul.html('');

                    window.currentTab = "#user_timeline_timeline";
            	}
                addPageMsgs(sinaMsgs, m, true);
                var last_index = sinaMsgs.length - 1;
                max_id = String(sinaMsgs[last_index].timestamp || sinaMsgs[last_index].cursor_id || sinaMsgs[last_index].id);
                page += 1;
                // 保存数据，用于翻页
                $tab.attr('max_id', max_id);
                $tab.attr('page', page);
                $tab.attr('screen_name', screen_name);
                $tab.attr('user_id', user_id);
                if(sinaMsgs.length > 8){
                    showReadMore(m);
                }else{
                    hideReadMore(m, true); //没有分页了
                }
                if(!read_more) {
                	var user = data.user || sinaMsgs[0].user || sinaMsgs[0].sender;
                	// 是否当前用户
                	user.is_me = String(c_user.id) == String(user.id);
                    var userinfo_html = buildUserInfo(user);
                    $ul.prepend(userinfo_html);
                    resetScrollTop(m);
                }
            }else{
                hideReadMore(m, true);
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
    var cursor = list.attr('cursor');
    var max_id = list.attr('max_id');
    var page = list.attr('page');
    var t = 'favorites';
    var user_cache = get_current_user_cache();
    var config = tapi.get_config(c_user);
    var support_cursor_only = config.support_cursor_only; // 只支持游标方式翻页
    if(!is_click) {
    	is_click = support_cursor_only ? !cursor : !page;
    }
    if(is_click) { // 点击或第一次加载
    	if(user_cache[t]) {
    		list.html(user_cache[t]);
    		return;
    	} else {
    		list.html('');
    		page = 1;
    	}
    }
    var params = {user: c_user, count: PAGE_SIZE};
    var support_cursor_only = config.support_cursor_only; // 只支持游标方式翻页
    var support_favorites_max_id = config.support_favorites_max_id; // 支持max_id方式翻页
    if(!is_click) {
    	if(support_cursor_only) {
    		if(cursor == '0') {
    			return;
    		}
    		if(cursor) {
    			params.cursor = cursor;
    		}
    	} else if(support_favorites_max_id) { // 163
    		if(max_id) {
    			params.max_id = max_id;
    		}
    	}
    	else {
    		if(page) {
    			params.page = page;
    		}
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
        	if(data.next_cursor >= 0) {
        		list.attr('cursor', data.next_cursor);
        	}
        	list.attr('page', Number(page) + 1);
        	status = addPageMsgs(status, t, true);
	        if(status.length > 0){
	        	var index = status.length - 1;
	        	list.attr('max_id', status[index].timestamp || status[index].id);
	            showReadMore(t);
	            user_cache[t] = list.html();
	        } else {
	            hideReadMore(t, true);
	        }
        } else {
        	showReadMore(t);
        }
    });
};

//获取时间线微博列表
//@t : 类型
function getSinaTimeline(t, notCheckNew){
    var _ul = $("#" + t + "_timeline ul.list");
    var c_user = getUser();
    var b_view = getBackgroundView();
    var data_type = t;
    if('direct_messages' === data_type) {
    	data_type = 'messages';
    }
    var cache = b_view.get_data_cache(data_type, c_user.uniqueKey)
      , view_status = b_view.get_view_status(t, c_user.uniqueKey);
    view_status.index = view_status.index || 0;
    view_status.size = view_status.size || PAGE_SIZE;
    if(view_status.size < PAGE_SIZE) {
        view_status.size = PAGE_SIZE;
    }
    hideReadMoreLoading(t);
    if(cache && cache.length > 0) {
        var counts_max_id_num = tapi.get_config(c_user).support_counts_max_id_num || 99;
        if(view_status.index === 0) {
            // 清空未读数据
            $('#tl_tabs li.active').find(".unreadCount").html('');
            removeUnreadTimelineCount(t);
            updateDockUserUnreadCount(getUser().uniqueKey);
        }
        var msgs = cache.slice(view_status.index, view_status.index + view_status.size), ids = [];
        var htmls = buildStatusHtml(msgs, t);
        _ul.append(htmls.join(''));
        // 处理缩址
        ShortenUrl.expandAll();
        for(var i = 0, len = msgs.length; i < len; i++) {
            var msg = msgs[i];
            ids.push(msg.id);
            if(msg.retweeted_status) {
                ids.push(msg.retweeted_status.id);
                if(msg.retweeted_status.retweeted_status) {
                	ids.push(msg.retweeted_status.retweeted_status.id);
                }
            } else if(msg.status) {
                ids.push(msg.status.id);
                if(msg.status.retweeted_status) {
                	ids.push(msg.status.retweeted_status.id);
                }
            }
            if(ids.length > counts_max_id_num) {
                var ids2 = ids.slice(0, counts_max_id_num);
                ids = ids.slice(counts_max_id_num, ids.length);
                showCounts(t, ids2);
            }
        }
        if(ids.length > 0) {
            showCounts(t, ids);
        }
        resetScrollTop(t);
        if(cache.length >= (PAGE_SIZE / 2)) {
            showReadMore(t);
        }
    } else if(!notCheckNew) {
    	showReadMoreLoading(t);
        b_view.checkTimeline(t);
    }
};

// 显示评论数和回复数
function showCounts(t, ids){
	if(!ids || ids.length === 0 || ['direct_messages'].indexOf(t) >= 0){
		return;
	}
    var c_user = getUser();
    var config = tapi.get_config(c_user);
    if(!c_user || !config.support_counts){
        return;
    }
    ids = ids.join(',');
    var data = {ids: ids, user: c_user};
    showLoading();
    tapi.counts(data, function(counts, textStatus){
    	hideLoading();
        if(textStatus != 'error' && counts && !counts.error){
            if(counts.length && counts.length > 0) {
                for(var i = 0, l = counts.length; i < l; i++) {
                    var item = counts[i];
                    $('#'+ t +'_timeline .showCounts_'+item.id).each(function(){
                        var _li = $(this);
                        var _edit = _li.find('.edit:eq(0)');
                        if(_edit){
                        	if(config.support_repost_timeline) {
                        		_edit.find('.repostCounts a').html(item.rt);
                        	} else {
                        		_edit.find('.repostCounts').html('('+ item.rt +')');
                        	}
                            var _comm_txt = '(0)';
                            if(item.comments > 0){
                                _comm_txt = '(<a href="javascript:void(0);" title="'
                                    + _u.i18n("comm_show_comments") +'" timeline_type="comment" onclick="showComments(this,' 
                                    + item.id + ');">' + item.comments + '</a>)';
                            }
                            _edit.find('.commentCounts').html(_comm_txt);
                        }
                    });
                }
            }
        }
    });
}

//======>>>>>>> 查看评论 / 转发列表 <<<<<<<
//@ele: 触发该事件的元素, 如果ele的timeline_type == 'repost'，则代表是转发列表
//@tweetId: 微博ID
//@page: 分页
//@notHide: 不要隐藏评论列表
function showComments(ele, tweetId, page, notHide, page_params){
	if(!tweetId) {
		return;
	}
	var $ele = $(ele);
	// 获取status的screen_name
	var comment_p = $ele.closest('.commentWrap');
	var $user_info = comment_p.find('.userName a:first');
	var screen_name = $user_info.attr('user_screen_name');
	var user_id = $user_info.attr('user_id');
    
    var commentWrap = comment_p.children('.comments');
    var $comment_list = commentWrap.children('.comment_list');
    var current_type = comment_p.attr('timeline_type') || 'comment';
	var timeline_type = $ele.attr('timeline_type') || current_type;
    if(current_type != timeline_type) {
    	// 切换，清空目前的数据
    	commentWrap.hide();
    	$comment_list.html('');
    	comment_p.attr('timeline_type', timeline_type);
    }
    if(!notHide && commentWrap.css('display') != 'none'){
        commentWrap.hide();
        return;
    } else if(!notHide && $comment_list.html()){
        commentWrap.show();
        return;
    }
    var hide_btn_text = timeline_type == 'comment' ? 
    	_u.i18n("btn_hide_comments") : _u.i18n("btn_hide_repost_timeline");
    commentWrap.find('.comment_hide_list_btn').html(hide_btn_text);
    showLoading();
    var user = getUser();
    var params = {id:tweetId, count:COMMENT_PAGE_SIZE, user:user};
    if(page) {
    	if(page_params) {
    		for(var k in page_params) {
    			params[k] = page_params[k];
    		}
    	} else {
    		params.page = page;
    	}
    } else {
    	page = 1;
    }
    var config = tapi.get_config(user);
    if(config.comments_need_status) {
        var sid = $ele.closest('li').attr('did');
        params.status = TWEETS[sid];
    }
    var method = timeline_type == 'comment' ? 'comments' : 'repost_timeline';
    tapi[method](params, function(data, textStatus){
    	data = data || {};
    	var comments = data.items || data;
        if(comments){
            if(comments.length && comments.length>0){
                var _html = [];
                var last_comment_id = null, first_comment_id = null;
                for(var i in comments){
                    _html.push(buildComment(comments[i], tweetId, screen_name, user_id, timeline_type));
                    last_comment_id = comments[i].timestamp || comments[i].id;
                    if(!first_comment_id) {
                    	first_comment_id = last_comment_id;
                    }
                }
                $comment_list.html(_html.join(''));
                commentWrap.show();
                // 如果明确显示没有下一页，则不显示分页按钮
                if(data.has_next !== false) {
                	if(page < 2){
                        commentWrap.find('.comment_paging a:eq(0)').hide();
                    }else{
                        commentWrap.find('.comment_paging a:eq(0)').show();
                    }
                    if(comments.length < COMMENT_PAGE_SIZE){
                        commentWrap.find('.comment_paging a:eq(1)').hide();
                    }else{
                        commentWrap.find('.comment_paging a:eq(1)').show();
                    }
                    $page = commentWrap.find('.comment_paging');
                    $page.attr('page',page).show();
                    if(first_comment_id) {
                    	$page.attr('first_id',first_comment_id);
                    }
                    if(last_comment_id) {
                    	$page.attr('last_id',last_comment_id);
                    }
                }
                if(data.comment_count) {
                	$ele.html(data.comment_count);
                }
            }else{
                if(page==1){
                    commentWrap.find('.comment_paging').hide();
                }else{
                    commentWrap.find('.comment_paging a:eq(1)').hide();
                }
            }
        }
        if(!comments || !comments.length){
        	$ele.parent().html('(0)');
        }
        hideLoading();
    });
};

var showRepostTimeline = showComments;

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
    var user = getUser();
    var page_params = null;
    if(page) {
    	if(user.blogType == 't163') {
    		// 163只支持 since_id和max_id翻页
        	if(is_pre) {
        		page_params = {since_id: page_wrap.attr('first_id')};
        	} else {
        		page_params = {max_id: page_wrap.attr('last_id')};
        	}
    	} else if(user.blogType == 'tqq') {
    		// PageFlag：（根据dwTime），0：第一页，1：向下翻页，2向上翻页；
    		// tqq: TwitterId: 第一页 时填0,继续向下翻页，填上一次请求返回的最后一条记录ID，翻页用
        	if(is_pre) {
        		// 必须+1，否则会带上第一天记录
        		page_params = {since_id: parseInt(page_wrap.attr('first_id')) + 1};
        	} else {
        		page_params = {max_id: page_wrap.attr('last_id')};
        	}
    	}
    }
    showComments(ele, tweetId, page, true, page_params);
}

//<<<<<<<<<<<======

//======>>>>>>> 更多(分页) <<<<<<<
var CAN_SCROLL_PAGING = {};
//有分页
function showReadMore(t){
    CAN_SCROLL_PAGING[t] = true;

    hideReadMoreLoading(t);
};
//正在获取分页或者没有分页内容了
//@nomore: 没有分页内容了
function hideReadMore(t, nomore){
    CAN_SCROLL_PAGING[t] = false;

    if(!nomore){
        showReadMoreLoading(t);
    }else{
        hideReadMoreLoading(t);
    }
};
//是否可以分页
function isCanReadMore(t){
    //$("#" + t + "ReadMore").hide();
    return CAN_SCROLL_PAGING[t] || false;
};
//显示获取分页loading
function showReadMoreLoading(t){
	if(t == 'friends') {
		t = 'followers';
	}
    $("#" + t + "_rm_loading").show();
    $("#" + t + '_timeline .list_warp').scrollTop(100000); //底部
};
//隐藏获取分页loading
function hideReadMoreLoading(t){
	if(t === 'friends') {
		t = 'followers';
	}
    $("#" + t + "_rm_loading").hide();
};

function getCurrentTab() {
	var c_t = window.currentTab;
    if(c_t == 'followers' || c_t == 'friends') {
    	c_t = '#followers_timeline';
    }
    return c_t;
}

function scrollPaging(){
    var c_t = window.currentTab;
    var tl = c_t.replace('#','').replace(/_timeline$/i,'');
    if(!isCanReadMore(tl)){
        //hideReadMore(tl, true);
        return;
    }
    c_t = getCurrentTab();
    var h = $(c_t + ' .list')[0].scrollHeight;
    var list_warp = $(c_t + ' .list_warp');
    h = h - list_warp.height();
    var scroll_top = list_warp.scrollTop();
//    console.log('scroll ' + tl, scroll_top, h);
    if(scroll_top >= h){
//    	console.log('scroll ' + tl);
        if(c_t == '#followers_timeline'){ //粉丝列表特殊处理
            readMoreFans();
        } else if(tl == 'favorites') {
        	getFavorites();
        } else if(tl == 'user_timeline') {
        	var $tab = $("#tl_tabs .tab-user_timeline")
        	  , statusType = $tab.attr('statusType');
        	if(statusType === 'search') {
        		Search.search(true);
        	} else if(statusType === 'blocking') {
        	    showblocking(true);
        	} else {
        		getUserTimeline(null, null, true);
        	}
        } else {
            readMore(tl);
        }
    }
};

function initScrollPaging() {
    $(".list_warp").bind('scrollstop', function(e){
//        var $this = $(this);
//    	if($this.data('scrolling')) {
//    		return;
//    	}
//    	$this.data('scrolling', true);
        scrollPaging();
        checkShowGototop();
//        $this.data('scrolling', false);
    });
};

//检查是否需要显示返回顶部按钮
function checkShowGototop(){
    var c_t = getCurrentTab();
    var list_warp = $(c_t + ' .list_warp');
    if(list_warp.scrollTop() > 200){
        $("#gototop").show();
    }else{
        $("#gototop").hide();
    }
};

function setScrollTotop(){
    $(getCurrentTab() + ' .list_warp').scrollTop(0);
};

function readMoreFans(){
    _getFansList(null, true);
};

function readMore(t){
    hideReadMore(t);
    showLoading();
    var _b_view = getBackgroundView();
    var c_user = getUser();
    var data_type = t;
    if(data_type === 'direct_messages') {
    	data_type = 'messages';
    }
    var cache = _b_view.get_data_cache(data_type, c_user.uniqueKey);
    var view_status = _b_view.get_view_status(t, c_user.uniqueKey);
    var timeline_offset = getTimelineOffset(t) + (view_status.index || 0);
    if(!cache || timeline_offset >= cache.length) {
        _b_view.getTimelinePage(c_user.uniqueKey, t);
    } else {
        var msgs = cache.slice(timeline_offset, timeline_offset + PAGE_SIZE);
        addPageMsgs(msgs, t, true);
        showReadMore(t);
        hideLoading();
    }
};

/************
 * 给BG调用的。
 * 如果当前tab是激活的，就返回true，否则返回false(即为未读). 
 * 修改：根据用户设置是否自动提示新消息来返回true or false
 * */
function addTimelineMsgs(msgs, t, user_uniqueKey, is_first_time, is_old_data){
    var c_user = getUser();
    if(!user_uniqueKey){
        user_uniqueKey = c_user.uniqueKey;
    }
    //不是当前用户
    if(c_user.uniqueKey != user_uniqueKey){
        return false;
    }

    var li = $('.tab-' + t);
    var _ul = $("#" + t + "_timeline ul.list");
    
    var unread = getUnreadTimelineCount(t);
    if(!is_old_data) {
        // 非旧数据，则需要重新计算未读数
        var c_user_id = String(c_user.id);
        for(var i=0, len = msgs.length; i < len; i++) {
            var _msg_user = msgs[i].user || msgs[i].sender;
            if(_msg_user && String(_msg_user.id) !== c_user_id) {
                unread += 1;
            }
        }
    }
    if(!li.hasClass('active')) {
        //清空，让下次点tab的时候重新取
    	_ul.html('');
    	if(unread > 0){
            li.find('.unreadCount').html(unread);
            updateDockUserUnreadCount(user_uniqueKey);
        }
        return false;
    } else {
    	if(!is_first_time && isNotAutoInsertMode()) {
    	    if(unread > 0){
                li.find('.unreadCount').html(unread);
    	    }
    	    return false;
    	} else {
    	    if(is_first_time) {
    	        // 第一次加载，清空未读提示
    	        li.find('.unreadCount').html('');
    	        removeUnreadTimelineCount(t);
    	        updateDockUserUnreadCount(user_uniqueKey);
    	    }
    	    addPageMsgs(msgs, t, false);
    	    return true;
    	}
    }
    return false;
};

// 添加分页数据，并且自动删除重复的数据，返回删除重复的数据集
function addPageMsgs(msgs, t, append, data_type){
	msgs = msgs || [];
	if(msgs.length == 0){
		return msgs;
	}
	if(t === 'sent_direct_messages') {
		t = 'direct_messages';
	}
	data_type = data_type || 'status';
    var _ul = $("#" + t + "_timeline ul.list"), htmls = [];
    var method = append ? 'append' : 'prepend';
    var direct = append ? 'last' : 'first';
    var $last_item;
    if(data_type === 'status') {
        $last_item = $("#" + t + "_timeline ul.list li.tweetItem:" + direct);
    } else {
        $last_item = $("#" + t + "_timeline ul.list div.user_info:" + direct);
    }
    var max_id = $last_item.attr('did');
    var result = filterDatasByMaxId(msgs, max_id, append);
    msgs = result.news;

    htmls = data_type === 'status' ? buildStatusHtml(msgs, t) : buildUsersHtml(msgs, t);
    _ul[method](htmls.join(''));
    // 处理缩址
    ShortenUrl.expandAll();
    
    if(t !== 'direct_messages' && data_type === 'status') {
        var ids = [];
        var counts_max_id_num = tapi.get_config(getUser()).support_counts_max_id_num || 99;
	    for(var i = 0, len = msgs.length; i < len; i++){
	    	var status = msgs[i]
	    	  , retweeted_status = status.retweeted_status || status.status;
        	ids.push(status.id);
            if(retweeted_status){
                ids.push(retweeted_status.id);
                if(retweeted_status.retweeted_status) {
                	ids.push(retweeted_status.retweeted_status.id);
                }
            }
	    }
	    if(ids.length > 0) {
	        if(ids.length > counts_max_id_num) {
	            var ids2 = ids.slice(0, counts_max_id_num);
	            ids = ids.slice(counts_max_id_num, ids.length);
	            showCounts(t, ids2);
	        }
	        showCounts(t, ids);
	    }
    }
    var h_old = _ul.height();
    //hold住当前阅读位置
    var list_warp = $("#" + t + '_timeline .list_warp');
    var st_old = list_warp.scrollTop();
    if(!append && st_old > 50){ //大于50才做处理，否则不重新定位(顶部用户可能想直接看到最新的微博)
        var h_new = _ul.height();
        list_warp.scrollTop(h_new - h_old + st_old);
    }
    return msgs;
};

//发送 @回复
function sendReplyMsg(msg){
    var btn = $("#replySubmit")
      , txt = $("#replyTextarea")
      , screen_name = $("#ye_dialog_title").text()
      , user = getUser()
      , config = tapi.get_config(user)
      , tweetId = $("#replyTweetId").val();
    // 判断是否需要填充 @screen_name
    if(config.reply_dont_need_at_screen_name !== true || !tweetId) {
    	if(config.rt_at_name) {
    		// 需要使用name替代screen_name
    		msg = '@' + $('#replyUserName').val() + ' ' + msg;
    	} else {
    		msg = screen_name + ' ' + msg;
    	}
    }
    if(tweetId) {
    	data = {sina_id: tweetId}; // @回复
    } else {
    	data = {};
    }
    btn.attr('disabled','true');
    txt.attr('disabled','true');
    data['status'] = msg;
    
    data['user'] = user;
    tapi.update(data, function(sinaMsg, textStatus){
        if(sinaMsg.id){
            hideReplyInput();
            txt.val('');
            setTimeout(callCheckNewMsg, 1000, 'friends_timeline');
            showMsg(screen_name + ' ' + _u.i18n("comm_success"));
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
        txt = $("#txtContent"),
        source_url = txt.data('source_url'),
        short_url = txt.data('short_url');
        
    btn.attr('disabled','true');
    txt.attr('disabled','true');
    
    var users = [], selLi = $("#accountsForSend .sel"), current_user = getUser();
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
        showMsg(_u.i18n("msg_need_select_account"));
        btn.removeAttr('disabled');
        txt.removeAttr('disabled');
        return;
    }
    var stat = {image_urls: []};
    stat.userCount = users.length;
    stat.sendedCount = 0;
    stat.successCount = 0;
    stat.uploadCount = 0;
    stat.unsupport_uploads = []; // 不支持发送图片的，则等待支持发送图片的获取到图片后，再发送
    var use_source_url = source_url && short_url;
    var pic = window.imgForUpload;
    stat.pic = pic;
//    var matchs = tapi.findSearchText(current_user, msg);
    for(var i = 0, len = users.length; i < len; i++) {
    	var status = msg, user = users[i];
    	// 判断是否使用缩短网址
    	if(use_source_url) {
    		var config = tapi.get_config(user);
    		if(config.support_auto_shorten_url) {
    			status = status.replace(short_url, source_url);
    		}
    	}
    	// 处理主题转化
//    	if(matchs.length > 0 && current_user.blogType !== user.blogType) {
//    	    for(var j = 0, jlen = matchs.length; j < jlen; j++) {
//    			var match = matchs[j];
//    			status = status.replace(match[0], tapi.formatSearchText(user, match[1]));
//    		}
//    	}
    	var config = tapi.get_config(user);
    	if(pic && (!config.support_upload || user.apiProxy)) { // twitter代理不兼容图片上传
    	    stat.unsupport_uploads.push([status, user, stat, selLi]);
    	} else {
    	    stat.uploadCount++;
    	    _sendMsgWraper(status, user, stat, selLi, pic);
    	}
    }
    _start_updates(stat);
};

function _get_image_url(stat, callback, onprogress, context) {
    // 都没有url，则只能发普通微博了
    var image_url = null;
    for(var i = 0, len = stat.image_urls.length; i < len; i++) {
        // 优先获取sinaimg
        if(stat.image_urls[i].indexOf('sinaimg') > 0) {
            image_url = stat.image_urls[i];
            break;
        }
    }
    if(!image_url) {
        image_url = stat.image_urls[0];
    }
    if(!image_url && stat.pic) {
        if(!onprogress) {
            var $loading_bar = $('#upImgPreview .loading_bar');
            if($loading_bar.length > 0) {
                onprogress = function(rpe) {
                    // progress
                    var html = display_size(rpe.loaded) + "/" + display_size(rpe.total);
                    var width = parseInt((rpe.loaded / rpe.total) * $loading_bar.width());
                    $loading_bar.find('div').css({'border-left-width': width + 'px'}).find('span').html(html);
                };
            }
        }
        Nodebox.upload({}, stat.pic, function(error, info) {
            if(info && (info.link || info.url)) {
                image_url = info.link || info.url;
            }
            callback.call(context, image_url);
        }, onprogress, context);
    } else {
        callback.call(context, image_url);
    }
}

function _start_updates(stat) {
    if(stat.uploadCount === 0 && stat.unsupport_uploads && stat.unsupport_uploads.length > 0) {
        var unsupport_uploads = stat.unsupport_uploads;
        delete stat.unsupport_uploads;
        _get_image_url(stat, function(image_url) {
            if(image_url) {
                stat.select_image_url = image_url;
            }
            for(var i = 0, len = unsupport_uploads.length; i < len; i++) {
                if(image_url) {
                    unsupport_uploads[i][0] += ' ' + image_url;
                }
                _sendMsgWraper.apply(null, unsupport_uploads[i]);
            }
        });
    }
};

function _sendMsgWraper(msg, user, stat, selLi, pic) {
    function callback(result, textStatus) {
        stat.uploadCount--;
        stat.sendedCount++;
        if(result === true || (result && (result.id || (result.data && result.data.id))) || textStatus === 'success') {
            stat.successCount++;
            $("#accountsForSend li[uniquekey=" + user.uniqueKey +"]").removeClass('sel');
            if(result) {
                var image_url = result.original_pic;
                if(!image_url && result.data) {
                    image_url = result.data.original_pic;
                }
                if(image_url) {
                    stat.image_urls.push(image_url);
                }
            }
        }
        _start_updates(stat);
        
        if(stat.successCount >= stat.userCount) { // 全部发送成功
            showMsg(_u.i18n("msg_send_success"));
            var $remember_send_data = $('#remember_send_data');
            if(!$remember_send_data.prop('checked')) {
                // 清除url数据
                $("#txtContent").val('').data({source_url: '', short_url: ''});
                window.imgForUpload = null;
                $('#upImgPreview').hide().find('.img').html('');
                hideMsgInput();
                selLi.addClass('sel');
            } else {
                // 不选中
                $remember_send_data.prop('checked', false);
            }
        }
        if(stat.sendedCount >= stat.userCount) {// 全部发送完成
            selLi = null;
            $("#btnSend, #txtContent").removeAttr('disabled');
            if(stat.successCount > 0) { // 有发送成功的
                setTimeout(callCheckNewMsg, 1000, 'friends_timeline');
                var failCount = stat.userCount - stat.successCount;
                if(stat.userCount > 1 && failCount > 0){ // 多个用户，并且有发送失败才显示
                    showMsg(_u.i18n("msg_send_complete").format({successCount:stat.successCount, errorCount:failCount}));
                }
                if(stat.select_image_url && failCount > 0) { 
                    // 有未成功的，则将图片保留下来，以便下次发送
                    var $txtContent = $("#txtContent");
                    $txtContent.val($txtContent.val() + ' ' + stat.select_image_url);
                }
            }
        }
        user = null;
        stat = null;
    };
    if(pic) {
        var data = {status: msg};
        pic = {file: pic};
        var $loading_bar = $('#upImgPreview .loading_bar'), onprogress = null;
        if(!$loading_bar.data('uploading')) {
            $loading_bar.data('uploading', true);
            onprogress = function(rpe) {
                // progress
                var html = display_size(rpe.loaded) + "/" + display_size(rpe.total);
                var width = parseInt((rpe.loaded / rpe.total) * $loading_bar.width());
                $loading_bar.find('div').css({'border-left-width': width + 'px'}).find('span').html(html);
            };
        }
        tapi.upload(user, data, pic, null, onprogress, callback);
    } else {
        var data = {status: msg, user:user};
        tapi.update(data, callback);
    }
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
    if(user.blogType == 't163') {
    	// 163只需要用户
    	data.id = $('#replyUserName').val();
    }
    tapi.new_message(data, function(sinaMsg, textStatus){
        if(sinaMsg === true || sinaMsg.id){
            hideReplyInput();
            txt.val('');
            showMsg(_u.i18n("msg_send_success"));
        } else if (sinaMsg.error){
//            showMsg('error: ' + sinaMsg.error);
        }
        btn.removeAttr('disabled');
        txt.removeAttr('disabled');
    });
};

function sendRepost(msg, repostTweetId, notSendMord){
    var $btn = $("#replySubmit"), $txt = $("#replyTextarea");
    repostTweetId = repostTweetId || $('#repostTweetId').val();
    var data = {status: msg, id:repostTweetId}
      , user = getUser()
      , config = tapi.get_config(user);
    data.user = user;
    $btn.attr('disabled','true');
    $txt.attr('disabled','true');
    if(config.repost_need_status) {
        data.retweeted_status = TWEETS[repostTweetId];
    }
    // 处理是否评论
    if(!notSendMord) {
        var $chk_sendOneMore = $('#chk_sendOneMore');
        if($chk_sendOneMore.attr("checked") && $chk_sendOneMore.val()) { // 同时给XXX评论
            if(config.support_repost_comment) {
            	data.is_comment = 1;
            } else {
            	sendComment(msg, $chk_sendOneMore.val(), true);
            }
        }
        var $chk_sendOneMore2 = $('#chk_sendOneMore2');
        if($chk_sendOneMore2.attr("checked") && $chk_sendOneMore2.val()) { // 同时给原作者 XXX评论
        	if(config.support_repost_comment_to_root) {
        		data.is_comment_to_root = 1;
        	} else {
        		sendComment(msg + '.', $chk_sendOneMore2.val(), true);
        	}
        }
    }
    tapi.repost(data, function(status, textStatus){
        if(status && (status === true || status.id || (status.retweeted_status && status.retweeted_status.id))) {
            hideReplyInput();
            $txt.val('');
            setTimeout(callCheckNewMsg, 1000, 'friends_timeline');
            showMsg(_u.i18n("msg_repost_success"));
        }
        $btn.removeAttr('disabled');
        $txt.removeAttr('disabled');
    });
};

function sendComment(msg, comment_id, notSendMord){
    var btn, txt, cid, data, user_id;
    btn = $("#replySubmit");
    txt = $("#replyTextarea");
    cid = $('#commentCommentId').val();
    user_id = $('#commentUserId').val();
    comment_id = comment_id || $('#commentTweetId').val();
    data = {comment: msg, id: comment_id};
    var user = getUser(), config = tapi.get_config(user);
    // 判断评论是否需要用到原微博的user_id
    if(config.comment_need_user_id) {
    	data.user_id = user_id;
    }
    if(config.comments_need_status) {
        data.status = TWEETS[comment_id];
    }
    data['user'] = user;
    btn.attr('disabled','true');
    txt.attr('disabled','true');
    var m = 'comment';
    if(cid){ //如果是回复别人的微博
    	m = 'reply';
    	data.cid = cid;
    	if(user.blogType !== 't163') { // 163不支持reply_user_id;
    		data.comment = data.comment.replace(_u.i18n("msg_comment_reply_default").format({username:$('#replyUserName').val()}), '');
    	}
        var reply_user_id = $('#replyUserId').val();
    	data.reply_user_id = reply_user_id;
    } 
    tapi[m](data, function(sinaMsg, textStatus){
        if(sinaMsg === true || sinaMsg.id){
            hideReplyInput();
            txt.val('');
            showMsg(_u.i18n("msg_comment_success"));
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
    var $submitWarp = $("#submitWarp");
    if($submitWarp.data('status') !== 'show') {
        initSelectSendAccounts();
        var h_submitWrap = $submitWarp.find(".w").height();
        var h = window.innerHeight - 70 - h_submitWrap;
        $(".list_warp").css('height', h);
        $submitWarp.data('status', 'show').css('height', h_submitWrap);
        $("#header .write").addClass('active').find('b').addClass('up');
        $("#doing").appendTo('#doingWarp');
        ActionCache.set('showMsgInput', []);
    }
    var $text = $("#txtContent"), value = $text.val();
    $text.focus().val('').val(value); //光标在最后面
    countInputText();
};

function hideMsgInput(){
    fawave.face.hide();
    var h = window.innerHeight - 70;
    $(".list_warp").css('height', h);
    $("#submitWarp").data('status', 'hide').css('height', 0);
    $("#header .write").removeClass('active').find('b').removeClass('up');
    $("#doing").prependTo('#tl_tabs .btns');
    ActionCache.set('showMsgInput', null);
};

function toogleMsgInput(ele){
    if($("#submitWarp").data('status') !== 'show'){
        showMsgInput();
        if(window.imgForUpload) {
            setTimeout(function() {
                $("#upImgPreview").show();
            }, 500);
        }
    }else{
        $("#upImgPreview").hide();
        hideMsgInput();
    }
};

function hideReplyInput(){
    fawave.face.hide();
    $("#ye_dialog_window").hide();
    // 清空旧数据
    $('#ye_dialog_window input[type="hidden"]').val('');
    $('#ye_dialog_window input[type="checkbox"]').val('');
    $('#replyTextarea').val('');
    // 清除 ActionCache
    cleanActionCache();
    window.imgForUpload_reply = null;
    $('#upImgPreview_reply').hide().find('.img').html('');
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

/**
 * 根据当前配置，初始化文本的基本属性
 */
function _initText($text, config) {
	config = config || tapi.get_config(getUser());
	$text.data('max_text_length', config.max_text_length)
	    .data('support_double_char', config.support_double_char);
}

function doReply(ele, screen_name, tweetId, name) { // @回复
	ActionCache.set('doReply', [null, screen_name, tweetId, name]);
    $('#actionType').val('reply');
    $('#replyTweetId').val(tweetId || '');
    $('#replyUserName').val(name);
    $('#ye_dialog_title').html('@' + screen_name);

    $('#chk_sendOneMore').attr("checked", false).val('').hide();
    $('#txt_sendOneMore').text('').hide();
    $('#chk_sendOneMore2').attr("checked", false).val('').hide();
    $('#txt_sendOneMore2').text('').hide();

    $('#ye_dialog_window').show();
    var $replyText = $('#replyTextarea'), text = $replyText.val();
    if(!text) {
        var tweet = TWEETS[tweetId]
          , user = getUser()
          , at_users = tapi.find_at_users(user, tweet.text);
        if(at_users) {
            for(var i = 0, l = at_users.length; i < l; i++) {
                var at_user = at_users[i];
                if(at_user !== tweet.user.name && at_user !== screen_name
                        && at_user !== user.screen_name && at_user !== user.name) {
                    text += '@' + at_user + ' ';
                }
            }
        }
    }
    $replyText.val('').focus().val(text);
    _initText($replyText);
    countReplyText();
};

/*
    @ele: 触发该事件的元素
    @userName: 当前微博的用户名
    @tweetId: 微博的id
    @rtUserName: 转发微博的用户名
    @reTweetId: 转发的微薄id
*/
function doRepost(ele, userName, tweetId, rtUserName, reTweetId){ // 转发
	ActionCache.set('doRepost', [null, userName, tweetId, rtUserName, reTweetId]);
	var user = getUser()
	  , config = tapi.get_config(user);
    $('#actionType').val('repost');
    $('#repostTweetId').val(tweetId);
    $('#replyUserName').val(userName);
    $('#ye_dialog_title').html(_u.i18n("msg_repost_who").format({username:userName}));
    var support_comment = config.support_comment && user.blogType !== 'tqq';
    if(support_comment) {
    	$('#chk_sendOneMore').attr("checked", false).val(tweetId).show();
        $('#txt_sendOneMore').text(_u.i18n("msg_comment_too").format({username:userName})).show();
    } else { // 不支持repost，则屏蔽
    	$('#chk_sendOneMore').attr("checked", false).val('').hide();
        $('#txt_sendOneMore').text('').hide();
    }
    if(support_comment &&
    		rtUserName && rtUserName != userName && reTweetId) {
        $('#chk_sendOneMore2').attr("checked", false).val(reTweetId).show();
        $('#txt_sendOneMore2').text(_u.i18n("msg_comment_original_too").format({username:rtUserName})).show();
    }else{
        $('#chk_sendOneMore2').attr("checked", false).val('').hide();
        $('#txt_sendOneMore2').text('').hide();
    }

    $('#ye_dialog_window').show();
    var $t = $('#replyTextarea');
    var value = $t.val() || '';
    $t.focus().blur();
    if(!value) {
    	if(reTweetId && TWEETS[tweetId]) {
    	    var rt = TWEETS[tweetId];
            if(user.blogType=='tqq') {
                userName = rt.user.name || userName;
            }
            value = config.repost_delimiter + '@' + userName + ':' + rt.text;
        } else {
        	value = _u.i18n("comm_repost_default");
        }
    }
	// 光标在前
	$t.val(value).focus();
    if(value === _u.i18n("comm_repost_default")){$t.select();}
    _initText($t, config);
    countReplyText();
};

/* 评论
 * cid:回复的评论ID
 */
function doComment(ele, userName, userId, tweetId, 
		replyUserName, replyUserId, cid) {
	if(typeof ele === 'string') {
		ele = document.getElementById(ele);
	}
	ActionCache.set('doComment', [$(ele).attr('id'), userName, userId, tweetId, replyUserName, replyUserId, cid]);
	$('#actionType').val('comment');
    $('#commentTweetId').val(tweetId);
    $('#commentUserId').val(userId);
    $('#replyUserName').val(replyUserName);
    $('#replyUserId').val(replyUserId || '');
    $('#commentCommentId').val(cid||'');
    $('#ye_dialog_title').html(_u.i18n("msg_comment_who").format({username:userName}));
    $('#ye_dialog_window').show();
    var _txt = $('#replyTextarea').val();
    if(!_txt) {
    	_txt = replyUserName ? (_u.i18n("msg_comment_reply_default").format({username:replyUserName})) : '';
    }
    var user = getUser();
	var config = tapi.get_config(user);
	if(config.support_comment_repost) { // 支持repost才显示
		$('#chk_sendOneMore').attr("checked", false).val(tweetId).show();
    	$('#txt_sendOneMore').text(_u.i18n("msg_repost_too")).show();
	} else {
		$('#chk_sendOneMore').val('').hide();
    	$('#txt_sendOneMore').text('').hide();
	}
    $('#chk_sendOneMore2').val('').hide();
    $('#txt_sendOneMore2').text('').hide();
    
    var $replyText = $('#replyTextarea');
    $replyText.val('').focus().val(_txt);
    _initText($replyText, config);
    countReplyText();
};

function doNewMessage(ele, userName, toUserId){//悄悄话
	ActionCache.set('doNewMessage', [null, userName, toUserId]);
    $('#actionType').val('newmsg');
    $('#whisperToUserId').val(toUserId);
    $('#replyUserName').val(userName);
    $('#ye_dialog_title').html(_u.i18n("msg_direct_message_who").format({username:userName}));

    $('#chk_sendOneMore').attr("checked", false).val('').hide();
    $('#txt_sendOneMore').text('').hide();
    $('#chk_sendOneMore2').attr("checked", false).val('').hide();
    $('#txt_sendOneMore2').text('').hide();

    $('#ye_dialog_window').show();
    var $replyText = $('#replyTextarea'), text = $replyText.val() || '';
    $replyText.val('').focus().val(text);
    _initText($replyText);
    countReplyText();
};

function doRT(ele, is_rt, is_rt_rt) {
	var $li = $(ele).closest('li');
    var did = $li.attr('did');
    data = TWEETS[did];
    var t = $("#txtContent");
    t.val('').blur();
    // 如果有链接还原，则记录下来
    var $link = $li.find('a.link');
    if($link.attr('rhref')) {
    	t.data('source_url', $link.attr('rhref')).data('short_url', $link.html());
    }
    if(is_rt) {
    	data = data.retweeted_status;
    } else if(is_rt_rt) {
    	data = data.retweeted_status.retweeted_status;
    }
    var _msg_user = data.user;
    var config = tapi.get_config(getUser());
    var repost_pre = config.repost_pre;
    var need_processMsg = config.need_processMsg;
    var val = data.text;
    if(!need_processMsg && val) {
        // 将链接提取出来
        var $links = $('<div>' + val + '</div>').find('a');
        val = htmlToText(val);
        $links.each(function() {
            var $a = $(this);
            var url = $a.attr('href'), a_text = $a.text();
            if(url && a_text) {
                val = val.replace(a_text, a_text + ' ' + url + ' ');
            }
        });
    }
    var original_pic = data.original_pic, sourcelink = null, need_sourcelink = null;
    if(config.rt_need_source && data.retweeted_status) {
    	if(data.retweeted_status.original_pic) {
    		original_pic = data.retweeted_status.original_pic;
    	}
    	var rt_name = config.rt_at_name ? 
    		(data.retweeted_status.user.name || data.retweeted_status.user.id) 
    		: data.retweeted_status.user.screen_name;
    	val += '//@' + rt_name + ':' + (need_processMsg ? data.retweeted_status.text 
    			: htmlToText(data.retweeted_status.text));
    	if(data.retweeted_status.retweeted_status) {
    		if(data.retweeted_status.retweeted_status.original_pic) {
        		original_pic = data.retweeted_status.retweeted_status.original_pic;
        	}
    		var rtrt_name = config.rt_at_name ? 
    	    		(data.retweeted_status.retweeted_status.user.name || data.retweeted_status.retweeted_status.user.id) 
    	    		: data.retweeted_status.retweeted_status.user.screen_name;
        	val += '//@' + rtrt_name + ':' + (need_processMsg ? 
        		data.retweeted_status.retweeted_status.text 
        		: htmlToText(data.retweeted_status.retweeted_status.text));
        }
    }
    if(!original_pic) {
    	// 尝试从链接中获取图片
        var $preview = $li.find('a.image_preview');
		original_pic = $preview.attr('original');
		sourcelink = $preview.attr('sourcelink');
		need_sourcelink = $preview.attr('need_sourcelink');
    }
    
//    if(!original_pic) {
//    	// 没图片，则打开文本框
//        window.imgForUpload = null;
//    	showMsgInput();
//    }
    window.imgForUpload = null;
    showMsgInput();
    
    var name = config.rt_at_name ? (_msg_user.name || _msg_user.id) : _msg_user.screen_name;
    val = 'RT @' + name + ' ' + val;
//    val = repost_pre + ' ' + '@' + name + ' ' + val;
    if(data.crosspostSource) {
    	var longurl = data.crosspostSource;
    	val += ' ' + longurl;
    }
    t.blur().val(val).focus(); //光标在头部
    if(original_pic) {
        if(original_pic.indexOf('126.fm') >= 0) {
            // 163的图片需要先还原
            ShortenUrl.expand(original_pic, function(data) {
                var longurl = data.url || data;
                if(longurl) {
                    original_pic = longurl.replace('#3', '');
                    var file = window.imgForUpload = getImageBlob(original_pic);
                    _init_image_preview(original_pic, file.size, 'upImgPreview', 'btnUploadPic');
                }
            });
        } else {
            var file = window.imgForUpload = getImageBlob(original_pic);
            _init_image_preview(original_pic, file.size, 'upImgPreview', 'btnUploadPic');
        }
    }
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
    var t = getCurrentTab().replace('#','').replace(/_timeline$/i,'');
    tapi.destroy({id:tweetId, user:user}, function(data, textStatus){
        if(textStatus != 'error' && data && !data.error){
        	$(ele).closest('li').remove();
            _delCache(tweetId, t, user.uniqueKey);
            showMsg(_u.i18n("msg_delete_success"));
        }else{
            showMsg(_u.i18n("msg_delete_fail"));
        }
    });
};
function doDelComment(ele, screen_name, tweetId){//删除评论
    if(!tweetId){return;}
    showLoading();
    var user = getUser();
    var t = getCurrentTab().replace('#','').replace(/_timeline$/i,'');
    tapi.comment_destroy({id:tweetId, user:user}, function(data, textStatus){
        if(textStatus != 'error' && data && !data.error){
        	$(ele).closest('li').remove();
            _delCache(tweetId, t, user.uniqueKey);
            showMsg(_u.i18n("msg_delete_success"));
        }else{
            showMsg(_u.i18n("msg_delete_fail"));
        }
    });
};
function delDirectMsg(ele, screen_name, tweetId){//删除私信
    if(!tweetId){return;}
    showLoading();
    var user = getUser();
    var t = getCurrentTab().replace('#','').replace(/_timeline$/i,'');
    tapi.destroy_msg({id:tweetId, user:user}, function(data, textStatus){
        if(textStatus != 'error' && data && !data.error){
        	$(ele).closest('li').remove();
            _delCache(tweetId, t, user.uniqueKey);
            showMsg(_u.i18n("msg_delete_success"));
        }else{
            showMsg(_u.i18n("msg_delete_fail"));
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
    var t = getCurrentTab().replace('#','').replace(/_timeline$/i,'');
    tapi.favorites_create({id:tweetId, user:user}, function(data, textStatus){
        if(textStatus != 'error' && data && !data.error){
            _a.after(_aHtml.replace('addFavorites','delFavorites')
                            .replace('favorites_2.gif','favorites.gif')
                            .replace(_u.i18n("btn_add_favorites_title"), _u.i18n("btn_del_favorites_title")));
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
            showMsg(_u.i18n("msg_add_favorites_success"));
        }else{
            showMsg(_u.i18n("msg_add_favorites_fail"));
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
    var t = getCurrentTab().replace('#','').replace(/_timeline$/i,'');
    tapi.favorites_destroy({id:tweetId, user:user}, function(data, textStatus){
        if(textStatus != 'error' && data && !data.error){
            _a.after(_aHtml.replace('delFavorites','addFavorites')
                            .replace('favorites.gif','favorites_2.gif')
                            .replace(_u.i18n("btn_del_favorites_title"), _u.i18n("btn_add_favorites_title")));
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
            showMsg(_u.i18n("msg_del_favorites_success"));
        }else{
            showMsg(_u.i18n("msg_del_favorites_fail"));
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
    var t = getCurrentTab().replace('#','').replace(/_timeline$/i,'');
    var title = _a.attr('title');
    tapi.retweet({id:tweetId, user:user}, function(data, textStatus){
        if(textStatus != 'error' && data && !data.error){
            _a.removeAttr('onclick').attr('title', _u.i18n("comm_success")).show();
			if(_a.hasClass('ort')) {
				_a.addClass('orted');
			}
			if(_a.html()) {
				_a.html(_u.i18n("comm_has") + _a.html());
			}
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

            showMsg(title + _u.i18n("comm_success"));
        }else{
            showMsg(title + _u.i18n("comm_fail"));
            _a.show();
        }
    });
};
//<<<<<<<<<<<<<=====

//查看图片
function showFacebox(ele){
    var _t = $(ele);
    if(!_t.find('.img_loading').length){
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
        showMsg(_u.i18n("msg_loading_map"));
    }
};

// 获取弹出窗口的基本参数
function _get_open_window_args(width, height) {
	width = width || 520;
	height = height || 600;
	var left = (window.screen.availWidth - width) / 2;
	var win_args = {
    	width: width, height: height, left: left, top: 30, 
    	toolbar: 'no', menubar: 'no', location: 'no', resizable: 'no',
    	scrollbars: 'yes', status: 'yes'
    };
    var args_str = '';
    for(var k in win_args) {
    	args_str += k + '=' + win_args[k] + ',';
    }
    return args_str.substring(0, args_str.length - 1);
}

function _getWindowId(callback) {
	var params = decodeForm(window.location.search);
	if(params.windowId) {
		callback(params.windowId);
	} else {
		chrome.tabs.getSelected(null, function(tab) {
			callback(tab.windowId);
		});
	}
}

//打开上传图片窗口
function openUploadImage(tabId, image_url, image_source_link, image_need_source_link){
    initOnUnload();
    var args_str = _get_open_window_args();
    tabId = tabId || '';
    var url = 'upimage.html?tabId=' + tabId;
    if(image_url) {
    	url += '&image_url=' + image_url;
    }
    if(image_source_link) {
        // 图片原始缩短url，如果有，则替换文本数据
        url += '&image_source_link=' + image_source_link;
    }
    if(image_need_source_link) {
        url += '&image_need_source_link=' + image_need_source_link;
    }
    window.open(url, '_blank', args_str);
};

// 打开长微博窗口
function openLongText() {
	_getWindowId(function(windowId) {
		initOnUnload();
	    var args_str = _get_open_window_args(700, 650);
	    var url = 'longtext.html?windowId=' + windowId;
	    window.open(url, '_blank', args_str);
	});
};

// 在新窗口打开popup页
function openPopupInNewWin(windowId) {
	_getWindowId(function(windowId) {
		initOnUnload();
		var settings = Settings.get();
		var args_str = _get_open_window_args(settings.popupWidth, settings.popupHeight);
	    window.theViewName = 'not_popup';
	    var url = 'popup.html?is_new_win=true';
	    if(windowId) {
	    	url += '&windowId=' + windowId;
	    }
	    getBackgroundView().new_win_popup.window = window.open(url, 'FaWave', args_str);
	});
}

//新消息提示模式：提示模式、免打扰模式
function changeAlertMode(to_mode){
    var btn = $("#btnAlertMode");
    if(!to_mode){
        var mode = btn.attr('mode');
        to_mode = (mode == 'alert') ? 'dnd' : 'alert';
    }
    setAlertMode(to_mode);
    var tip = (to_mode=='alert') ? _u.i18n("btn_alert_mode_title") : _u.i18n("btn_dnd_mode_title");
    btn.attr('mode', to_mode).attr('title', tip).find('img').attr('src', 'images/' + to_mode + '_mode.png');
    setUnreadTimelineCount(0, 'friends_timeline');
};

//新消息是否自动插入：自动插入、仅提示新消息数
function changeAutoInsertMode(to_mode){
    var btn = $("#btnAutoInsert");
    if(!to_mode){
        var mode = btn.attr('mode');
        to_mode = mode === 'notautoinsert' ? 'autoinsert' : 'notautoinsert';
    }
    setAutoInsertMode(to_mode);
    var tip = to_mode === 'notautoinsert' ? _u.i18n("btn_not_auto_insert_title") : _u.i18n("btn_auto_insert_title");
    btn.attr('mode', to_mode).attr('title', tip).find('img').attr('src', 'images/' + to_mode + '.png');
};

//表情添加
fawave.face = {
    show: function(ele, target_id) {
        var f = $("#face_box");
        if(f.css('display') !== 'none' && $("#face_box_target_id").val() === target_id) {
            f.hide();
            return;
        }
    	// 初始化表情
    	if($('#face_box .faceItemPicbg .face_icons').length === 0) {
    	    var userList = getUserList('send');
    	    var blogTypes = {"yanwenzi": 1};
    	    for(var i = 0, len = userList.length; i < len; i++) {
    	        blogTypes[userList[i].blogType] = 1;
    	    }
    		// FACE_TYPES   [typename, faces, url_pre, tpl, type_title]
    		for(var i = 0, len = FACE_TYPES.length; i < len; i++) {
    			var face_type = FACE_TYPES[i];
    			if(!blogTypes[face_type[0]]) {
    			    // 未绑定的微博类型，无需显示表情
    			    continue;
    			}
    			var $face_tab = $('<span face_type="' + face_type[0] + '">' + face_type[4] + '</span>');
    			$face_tab.click(function() {
    			    var $this = $(this);
    				if(!$this.hasClass('active')) {
    					$('.face_tab span').removeClass('active');
        				$('#face_box .faceItemPicbg .face_icons').hide();
        				$('#face_box .faceItemPicbg .' + $this.attr('face_type') + '_faces').show();
        				$this.addClass('active');
    				}
    			});
    			var $face_icons = $('<div style="display:none;" class="face_icons ' + face_type[0] + '_faces"></div>');
    			$('#face_box .face_tab p').append($face_tab);
        		$('#face_box .faceItemPicbg').append($face_icons);
        		var exists = {};
        		$('#face_icons li a').each(function() {
        			exists[$(this).attr('title')] = true;
        		});
        		var face_tpl = face_type[3];
        		var faces = face_type[1];
        		if(face_tpl) {
        		    var tpl = '<li><a href="javascript:void(0)" onclick="fawave.face.insert(this)"' 
                        + ' value="' + face_tpl + '" title="{{name}}"><img src="{{url}}" alt="{{name}}"></a></li>';
                    var url_pre = face_type[2];
                    for(var name in faces) {
                        if(exists[name]) continue;
                        $face_icons.append(tpl.format({'name': name, 'url': url_pre + faces[name]}));
                        exists[name] = true;
                    }
        		} else {
        		    var tpl = '<li class="yanwenzi"><a href="javascript:void(0)" onclick="fawave.face.insert(this)"' 
                        + ' value="{{name}}" title="{{title}}">{{name}}</a></li>';
        		    for(var name in faces) {
        		        $face_icons.append(tpl.format({'name': name, 'title': faces[name]}));
        		    }
        		}
    		}
    		var current_blogtype = getUser().blogType;
    		var $selected = $("#accountsForSend li.sel");
    		if($selected.length > 1) {
    		    current_blogtype = 'yanwenzi';
    		} else if($selected.length === 1) {
    		    current_blogtype = $selected.attr('blogType');
    		}
    		var $face_type_tab = $('#face_box .face_tab span[face_type="' + current_blogtype + '"]');
    		if($face_type_tab.length === 0) {
    		    $face_type_tab = $('#face_box .face_tab span[face_type="yanwenzi"]');
    		}
    		$face_type_tab.click();
    	}
    	$("#face_box_target_id").val(target_id);
        var offset = $(ele).offset(), left = offset.left - 40, arrow_left = 40;
        if($('#replyTextarea').length > 0 && !$('#replyTextarea').is(':hidden')) {
            left = $('#ye_dialog_window').position().left;
            arrow_left = 120;
        }
        f.css({top: offset.top+20, left: left}).show();
        f.find('.layerArrow').css({left: arrow_left});
    },
    hide: function() {
        $("#face_box").hide();
        $("#face_box_target_id").val('');
    },
    insert: function(ele) {
        var $target_textbox = $("#" + $("#face_box_target_id").val());
        if($target_textbox.length === 1) {
            var tb = $target_textbox[0], str = $(ele).attr('value');
            var newstart = tb.selectionStart+str.length;
            tb.value=tb.value.substr(0, tb.selectionStart) + str + tb.value.substring(tb.selectionEnd);
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
        this.c_t = getCurrentTab();
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
            _t.status.t++; 
            _t.T = setTimeout(_t.run, 10);
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
	tapi.translate(getUser(), $ele.text(), target, function(translatedText) {
		if(translatedText) {
			$ele.after('<hr /><div class="tweet_text_old">' + translatedText + '</div>');
		}
	});
};

// instapaper / read it later
function read_later(ele, service_type) {
	service_type = service_type || 'instapaper';
	var $button = $(ele);
	$button.hide();
	var $ele = $(ele).parents('.userName').next();
	var $datelink = $ele.nextAll('.msgInfo:first').find('a:first');
	if(!$ele.hasClass('tweet_text')) {
		$ele = $ele.find('.tweet_text');
	}
	var $link = $ele.find('a.link:first');
	// 没有链接，则找图片 img.thumbnail_pic attr:original
	if($link.length == 0) {
		$link = $ele.next('div').find('a.thumbnail_pic:first');
	}
	if($link.length == 0) {
		_showMsg("No URL", true);
	} else {
		var url = $link.attr('original') || $link.attr('rhref') || $link.attr('href');
		var title = $link.attr('flash_title');
		var selection = $ele.text();
		var data = {url: url, selection: selection};
		if(title) {
			data.title = title;
		}
		var user = null, service = null, settings = Settings.get();
		if(service_type === 'instapaper') {
			user = settings.instapaper_user;
			service = Instapaper;
			data.selection += ' ' + $datelink.attr('href');
		} else {
			user = settings.readitlater_user;
			service = ReadItLater;
			if(!data.title) {
				data.title = data.selection;
			}
			delete data.selection;
		}
		service.add(user, data, function(success, error, xhr){
			if(success) {
				_showMsg(_u.i18n("msg_save_success"), true);
			} else {
				_showMsg('Read later fail.', true);
				$button.show();
			}
		});
	}
};

// AD
function adShow(){
    var ad = getBackgroundView().ADs.getNext();
    if(ad){
        $("#topAd").html('<a href="{{url}}" target="_blank" title="{{title}}">{{title}}</a>'.format(ad));
    }
};

var __action_names = ['doComment', 'doRepost', 'doNewMessage', 'doReply', 'showMsgInput'];

function restoreActionCache() {
    __action_names.forEach(function(action){
    	var action_args = ActionCache.get(action);
        if(action_args) {
            if(action === 'showMsgInput') {
             // 延时一小段时间触发
                setTimeout(function() {
                    window[action].apply(this, action_args);
                }, 400);
            } else {
                window[action].apply(this, action_args);
            }
        }
	});
};

function cleanActionCache() {
	for(var i = 0, len = __action_names.length; i < len; i++) {
		ActionCache.set(__action_names[i], null);
	}
};

// 查看黑名单
function showblocking(read_more) {
    var timeline_type = 'user_timeline';
    hideReadMore(timeline_type);
    var $tab = $("#tl_tabs .tab-user_timeline");
    $tab.attr('statusType', 'blocking');
    if(!read_more) {
        var $ul = $("#" + timeline_type + "_timeline ul.list");
        $ul.find(".tweetItem").remove();
        $ul.find('.fans').remove();
        $tab.data('page', null);
    }
    var c_user = getUser();
    var page = ($tab.data('page') || 0) + 1;
    getBackgroundView().BlockingUser.list(c_user, page, PAGE_SIZE, function(users) {
        hideLoading();
        hideReadMoreLoading(timeline_type);
        // 如果用户已经切换，则不处理
        var now_user = getUser();
        if(now_user.uniqueKey != c_user.uniqueKey) {
            return;
        }
        users = users.items || users;
        if(users.length > 0){
            for(var i = 0, l = users.length; i < l; i++) {
                users[i].blocking = true;
            }
            users = addPageMsgs(users, timeline_type, true, 'user');
            // 保存数据，用于翻页
            $tab.data('page', page);
        }
        if(users.length >= PAGE_SIZE / 2) {
            showReadMore(timeline_type);
        } else {
            hideReadMore(timeline_type, true); //没有分页了
        }
        checkShowGototop();
    });
    return false;
};

function create_blocking(ele, user_id) {
    var $ele = $(ele);
    $ele.hide();
    getBackgroundView().BlockingUser.create(user_id, function(data) {
        if(data === true || (data && !data.error)) {
            showMsg(_u.i18n("create_blocking_success"));
            $ele.prev('.follow').show();
        } else {
            var msg = (data && data.error) || _u.i18n("create_blocking_fail");
            showMsg(msg);
            $ele.show();
        }
    });
};

function destroy_blocking(ele, user_id) {
    var $ele = $(ele);
    $ele.hide();
    getBackgroundView().BlockingUser.destroy(user_id, function(data) {
        if(data === true || (data && !data.error)) {
            showMsg(_u.i18n("destroy_blocking_success"));
            $ele.next('.follow').show();
        } else {
            var msg = (data && data.error) || _u.i18n("destroy_blocking_fail");
            showMsg(msg);
            $ele.show();
        }
    });
};