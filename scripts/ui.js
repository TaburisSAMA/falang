
//var emotionalDict={
//    "微笑": "01", "我晕": "02", "口水": "03", "开心": "04", "鄙视": "05", 
//    "我汗": "06", "好爽": "07", "偷笑": "08", "暴走": "09", "垂泪": "10", 
//    "死定": "11", "傲慢": "12", "发怒": "13", "害羞": "14", "吃惊": "15", 
//    "瞌睡": "16", "阴险": "17", "伤心": "18", "郁闷": "19", "摇头": "20", 
//    "牛逼": "21", "呕吐": "22", "可怜": "23", "耍酷": "24", "雷死": "25", 
//    "怒吼": "26", "啥玩意儿？": "27", 
//    "28":"28", "29":"29", "30":"30", "31":"31", "32":"32"
//}

//第一行是新浪API提供的表情列表，不过貌似很不全
var emotionalDict={
    "\u6c42\u9886\u517b":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/magic/08/adopt.gif","\u522b\u7406\u6211":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/magic/14/alone.gif","\u751f\u6c14":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/magic/57/angry.gif","\u751f\u65e5\u5feb\u4e50":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/magic/33/bday.gif","\u6293\u72c2":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/4d/crazy.gif","\u5927\u54ed":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/magic/af/cry.gif","\u4efb\u4f60\u5904\u7f6e":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/magic/b1/deal.gif","\u5403\u996d\u4e86":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/magic/07/eat.gif","\u55ef\u55ef":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/magic/d7/en.gif","\u5174\u594b":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/magic/9c/excite.gif","\u6655":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/a4/dizzy.gif","\u8ddf\u6211\u8d70\u5427":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/magic/6b/go.gif","\u771f\u4e56":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/magic/d8/good.gif","\u6211\u6765\u4e86":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/magic/74/here.gif","\u8fdf\u5230\u4e86":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/magic/87/late.gif","\u7b11\u6b7b\u4eba\u4e86":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/magic/6a/laugh.gif","\u65e9\u4e0a\u597d":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/magic/c8/morning.gif","\u65b0\u7684\u4e00\u5929":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/magic/e7/newday.gif","\u8def\u8fc7":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/magic/72/pass.gif","\u60f3\u4e0d\u901a":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/magic/64/puzzle.gif","\u627e\u70b9\u523a\u6fc0":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/magic/fc/rest.gif","\u6211\u597d\u51c4\u51c9":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/magic/d8/sad.gif","\u60ca\u559c":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/magic/1b/surprise.gif","\u8c22\u8c22":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/magic/6b/thx.gif","\u8d50\u4e2a\u5ab3\u5987\u5427":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/magic/38/wife.gif","\u6012":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/57/angry.gif","\u7bee\u7403":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/2c/bball_thumb.gif","\u793c\u82b1":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/3d/bingo_thumb.gif","\u5496\u5561":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/64/cafe_thumb.gif","\u86cb\u7cd5":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/6a/cake.gif","\u8721\u70db":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/cc/candle.gif","\u5149\u76d8":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/d0/cd_thumb.gif","\u5e72\u676f":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/bd/cheer.gif","\u9177":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/40/cool_thumb.gif","\u8870":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/af/cry.gif","\u9634\u5929":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/37/dark_thumb.gif","\u98ce\u6247":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/92/fan.gif","\u7403":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/93/fball_thumb.gif","\u82b1":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/6c/flower.gif","\u9c9c\u82b1":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/6c/flower_thumb.gif","\u8db3\u7403":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/c0/football.gif","\u54fc":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/19/hate.gif","\u5e3d\u5b50":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/25/hat_thumb.gif","\u5fc3":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/6d/heart.gif","\u5077\u7b11":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/7e/hei_thumb.gif","\u623f\u5b50":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/d1/house_thumb.gif","\u51b0\u68cd":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/3a/ice.gif","\u5531\u6b4c":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/79/ktv_thumb.gif","\u54c8\u54c8":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/6a/laugh.gif","\u7231\u4f60":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/7e/love.gif","\u94b1":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/90/money_thumb.gif","\u6708\u4eae":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/b9/moon.gif","\u7535\u5f71":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/77/movie_thumb.gif","\u97f3\u4e50":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/d0/music_thumb.gif","\u8bdd\u7b52":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/1b/m_thumb.gif","\u732a\u5934":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/58/pig.gif","\u4e0b\u96e8":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/50/rain.gif","\u7ea2\u724c":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/64/redcard.gif","\u6cea":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/d8/sad.gif","\u5bb3\u7f9e":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/05/shame_thumb.gif","\u54e8\u5b50":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/a0/shao.gif","\u95ea\u7535":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/e3/sh_thumb.gif","\u56f0":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/8b/sleepy.gif","\u7761\u89c9":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/7d/sleep_thumb.gif","\u5475\u5475":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/eb/smile.gif","\u96ea":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/00/snow_thumb.gif","\u661f":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/0b/star_thumb.gif","\u592a\u9633":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/e5/sun.gif","\u9633\u5149":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/1a/sunny_thumb.gif","\u6c57":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/13/sweat.gif","\u7535\u8bdd":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/9d/tel_thumb.gif","\u563b\u563b":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/c2/tooth.gif","\u7535\u89c6\u673a":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/b3/tv_thumb.gif","\u96e8\u4f1e":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/33/umb_thumb.gif","\u4f24\u5fc3":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/ea/unheart.gif","\u897f\u74dc":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/6b/watermelon.gif","\u5fae\u98ce":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/a5/wind_thumb.gif","\u9ec4\u724c":"http://timg.sjs.sinajs.cn/miniblog2style/images/common/face/ext/normal/a0/yellowcard.gif",
    "足球":"football", "哨子":"shao", "红牌":"redcard", "黄牌":"yellowcard", "哈哈":"laugh", 
    "呵呵":"smile", "衰":"cry", "汗":"sweat", "爱你":"love", "嘻嘻":"tooth", "哼":"hate", 
    "心":"heart", "晕":"dizzy", "怒":"angry", "蛋糕":"cake", "花":"flower", "抓狂":"crazy", 
    "困":"sleepy", "干杯":"cheer", "太阳":"sun", "下雨":"rain", "泪":"sad", "月亮":"moon", 
    "猪头":"pig", "蜡烛":"candle", "伤心":"unheart", "风扇":"fan", "冰棍":"ice", "西瓜":"watermelon",
    "织":"zhi", "围观":"wg", "威武":"v5", "害羞":"shame", "睡觉":"sleep", "钱":"money", "偷笑":"touxiao",
    "奥特曼":"otm", "宅":"z", "酷":"cool", "微风":"wind", "话筒":"maiphone", "爱心专递":"axcd",
    "馋嘴":"cz", "来":"come", "便便":"shi"
}

