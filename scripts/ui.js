//var tp = '<li class="{#if $T.read} read {#else} unread-item {#/if}" id="tweet{$T.id}" did="{$T.id}">'
//            +'  <div class="usericon"><a target="_blank" href="{$P.domain_sina}/' + (user.domain||user.id) + '"><img src="' + user.profile_image_url.replace('24x24', '48x48') + '" /></a></div>'
//			+'	<div class="mainContent">'
//			+'		<div class="userName"><a target="_blank" href="' + domain_sina + '/' + (user.domain||user.id) + '">' + user.screen_name + inreplyBtn
//            +'</a><span class="edit"><a class="replytweet" href="javascript:void(0);" onclick="javascript:doReply(this,\'' + user.screen_name + '\',' + sinaMsg.id + ');">回复</a>' 
//            +'<a class="rtweet" href="javascript:void(0);" onclick="doRT(this);">RT</a>' 
//            +'<a class="reposttweet" href="javascript:void(0);" onclick="javascript:doRepost(this,\'' + user.screen_name + '\',' + sinaMsg.id + ');">转发</a>'
//            +'<a class="commenttweet" href="javascript:void(0);" onclick="javascript:doComment(this,\'' + user.screen_name + '\',' + sinaMsg.id + ');">评论</a>'
//            +'<a class="newMessage" href="javascript:void(0);" onclick="doNewMessage(this,\'' + user.screen_name + '\',' + user.id + ');">私信</a>'
//            + delBtn.replace('tweetId', sinaMsg.id) + '</span></div>'
//			+'		<div class="msg"><div class="tweet">' + processMsg(sinaMsg.text);
//    if(sinaMsg.thumbnail_pic){
//        tp = tp + '<div><a target="_blank" href="' + sinaMsg.original_pic + '" ><img src="' + sinaMsg.thumbnail_pic +'" /></a></div>';
//    }
//    if(sinaMsg.retweeted_status){
//        tp = tp + '</div><div class="retweeted">' + processMsg('@' + sinaMsg.retweeted_status.user.screen_name + ' ' + sinaMsg.retweeted_status.text);
//        if(sinaMsg.retweeted_status.thumbnail_pic){
//            tp = tp + '<div><a target="_blank" href="' + sinaMsg.retweeted_status.original_pic + '" ><img src="' + sinaMsg.retweeted_status.thumbnail_pic +'" /></a></div>';
//        }
//    }
//    tp = tp +          '</div></div>'
//			+'		<div class="msgInfo">' + new Date(sinaMsg.created_at).format("yyyy-MM-dd hh:mm:ss") + ' 通过 ' + (sinaMsg.source||'网站') + '</div>'
//			+'	</div><div class="msgObjJson" style="display:none;">' + JSON.stringify(sinaMsg) + '</div>'
//			+'</li>'; 



//var emotionalDict={
//    "微笑": "01", "我晕": "02", "口水": "03", "开心": "04", "鄙视": "05", 
//    "我汗": "06", "好爽": "07", "偷笑": "08", "暴走": "09", "垂泪": "10", 
//    "死定": "11", "傲慢": "12", "发怒": "13", "害羞": "14", "吃惊": "15", 
//    "瞌睡": "16", "阴险": "17", "伤心": "18", "郁闷": "19", "摇头": "20", 
//    "牛逼": "21", "呕吐": "22", "可怜": "23", "耍酷": "24", "雷死": "25", 
//    "怒吼": "26", "啥玩意儿？": "27", 
//    "28":"28", "29":"29", "30":"30", "31":"31", "32":"32"
//}

var emotionalDict={
    "哈哈": "laugh", "呵呵": "smile", "泪": "cry", "汗": "sweat", "爱你": "love", 
    "嘻嘻": "tooth", "哼": "hate", "心": "heart", "晕": "dizzy", "怒": "angry", 
    "蛋糕": "cake", "花": "flower", "抓狂": "crazy", "困": "sleepy", "干杯": "cheer", 
    "太阳": "sun", "下雨": "rain", "伤心": "sad", "月亮": "moon", "猪头": "pig"
}


