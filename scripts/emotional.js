// @author qleelulu@gmail.com

// 新浪微博表情转化
var TSINA_FACE_URL_PRE = 'http://timg.sjs.sinajs.cn/t3/style/images/common/face/ext/normal/';
var TSINA_FACES = {
"呵呵": "eb/smile.gif",
"嘻嘻": "c2/tooth.gif",
"哈哈": "6a/laugh.gif",
"爱你": "7e/love.gif",
"晕": "a4/dizzy.gif",
"泪": "d8/sad.gif",
"馋嘴": "b8/cz_thumb.gif",
"抓狂": "4d/crazy.gif",
"哼": "19/hate.gif",
"可爱": "9c/tz_thumb.gif",
"怒": "57/angry.gif",
"汗": "13/sweat.gif",
"困": "8b/sleepy.gif",
"害羞": "05/shame_thumb.gif",
"睡觉": "7d/sleep_thumb.gif",
"钱": "90/money_thumb.gif",
"偷笑": "7e/hei_thumb.gif",
"酷": "40/cool_thumb.gif",
"衰": "af/cry.gif",
"吃惊": "f4/cj_thumb.gif",
"闭嘴": "29/bz_thumb.gif",
"鄙视": "71/bs2_thumb.gif",
"挖鼻屎": "b6/kbs_thumb.gif",
"花心": "64/hs_thumb.gif",
"鼓掌": "1b/gz_thumb.gif",
"失望": "0c/sw_thumb.gif",
"思考": "e9/sk_thumb.gif",
"生病": "b6/sb_thumb.gif",
"亲亲": "8f/qq_thumb.gif",
"怒骂": "89/nm_thumb.gif",
"太开心": "58/mb_thumb.gif",
"懒得理你": "17/ldln_thumb.gif",
"右哼哼": "98/yhh_thumb.gif",
"左哼哼": "6d/zhh_thumb.gif",
"嘘": "a6/x_thumb.gif",
"委屈": "73/wq_thumb.gif",
"吐": "9e/t_thumb.gif",
"可怜": "af/kl_thumb.gif",
"打哈气": "f3/k_thumb.gif",
"做鬼脸": "88/zgl_thumb.gif",
"握手": "0c/ws_thumb.gif",
"耶": "d9/ye_thumb.gif",
"good": "d8/good_thumb.gif",
"弱": "d8/sad_thumb.gif",
"不要": "c7/no_thumb.gif",
"ok": "d6/ok_thumb.gif",
"赞": "d0/z2_thumb.gif",
"来": "40/come_thumb.gif",
"蛋糕": "6a/cake.gif",
"心": "6d/heart.gif",
"伤心": "ea/unheart.gif",
"钟": "d3/clock_thumb.gif",
"猪头": "58/pig.gif",
"咖啡": "64/cafe_thumb.gif",
"话筒": "1b/m_thumb.gif",
"干杯": "bd/cheer.gif",
"绿丝带": "b8/green.gif",
"蜡烛": "cc/candle.gif",
"微风": "a5/wind_thumb.gif",
"月亮": "b9/moon.gif",
"月饼": "96/mooncake3_thumb.gif",
"满月": "5d/moon1_thumb.gif",
"酒壶": "64/wine_thumb.gif",
"团": "11/tuan_thumb.gif",
"圆": "53/yuan_thumb.gif",
"左抱抱": "54/left_thumb.gif",
"右抱抱": "0d/right_thumb.gif",
"乐乐": "66/guanbuzhao_thumb.gif",
"团圆月饼": "e6/tuanyuan_thumb.gif",
"快快": "49/lbq1_thumb.gif",
"织": "41/zz2_thumb.gif",
"围观": "f2/wg_thumb.gif",
"威武": "70/vw_thumb.gif",
"爱心专递": "c9/axcd_thumb.gif",
"奥特曼": "bc/otm_thumb.gif",
// 亚运
"国旗": "dc/flag_thumb.gif",
"金牌": "f4/jinpai_thumb.gif",
"银牌": "1e/yinpai_thumb.gif",
"铜牌": "26/tongpai_thumb.gif",
"围脖": "3f/weijin_thumb.gif",
"温暖帽子": "f1/wennuanmaozi_thumb.gif",
"手套": "72/shoutao_thumb.gif",
"落叶": "79/yellowMood_thumb.gif",
"照相机": "33/camera_thumb.gif",
"白云": "ff/y3_thumb.gif",
"礼物": "c4/liwu_thumb.gif",
"v5": "c5/v5_org.gif",
"书呆子": "61/sdz_org.gif"
};

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
    "馋嘴":"cz", "来":"come", "便便":"shi", "赞":"z2_org", "瞄":"miao_org", "囧":"j_org", "惊恐":"jingkong_org", 
    "鼓掌":"gz_org", "手套":"shoutao_org", "挖鼻屎":"kbs_org", "good":"http://timg.sjs.sinajs.cn/t3/style/images/common/face/ext/normal/d8/good_thumb.gif",
    "弱":"http://timg.sjs.sinajs.cn/t3/style/images/common/face/ext/normal/d8/sad_org.gif",
    "嘘":"http://timg.sjs.sinajs.cn/t3/style/images/common/face/ext/normal/a6/x_thumb.gif",
    "花心":"http://timg.sjs.sinajs.cn/t3/style/images/common/face/ext/normal/64/hs_org.gif"
};

