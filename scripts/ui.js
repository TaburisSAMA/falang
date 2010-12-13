// @author qleelulu@gmail.com

function buildStatusHtml(statuses, t, c_user){
	var htmls = [];
    if(!statuses || statuses.length == 0) { 
    	return htmls; 
    }
    if(!c_user){
        c_user = getUser();
    }
    var TEMPLATE_RT_RT = null;
    var theme = Settings.get().theme;
    var rt_replace_pre = null, rt_rt_replace_pre = null;
    if(theme=='pip_io') {
    	rt_replace_pre = '<!-- {{retweeted_status_out}} -->';
    	rt_rt_replace_pre = '<!-- {{retweeted_retweeted_status_out}} -->';
    } else {
    	rt_replace_pre = '<!-- {{retweeted_status_in}} -->';
    	rt_rt_replace_pre = '<!-- {{retweeted_retweeted_status_in}} -->';
    }
    
    var config = tapi.get_config(c_user);
 	var support_comment = config.support_comment;
 	var support_favorites = config.support_favorites;
 	var BUTTON_TPLS = {
        showMapBtn: '<a class="geobtn" href="javascript:" onclick="showGeoMap(\'{{user.profile_image_url}}\', {{geo.coordinates[0]}}, {{geo.coordinates[1]}});" title="点击查看地理位置信息"><img src="images/mapspin2a.png"/></a>',
        delTweetBtn: '<a class="deltweet" href="javascript:void(0);" onclick="doDelTweet(\'{{id}}\', this);" title="点击删除微博">删</a>',
        replyBtn: '<a class="replytweet" href="javascript:void(0);" onclick="javascript:doReply(this,\'{{user.screen_name}}\',\'{{id}}\');" title="进行@回复">@</a>',
        oretweetBtn: '<a class="oretweet ort" href="javascript:void(0);" onclick="javascript:sendOretweet(this,\'{{user.screen_name}}\',\'{{id}}\');" title="Twitter锐推"></a>',
        retweetBtn: '<a class="rtweet" href="javascript:void(0);" onclick="doRT(this);" title="Twitter式转发">RT</a>',
        repostBtn: '<a class="reposttweet" href="javascript:void(0);" onclick="javascript:doRepost(this,\'{{user.screen_name}}\',\'{{id}}\',\'{{retweeted_status_screen_name}}\',\'{{retweeted_status_id}}\');" title="转发这条微博">转</a>',
        repostCounts: '<span class="repostCounts">(-)</span>',
        commentBtn: '<a class="commenttweet" href="javascript:void(0);" onclick="javascript:doComment(this,\'{{user.screen_name}}\', \'{{user.id}}\', \'{{id}}\');" title="点击添加评论">评</a>',
        commentCounts: '<span class="commentCounts">({{comments_count}})</span>',
        delCommentBtn: '<a class="delcommenttweet" href="javascript:void(0);" onclick="javascript:doDelComment(this,\'{{user.screen_name}}\',\'{{id}}\');" title="点击删除评论">删</a>',
        new_msgBtn: '<a class="newMessage" href="javascript:void(0);" onclick="doNewMessage(this,\'{{user.screen_name}}\',\'{{user.id}}\');" title="发送私信">私</a>',
        delDirectMsgBtn: '<a class="newMessage" href="javascript:void(0);" onclick="delDirectMsg(this,\'{{user.screen_name}}\',\'{{id}}\');" title="点击删除私信">删</a>',
        addFavoritesMsgBtn: '<a class="newMessage" href="javascript:void(0);" onclick="addFavorites(this,\'{{user.screen_name}}\',\'{{id}}\');" title="点击收藏"><img width="11px" src="/images/favorites_2.gif"/></a>',
        delFavoritesMsgBtn: '<a class="newMessage" href="javascript:void(0);" onclick="delFavorites(this,\'{{user.screen_name}}\',\'{{id}}\');" title="点击取消收藏"><img width="11px" src="/images/favorites.gif"/></a>',
        
        // rt
        rtShowMapBtn: '<a class="geobtn" href="javascript:" onclick="showGeoMap(\'{{retweeted_status.user.profile_image_url}}\', {{retweeted_status.geo.coordinates[0]}}, {{retweeted_status.geo.coordinates[1]}});" title="点击查看地理位置信息"><img src="images/mapspin2a.png"/></a>',
        rtRepostBtn: '<a class="reposttweet" href="javascript:void(0);" onclick="javascript:doRepost(this,\'{{retweeted_status.user.screen_name}}\',\'{{retweeted_status.id}}\');" title="转发这条微博">转</a>',
        rtRetweetBtn: '<a class="rtweet" href="javascript:void(0);" onclick="doRT(this, true);" title="Twitter式转发">RT</a>',
        rtOretweetBtn: '<a class="oretweet ort" href="javascript:void(0);" onclick="javascript:sendOretweet(this,\'{{retweeted_status.user.screen_name}}\',\'{{retweeted_status.id}}\');" title="Twitter锐推"></a>',
        rtCommentBtn: '<a class="commenttweet" href="javascript:void(0);" onclick="javascript:doComment(this,\'{{retweeted_status.user.screen_name}}\', \'{{retweeted_status.user.id}}\', \'{{retweeted_status.id}}\');" title="点击添加评论">评</a>',
        rtCommentCounts: '<span class="commentCounts">(-)</span>',
        rtReplyBtn: '<a class="replytweet" href="javascript:void(0);" onclick="javascript:doReply(this,\'{{retweeted_status.user.screen_name}}\',\'{{retweeted_status.id}}\');" title="进行@回复">@</a>',
        rtAddFavoritesMsgBtn: '<a class="newMessage" href="javascript:void(0);" onclick="addFavorites(this,\'{{retweeted_status.user.screen_name}}\',\'{{retweeted_status.id}}\');" title="点击收藏"><img width="11px" src="/images/favorites_2.gif"/></a>',
        rtRepostCounts: '<span class="repostCounts">(-)</span>',
        
        // rt rt
        rtrtShowMapBtn: '<a class="geobtn" href="javascript:" onclick="showGeoMap(\'{{retweeted_status.retweeted_status.user.profile_image_url}}\', {{retweeted_status.retweeted_status.geo.coordinates[0]}}, {{retweeted_status.retweeted_status.geo.coordinates[1]}});" title="点击查看地理位置信息"><img src="images/mapspin2a.png"/></a>',
        rtrtOretweetBtn: '',
        rtrtRetweetBtn: '<a class="rtweet" href="javascript:void(0);" onclick="doRT(this, false, true);" title="Twitter式转发">RT</a>',
        rtrtRepostBtn: '<a class="reposttweet" href="javascript:void(0);" onclick="javascript:doRepost(this,\'{{retweeted_status.retweeted_status.user.screen_name}}\',\'{{retweeted_status.retweeted_status.id}}\');" title="转发这条微博">转</a>',
        rtrtCommentBtn: '<a class="commenttweet" href="javascript:void(0);" onclick="javascript:doComment(this,\'{{retweeted_status.retweeted_status.user.screen_name}}\', \'{{retweeted_status.retweeted_status.user.id}}\', ,\'{{retweeted_status.retweeted_status.id}}\');" title="点击添加评论">评</a>',
        rtrtCommentCounts: '<span class="commentCounts">(-)</span>',
        rtrtReplyBtn: '<a class="replytweet" href="javascript:void(0);" onclick="javascript:doReply(this,\'{{retweeted_status.retweeted_status.user.screen_name}}\',\'{{retweeted_status.retweeted_status.id}}\');" title="进行@回复">@</a>',
        rtrtAddFavoritesMsgBtn: '<a class="newMessage" href="javascript:void(0);" onclick="addFavorites(this,\'{{retweeted_status.retweeted_status.user.screen_name}}\',\'{{retweeted_status.retweeted_status.id}}\');" title="点击收藏"><img width="11px" src="/images/favorites_2.gif"/></a>',
        rtrtRepostCounts: '<span class="repostCounts">(-)</span>'
    };
 	
 	// 不支持收藏
    if(!support_favorites) {
    	BUTTON_TPLS.addFavoritesMsgBtn = BUTTON_TPLS.delFavoritesMsgBtn = '';
    }
    // 不支持repost(转发)
    if(!config.support_repost) {
    	BUTTON_TPLS.repostCounts = BUTTON_TPLS.rtRepostCounts = BUTTON_TPLS.repostBtn = BUTTON_TPLS.rtRepostBtn = '';
    }
    if(!config.support_counts) {
    	BUTTON_TPLS.repostCounts = BUTTON_TPLS.rtRepostCounts = '';
    }
    // 不支持删除私信
    if(!config.support_destroy_msg) {
    	BUTTON_TPLS.delDirectMsgBtn = '';
    }
	// 不支持私信
    if(!config.support_direct_messages) {
    	BUTTON_TPLS.delDirectMsgBtn = '';
    	BUTTON_TPLS.new_msgBtn = '';
    }
    // 不支持评论
    if(!support_comment) {
    	BUTTON_TPLS.commentBtn = BUTTON_TPLS.commentCounts = BUTTON_TPLS.rtCommentCounts = BUTTON_TPLS.rtCommentBtn = '';
    }
    
    switch(t){
	    case 'friends_timeline':
	    case 'favorites':
	    case 'mentions':
	    case 'user_timeline':
	    	BUTTON_TPLS.delDirectMsgBtn = BUTTON_TPLS.delCommentBtn = '';
	        break;
	    case 'comments_timeline':
	    	BUTTON_TPLS.repostBtn = BUTTON_TPLS.repostCounts = BUTTON_TPLS.commentCounts = BUTTON_TPLS.delTweetBtn = 
	    		BUTTON_TPLS.delDirectMsgBtn = BUTTON_TPLS.addFavoritesMsgBtn = BUTTON_TPLS.delFavoritesMsgBtn = '';
	    	BUTTON_TPLS.commentBtn = '<a class="commenttweet" href="javascript:void(0);" onclick="javascript:doComment(this,\'{{status.user.screen_name}}\', \'{{status.user.id}}\', \'{{status.id}}\',\'{{user.screen_name}}\', \'{{user.id}}\',\'{{id}}\');" title="点击回复评论">回复</a>';
	        break;
	    case 'comments_by_me':
	    	BUTTON_TPLS.delDirectMsgBtn = BUTTON_TPLS.addFavoritesMsgBtn = BUTTON_TPLS.delFavoritesMsgBtn = '';
	        break;
	    case 'direct_messages':
	    	BUTTON_TPLS.repostBtn = BUTTON_TPLS.oretweetBtn = BUTTON_TPLS.repostCounts = BUTTON_TPLS.commentBtn = BUTTON_TPLS.commentCounts = 
	    		BUTTON_TPLS.delCommentBtn = BUTTON_TPLS.delTweetBtn = BUTTON_TPLS.addFavoritesMsgBtn = BUTTON_TPLS.delFavoritesMsgBtn = '';
	    	BUTTON_TPLS.new_msgBtn = BUTTON_TPLS.new_msgBtn.replace('>私<', '>回复<');
	        break;
	    default:
	        break;
	}
    if(c_user.blogType != 'twitter') {
    	BUTTON_TPLS.rtOretweetBtn = BUTTON_TPLS.oretweetBtn = '';
    }
	
	switch(c_user.blogType){
	    case 'digu':
	    	BUTTON_TPLS.replyBtn = BUTTON_TPLS.replyBtn.replace('>@<', '>回复<');
	        break;
	    case 'renjian':
	    	BUTTON_TPLS.repostCounts = BUTTON_TPLS.rtRepostCounts = BUTTON_TPLS.rtrtRepostCounts = '';
	        break;
        default:
            break;
	}
 	
    for(var i in statuses) {
    	var status = statuses[i];
    	status.user = status.user || status.sender;
    	/*
         * status.retweeted_status 转发
         * status.status 评论
         */
    	status.retweeted_status = status.retweeted_status || status.status;
    	
    	var comments_count = '-';
     	if(status.comments_count !== undefined) {
     		if(status.comments_count == 0) {
     			comments_count = 0;
     		} else {
     			comments_count = '<a href="javascript:void(0);" title="点击查看评论" onclick="showComments(this, \'{{id}}\');">{{comments_count}}</a>'.format(status);
     		}
     	}
     	status.comments_count = comments_count;
     	if(status.retweeted_status && status.retweeted_status.user) {
     		status.retweeted_status_screen_name = status.retweeted_status.user.screen_name;
     		status.retweeted_status_id = status.retweeted_status.id;
     	} else {
     		status.retweeted_status_id = status.retweeted_status_screen_name = '';
     	}
     	var buttons = {};
     	for(var key in BUTTON_TPLS) {
     		var tpl = BUTTON_TPLS[key];
     		if(key.substring(0, 2) == 'rt') {
     			if(!status.retweeted_status) {
     				tpl = '';
     			} else if(key.substring(0, 4) == 'rtrt' && !status.retweeted_status.retweeted_status) {
     				tpl = '';
     			}
     		}
     		if(tpl && key.endswith('MapBtn') && (!status.geo || !status.geo.coordinates)) {
     			tpl = '';
 	        }
     		if(tpl) {
     			tpl = tpl.format(status);
     		}
     		buttons[key] = tpl;
     	}
     	if(status.favorited){
     		buttons.addFavoritesMsgBtn = '';
        } else {
        	buttons.delFavoritesMsgBtn = '';
        }
     	if(c_user.id == status.user.id) {
            status.myTweet = true;
            buttons.new_msgBtn = '';
            buttons.rtOretweetBtn = buttons.oretweetBtn = '';
        } else {
        	buttons.delTweetBtn = '';
        }
     	// 不支持评论
        if(status.hide_comments === true) {
        	buttons.commentBtn = buttons.commentCounts = buttons.rtCommentCounts = buttons.rtCommentBtn = '';
        }
        if(status.retweeted_status && status.retweeted_status.retweeted) {
        	buttons.rtOretweetBtn = '<a class="oretweet ort orted" href="javascript:void(0);" title="已成功锐推"></a>';
        }
        if(status.retweeted) {
        	buttons.oretweetBtn = '<a class="oretweet ort orted" href="javascript:void(0);" title="已成功锐推"></a>';
        }
        
        var context = {
            provinces: provinces,
            tType: t,
            getUserCountsInfo: getUserCountsInfo,
            buildTipboxUserInfo: buildTipboxUserInfo,
            processMsg: tapi.processMsg,
            user: status.user,
            account: c_user,
            tweet: status,
            support_follow: c_user.blogType != 'douban',
            btn: buttons
        };
        try {
        	var html = Shotenjin.render(TEMPLATE, context);
            var need_rt_rt = status.retweeted_status && status.retweeted_status.retweeted_status;
            var rt_rt_tpl = null;
            if(status.retweeted_status) {
            	html = html.replace(rt_replace_pre, Shotenjin.render(TEMPLATE_RT, context));
            	if(need_rt_rt) {
            		if(!TEMPLATE_RT_RT) {
            			TEMPLATE_RT_RT = TEMPLATE_RT.replace(/tweet\.retweeted_status\./g, 'tweet.retweeted_status.retweeted_status.').replace(/btn\.rt/g, 'btn.rtrt');
            		}
            		status.retweeted_status.retweeted_status.is_rt = true;
            		html = html.replace(rt_rt_replace_pre, Shotenjin.render(TEMPLATE_RT_RT, context));
                }
            	
            }
            htmls.push(html);
        } catch(err) {
            log(err);
        }
        status.readed = true;
    }
    return htmls;
};