function bildMsgLi(sinaMsg, t){
    if(!sinaMsg){ return ''; }
    try{
        var c_user = getUser();
        var user = sinaMsg.user || sinaMsg.sender;
        if(t == 'friends' || t == 'followers'){ //粉丝列表
            user = sinaMsg;
        }
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
        if(rt_status && rt_status.user){
            crlBtn.rtRepostBtn = '<a class="reposttweet" href="javascript:void(0);" onclick="javascript:doRepost(this,\'' + rt_status.user.screen_name + '\',' + rt_status.id + ');" title="转发这条微博">转</a>';
            crlBtn.rtCommentBtn = '<a class="commenttweet" href="javascript:void(0);" onclick="javascript:doComment(this,\'' + rt_status.user.screen_name + '\',' + rt_status.id + ');" title="点击添加评论">评</a>';
        }

        switch(t){
            case 'friends_timeline':
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
                        provinces: provinces,
                        tType: t,
                        getUserCountsInfo: getUserCountsInfo,
                        processMsg: processMsg,
                        user: user,
                        tweet: sinaMsg,
                        btn: crlBtn
                       };
        var tp = TEMPLATE;
        if(t == 'friends' || t == 'followers'){
            tp = TEMPLATE_FANS;
        }
        var r = Shotenjin.render(tp, context);
    }catch(err){
        console.log(JSON.stringify(err));
        return '';
    }
    sinaMsg.readed = true;
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
function buildComment(comment){
    var c_user = getUser();
    var commentBtn = '<a class="replyComment" href="javascript:void(0);" onclick="javascript:doComment(this,\'' + comment.status.user.screen_name + '\',' + comment.status.id + ',\''+ comment.user.screen_name + '\',' + comment.id + ');" title="评论回复">回复</a>';
    
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
    if(!str){ return ''; }
    //str = ubbCode(str);
    //str = str.replace(/(http:\/\/[\w|\.|\/|\-|\=|\+|\?|\%|#]+)/g, '<a target="_blank" href="$1" title="$1">$1</a>');
    var re = new RegExp('(?:\\[url\\s*=\\s*|)((?:www\\.|http[s]?://)[\\w\\.\\?%&\-/#=;:!\\+]+)\\s*(?:\\](.+)\\[/url\\]|)', 'ig');
    str = str.replace(re, replaceUrl);
    //str = str.replace(/^@([\w\-\u4e00-\u9fa5|\_]+)/g, ' <a target="_blank" href="'+ domain_sina +'/n/$1" title="$1\'s Homepage">@$1</a>');
    str = str.replace(/^@([\w\-\u4e00-\u9fa5|\_]+)/g, ' <a target="_blank" href="javascript:getUserTimeline(\'$1\');" rhref="'+ domain_sina +'/n/$1" title="左键查看微薄，右键打开主页">@$1</a>');
    str = str.replace(/([^\w#])@([\w\-\u4e00-\u9fa5|\_]+)/g, '$1<a target="_blank" href="javascript:getUserTimeline(\'$2\');" rhref="'+ domain_sina +'/n/$2" title="左键查看微薄，右键打开主页">@$2</a>');
    str = str.replace(/#([^#]+)#/g, '<a target="_blank" href="'+ domain_sina +'/k/$1" title="Search #$1">#$1#</a>');
    
    //str = str.replace(/([^\w]|^)#([\w\u4e00-\u9fa5|\_\~]+)/g, ' <a target="_blank" href="'+ domain_sina +'/k/$2" title="Search #$2">#$2</a>');
    //str = str.replace(/\[:(\d{2})\]|\{([\u4e00-\u9fa5,\uff1f]{2,})\}/g, replaceEmotional); //嘀咕的表情
    
    str = str.replace(/\[([\u4e00-\u9fff,\uff1f]{1,4})\]/g, replaceEmotional);
    //str = str.replace(/([^\w])@([\w\-\u4e00-\u9fa5|\_]+)/g, '$1<a target="_blank" href="'+ domain_sina +'/n/$2" title="$2\'s Homepage">@$2</a>');
    
    return str;
};

function replaceUrl(m, g1, g2){
    return '<a target="_blank" href="' + g1 + '" title="' + g1 + '">' + (g2||g1) + '</a>';
}

function replaceEmotional(m, g1){
    if(g1 && emotionalDict[g1]){
        var src = emotionalDict[g1];
        if(src.indexOf('http') != 0){
            src = '/images/faces/' + src + '.gif';
        }
        return '<img title="' + m + '" src="' + src + '" />';
    }else{
        return m;
    }
}