// http://api.t.sina.com.cn/emotions.json
var TSINA_API_EMOTIONS = 
{"\u78d5\u5934": "6a/kt_org.gif", "\u53f3\u54fc\u54fc": "98/yhh_org.gif", "\u4e0d\u516c\u5e73": "85/bgp_org.gif", "\u82b1\u5fc3": "64/hs_org.gif", "\u7535\u5f71": "77/movie_org.gif", "0": "d8/ling_org.gif", "\u59d4\u5c48": "73/wq_org.gif", "\u767d\u773c": "24/baiyan_org.gif", "\u53cc\u5b50\u5ea7": "d4/szz_org.gif", "\u9f99\u5377\u98ce": "6a/ljf_org.gif", "\u53ef\u7231": "9c/tz_org.gif", "\u62cd\u7167": "ec/pz_org.gif", "\u5de8\u87f9": "d2/jxz2_org.gif", "\u62b1\u6795": "f4/bz3_org.gif", "\u7bee\u7403": "2c/bball_org.gif", "\u732a\u5934": "58/pig.gif", "\u72d7": "5d/g_org.gif", "\u6e38\u6cf3": "b9/swimming_org.gif", "\u54c8\u5c3c\u5154\u8036": "53/honeyoye_org.gif", "\u53f9\u53f7": "3b/th_org.gif", "\u8d5e": "d0/z2_org.gif", "\u9c9c\u82b1": "6c/flower_org.gif", "\u72ee\u5b50\u5ea7": "23/leo_org.gif", "\u9017\u53f7": "cc/dh_org.gif", "\u8870": "af/cry.gif", "\u624b\u5957": "72/shoutao_org.gif", "\u5403\u60ca": "f4/cj_org.gif", "\u5207": "1d/q_org.gif", "\u4e86\u4e0d\u8d77\u7231": "11/2liaobuqiai_org.gif", "\u751f\u75c5\u4e86": "19/shengbing_org.gif", "\u54c8\u54c8": "6a/laugh.gif", "\u591a\u95ee\u53f7": "17/wh2_org.gif", "\u54c7\u54c8\u54c8": "cc/whh_org.gif", "\u661f": "0b/star_org.gif", "\u4e50\u4e50": "66/guanbuzhao_org.gif", "\u623f\u5b50": "d1/house_org.gif", "\u56f4\u8116": "3f/weijin_org.gif", "\u563f": "d3/01_org.gif", "\u53d1\u55f2": "4e/fd_org.gif", "\u6d2a\u6c34": "ba/hs2_org.gif", "\u4ea4\u7ed9\u6211\u5427": "e2/jgwb_org.gif", "\u7ed9\u529b": "c9/geili_org.gif", "\u6765": "40/come_org.gif", "\u6700\u5dee": "3e/bad_org.gif", "\u5de6\u62b1\u62b1": "54/left_org.gif", "\u9ec4\u724c": "a0/yellowcard.gif", "\u8bdd\u7b52": "1b/m_org.gif", "\u653e\u7535": "fd/fangdian_org.gif", "\u5e05": "36/s2_org.gif", "\u5e3d\u5b50": "25/hat_org.gif", "\u94f6\u724c": "1e/yinpai_org.gif", "\u53f6\u5b50": "b8/green_org.gif", "\u5c04\u624b\u5ea7": "5d/ssz_org.gif", "\u8036": "d9/ye_org.gif", "\u5b9e\u4e60": "48/sx_org.gif", "\u5929\u874e\u5ea7": "09/txz_org.gif", "\u4e0d": "a2/bx2_org.gif", "haha": "13/ha_org.gif", "\u6469\u7faf\u5ea7": "da/mjz_org.gif", "\u897f\u74dc": "6b/watermelon.gif", "\u8272": "a1/se_org.gif", "\u75db\u54ed": "eb/gd_org.gif", "\u9876": "91/d_org.gif", "\u88ab\u7838": "5a/bz2_org.gif", "\u55b5\u545c": "a7/weiqu_org.gif", "\u7fbd\u6bdb\u7403": "77/badminton_org.gif", "\u7784": "14/miao_org.gif", "high": "e7/f_org.gif", "\u7d27\u5f20": "75/jinzhang_org.gif", "\u5927\u7b11": "6a/laugh_org.gif", "\u5370\u8ff9": "84/foot_org.gif", "\u5154\u5b50": "81/rabbit_org.gif", "\u4e52\u4e53\u7403": "a5/pingpong_org.gif", "1": "9b/1_org.gif", "\u4e0d\u5c51": "b0/bx_org.gif", "\u626f\u8138": "99/chelian_org.gif", "\u95ee\u53f7": "9d/wh_org.gif", "\u5c04\u624b": "46/ssz2_org.gif", "\u4e0d\u5173\u6211\u4e8b": "e8/bgws_org.gif", "\u767d\u7f8a\u5ea7": "e0/byz_org.gif", "\u6655": "a4/dizzy.gif", "\u94dc\u724c": "26/tongpai_org.gif", "\u51b0\u68cd": "3a/ice.gif", "\u624b\u821e\u8db3\u8e48": "b2/gx_org.gif", "\u65e0\u804a": "53/wl_org.gif", "\u54a6": "9f/yiwen_org.gif", "\u5723\u8bde\u94c3\u94db": "64/chrisbell_org.gif", "\u60b2\u5267": "ea/beiju_org.gif", "\u4e0a\u706b": "64/bf_org.gif", "\u793c\u82b1": "3d/bingo_org.gif", "\u5f97\u610f": "fb/dy_org.gif", "\u95ea\u7535": "e3/sh_org.gif", "\u53ef\u601c": "af/kl_org.gif", "\u5618": "a6/x_org.gif", "\u6c34\u74f6\u5ea7": "00/spz_org.gif", "\u949f": "d3/clock_org.gif", "\u98de\u673a": "6d/travel_org.gif", "\u5fc3\u52a8": "5f/xd_org.gif", "\u81ea\u884c\u8f66": "46/zxc_org.gif", "\u55b5": "a0/miaomiao_org.gif", "\u8336": "a8/cha_org.gif", "good": "d8/good_org.gif", "\u8c03\u620f": "f7/tiaoxi_org.gif", "\u8737": "87/q2_org.gif", "\u5618\u5618": "cf/xu_org.gif", "\u9152": "39/j2_org.gif", "kiss": "59/kiss2_org.gif", "\u8db3\u7403": "c0/football.gif", "\u4e07\u5723\u8282": "73/nanguatou2_org.gif", "\u6708\u997c": "96/mooncake3_org.gif", "\u5927\u60ca": "74/suprise_org.gif", "\u4e50\u548c": "5f/m2_org.gif", "\u5f69\u8679": "03/ch_org.gif", "\u96ea\u4eba": "d9/xx2_org.gif", "\u4e0b\u96e8": "50/rain.gif", "yeah": "1a/yeah_org.gif", "\u9ed1\u7ebf": "91/h_org.gif", "\u5904\u5973\u5ea7": "09/cnz_org.gif", "\u4e0d\u9519\u54e6": "79/bco_org.gif", "\u4f60\u61c2\u7684": "2e/nidongde_org.gif", "\u505a\u9b3c\u8138": "88/zgl_org.gif", "\u98ce\u6247": "92/fan.gif", "7": "43/7_org.gif", "\u5f00\u5fc3": "40/happy_org.gif", "\u6643": "bf/h2_org.gif", "orz": "c0/orz1_org.gif", "\u72c2\u7b11": "d5/zk_org.gif", "\u52a0\u6211\u4e00\u4e2a": "ee/plus1_org.gif", "\u7167\u76f8\u673a": "33/camera_org.gif", "\u793c\u7269": "c4/liwu_org.gif", "\u5c04\u95e8": "e0/zuqiu_org.gif", "\u95ea": "ce/03_org.gif", "\u7761\u89c9": "7d/sleep_org.gif", "\u81ea\u63d2\u53cc\u76ee": "d3/zichashuangmu_org.gif", "\u795e\u9a6c": "60/horse2_org.gif", "\u6311\u7709": "c9/tiaomei_org.gif", "\u8272\u772f\u772f": "90/semimi_org.gif", "\u819c\u62dc": "9f/mb2_org.gif", "\u6012": "57/angry.gif", "\u9762\u62bd": "fd/mianchou_org.gif", "\u5de7\u514b\u529b": "b1/qkl_org.gif", "\u63e1\u624b": "0c/ws_org.gif", "\u706b\u70ac": "3b/hj_org.gif", "\u82b1": "6c/flower.gif", "\u7535\u89c6\u673a": "b3/tv_org.gif", "2": "2c/2_org.gif", "\u6012\u9a82": "89/nm_org.gif", "\u5723\u8bde\u6811": "a2/christree_org.gif", "\u653e\u5f00": "55/fangkai_org.gif", "\u53bb": "6b/go_org.gif", "\u5fc3": "6d/heart.gif", "\u751f\u6c14": "0a/shengqi_org.gif", "\u53cc\u5b50": "89/szz2_org.gif", "\u62dc\u62dc": "70/88_org.gif", "\u97f3\u4e50": "d0/music_org.gif", "\u63ea\u8033\u6735": "15/j3_org.gif", "\u72af\u9519": "19/fc_org.gif", "\u7f8e\u5473": "c1/meiwei_org.gif", "\u94bb\u6212": "31/r_org.gif", "\u51fb\u5251": "38/jijian_org.gif", "\u6cea\u5954": "34/lb_org.gif", "\u8df3\u7ef3": "79/ts_org.gif", "\u843d\u53f6": "79/yellowMood_org.gif", "886": "6f/886_org.gif", "\u5dee\u5f97\u8fdc\u5462": "ee/cdyn_org.gif", "\u9b3c\u8138": "14/guilian_org.gif", "\u9633\u5149": "1a/sunny_org.gif", "\u597d\u53ef\u601c": "76/kelian_org.gif", "\u53e5\u53f7": "9b/jh_org.gif", "\u96ea": "00/snow_org.gif", "\u91d1\u725b\u5ea7": "8d/jnz_org.gif", "\u75de\u75de\u5154\u56e7": "38/jiong_org.gif", "\u4f24\u5fc3": "ea/unheart.gif", "\u7231": "09/ai_org.gif", "\u6c34\u74f6": "1b/spz2_org.gif", "\u6253\u9488": "b0/zt_org.gif", "\u594b\u6597": "4e/fendou_org.gif", "\u5723\u8bde\u889c": "08/chrisocks_org.gif", "\u70ed\u543b": "60/rw_org.gif", "\u6742\u6280": "ec/zs_org.gif", "\u8def\u8fc7": "70/lg_org.gif", "\u62dc\u6258": "6e/bt_org.gif", "\u5929\u79e4": "6b/tpz2_org.gif", "\u6cea": "d8/sad.gif", "\u9177": "40/cool_org.gif", "\u9634\u9669": "6d/yx_org.gif", "\u9ad8\u5174": "c7/gx3_org.gif", "\u96fe": "68/w_org.gif", "\u7c89\u7ea2\u4e1d\u5e26": "77/pink_org.gif", "\u5b85": "d7/z_org.gif", "\u9ed18": "6b/black8_org.gif", "\u5410": "9e/t_org.gif", "\u624b\u8d31": "b8/shoujian_org.gif", "\u601d\u8003": "e9/sk_org.gif", "\u72ee\u5b50": "4a/leo2_org.gif", "\u53cc\u9c7c": "e2/syz2_org.gif", "\u52a0\u6cb9": "d4/jiayou_org.gif", "8": "6d/8_org.gif", "\u7ec7": "41/zz2_org.gif", "\u592a\u5f00\u5fc3": "58/mb_org.gif", "\u56fd\u65d7": "dc/flag_org.gif", "\u4e0d\u8981": "c7/no_org.gif", "\u56e7": "15/j_org.gif", "\u8df3\u821e\u82b1": "70/twh_org.gif", "\u5a9a\u773c": "32/meiyan_org.gif", "\u5475\u5475": "eb/smile.gif", "\u53d1\u594b": "31/d2_org.gif", "\u4e0d\u77e5\u6240\u63aa": "ab/buzhisuocuo_org.gif", "\u7535\u8bdd": "9d/tel_org.gif", "\u7701\u7565\u53f7": "0d/shengluehao_org.gif", "\u6674\u8f6c\u591a\u4e91": "d2/qzdy_org.gif", "\u5472\u7259": "c1/ciya_org.gif", "\u75f4\u5446": "e8/chidai_org.gif", "\u5fae\u7b11": "05/weixiao_org.gif", "\u7cd6\u679c": "34/candy_org.gif", "\u5c04\u7bad": "40/shejian_org.gif", "\u60b2\u4f24": "1a/bs_org.gif", "3": "f3/3_org.gif", "mua": "c6/muamua_org.gif", "\u9634\u5929": "37/dark_org.gif", "\u6e29\u6696\u5e3d\u5b50": "f1/wennuanmaozi_org.gif", "\u5965\u7279\u66fc": "bc/otm_org.gif", "\u767d\u7f8a": "07/byz2_org.gif", "\u597d\u56f0": "8b/sleepy_org.gif", "\u5fc5\u80dc": "cf/bs3_org.gif", "\u5723\u8bde\u8001\u4eba": "c5/chrisfather_org.gif", "\u56e7\u8033\u6735": "f0/jiongerduo_org.gif", "\u53cc\u9c7c\u5ea7": "7f/syz_org.gif", "\u6211\u5403": "00/wochiwode_org.gif", "\u4e3e\u91cd": "14/juzhong_org.gif", "6": "dc/6_org.gif", "\u611f\u5192": "a0/gm_org.gif", "\u5de6\u54fc\u54fc": "6d/zhh_org.gif", "\u5723\u8bde\u5e3d": "06/chrishat_org.gif", "\u8138\u53d8\u8272": "cd/lbs_org.gif", "\u6863\u6848": "ce/gz2_org.gif", "\u94b1": "90/money_org.gif", "\u5de5\u4f5c": "b2/gz3_org.gif", "\u7325\u7410": "e1/weisuo_org.gif", "\u7206\u53d1": "38/fn2_org.gif", "\u7eff\u4e1d\u5e26": "b8/green.gif", "\u611f\u52a8": "7c/gandong_org.gif", "\u5e86\u795d": "67/06_org.gif", "\u661f\u661f\u773c": "5c/stareyes_org.gif", "\u6050\u6016": "86/kb_org.gif", "\u751f\u75c5": "b6/sb_org.gif", "\u62b1\u62b1": "7c/bb_org.gif", "\u6253\u7259": "d7/taihaoxiaole_org.gif", "\u91d1\u725b": "3b/jnz2_org.gif", "\u5929\u874e": "1e/txz2_org.gif", "\u75de\u75de\u5154\u8036": "19/pipioye_org.gif", "\u91d1\u724c": "f4/jinpai_org.gif", "\u6012\u543c": "4d/nh_org.gif", "\u543c\u543c": "34/05_org.gif", "\u60ca\u6050": "46/jingkong_org.gif", "\u6295\u7bee": "7a/basketball_org.gif", "\u51b2\u950b": "2f/cf_org.gif", "\u6012\u6c14": "ea/angery_org.gif", "\u96e8\u4f1e": "33/umb_org.gif", "\u7231\u5fc3\u4f20\u9012": "c9/axcd_org.gif", "\u5de8\u87f9\u5ea7": "a3/jxz_org.gif", "\u70e6\u8e81": "c5/fanzao_org.gif", "\u4eb2": "05/kiss_org.gif", "\u6708\u4eae": "b9/moon.gif", "\u5192\u4e2a\u6ce1": "32/maogepao_org.gif", "9": "26/9_org.gif", "\u4e92\u7c89": "89/hufen_org.gif", "\u641e\u7b11": "09/gx2_org.gif", "\u5e05\u7206": "c1/shuaibao_org.gif", "\u6b22\u6b23\u9f13\u821e": "2b/hxgw_org.gif", "\u98ce": "74/gf_org.gif", "v5": "c5/v5_org.gif", "\u998b\u5634": "b8/cz_org.gif", "\u56e2": "11/tuan_org.gif", "\u6311\u9017": "3c/tiaodou_org.gif", "\u6015\u6015": "7c/pp_org.gif", "\u6fc0\u52a8": "bb/jidong_org.gif", "\u8e6d": "33/c_org.gif", "\u836f": "5d/y_org.gif", "\u6253\u54c8\u6c14": "f3/k_org.gif", "\u62bd\u8033\u5149": "eb/ceg_org.gif", "\u5706": "53/yuan_org.gif", "\u840c": "42/kawayi_org.gif", "\u624b\u673a": "4b/sj2_org.gif", "\u56f4\u89c2": "f2/wg_org.gif", "\u6254\u9e21\u86cb": "91/rjd_org.gif", "\u75b2\u52b3": "d1/pilao_org.gif", "\u7231\u4f60": "7e/love.gif", "4": "2c/4_org.gif", "\u6392\u7403": "cf/volleyball_org.gif", "\u6293\u72c2": "4d/crazy.gif", "\u56e2\u5706\u6708\u997c": "e6/tuanyuan_org.gif", "\u63c9": "d6/knead_org.gif", "\u53f3\u62b1\u62b1": "0d/right_org.gif", "\u7535\u8111": "df/dn_org.gif", "\u6c7d\u8f66": "a4/jc_org.gif", "\u7f8e\u597d": "ae/mh_org.gif", "\u6469\u7faf": "16/mjz2_org.gif", "\u6d6e\u4e91": "bc/fuyun_org.gif", "\u5927\u54ed": "af/cry_org.gif", "\u7ea2\u5305": "71/hongbao_org.gif", "\u5e72\u676f": "bd/cheer.gif", "\u60ca\u8bb6": "dc/jingya_org.gif", "\u6124\u6012": "bd/fn_org.gif", "\u94bb\u77f3": "9f/diamond_org.gif", "\u6d41\u661f": "8e/lx_org.gif", "\u51bb\u7ed3": "d3/sjdj_org.gif", "\u9ab7\u9ac5": "bd/kl2_org.gif", "\u545c\u545c": "55/bya_org.gif", "\u5455\u5410": "75/sick_org.gif", "\u5f31": "d8/sad_org.gif", "\u95ed\u5634": "29/bz_org.gif", "\u4fbf\u4fbf": "34/s_org.gif", "\u6c57\u4e86": "7d/han_org.gif", "\u563b\u563b": "c2/tooth.gif", "\u6655\u6b7b\u4e86": "a4/dizzy_org.gif", "\u592a\u9633": "e5/sun.gif", "\u6c57": "13/sweat.gif", "\u7728\u7728\u773c": "3b/zy2_org.gif", "\u4e0d\u5012\u7fc1": "b6/bdw_org.gif", "\u5c0f\u4eba\u5f97\u5fd7": "09/xrdz_org.gif", "\u5927\u6c57": "13/sweat_org.gif", "ok": "d6/ok_org.gif", "\u7ba1\u4e0d\u7740\u7231": "78/2guanbuzhao1_org.gif", "\u9e2d\u68a8": "bb/pear_org.gif", "\u56f0": "8b/sleepy.gif", "\u559c\u6b22": "5f/xh_org.gif", "\u9f13\u638c": "1b/gz_org.gif", "\u8721\u70db": "cc/candle.gif", "\u54fc": "19/hate.gif", "\u6247\u5b50\u906e\u9762": "a1/coverface_org.gif", "\u61d2\u5f97\u7406\u4f60": "17/ldln_org.gif", "\u4e0d\u6d3b\u4e86": "37/lb2_org.gif", "\u5f3a\u543b": "b1/q3_org.gif", "\u4eb2\u8033\u6735": "1c/qinerduo_org.gif", "\u53f0\u98ce": "55/tf_org.gif", "\u5531\u6b4c": "79/ktv_org.gif", "\u5496\u5561": "64/cafe_org.gif", "\u591a\u4e91\u8f6c\u6674": "f3/dyzq_org.gif", "\u4eb2\u4eb2": "8f/qq_org.gif", "\u60ca\u54ed": "0c/supcry_org.gif", "\u7ea2\u724c": "64/redcard.gif", "\u62f3\u5934": "cc/o_org.gif", "\u629a\u6478": "78/touch_org.gif", "\u55b7": "4a/pen_org.gif", "\u5927\u5df4": "9c/dynamicbus_org.gif", "\u5fae\u98ce": "a5/wind_org.gif", "\u5931\u671b": "0c/sw_org.gif", "\u718a\u732b": "6e/panda_org.gif", "\u94a2\u7434": "b2/gq_org.gif", "\u6324\u773c": "c3/zy_org.gif", "\u6316\u9f3b\u5c4e": "b6/kbs_org.gif", "\u6709\u94b1": "e6/youqian_org.gif", "\u6ee1\u6708": "5d/moon1_org.gif", "\u54ed": "79/ku_org.gif", "\u86cb\u7cd5": "6a/cake.gif", "\u5904\u5973": "62/cnz2_org.gif", "\u5c0f\u4e11": "6b/xc_org.gif", "\u9152\u58f6": "64/wine_org.gif", "\u4e66\u5446\u5b50": "61/sdz_org.gif", "\u624b\u7eb8": "55/sz_org.gif", "\u559c": "bf/xi_org.gif", "\u7591\u95ee": "5c/yw_org.gif", "\u5435\u95f9": "fa/cn_org.gif", "\u51a4": "5f/wq2_org.gif", "\u5a01\u6b66": "70/vw_org.gif", "\u89c1\u94b1": "2b/jianqian_org.gif", "\u5c34\u5c2c": "43/gg_org.gif", "5": "d5/5_org.gif", "\u5077\u7b11": "7e/hei_org.gif", "\u54ac\u624b\u5e15": "af/handkerchief_org.gif", "\u811a\u5370": "12/jy_org.gif", "\u53f9\u6c14": "90/tq_org.gif", "\u5bb3\u7f9e": "05/shame_org.gif", "\u6b22\u6b22": "c3/liaobuqi_org.gif", "\u6c99\u5c18\u66b4": "69/sc_org.gif", "\u9119\u89c6": "71/bs2_org.gif", "\u5566\u5566": "c1/04_org.gif", "\u54e8\u5b50": "a0/shao.gif", "\u51b0\u96f9": "05/bb2_org.gif", "\u5929\u79e4\u5ea7": "c1/tpz_org.gif"};