function buildUsersHtml(users, t, c_user){
	var htmls = [];
    if(!users || users.length == 0) { 
    	return htmls; 
    }
    if(!c_user){
        c_user = getUser();
    }
    for(var i in users) {
    	var user = users[i];
        var context = {
            provinces: provinces,
            tType: t,
            getUserCountsInfo: getUserCountsInfo,
            buildTipboxUserInfo: buildTipboxUserInfo,
            processMsg: tapi.processMsg,
            user: user,
            account: c_user,
            support_follow: c_user.blogType != 'douban'
        };
        try {
            htmls.push(Shotenjin.render(TEMPLATE_FANS, context));
        } catch(err) {
            log(err);
        }
    }
    return htmls;
};

//function bildMsgLi(sinaMsg, t, c_user){
//    if(!sinaMsg){ return ''; }
//    try{
//        if(!c_user){
//            c_user = getUser();
//        }
//        var user = sinaMsg.user || sinaMsg.sender;
//        if(t == 'friends' || t == 'followers'){ //粉丝列表
//            user = sinaMsg;
//        }
//        if(c_user.id == user.id){
//            sinaMsg.myTweet = true;
//        }
//     	var config = tapi.get_config(c_user);
//     	var support_comment = config.support_comment;
//     	var support_favorites = config.support_favorites;
//     	var comments_count = '-';
//     	if(sinaMsg.comments_count !== undefined) {
//     		if(sinaMsg.comments_count == 0) {
//     			comments_count = 0;
//     		} else {
//     			comments_count = '<a href="javascript:void(0);" title="点击查看评论" onclick="showComments(this, \'{{id}}\');">{{comments_count}}</a>'.format(sinaMsg);
//     		}
//     	}
//     	var crlBtn = {
//                showMapBtn: '',
//                rtShowMapBtn: '',
//                rtrtShowMapBtn: '',
//
//                delTweetBtn: '<a class="deltweet" href="javascript:void(0);" onclick="doDelTweet(\'' + sinaMsg.id + '\', this);" title="点击删除微博">删</a>',
//                replyBtn: '<a class="replytweet" href="javascript:void(0);" onclick="javascript:doReply(this,\'' + user.screen_name + '\',\'' + sinaMsg.id + '\');" title="进行@回复">@</a>',
//                oretweetBtn: '',
//                retweetBtn: '<a class="rtweet" href="javascript:void(0);" onclick="doRT(this);" title="Twitter式转发">RT</a>',
//                repostBtn: '<a class="reposttweet" href="javascript:void(0);" onclick="javascript:doRepost(this,\'' + user.screen_name + '\',\'' + sinaMsg.id + '\',\'' + (sinaMsg.retweeted_status ? sinaMsg.retweeted_status.user.screen_name : '') + '\',\'' + (sinaMsg.retweeted_status ? sinaMsg.retweeted_status.id : '0') + '\');" title="转发这条微博">转</a>',
//                repostCounts: '<span class="repostCounts">(-)</span>',
//                rtRepostCounts: '<span class="repostCounts">(-)</span>',
//                rtrtRepostCounts: '<span class="repostCounts">(-)</span>',
//                commentBtn: '<a class="commenttweet" href="javascript:void(0);" onclick="javascript:doComment(this,\'' + user.screen_name + '\', \'' + user.id + '\', \'' + sinaMsg.id + '\');" title="点击添加评论">评</a>',
//                commentCounts: '<span class="commentCounts">(' + comments_count + ')</span>',
//                rtCommentCounts: '<span class="commentCounts">(-)</span>',
//                rtrtCommentCounts: '<span class="commentCounts">(-)</span>',
//                delCommentBtn: '<a class="delcommenttweet" href="javascript:void(0);" onclick="javascript:doDelComment(this,\'' + user.screen_name + '\',\'' + sinaMsg.id + '\');" title="点击删除评论">删</a>',
//                new_msgBtn: '<a class="newMessage" href="javascript:void(0);" onclick="doNewMessage(this,\'' + user.screen_name + '\',\'' + user.id + '\');" title="发送私信">私</a>',
//                delDirectMsgBtn: '<a class="newMessage" href="javascript:void(0);" onclick="delDirectMsg(this,\'' + user.screen_name + '\',\'' + sinaMsg.id + '\');" title="点击删除私信">删</a>',
//                addFavoritesMsgBtn: '<a class="newMessage" href="javascript:void(0);" onclick="addFavorites(this,\'' + user.screen_name + '\',\'' + sinaMsg.id + '\');" title="点击收藏"><img width="11px" src="/images/favorites_2.gif"/></a>',
//                delFavoritesMsgBtn: '<a class="newMessage" href="javascript:void(0);" onclick="delFavorites(this,\'' + user.screen_name + '\',\'' + sinaMsg.id + '\');" title="点击取消收藏"><img width="11px" src="/images/favorites.gif"/></a>',
//                rtRepostBtn: '',
//                rtOretweetBtn: '',
//                rtCommentBtn: '',
//                rtReplyBtn: '',
//                rtAddFavoritesMsgBtn: '',
//                // rt rt
//                rtrtOretweetBtn: '',
//                rtrtRepostBtn: '',
//                rtrtCommentBtn: '',
//                rtrtReplyBtn: '',
//                rtrtAddFavoritesMsgBtn: ''
//        };
//
//        var rt_status = sinaMsg.retweeted_status || sinaMsg.status;
//        if(rt_status && rt_status.user){
//            crlBtn.rtRepostBtn = '<a class="reposttweet" href="javascript:void(0);" onclick="javascript:doRepost(this,\'' + rt_status.user.screen_name + '\',\'' + rt_status.id + '\');" title="转发这条微博">转</a>';
//            crlBtn.rtCommentBtn = '<a class="commenttweet" href="javascript:void(0);" onclick="javascript:doComment(this,\'' + rt_status.user.screen_name + '\', \'' + rt_status.user.id + '\', \'' + rt_status.id + '\');" title="点击添加评论">评</a>';
//            crlBtn.rtReplyBtn = '<a class="replytweet" href="javascript:void(0);" onclick="javascript:doReply(this,\'' + rt_status.user.screen_name + '\',\'' + rt_status.id + '\');" title="进行@回复">@</a>';
//            crlBtn.rtAddFavoritesMsgBtn = '<a class="newMessage" href="javascript:void(0);" onclick="addFavorites(this,\'' + rt_status.user.screen_name + '\',\'' + rt_status.id + '\');" title="点击收藏"><img width="11px" src="/images/favorites_2.gif"/></a>';
//            if(rt_status.retweeted_status && rt_status.retweeted_status.user) {
//            	//log(rt_status);
//            	var rtrt_screen_name = rt_status.retweeted_status.user.screen_name;
//            	var rtrt_user_id = rt_status.retweeted_status.user.id;
//            	var rtrt_id = rt_status.retweeted_status.id;
//            	crlBtn.rtrtRepostBtn = '<a class="reposttweet" href="javascript:void(0);" onclick="javascript:doRepost(this,\'' + rtrt_screen_name + '\',\'' + rtrt_id + '\');" title="转发这条微博">转</a>';
//                crlBtn.rtrtCommentBtn = '<a class="commenttweet" href="javascript:void(0);" onclick="javascript:doComment(this,\'' + rtrt_screen_name + '\', \'' + rtrt_user_id + '\', ,\'' + rtrt_id + '\');" title="点击添加评论">评</a>';
//                crlBtn.rtrtReplyBtn = '<a class="replytweet" href="javascript:void(0);" onclick="javascript:doReply(this,\'' + rtrt_screen_name + '\',\'' + rtrt_id + '\');" title="进行@回复">@</a>';
//                crlBtn.rtrtAddFavoritesMsgBtn = '<a class="newMessage" href="javascript:void(0);" onclick="addFavorites(this,\'' + rtrt_screen_name + '\',\'' + rtrt_id + '\');" title="点击收藏"><img width="11px" src="/images/favorites_2.gif"/></a>';
//                
//                //地理位置
//                if(rt_status.retweeted_status.geo && rt_status.retweeted_status.geo.coordinates){
//                    crlBtn.rtrtShowMapBtn = '<a class="geobtn" href="javascript:" onclick="showGeoMap(\'' + rt_status.retweeted_status.user.profile_image_url + '\', ' + rt_status.retweeted_status.geo.coordinates[0] + ', ' + rt_status.retweeted_status.geo.coordinates[1] + ')" title="点击查看地理位置信息"><img src="images/mapspin2a.png"/></a>';
//                }
//            }
//            //地理位置
//            if(rt_status.geo && rt_status.geo.coordinates){
//                crlBtn.rtShowMapBtn = '<a class="geobtn" href="javascript:" onclick="showGeoMap(\'' + rt_status.user.profile_image_url + '\', ' + rt_status.geo.coordinates[0] + ', ' + rt_status.geo.coordinates[1] + ')" title="点击查看地理位置信息"><img src="images/mapspin2a.png"/></a>';
//            }
//        }
//        //地理位置
//        if(sinaMsg.geo && sinaMsg.geo.coordinates){
//            crlBtn.showMapBtn = '<a class="geobtn" href="javascript:" onclick="showGeoMap(\'' + user.profile_image_url + '\', ' + sinaMsg.geo.coordinates[0] + ', ' + sinaMsg.geo.coordinates[1] + ')" title="点击查看地理位置信息"><img src="images/mapspin2a.png"/></a>';
//        }
//        // 不支持评论
//        if(!support_comment || sinaMsg.hide_comments === true) {
//        	crlBtn.commentBtn = crlBtn.commentCounts = crlBtn.rtCommentCounts = crlBtn.rtCommentBtn = '';
//        }
//        // 不支持收藏
//        if(!support_favorites) {
//        	crlBtn.addFavoritesMsgBtn = crlBtn.delFavoritesMsgBtn = '';
//        }
//        // 不支持repost(转发)
//        if(!config.support_repost) {
//        	crlBtn.repostCounts = crlBtn.rtRepostCounts = crlBtn.repostBtn = crlBtn.rtRepostBtn = '';
//        }
//        if(!config.support_counts) {
//        	crlBtn.repostCounts = crlBtn.rtRepostCounts = '';
//        }
//        // 不支持删除私信
//        if(!config.support_destroy_msg) {
//        	crlBtn.delDirectMsgBtn = '';
//        }
//		// 不支持私信
//        if(!config.support_direct_messages) {
//        	crlBtn.delDirectMsgBtn = '';
//        	crlBtn.new_msgBtn = '';
//        }
//
//        switch(t){
//            case 'friends_timeline':
//            case 'favorites':
//                crlBtn.delDirectMsgBtn = crlBtn.delCommentBtn = '';
//                if(c_user.id == user.id){
//                    //crlBtn.repostBtn = '<a>转</a>';
//                    crlBtn.new_msgBtn = '';
//                }else{
//                    crlBtn.delTweetBtn = '';
//                }
//                if(sinaMsg.favorited){
//                    crlBtn.addFavoritesMsgBtn = '';
//                }else{
//                    crlBtn.delFavoritesMsgBtn = '';
//                }
//                break;
//            case 'mentions':
//                crlBtn.delDirectMsgBtn = crlBtn.delCommentBtn = '';
//                if(c_user.id == user.id){
//                    //crlBtn.repostBtn = '<a>转</a>';
//                    crlBtn.new_msgBtn = '';
//                }else{
//                    crlBtn.delTweetBtn = '';
//                }
//                if(sinaMsg.favorited){
//                    crlBtn.addFavoritesMsgBtn = '';
//                }else{
//                    crlBtn.delFavoritesMsgBtn = '';
//                }
//                break;
//            case 'comments_timeline':
//                crlBtn.repostBtn = crlBtn.repostCounts = crlBtn.commentCounts = crlBtn.delTweetBtn = crlBtn.delDirectMsgBtn = crlBtn.addFavoritesMsgBtn = crlBtn.delFavoritesMsgBtn = '';
//                crlBtn.commentBtn = '<a class="commenttweet" href="javascript:void(0);" onclick="javascript:doComment(this,\'' + 
//                	sinaMsg.status.user.screen_name + '\', \'' + sinaMsg.status.user.id + '\', \'' + sinaMsg.status.id + '\',\'' + user.screen_name + '\', \'' + user.id + '\',\'' + sinaMsg.id + '\');" title="点击回复评论">回复</a>';
//                if(c_user.id == user.id){
//                    crlBtn.new_msgBtn = '';
//                }else{
//                    //delCommentBtn = '';
//                    //commentBtn = commentBtn.replace('>评<', '>回复<');
//                }
//                break;
//            case 'comments_by_me':
//                crlBtn.delDirectMsgBtn = crlBtn.addFavoritesMsgBtn = crlBtn.delFavoritesMsgBtn = '';
//                break;
//            case 'direct_messages':
//                crlBtn.repostBtn = crlBtn.oretweetBtn = crlBtn.repostCounts = crlBtn.commentBtn = crlBtn.commentCounts = crlBtn.delCommentBtn = crlBtn.delTweetBtn = crlBtn.addFavoritesMsgBtn = crlBtn.delFavoritesMsgBtn = '';
//                crlBtn.new_msgBtn = crlBtn.new_msgBtn.replace('>私<', '>回复<');
//                break;
//            case 'user_timeline':
//                if(sinaMsg.favorited){
//                    crlBtn.addFavoritesMsgBtn = '';
//                }else{
//                    crlBtn.delFavoritesMsgBtn = '';
//                }
//                crlBtn.delDirectMsgBtn = crlBtn.delCommentBtn = crlBtn.new_msgBtn = '';
//                if(c_user.id == user.id){
//                    crlBtn.addFavoritesMsgBtn = crlBtn.delFavoritesMsgBtn = '';
//                }else{
//                    crlBtn.delTweetBtn = '';
//                }
//                break;
//            default:
//                //
//        }
//
//        switch(c_user.blogType){
//            case 'digu':
//                crlBtn.replyBtn = crlBtn.replyBtn.replace('>@<', '>回复<');
//                break;
//            case 'renjian':
//                crlBtn.repostCounts = crlBtn.rtRepostCounts = crlBtn.rtrtRepostCounts = '';
//                break;
//            case 'twitter':
//                if(rt_status && rt_status.user){
//                    crlBtn.oretweetBtn = '';
//                    if(rt_status.retweeted){
//                        crlBtn.rtOretweetBtn = '<a class="oretweet ort orted" href="javascript:void(0);" title="已成功锐推"></a>';
//                    }else{
//                        crlBtn.rtOretweetBtn = '<a class="oretweet ort" href="javascript:void(0);" onclick="javascript:sendOretweet(this,\'' + rt_status.user.screen_name + '\',\'' + rt_status.id + '\');" title="Twitter锐推"></a>';
//                    }
//                }else{
//                    if(sinaMsg.retweeted){
//                        crlBtn.oretweetBtn = '<a class="oretweet ort orted" href="javascript:void(0);" title="已成功锐推"></a>';
//                    }else{
//                        crlBtn.oretweetBtn = '<a class="oretweet ort" href="javascript:void(0);" onclick="javascript:sendOretweet(this,\'' + user.screen_name + '\',\'' + sinaMsg.id + '\');" title="Twitter锐推"></a>';
//                    }
//                    crlBtn.rtOretweetBtn = '';
//                }
//                break;
//                default:
//                    break;
//        }
//
//        /*
//        * sinaMsg.retweeted_status 转发
//        * sinaMsg.status 评论
//        */
//        sinaMsg.retweeted_status = sinaMsg.retweeted_status || sinaMsg.status || null;
//        var context = {
//                        provinces: provinces,
//                        tType: t,
//                        getUserCountsInfo: getUserCountsInfo,
//                        buildTipboxUserInfo: buildTipboxUserInfo,
//                        processMsg: tapi.processMsg,
//                        user: user,
//                        account: c_user,
//                        tweet: sinaMsg,
//                        support_follow: c_user.blogType != 'douban',
//                        btn: crlBtn
//                       };
//        var tp = TEMPLATE;
//        if(t == 'friends' || t == 'followers'){
//            tp = TEMPLATE_FANS;
//        }
//        var theme = Settings.get().theme;
//        var need_rt_rt = sinaMsg.retweeted_status && sinaMsg.retweeted_status.retweeted_status;
//        var rt_rt_tpl = null;
//        if(need_rt_rt) {
//        	sinaMsg.retweeted_status.retweeted_status.is_rt = true;
//        	rt_rt_tpl = TEMPLATE_RT.replace(/tweet\.retweeted_status\./g, 'tweet.retweeted_status.retweeted_status.');
//        	rt_rt_tpl = rt_rt_tpl.replace(/btn\.rt/g, 'btn.rtrt');
//        }
//        if(theme=='pip_io'){
//            tp = tp.replace('<!-- {{retweeted_status_out}} -->', TEMPLATE_RT);
//            if(need_rt_rt) {
//            	tp = tp.replace('<!-- {{retweeted_retweeted_status_out}} -->', rt_rt_tpl);
//            }
//        }else{
//            tp = tp.replace('<!-- {{retweeted_status_in}} -->', TEMPLATE_RT);
//            if(need_rt_rt) {
//            	tp = tp.replace('<!-- {{retweeted_retweeted_status_in}} -->', rt_rt_tpl);
//            }
//        }
//        var r = Shotenjin.render(tp, context);
//    }catch(err){
//        log(JSON.stringify(err));
//        return '';
//    }
//    sinaMsg.readed = true;
//    return r;
//};

