// @author qleelulu@gmail.com

function bildMsgLi(sinaMsg, t, c_user){
    if(!sinaMsg){ return ''; }
    try{
        if(!c_user){
            c_user = getUser();
        }
        var user = sinaMsg.user || sinaMsg.sender;
        if(t == 'friends' || t == 'followers'){ //粉丝列表
            user = sinaMsg;
        }
        if(c_user.id == user.id){
            sinaMsg.myTweet = true;
        }
     	var config = tapi.get_config(c_user);
     	var support_comment = config.support_comment;
     	var support_favorites = config.support_favorites;
        var crlBtn = {
                delTweetBtn: '<a class="deltweet" href="javascript:void(0);" onclick="doDelTweet(\'' + sinaMsg.id + '\', this);" title="点击删除微博">删</a>',
                replyBtn: '<a class="replytweet" href="javascript:void(0);" onclick="javascript:doReply(this,\'' + user.screen_name + '\',\'' + sinaMsg.id + '\');" title="进行@回复">@</a>',
                oretweetBtn: '',
                rtBtn: '<a class="rtweet" href="javascript:void(0);" onclick="doRT(this);" title="Twitter式转发">RT</a>',
                repostBtn: '<a class="reposttweet" href="javascript:void(0);" onclick="javascript:doRepost(this,\'' + user.screen_name + '\',\'' + sinaMsg.id + '\',\'' + (sinaMsg.retweeted_status ? sinaMsg.retweeted_status.user.screen_name : '') + '\',' + (sinaMsg.retweeted_status ? sinaMsg.retweeted_status.id : '0') + ');" title="转发这条微博">转</a>',
                repostCounts: '<span class="repostCounts">(-)</span>',
                rtRepostCounts: '<span class="repostCounts">(-)</span>',
                rtrtRepostCounts: '<span class="repostCounts">(-)</span>',
                commentBtn: '<a class="commenttweet" href="javascript:void(0);" onclick="javascript:doComment(this,\'' + user.screen_name + '\',\'' + sinaMsg.id + '\');" title="点击添加评论">评</a>',
                commentCounts: '<span class="commentCounts">(-)</span>',
                rtCommentCounts: '<span class="commentCounts">(-)</span>',
                rtrtCommentCounts: '<span class="commentCounts">(-)</span>',
                delCommentBtn: '<a class="delcommenttweet" href="javascript:void(0);" onclick="javascript:doDelComment(this,\'' + user.screen_name + '\',\'' + sinaMsg.id + '\');" title="点击删除评论">删</a>',
                new_msgBtn: '<a class="newMessage" href="javascript:void(0);" onclick="doNewMessage(this,\'' + user.screen_name + '\',\'' + user.id + '\');" title="发送私信">私</a>',
                delDirectMsgBtn: '<a class="newMessage" href="javascript:void(0);" onclick="delDirectMsg(this,\'' + user.screen_name + '\',\'' + sinaMsg.id + '\');" title="点击删除私信">删</a>',
                addFavoritesMsgBtn: '<a class="newMessage" href="javascript:void(0);" onclick="addFavorites(this,\'' + user.screen_name + '\',\'' + sinaMsg.id + '\');" title="点击收藏"><img width="11px" src="/images/favorites_2.gif"/></a>',
                delFavoritesMsgBtn: '<a class="newMessage" href="javascript:void(0);" onclick="delFavorites(this,\'' + user.screen_name + '\',\'' + sinaMsg.id + '\');" title="点击取消收藏"><img width="11px" src="/images/favorites.gif"/></a>',
                rtRepostBtn: '',
                rtOretweetBtn: '',
                rtCommentBtn: '',
                rtReplyBtn: '',
                rtAddFavoritesMsgBtn: '',
                // rt rt
                rtrtRepostBtn: '',
                rtrtCommentBtn: '',
                rtrtReplyBtn: '',
                rtrtAddFavoritesMsgBtn: ''
        };

        var rt_status = sinaMsg.retweeted_status || sinaMsg.status;
        if(rt_status && rt_status.user){
            crlBtn.rtRepostBtn = '<a class="reposttweet" href="javascript:void(0);" onclick="javascript:doRepost(this,\'' + rt_status.user.screen_name + '\',\'' + rt_status.id + '\');" title="转发这条微博">转</a>';
            crlBtn.rtCommentBtn = '<a class="commenttweet" href="javascript:void(0);" onclick="javascript:doComment(this,\'' + rt_status.user.screen_name + '\',\'' + rt_status.id + '\');" title="点击添加评论">评</a>';
            crlBtn.rtReplyBtn = '<a class="replytweet" href="javascript:void(0);" onclick="javascript:doReply(this,\'' + rt_status.user.screen_name + '\',\'' + rt_status.id + '\');" title="进行@回复">@</a>';
            crlBtn.rtAddFavoritesMsgBtn = '<a class="newMessage" href="javascript:void(0);" onclick="addFavorites(this,\'' + rt_status.user.screen_name + '\',\'' + rt_status.id + '\');" title="点击收藏"><img width="11px" src="/images/favorites_2.gif"/></a>';
            if(rt_status.retweeted_status && rt_status.retweeted_status.user) {
            	//log(rt_status);
            	var rtrt_screen_name = rt_status.retweeted_status.user.screen_name;
            	var rtrt_id = rt_status.retweeted_status.id;
            	crlBtn.rtrtRepostBtn = '<a class="reposttweet" href="javascript:void(0);" onclick="javascript:doRepost(this,\'' + rtrt_screen_name + '\',\'' + rtrt_id + '\');" title="转发这条微博">转</a>';
                crlBtn.rtrtCommentBtn = '<a class="commenttweet" href="javascript:void(0);" onclick="javascript:doComment(this,\'' + rtrt_screen_name + '\',\'' + rtrt_id + '\');" title="点击添加评论">评</a>';
                crlBtn.rtrtReplyBtn = '<a class="replytweet" href="javascript:void(0);" onclick="javascript:doReply(this,\'' + rtrt_screen_name + '\',\'' + rtrt_id + '\');" title="进行@回复">@</a>';
                crlBtn.rtrtAddFavoritesMsgBtn = '<a class="newMessage" href="javascript:void(0);" onclick="addFavorites(this,\'' + rtrt_screen_name + '\',\'' + rtrt_id + '\');" title="点击收藏"><img width="11px" src="/images/favorites_2.gif"/></a>';
                
            }
        }
        // 不支持评论
        if(!support_comment) {
        	crlBtn.commentBtn = crlBtn.commentCounts = crlBtn.rtCommentCounts = crlBtn.rtCommentBtn = '';
        }
        // 不支持收藏
        if(!support_favorites) {
        	crlBtn.addFavoritesMsgBtn = crlBtn.delFavoritesMsgBtn = '';
        }
        // 不支持repost(转发)
        if(!config.support_repost) {
        	crlBtn.repostCounts = crlBtn.rtRepostCounts = crlBtn.repostBtn = crlBtn.rtRepostBtn = '';
        }
        // 不支持删除私信
        if(!config.support_destroy_msg) {
        	crlBtn.delDirectMsgBtn = '';
        }
		// 不支持私信
        if(!config.support_direct_messages) {
        	crlBtn.delDirectMsgBtn = '';
        	crlBtn.new_msgBtn = '';
        }
        
        if(c_user.blogType == 'digu' ){
            crlBtn.replyBtn = crlBtn.replyBtn.replace('>@<', '>回复<');
        }
        else if(c_user.blogType == 'twitter' ){
            crlBtn.oretweetBtn = '<a class="oretweet ort" href="javascript:void(0);" onclick="javascript:sendOretweet(this,\'' + user.screen_name + '\',\'' + sinaMsg.id + '\');" title="Twitter锐推"></a>';
        }

        switch(t){
            case 'friends_timeline':
            case 'favorites':
                crlBtn.delDirectMsgBtn = crlBtn.delCommentBtn = '';
                if(c_user.id == user.id){
                    //crlBtn.repostBtn = '<a>转</a>';
                    crlBtn.new_msgBtn = '';
                }else{
                    crlBtn.delTweetBtn = '';
                }
                if(sinaMsg.favorited){
                    crlBtn.addFavoritesMsgBtn = '';
                }else{
                    crlBtn.delFavoritesMsgBtn = '';
                }
                break;
            case 'mentions':
                crlBtn.delDirectMsgBtn = crlBtn.delCommentBtn = '';
                if(c_user.id == user.id){
                    //crlBtn.repostBtn = '<a>转</a>';
                    crlBtn.new_msgBtn = '';
                }else{
                    crlBtn.delTweetBtn = '';
                }
                if(sinaMsg.favorited){
                    crlBtn.addFavoritesMsgBtn = '';
                }else{
                    crlBtn.delFavoritesMsgBtn = '';
                }
                break;
            case 'comments_timeline':
                crlBtn.repostBtn = crlBtn.repostCounts = crlBtn.commentCounts = crlBtn.delTweetBtn = crlBtn.delDirectMsgBtn = crlBtn.addFavoritesMsgBtn = crlBtn.delFavoritesMsgBtn = '';
                crlBtn.commentBtn = '<a class="commenttweet" href="javascript:void(0);" onclick="javascript:doComment(this,\'' + 
                	sinaMsg.status.user.screen_name + '\',' + sinaMsg.status.id + ',\'' + user.screen_name + '\', ' + user.id + ',\'' + sinaMsg.id + '\');" title="点击回复评论">回复</a>';
                if(c_user.id == user.id){
                    crlBtn.new_msgBtn = '';
                }else{
                    //delCommentBtn = '';
                    //commentBtn = commentBtn.replace('>评<', '>回复<');
                }
                break;
            case 'comments_by_me':
                crlBtn.delDirectMsgBtn = crlBtn.addFavoritesMsgBtn = crlBtn.delFavoritesMsgBtn = '';
                break;
            case 'direct_messages':
                crlBtn.repostBtn = crlBtn.oretweetBtn = crlBtn.repostCounts = crlBtn.commentBtn = crlBtn.commentCounts = crlBtn.delCommentBtn = crlBtn.delTweetBtn = crlBtn.addFavoritesMsgBtn = crlBtn.delFavoritesMsgBtn = '';
                crlBtn.new_msgBtn = crlBtn.new_msgBtn.replace('>私<', '>回复<');
                break;
            case 'user_timeline':
                if(sinaMsg.favorited){
                    crlBtn.addFavoritesMsgBtn = '';
                }else{
                    crlBtn.delFavoritesMsgBtn = '';
                }
                crlBtn.delDirectMsgBtn = crlBtn.delCommentBtn = crlBtn.new_msgBtn = '';
                if(c_user.id == user.id){
                    crlBtn.addFavoritesMsgBtn = crlBtn.delFavoritesMsgBtn = '';
                }else{
                    crlBtn.delTweetBtn = '';
                }
                break;
            default:
                //
        }

        /*
        * sinaMsg.retweeted_status 转发
        * sinaMsg.status 评论
        */
        sinaMsg.retweeted_status = sinaMsg.retweeted_status || sinaMsg.status || null;
        var context = {
                        provinces: provinces,
                        tType: t,
                        getUserCountsInfo: getUserCountsInfo,
                        buildTipboxUserInfo: buildTipboxUserInfo,
                        processMsg: tapi.processMsg,
                        user: user,
                        account: c_user,
                        tweet: sinaMsg,
                        btn: crlBtn
                       };
        var tp = TEMPLATE;
        if(t == 'friends' || t == 'followers'){
            tp = TEMPLATE_FANS;
        }
        var theme = Settings.get().theme;
        var need_rt_rt = sinaMsg.retweeted_status && sinaMsg.retweeted_status.retweeted_status;
        var rt_rt_tpl = null;
        if(need_rt_rt) {
        	sinaMsg.retweeted_status.retweeted_status.is_rt = true;
        	rt_rt_tpl = TEMPLATE_RT.replace(/tweet\.retweeted_status\./g, 'tweet.retweeted_status.retweeted_status.');
        	rt_rt_tpl = rt_rt_tpl.replace(/btn\.rt/g, 'btn.rtrt');
        }
        if(theme=='pip_io'){
            tp = tp.replace('<!-- {{retweeted_status_out}} -->', TEMPLATE_RT);
            if(need_rt_rt) {
            	tp = tp.replace('<!-- {{retweeted_retweeted_status_out}} -->', rt_rt_tpl);
            }
        }else{
            tp = tp.replace('<!-- {{retweeted_status_in}} -->', TEMPLATE_RT);
            if(need_rt_rt) {
            	tp = tp.replace('<!-- {{retweeted_retweeted_status_in}} -->', rt_rt_tpl);
            }
        }
        var r = Shotenjin.render(tp, context);
    }catch(err){
        log(JSON.stringify(err));
        return '';
    }
    sinaMsg.readed = true;
    return r;
};

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
                    user: user
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
function buildComment(comment, status_id, status_user_screen_name){
    var c_user = getUser();
    if(comment.status && comment.status.id) {
    	status_id = comment.status.id;
    	if(comment.status.user) {
    		status_user_screen_name = comment.status.user.screen_name;
    	}
    }
    var commentBtn = '<a class="replyComment" href="javascript:void(0);" onclick="javascript:doComment(this,\'{{status_user_screen_name}}\',{{status_id}},\'{{comment_user_screen_name}}\',{{comment_user_id}},{{comment_id}});" title="评论回复">回复</a>'.format({
    	status_id: status_id,
    	status_user_screen_name: status_user_screen_name,
    	comment_id: comment.id,
    	comment_user_screen_name: comment.user.screen_name,
    	comment_user_id: comment.user.id
    });
    var tp = '<li>' 
            + tapi.processMsg(c_user, '@'
                        + comment.user.screen_name
                        + (comment.user.verified ? '<img title="新浪认证" src="/images/verified.gif" />':'')
                        + ': ' + HTMLEnCode(comment.text), true) 
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


/**
 * 处理内容
 */
 /*
var processMsg = function (str, notEncode) {
    if(!str){ return ''; }
    if(!notEncode){
        str = HTMLEnCode(str);
    }

    var user = getUser();
    var config = tapi.get_config(user);

    //str = ubbCode(str);
    //str = str.replace(/(http:\/\/[\w|\.|\/|\-|\=|\+|\?|\%|#]+)/g, '<a target="_blank" href="$1" title="$1">$1</a>');
    var re = new RegExp('(?:\\[url\\s*=\\s*|)((?:www\\.|http[s]?://)[\\w\\.\\?%&\\-/#=;:!\\+]+)(?:\\](.+)\\[/url\\]|)', 'ig');
    str = str.replace(re, replaceUrl);
    //str = str.replace(/^@([\w\-\u4e00-\u9fa5|\_]+)/g, ' <a target="_blank" href="'+ config.host +'/n/$1" title="$1\'s Homepage">@$1</a>');
    str = str.replace(/^@([\w\-\u4e00-\u9fa5|\_]+)/g, ' <a target="_blank" href="javascript:getUserTimeline(\'$1\');" rhref="'+ config.user_home_url +'$1" title="左键查看微薄，右键打开主页">@$1</a>');
    str = str.replace(/([^\w#])@([\w\-\u4e00-\u9fa5|\_]+)/g, '$1<a target="_blank" href="javascript:getUserTimeline(\'$2\');" rhref="'+ config.user_home_url +'$2" title="左键查看微薄，右键打开主页">@$2</a>');
    str = str.replace(/#([^#]+)#/g, '<a target="_blank" href="'+ config.search_url +'$1" title="Search #$1">#$1#</a>');
    
    //str = str.replace(/([^\w]|^)#([\w\u4e00-\u9fa5|\_\~]+)/g, ' <a target="_blank" href="'+ config.host +'/k/$2" title="Search #$2">#$2</a>');
    //str = str.replace(/\[:(\d{2})\]|\{([\u4e00-\u9fa5,\uff1f]{2,})\}/g, replaceEmotional); //嘀咕的表情
    
    str = str.replace(/\[([\u4e00-\u9fff,\uff1f,\w]{1,4})\]/g, replaceEmotional);
    //str = str.replace(/([^\w])@([\w\-\u4e00-\u9fa5|\_]+)/g, '$1<a target="_blank" href="'+ config.host +'/n/$2" title="$2\'s Homepage">@$2</a>');
    
    return str;
};

function replaceUrl(m, g1, g2){
    var _url = g1;
    if(g1.indexOf('http') != 0){
        _url = 'http://' + g1;
    }
    return '<a target="_blank" href="{{url}}" title="{{title}}">{{value}}</a>'.format({
    	url: _url, title: g1, value: g2||g1
    });
};

function replaceEmotional(m, g1){
	var tpl = '<img title="{{title}}" src="{{src}}" />';
	if(g1) {
		if(emotionalDict[g1]){
	        var src = emotionalDict[g1];
	        if(src.indexOf('http') != 0){
	            src = '/images/faces/' + src + '.gif';
	        }
	        return tpl.format({title: m, src: src});
	    }
	    var other = TSINA_API_EMOTIONS[g1] || TSINA_FACES[g1];
	    if(other) {
	    	return tpl.format({title: m, src: TSINA_FACE_URL_PRE + other});
		}
	}
    return m;
};
*/