function bildMsgLi(sinaMsg, t){
    if(!sinaMsg){ return ''; }
    var newItem = inreplyBtn = '';
    if(!sinaMsg.readed){ newItem = ' class="unread-item" '; }
    var c_user = getUser();
    var user = sinaMsg.user || sinaMsg.sender;
    if(c_user.id == user.id){
        
    }
    if(sinaMsg.in_reply_to_user_id && sinaMsg.in_reply_to_screen_name){
        //inreplyBtn = ' <a target="_blank" class="inreply" href="http://t.sina.com/relatedDialogue/' + sinaMsg.id + '" title="查看与 @'
        //    + sinaMsg.in_reply_to_screen_name + ' 的相关对话" ><img src="images/inreply.png" /></a>';
    }
    var delTweetBtn = '<a class="deltweet" href="javascript:void(0);" onclick="doDelTweet(' + sinaMsg.id + ', this);" title="删除">删</a>';
    var replyBtn = '<a class="replytweet" href="javascript:void(0);" onclick="javascript:doReply(this,\'' + user.screen_name + '\',' + sinaMsg.id + ');" title="进行@回复">@</a>';
    var rtBtn = '<a class="rtweet" href="javascript:void(0);" onclick="doRT(this);" title="Twitter式转发">RT</a>';
    var repostBtn = '<a class="reposttweet" href="javascript:void(0);" onclick="javascript:doRepost(this,\'' + user.screen_name + '\',' + sinaMsg.id + ');" title="转发这条微博">转</a>';
    var commentBtn = '<a class="commenttweet" href="javascript:void(0);" onclick="javascript:doComment(this,\'' + user.screen_name + '\',' + sinaMsg.id + ');" title="评论">评</a>';
    var delCommentBtn = '<a class="delcommenttweet" href="javascript:void(0);" onclick="javascript:doDelComment(this,\'' + user.screen_name + '\',' + sinaMsg.id + ');" title="删除">删</a>';
    var new_msgBtn = '<a class="newMessage" href="javascript:void(0);" onclick="doNewMessage(this,\'' + user.screen_name + '\',' + user.id + ');" title="发送私信">私</a>';
    var delDirectMsgBtn = '<a class="newMessage" href="javascript:void(0);" onclick="delDirectMsg(this,\'' + user.screen_name + '\',' + sinaMsg.id + ');" title="删除">删</a>';
    var addFavoritesMsgBtn = '<a class="newMessage" href="javascript:void(0);" onclick="addFavorites(this,\'' + user.screen_name + '\',' + sinaMsg.id + ');" title="点击收藏"><img width="11px" src="images/favorites_2.gif"/></a>';
    var delFavoritesMsgBtn = '<a class="newMessage" href="javascript:void(0);" onclick="delFavorites(this,\'' + user.screen_name + '\',' + sinaMsg.id + ');" title="点击取消收藏"><img width="11px" src="images/favorites.gif"/></a>';
    switch(t){
        case 'friends_timeline':
            delDirectMsgBtn = delCommentBtn = '';
            if(c_user.id == user.id){
                repostBtn = new_msgBtn = '';
            }else{
                delTweetBtn = '';
            }
            if(sinaMsg.favorited){
                addFavoritesMsgBtn = '';
            }else{
                delFavoritesMsgBtn = '';
            }
            break;
        case 'mentions':
            delDirectMsgBtn = delCommentBtn = '';
            if(c_user.id == user.id){
                repostBtn = new_msgBtn = '';
            }else{
                delTweetBtn = '';
            }
            if(sinaMsg.favorited){
                addFavoritesMsgBtn = '';
            }else{
                delFavoritesMsgBtn = '';
            }
            break;
        case 'comments_timeline':
            repostBtn = delTweetBtn = delDirectMsgBtn = addFavoritesMsgBtn = delFavoritesMsgBtn = '';
            if(c_user.id == user.id){
                commentBtn = new_msgBtn = '';
            }else{
                //delCommentBtn = '';
                commentBtn = commentBtn.replace('>评<', '>回复<');
            }
            break;
        case 'comments_by_me':
            delDirectMsgBtn = addFavoritesMsgBtn = delFavoritesMsgBtn = '';
            break;
        case 'direct_messages':
            repostBtn = commentBtn = delCommentBtn = delTweetBtn = addFavoritesMsgBtn = delFavoritesMsgBtn = '';
            break;
        case 'favorites':
            break;
        default:
            //
    }
    var tp = '<li' + newItem + ' id="tweet' + sinaMsg.id + '" did="' + sinaMsg.id + '"><div class="usericon"><a target="_blank" href="' + domain_sina + '/' + (user.domain||user.id) + '"><img src="' + user.profile_image_url.replace('24x24', '48x48') + '" /></a></div>'
			+'	<div class="mainContent">'
			+'		<div class="userName"><a target="_blank" href="' + domain_sina + '/' + (user.domain||user.id) + '">' + user.screen_name 
            + (user.verified ? '<img title="新浪认证" src="images/verified.gif" />':'') //V标识
            +'</a><span class="edit">' 
            + addFavoritesMsgBtn + delFavoritesMsgBtn + replyBtn + rtBtn + repostBtn + commentBtn + new_msgBtn + delTweetBtn + delCommentBtn + delDirectMsgBtn 
            + '</span></div>'
			+'		<div class="msg"><div class="tweet">' + processMsg(sinaMsg.text);
    if(sinaMsg.thumbnail_pic){
        tp = tp + '<div><a target="_blank" href="' + sinaMsg.original_pic + '" ><img src="' + sinaMsg.thumbnail_pic +'" /></a></div>';
    }
    if(sinaMsg.retweeted_status){//转发status
        tp = tp + '</div><div class="retweeted">' 
            + processMsg('@' 
                + sinaMsg.retweeted_status.user.screen_name 
                + (sinaMsg.retweeted_status.user.verified ? '<img title="新浪认证" src="images/verified.gif" />':'')
                + ' ' + sinaMsg.retweeted_status.text);
        if(sinaMsg.retweeted_status.thumbnail_pic){
            tp = tp + '<div><a target="_blank" href="' + sinaMsg.retweeted_status.original_pic + '" ><img src="' + sinaMsg.retweeted_status.thumbnail_pic +'" /></a></div>';
        }
    }
    if(sinaMsg.status){//评论
        tp = tp + '</div><div class="retweeted">' 
            + processMsg('评论@' 
                + sinaMsg.status.user.screen_name 
                + (sinaMsg.status.user.verified ? '<img title="新浪认证" src="images/verified.gif" />':'')
                + ' 的微博: ' + sinaMsg.status.text);
        if(sinaMsg.status.thumbnail_pic){
            tp = tp + '<div><a target="_blank" href="' + sinaMsg.status.original_pic + '" ><img src="' + sinaMsg.status.thumbnail_pic +'" /></a></div>';
        }
    }
    tp = tp +          '</div></div>'
			+'		<div class="msgInfo">' + new Date(sinaMsg.created_at).format("yyyy-MM-dd hh:mm:ss") + ' 通过 ' + (sinaMsg.source||'网站') + '</div>'
			+'	</div><div class="msgObjJson" style="display:none;">' + JSON.stringify(sinaMsg) + '</div>'
			+'</li>';   
     sinaMsg.readed = true;
     return tp;
};

