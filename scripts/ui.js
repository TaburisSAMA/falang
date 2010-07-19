
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
    "足球":"football", "哨子":"shao", "红牌":"redcard", "黄牌":"yellowcard", "哈哈":"laugh", 
    "呵呵":"smile", "衰":"cry", "汗":"sweat", "爱你":"love", "嘻嘻":"tooth", "哼":"hate", 
    "心":"heart", "晕":"dizzy", "怒":"angry", "蛋糕":"cake", "花":"flower", "抓狂":"crazy", 
    "困":"sleepy", "干杯":"cheer", "太阳":"sun", "下雨":"rain", "泪":"sad", "月亮":"moon", 
    "猪头":"pig", "蜡烛":"candle", "伤心":"unheart", "风扇":"fan", "冰棍":"ice", "西瓜":"watermelon"
}

function bildMsgLi(sinaMsg, t){
    if(!sinaMsg){ return ''; }

    var c_user = getUser();
    var user = sinaMsg.user || sinaMsg.sender;
    if(c_user.id == user.id){
        sinaMsg.myTweet = true;
    }
    var crlBtn = {
            delTweetBtn: '<a class="deltweet" href="javascript:void(0);" onclick="doDelTweet(' + sinaMsg.id + ', this);" title="点击删除微博">删</a>',
            replyBtn: '<a class="replytweet" href="javascript:void(0);" onclick="javascript:doReply(this,\'' + user.screen_name + '\',' + sinaMsg.id + ');" title="进行@回复">@</a>',
            rtBtn: '<a class="rtweet" href="javascript:void(0);" onclick="doRT(this);" title="Twitter式转发">RT</a>',
            repostBtn: '<a class="reposttweet" href="javascript:void(0);" onclick="javascript:doRepost(this,\'' + user.screen_name + '\',' + sinaMsg.id + ',\'' + (sinaMsg.retweeted_status ? sinaMsg.retweeted_status.user.screen_name : '') + '\',' + (sinaMsg.retweeted_status ? sinaMsg.retweeted_status.id : '0') + ');" title="转发这条微博">转</a>',
            repostCounts: '<span class="repostCounts">(-)</span>',
            rtRepostCounts: '<span class="repostCounts">(-)</span>',
            commentBtn: '<a class="commenttweet" href="javascript:void(0);" onclick="javascript:doComment(this,\'' + user.screen_name + '\',' + sinaMsg.id + ');" title="点击添加评论">评</a>',
            commentCounts: '<span class="commentCounts">(-)</span>',
            rtCommentCounts: '<span class="commentCounts">(-)</span>',
            delCommentBtn: '<a class="delcommenttweet" href="javascript:void(0);" onclick="javascript:doDelComment(this,\'' + user.screen_name + '\',' + sinaMsg.id + ');" title="点击删除评论">删</a>',
            new_msgBtn: '<a class="newMessage" href="javascript:void(0);" onclick="doNewMessage(this,\'' + user.screen_name + '\',' + user.id + ');" title="发送私信">私</a>',
            delDirectMsgBtn: '<a class="newMessage" href="javascript:void(0);" onclick="delDirectMsg(this,\'' + user.screen_name + '\',' + sinaMsg.id + ');" title="点击删除私信">删</a>',
            addFavoritesMsgBtn: '<a class="newMessage" href="javascript:void(0);" onclick="addFavorites(this,\'' + user.screen_name + '\',' + sinaMsg.id + ');" title="点击收藏"><img width="11px" src="/images/favorites_2.gif"/></a>',
            delFavoritesMsgBtn: '<a class="newMessage" href="javascript:void(0);" onclick="delFavorites(this,\'' + user.screen_name + '\',' + sinaMsg.id + ');" title="点击取消收藏"><img width="11px" src="/images/favorites.gif"/></a>',
            rtRepostBtn: '',
            rtCommentBtn: ''
    };

    var rt_status = sinaMsg.retweeted_status || sinaMsg.status;
    if(rt_status){
        crlBtn.rtRepostBtn = '<a class="reposttweet" href="javascript:void(0);" onclick="javascript:doRepost(this,\'' + rt_status.user.screen_name + '\',' + rt_status.id + ');" title="转发这条微博">转</a>';
        crlBtn.rtCommentBtn = '<a class="commenttweet" href="javascript:void(0);" onclick="javascript:doComment(this,\'' + rt_status.user.screen_name + '\',' + rt_status.id + ');" title="点击添加评论">评</a>';
    }

    switch(t){
        case 'friends_timeline':
            crlBtn.delDirectMsgBtn = crlBtn.delCommentBtn = '';
            if(c_user.id == user.id){
                crlBtn.repostBtn = '<a>转</a>';
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
                crlBtn.repostBtn = '<a>转</a>';
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
            crlBtn.commentBtn = '<a class="commenttweet" href="javascript:void(0);" onclick="javascript:doComment(this,\'' + sinaMsg.status.user.screen_name + '\',' + sinaMsg.status.id + ',\'' + user.screen_name + '\');" title="点击回复评论">回复</a>';
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
            crlBtn.repostBtn = crlBtn.repostCounts = crlBtn.commentBtn = crlBtn.commentCounts = crlBtn.delCommentBtn = crlBtn.delTweetBtn = crlBtn.addFavoritesMsgBtn = crlBtn.delFavoritesMsgBtn = '';
            crlBtn.new_msgBtn = crlBtn.new_msgBtn.replace('>私<', '>回复<');
            break;
        case 'favorites':
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
                    tType: t,
                    getUserCountsInfo: getUserCountsInfo,
                    processMsg: processMsg,
                    user: user,
                    tweet: sinaMsg,
                    btn: crlBtn
                   };
    //var tp = $("#tp_time_line").val();
    var r = '';
    try{
        var r = Shotenjin.render(TEMPLATE, context);
    }catch(err){
        console.log(err);
        return '';
    }
    sinaMsg.readed = true;
    return r;
};

/**
 * 生成评论列表
 */
function buildComment(comment){
    var c_user = getUser();
    var commentBtn = '<a class="replyComment" href="javascript:void(0);" onclick="javascript:doComment(this,\'' + comment.status.user.screen_name + '\',' + comment.status.id + ',\''+ comment.user.screen_name + '\');" title="评论回复">回复</a>';
    
    var tp = '<li>' 
            + processMsg('@'
                        + comment.user.screen_name
                        + (comment.user.verified ? '<img title="新浪认证" src="/images/verified.gif" />':'')
                        + ': ' + comment.text) 
            + '<span class="msgInfo">(' + new Date(comment.created_at).format("yyyy-MM-dd hh:mm:ss") + ')</span>'
            + commentBtn
            + '</li>';
    return tp;
}

function getUserCountsInfo(user){
    var tp = '关注：' + user.friends_count + '个\r\n'
           + '粉丝：' + user.followers_count + '个\r\n'
           + '微博：' + user.statuses_count + '条';
    return tp;
}

/**
 * 处理内容
 */
var processMsg = function (str) {
    //str = ubbCode(str);
    //str = str.replace(/(http:\/\/[\w|\.|\/|\-|\=|\+|\?|\%|#]+)/g, '<a target="_blank" href="$1" title="$1">$1</a>');
    var re = new RegExp('(?:\\[url\\s*=\\s*|)((?:www\\.|http[s]?://)[\\w\\.\\?%&\-/#=;:!\\+]+)\\s*(?:\\](.+)\\[/url\\]|)', 'ig');
    str = str.replace(re, replaceUrl);
    str = str.replace(/^@([\w\u4e00-\u9fa5|\_]+)/g, ' <a target="_blank" href="'+ domain_sina +'/n/$1" title="$1\'s Homepage">@$1</a>');
    str = str.replace(/#([^#]+)#/g, '<a target="_blank" href="'+ domain_sina +'/k/$1" title="Search #$1">#$1#</a>');
    
    //str = str.replace(/([^\w]|^)#([\w\u4e00-\u9fa5|\_\~]+)/g, ' <a target="_blank" href="'+ domain_sina +'/k/$2" title="Search #$2">#$2</a>');
    //str = str.replace(/\[:(\d{2})\]|\{([\u4e00-\u9fa5,\uff1f]{2,})\}/g, replaceEmotional); //嘀咕的表情
    
    str = str.replace(/\[([\u4e00-\u9fa5,\uff1f]{1,2})\]/g, replaceEmotional);
    return str.replace(/([^\w])@([\w\u4e00-\u9fa5|\_]+)/g, '$1<a target="_blank" href="'+ domain_sina +'/n/$2" title="$2\'s Homepage">@$2</a>');
};

function replaceUrl(m, g1, g2){
    return '<a target="_blank" href="' + g1 + '" title="' + g1 + '">' + (g2||g1) + '</a>';
}

function replaceEmotional(m, g1){
    if(g1 && emotionalDict[g1]){
        return '<img title="' + m + '" src="http://simg.sinajs.cn/miniblog2style/images/common/face/basic/' + emotionalDict[g1] + '.gif" />';
    }else{
        return m;
    }
}