//嘀咕的表情
//http://images.digu.com/web_res_v1/emotion/**.gif
var DIGU_EMOTIONS = {
    "微笑": "01", "我晕": "02", "口水": "03", "开心": "04", "鄙视": "05", 
    "我汗": "06", "好爽": "07", "偷笑": "08", "暴走": "09", "垂泪": "10", 
    "死定": "11", "傲慢": "12", "发怒": "13", "害羞": "14", "吃惊": "15", 
    "瞌睡": "16", "阴险": "17", "伤心": "18", "郁闷": "19", "摇头": "20", 
    "牛逼": "21", "呕吐": "22", "可怜": "23", "耍酷": "24", "雷死": "25", 
    "怒吼": "26", "啥玩意儿？": "27", 
    "28":"28", "29":"29", "30":"30", "31":"31", "32":"32"
};

//人间的表情 [//smile]
var RENJIAN_EMOTIONS = {
   "smile":[
      "微笑",
      "0px 0px"
   ],
   "heart":[
      "色",
      "-30px 0px"
   ],
   "yum":[
      "满足",
      "-60px 0px"
   ],
   "laugh":[
      "憨笑",
      "-90px 0px"
   ],
   "grin":[
      "可爱",
      "-120px 0px"
   ],
   "tongue":[
      "调皮",
      "-150px 0px"
   ],
   "hot":[
      "得意",
      "-180px 0px"
   ],
   "ambivalent":[
      "不高兴",
      "-210px 0px"
   ],
   "blush":[
      "害羞",
      "-240px 0px"
   ],
   "frown":[
      "低落",
      "-270px 0px"
   ],
   "halo":[
      "炯炯有神",
      "0px -30px"
   ],
   "crazy":[
      "猥琐",
      "-30px -30px"
   ],
   "crying":[
      "哭",
      "-60px -30px"
   ],
   "undecided":[
      "傲慢",
      "-90px -30px"
   ],
   "naughty":[
      "魔鬼",
      "-120px -30px"
   ],
   "lips":[
      "闭嘴",
      "-150px -30px"
   ],
   "nerd":[
      "得意",
      "-180px -30px"
   ],
   "kiss":[
      "亲亲",
      "-210px -30px"
   ],
   "pirate":[
      "海盗",
      "-240px -30px"
   ],
   "gasp":[
      "惊讶",
      "-270px -30px"
   ],
   "foot":[
      "擦汗",
      "0px -60px"
   ],
   "largegasp":[
      "衰",
      "-30px -60px"
   ],
   "veryangry":[
      "抓狂",
      "-60px -60px"
   ],
   "angry":[
      "无奈",
      "-90px -60px"
   ],
   "confused":[
      "晕",
      "-120px -60px"
   ],
   "sick":[
      "我吐",
      "-150px -60px"
   ],
   "moneymouth":[
      "吐钱",
      "-180px -60px"
   ],
   "ohnoes":[
      "糗大了",
      "-210px -60px"
   ],
   "wink":[
      "眨眼",
      "-240px -60px"
   ],
   "sarcastic":[
      "阴险",
      "-270px -60px"
   ],
   "up":[
      "顶",
      "0px -90px"
   ],
   "down":[
      "鄙视",
      "-30px -90px"
   ],
   "candle":[
      "蜡烛",
      "-60px -90px"
   ],
   "flower":[
      "鲜花",
      "-90px -90px"
   ],
   "ribbon":[
      "丝带",
      "-120px -90px"
   ]
};

// TQQ表情
var TQQ_EMOTIONS = {
	'微笑': '14',
	'撇嘴': '1',
	'色': '2',
	'发呆': '3',
	'得意': '4',
	'流泪': '5',
	'害羞': '6',
	'闭嘴': '7',
	'睡': '8',
	'大哭': '9',
	'尴尬': '10',
	'发怒': '11',
	'调皮': '12',
	'呲牙': '13',
	'惊讶': '0',
	'难过': '15',
	'酷': '16',
	'冷汗': '17',
	'抓狂': '18',
	'吐': '19',
	'偷笑': '20',
	'可爱': '21',
	'白眼': '22',
	'傲慢': '23'
};