//function bildMsgLi(sinaMsg, isNew){
//    if(!sinaMsg){ return ''; }
//    var newItem = delBtn = inreplyBtn = '';
//    if(isNew){ newItem = ' class="unread-item" '; }
//    var c_user = getUser();
//    var user = sinaMsg.user || sinaMsg.sender;
//    if(c_user.userName.toLowerCase() == user.name.toLowerCase()){
//        delBtn = '<a class="deltweet" href="javascript:void(0);" onclick="doDelTweet(tweetId, this);">删除</a>';
//    }
//    if(sinaMsg.in_reply_to_user_id && sinaMsg.in_reply_to_screen_name){
//        inreplyBtn = ' <a target="_blank" class="inreply" href="http://sina.com/relatedDialogue/' + sinaMsg.id + '" title="查看与 @'
//            + sinaMsg.in_reply_to_screen_name + ' 的相关对话" ><img src="images/inreply.png" /></a>';
//    }
//    var tp = '<li' + newItem + ' id="tweet' + sinaMsg.id + '" did="' + sinaMsg.id + '"><div class="usericon"><a target="_blank" href="' + domain_sina + '/' + (user.domain||user.id) + '"><img src="' + user.profile_image_url.replace('24x24', '48x48') + '" /></a></div>'
//			+'	<div class="mainContent">'
//			+'		<div class="userName"><a target="_blank" href="' + domain_sina + '/' + (user.domain||user.id) + '">' + user.screen_name + inreplyBtn
//            +'</a><span class="edit"><a class="replytweet" href="javascript:void(0);" onclick="javascript:doReply(this,\'' + user.screen_name + '\',' + sinaMsg.id + ');">回复</a>' 
//            +'<a class="rtweet" href="javascript:void(0);" onclick="doRT(this);">RT</a>' 
//            +'<a class="reposttweet" href="javascript:void(0);" onclick="javascript:doRepost(this,\'' + user.screen_name + '\',' + sinaMsg.id + ');">转发</a>'
//            +'<a class="commenttweet" href="javascript:void(0);" onclick="javascript:doComment(this,\'' + user.screen_name + '\',' + sinaMsg.id + ');">评论</a>'
//            +'<a class="newMessage" href="javascript:void(0);" onclick="doNewMessage(this,\'' + user.screen_name + '\',' + user.id + ');">私信</a>'
//            + delBtn.replace('tweetId', sinaMsg.id) + '</span></div>'
//			+'		<div class="msg"><div class="tweet">' + processMsg(sinaMsg.text);
//    if(sinaMsg.thumbnail_pic){
//        tp = tp + '<div><a target="_blank" href="' + sinaMsg.original_pic + '" ><img src="' + sinaMsg.thumbnail_pic +'" /></a></div>';
//    }
//    if(sinaMsg.retweeted_status){
//        tp = tp + '</div><div class="retweeted">' + processMsg('@' + sinaMsg.retweeted_status.user.screen_name + ' ' + sinaMsg.retweeted_status.text);
//        if(sinaMsg.retweeted_status.thumbnail_pic){
//            tp = tp + '<div><a target="_blank" href="' + sinaMsg.retweeted_status.original_pic + '" ><img src="' + sinaMsg.retweeted_status.thumbnail_pic +'" /></a></div>';
//        }
//    }
//    tp = tp +          '</div></div>'
//			+'		<div class="msgInfo">' + new Date(sinaMsg.created_at).format("yyyy-MM-dd hh:mm:ss") + ' 通过 ' + (sinaMsg.source||'网站') + '</div>'
//			+'	</div><div class="msgObjJson" style="display:none;">' + JSON.stringify(sinaMsg) + '</div>'
//			+'</li>';   
//     return tp;
//};