// 生成Tipbox用户信息(鼠标移到用户头像时显示的用户信息)
function buildTipboxUserInfo(user){
    var context = {
	    provinces: provinces,
	    user: user
	};
    var r = Shotenjin.render(TEMPLATE_TIPBOX_USER_INFO, context);
    return r;
};

// 生成用户信息
function buildUserInfo(user){
    var context = {
        provinces: provinces,
        getUserCountsInfo: getUserCountsInfo,
        user: user,
        support_follow: getUser().blogType != 'douban'
    };
    var r = Shotenjin.render(TEMPLATE_USER_INFO, context);
    return r;
};

//生成粉丝信息
function buildFansLi(user, t){
    var context = {
	    t: t,
	    provinces: provinces,
	    getUserCountsInfo: getUserCountsInfo,
	    user: user
	};
    var r = Shotenjin.render(TEMPLATE_FANS, context);
    return r;
};

/**
 * 生成评论列表
 */
function buildComment(comment, status_id, status_user_screen_name, status_user_id){
    var c_user = getUser();
    if(comment.status && comment.status.id) {
    	status_id = comment.status.id;
    	if(comment.status.user) {
    		status_user_screen_name = comment.status.user.screen_name;
    		status_user_id = comment.status.user.id;
    	}
    }
    var commentBtn = '<a class="replyComment" href="javascript:void(0);" onclick="javascript:doComment(this,\'{{status_user_screen_name}}\',\'{{status_user_id}}\',\'{{status_id}}\',\'{{comment_user_screen_name}}\',\'{{comment_user_id}}\',\'{{comment_id}}\');" title="评论回复">回复</a>'.format({
    	status_id: status_id,
    	status_user_screen_name: status_user_screen_name,
    	status_user_id: status_user_id,
    	comment_id: comment.id,
    	comment_user_screen_name: comment.user.screen_name,
    	comment_user_id: comment.user.id
    });
    if(comment.user.verified) {
    	comment.user.verified = '<img title="认证用户" src="/images/verified.gif" />';
    } else {
    	comment.user.verified = '';
    }
    var reply_user = '<a target="_blank" href="javascript:getUserTimeline(\'{{screen_name}}\', \'{{id}}\');" rhref="{{t_url}}" title="左键查看微薄，右键打开主页">@{{screen_name}}{{verified}}</a>'.format(comment.user);
    var tp = '<li>' 
            + reply_user + ': ' + tapi.processMsg(c_user, HTMLEnCode(comment.text), true) 
            + '<span class="msgInfo">(' + new Date(comment.created_at).format("yyyy-MM-dd hh:mm:ss") + ')</span>'
            + commentBtn
            + '</li>';
    return tp;
}

function getUserCountsInfo(user){
	if(user.statuses_count == undefined) return '';
    tp = '关注：' + user.friends_count + '个\r\n'
           + '粉丝：' + user.followers_count + '个\r\n'
           + '微博：' + user.statuses_count + '条';
    return tp;
}