/**
 * 处理内容
 */
var processMsg = function (str) {
    //str = ubbCode(str);
    //str = str.replace(/(http:\/\/[\w|\.|\/|\-|\=|\+|\?|\%|#]+)/g, '<a target="_blank" href="$1" title="$1">$1</a>');
    var re = new RegExp('(?:\\[url\\s*=\\s*|)((?:www\\.|http[s]?://)[\\w\\.\\?%&\-/#=;:!\\+]+)\\s*(?:\\](.+)\\[/url\\]|)', 'ig');
    str = str.replace(re, replaceUrl);
    str = str.replace(/^@([\w\u4e00-\u9fa5|\_]+)/g, ' <a target="_blank" href="'+ domain_sina +'/n/$1" title="$1\'s Homepage">@$1</a>');
    str = str.replace(/([^\w]|^)#([\w\u4e00-\u9fa5|\_]+)/g, ' <a target="_blank" href="'+ domain_sina +'/k/$2" title="Search #$2">#$2</a>');
    //str = str.replace(/\[:(\d{2})\]|\{([\u4e00-\u9fa5,\uff1f]{2,})\}/g, replaceEmotional); //嘀咕的表情
    str = str.replace(/\[([\u4e00-\u9fa5,\uff1f]{1,2})\]/g, replaceEmotional);
    return str.replace(/[^\w]@([\w\u4e00-\u9fa5|\_]+)/g, ' <a target="_blank" href="'+ domain_sina +'/n/$1" title="$1\'s Homepage">@$1</a>');
};

function replaceUrl(m, g1, g2){
    return '<a target="_blank" href="' + g1 + '" title="' + g1 + '">' + (g2||g1) + '</a>'
}

function replaceEmotional(m, g1){
    if(g1 && emotionalDict[g1]){
        return '<img title="' + m + '" src="http://simg.sinajs.cn/miniblog2style/images/common/face/basic/' + emotionalDict[g1] + '.gif" />';
    }else{
        return m;
    }
}
