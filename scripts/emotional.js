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
// 星座
//"天蝎座": "09/txz_thumb.gif", "天秤座": "c1/tpz_thumb.gif", "双子座": "d4/szz_thumb.gif", "双鱼座": "7f/syz_thumb.gif", "射手座": "5d/ssz_thumb.gif", "水瓶座": "00/spz_thumb.gif", "摩羯座": "da/mjz_thumb.gif", "狮子座": "23/leo_thumb.gif", "巨蟹座": "a3/jxz_thumb.gif", "金牛座": "8d/jnz_thumb.gif", "处女座": "09/cnz_thumb.gif", 
//"白羊座": "e0/byz_thumb.gif"
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
{"呵呵":"eb/smile.gif","嘻嘻":"c2/tooth.gif","哈哈":"6a/laugh.gif","爱你":"7e/love.gif","晕":"a4/dizzy.gif","泪":"d8/sad.gif","馋嘴":"b8/cz_org.gif","抓狂":"4d/crazy.gif","哼":"19/hate.gif","可爱":"9c/tz_org.gif","怒":"57/angry.gif","汗":"13/sweat.gif","困":"8b/sleepy.gif","害羞":"05/shame_org.gif","睡觉":"7d/sleep_org.gif","钱":"90/money_org.gif","偷笑":"7e/hei_org.gif","酷":"40/cool_org.gif","衰":"af/cry.gif","吃惊":"f4/cj_org.gif","闭嘴":"29/bz_org.gif","鄙视":"71/bs2_org.gif","挖鼻屎":"b6/kbs_org.gif","花心":"64/hs_org.gif","鼓掌":"1b/gz_org.gif","失望":"0c/sw_org.gif","思考":"e9/sk_org.gif","生病":"b6/sb_org.gif","亲亲":"8f/qq_org.gif","怒骂":"89/nm_org.gif","太开心":"58/mb_org.gif","懒得理你":"17/ldln_org.gif","右哼哼":"98/yhh_org.gif","左哼哼":"6d/zhh_org.gif","嘘":"a6/x_org.gif","委屈":"73/wq_org.gif","吐":"9e/t_org.gif","可怜":"af/kl_org.gif","打哈气":"f3/k_org.gif","做鬼脸":"88/zgl_org.gif","握手":"0c/ws_org.gif","耶":"d9/ye_org.gif","good":"d8/good_org.gif","弱":"d8/sad_org.gif","不要":"c7/no_org.gif","ok":"d6/ok_org.gif","赞":"d0/z2_org.gif","来":"40/come_org.gif","蛋糕":"6a/cake.gif","心":"6d/heart.gif","伤心":"ea/unheart.gif","钟":"d3/clock_org.gif","猪头":"58/pig.gif","咖啡":"64/cafe_org.gif","话筒":"1b/m_org.gif","干杯":"bd/cheer.gif","绿丝带":"b8/green.gif","蜡烛":"cc/candle.gif","微风":"a5/wind_org.gif","月亮":"b9/moon.gif","金牌":"f4/jinpai_org.gif","银牌":"1e/yinpai_org.gif","铜牌":"26/tongpai_org.gif","国旗":"dc/flag_org.gif","织":"41/zz2_org.gif","围观":"f2/wg_org.gif","威武":"70/vw_org.gif","奥特曼":"bc/otm_org.gif","围脖":"3f/weijin_org.gif","温暖帽子":"f1/wennuanmaozi_org.gif","手套":"72/shoutao_org.gif","落叶":"79/yellowMood_org.gif","照相机":"33/camera_org.gif","白云":"ff/y3_org.gif","礼物":"c4/liwu_org.gif","管不着爱":"78/2guanbuzhao1_org.gif","爱":"09/ai_org.gif","了不起爱":"11/2liaobuqiai_org.gif","火鸡":"a2/huoji2_org.gif","感":"63/gan_org.gif","恩":"d7/en_org.gif","花":"6c/flower.gif","绿丝带":"b8/green.gif","爱心传递":"c9/axcd_org.gif","蜡烛":"cc/candle.gif","加油":"d4/jiayou_org.gif","国旗":"dc/flag_org.gif","金牌":"f4/jinpai_org.gif","银牌":"1e/yinpai_org.gif","铜牌":"26/tongpai_org.gif","哨子":"a0/shao.gif","黄牌":"a0/yellowcard.gif","红牌":"64/redcard.gif","足球":"c0/football.gif","篮球":"2c/bball_org.gif","黑8":"6b/black8_org.gif","排球":"cf/volleyball_org.gif","游泳":"b9/swimming_org.gif","乒乓球":"a5/pingpong_org.gif","投篮":"7a/basketball_org.gif","羽毛球":"77/badminton_org.gif","射门":"e0/zuqiu_org.gif","射箭":"40/shejian_org.gif","举重":"14/juzhong_org.gif","击剑":"38/jijian_org.gif","挤眼":"c3/zy_org.gif","亲亲":"8f/qq_org.gif","怒骂":"89/nm_org.gif","太开心":"58/mb_org.gif","懒得理你":"17/ldln_org.gif","打哈气":"f3/k_org.gif","生病":"b6/sb_org.gif","书呆子":"61/sdz_org.gif","失望":"0c/sw_org.gif","可怜":"af/kl_org.gif","挖鼻屎":"b6/kbs_org.gif","黑线":"91/h_org.gif","花心":"64/hs_org.gif","可爱":"9c/tz_org.gif","吐":"9e/t_org.gif","委屈":"73/wq_org.gif","思考":"e9/sk_org.gif","哈哈":"6a/laugh.gif","嘘":"a6/x_org.gif","右哼哼":"98/yhh_org.gif","左哼哼":"6d/zhh_org.gif","疑问":"5c/yw_org.gif","阴险":"6d/yx_org.gif","做鬼脸":"88/zgl_org.gif","爱你":"7e/love.gif","馋嘴":"b8/cz_org.gif","顶":"91/d_org.gif","钱":"90/money_org.gif","嘻嘻":"c2/tooth.gif","汗":"13/sweat.gif","呵呵":"eb/smile.gif","睡觉":"7d/sleep_org.gif","困":"8b/sleepy.gif","害羞":"05/shame_org.gif","悲伤":"1a/bs_org.gif","鄙视":"71/bs2_org.gif","抱抱":"7c/bb_org.gif","拜拜":"70/88_org.gif","怒":"57/angry.gif","吃惊":"f4/cj_org.gif","闭嘴":"29/bz_org.gif","泪":"d8/sad.gif","偷笑":"7e/hei_org.gif","哼":"19/hate.gif","晕":"a4/dizzy.gif","衰":"af/cry.gif","抓狂":"4d/crazy.gif","愤怒":"bd/fn_org.gif","感冒":"a0/gm_org.gif","鼓掌":"1b/gz_org.gif","酷":"40/cool_org.gif","来":"40/come_org.gif","good":"d8/good_org.gif","haha":"13/ha_org.gif","不要":"c7/no_org.gif","ok":"d6/ok_org.gif","拳头":"cc/o_org.gif","弱":"d8/sad_org.gif","握手":"0c/ws_org.gif","赞":"d0/z2_org.gif","耶":"d9/ye_org.gif","最差":"3e/bad_org.gif","右抱抱":"0d/right_org.gif","左抱抱":"54/left_org.gif","火鸡":"a2/huoji2_org.gif","感":"63/gan_org.gif","恩":"d7/en_org.gif","礼物":"c4/liwu_org.gif","万圣节":"73/nanguatou2_org.gif","喜":"bf/xi_org.gif","温暖帽子":"f1/wennuanmaozi_org.gif","围脖":"3f/weijin_org.gif","手套":"72/shoutao_org.gif","红包":"71/hongbao_org.gif","大巴":"9c/dynamicbus_org.gif","落叶":"79/yellowMood_org.gif","火炬":"3b/hj_org.gif","酒壶":"64/wine_org.gif","月饼":"96/mooncake3_org.gif","满月":"5d/moon1_org.gif","飞机":"6d/travel_org.gif","自行车":"46/zxc_org.gif","药":"5d/y_org.gif","手纸":"55/sz_org.gif","手机":"4b/sj2_org.gif","钻戒":"31/r_org.gif","巧克力":"b1/qkl_org.gif","脚印":"12/jy_org.gif","汽车":"a4/jc_org.gif","酒":"39/j2_org.gif","狗":"5d/g_org.gif","工作":"b2/gz3_org.gif","档案":"ce/gz2_org.gif","叶子":"b8/green_org.gif","钢琴":"b2/gq_org.gif","印迹":"84/foot_org.gif","电脑":"df/dn_org.gif","钻石":"9f/diamond_org.gif","钟":"d3/clock_org.gif","茶":"a8/cha_org.gif","照相机":"33/camera_org.gif","西瓜":"6b/watermelon.gif","雨伞":"33/umb_org.gif","电视机":"b3/tv_org.gif","电话":"9d/tel_org.gif","太阳":"e5/sun.gif","星":"0b/star_org.gif","哨子":"a0/shao.gif","话筒":"1b/m_org.gif","音乐":"d0/music_org.gif","电影":"77/movie_org.gif","月亮":"b9/moon.gif","唱歌":"79/ktv_org.gif","冰棍":"3a/ice.gif","房子":"d1/house_org.gif","帽子":"25/hat_org.gif","足球":"c0/football.gif","鲜花":"6c/flower_org.gif","花":"6c/flower.gif","风扇":"92/fan.gif","干杯":"bd/cheer.gif","蛋糕":"6a/cake.gif","咖啡":"64/cafe_org.gif","奥特曼":"bc/otm_org.gif","囧":"15/j_org.gif","宅":"d7/z_org.gif","扔鸡蛋":"91/rjd_org.gif","围观":"f2/wg_org.gif","威武":"70/vw_org.gif","织":"41/zz2_org.gif","orz":"c0/orz1_org.gif","实习":"48/sx_org.gif","小丑":"6b/xc_org.gif","帅":"36/s2_org.gif","猪头":"58/pig.gif","骷髅":"bd/kl2_org.gif","便便":"34/s_org.gif","雪人":"d9/xx2_org.gif","热吻":"60/rw_org.gif","伤心":"ea/unheart.gif","黄牌":"a0/yellowcard.gif","红牌":"64/redcard.gif","跳舞花":"70/twh_org.gif","礼花":"3d/bingo_org.gif","打针":"b0/zt_org.gif","叹号":"3b/th_org.gif","问号":"9d/wh_org.gif","句号":"9b/jh_org.gif","逗号":"cc/dh_org.gif","1":"9b/1_org.gif","2":"2c/2_org.gif","3":"f3/3_org.gif","4":"2c/4_org.gif","5":"d5/5_org.gif","6":"dc/6_org.gif","7":"43/7_org.gif","8":"6d/8_org.gif","9":"26/9_org.gif","0":"d8/ling_org.gif","闪":"ce/03_org.gif","啦啦":"c1/04_org.gif","吼吼":"34/05_org.gif","庆祝":"67/06_org.gif","嘿":"d3/01_org.gif","省略号":"0d/shengluehao_org.gif","kiss":"59/kiss2_org.gif","圆":"53/yuan_org.gif","团":"11/tuan_org.gif","团圆月饼":"e6/tuanyuan_org.gif","欢欢":"c3/liaobuqi_org.gif","乐乐":"66/guanbuzhao_org.gif","粉红丝带":"77/pink_org.gif","爱心传递":"c9/axcd_org.gif","心":"6d/heart.gif","绿丝带":"b8/green.gif","蜡烛":"cc/candle.gif","白云":"ff/y3_org.gif","雾":"68/w_org.gif","台风":"55/tf_org.gif","沙尘暴":"69/sc_org.gif","晴转多云":"d2/qzdy_org.gif","流星":"8e/lx_org.gif","龙卷风":"6a/ljf_org.gif","洪水":"ba/hs2_org.gif","风":"74/gf_org.gif","多云转晴":"f3/dyzq_org.gif","彩虹":"03/ch_org.gif","冰雹":"05/bb2_org.gif","微风":"a5/wind_org.gif","阳光":"1a/sunny_org.gif","雪":"00/snow_org.gif","闪电":"e3/sh_org.gif","下雨":"50/rain.gif","阴天":"37/dark_org.gif","白羊":"07/byz2_org.gif","射手":"46/ssz2_org.gif","双鱼":"e2/syz2_org.gif","双子":"89/szz2_org.gif","天秤":"6b/tpz2_org.gif","天蝎":"1e/txz2_org.gif","水瓶":"1b/spz2_org.gif","处女":"62/cnz2_org.gif","金牛":"3b/jnz2_org.gif","巨蟹":"d2/jxz2_org.gif","狮子":"4a/leo2_org.gif","摩羯":"16/mjz2_org.gif","天蝎座":"09/txz_org.gif","天秤座":"c1/tpz_org.gif","双子座":"d4/szz_org.gif","双鱼座":"7f/syz_org.gif","射手座":"5d/ssz_org.gif","水瓶座":"00/spz_org.gif","摩羯座":"da/mjz_org.gif","狮子座":"23/leo_org.gif","巨蟹座":"a3/jxz_org.gif","金牛座":"8d/jnz_org.gif","处女座":"09/cnz_org.gif","白羊座":"e0/byz_org.gif","猥琐":"e1/weisuo_org.gif","挑眉":"c9/tiaomei_org.gif","挑逗":"3c/tiaodou_org.gif","亲耳朵":"1c/qinerduo_org.gif","媚眼":"32/meiyan_org.gif","冒个泡":"32/maogepao_org.gif","囧耳朵":"f0/jiongerduo_org.gif","鬼脸":"14/guilian_org.gif","放电":"fd/fangdian_org.gif","悲剧":"ea/beiju_org.gif","欢欢":"c3/liaobuqi_org.gif","乐乐":"66/guanbuzhao_org.gif","管不着爱":"78/2guanbuzhao1_org.gif","爱":"09/ai_org.gif","了不起爱":"11/2liaobuqiai_org.gif","自插双目":"d3/zichashuangmu_org.gif","咦":"9f/yiwen_org.gif","嘘嘘":"cf/xu_org.gif","我吃":"00/wochiwode_org.gif","喵呜":"a7/weiqu_org.gif","v5":"c5/v5_org.gif","调戏":"f7/tiaoxi_org.gif","打牙":"d7/taihaoxiaole_org.gif","手贱":"b8/shoujian_org.gif","色":"a1/se_org.gif","喷":"4a/pen_org.gif","你懂的":"2e/nidongde_org.gif","喵":"a0/miaomiao_org.gif","美味":"c1/meiwei_org.gif","惊恐":"46/jingkong_org.gif","感动":"7c/gandong_org.gif","放开":"55/fangkai_org.gif","痴呆":"e8/chidai_org.gif","扯脸":"99/chelian_org.gif","不知所措":"ab/buzhisuocuo_org.gif","白眼":"24/baiyan_org.gif","小人得志":"09/xrdz_org.gif","哇哈哈":"cc/whh_org.gif","叹气":"90/tq_org.gif","冻结":"d3/sjdj_org.gif","切":"1d/q_org.gif","拍照":"ec/pz_org.gif","怕怕":"7c/pp_org.gif","怒吼":"4d/nh_org.gif","膜拜":"9f/mb2_org.gif","路过":"70/lg_org.gif","泪奔":"34/lb_org.gif","脸变色":"cd/lbs_org.gif","亲":"05/kiss_org.gif","恐怖":"86/kb_org.gif","交给我吧":"e2/jgwb_org.gif","欢欣鼓舞":"2b/hxgw_org.gif","高兴":"c7/gx3_org.gif","尴尬":"43/gg_org.gif","发嗲":"4e/fd_org.gif","犯错":"19/fc_org.gif","得意":"fb/dy_org.gif","吵闹":"fa/cn_org.gif","冲锋":"2f/cf_org.gif","抽耳光":"eb/ceg_org.gif","差得远呢":"ee/cdyn_org.gif","被砸":"5a/bz2_org.gif","拜托":"6e/bt_org.gif","必胜":"cf/bs3_org.gif","不关我事":"e8/bgws_org.gif","上火":"64/bf_org.gif","不倒翁":"b6/bdw_org.gif","不错哦":"79/bco_org.gif","烦躁":"c5/fanzao_org.gif","呲牙":"c1/ciya_org.gif","有钱":"e6/youqian_org.gif","微笑":"05/weixiao_org.gif","帅爆":"c1/shuaibao_org.gif","生气":"0a/shengqi_org.gif","生病了":"19/shengbing_org.gif","色眯眯":"90/semimi_org.gif","疲劳":"d1/pilao_org.gif","瞄":"14/miao_org.gif","哭":"79/ku_org.gif","好可怜":"76/kelian_org.gif","紧张":"75/jinzhang_org.gif","惊讶":"dc/jingya_org.gif","激动":"bb/jidong_org.gif","见钱":"2b/jianqian_org.gif","汗了":"7d/han_org.gif","奋斗":"4e/fendou_org.gif","yeah":"1a/yeah_org.gif","喜欢":"5f/xh_org.gif","心动":"5f/xd_org.gif","无聊":"53/wl_org.gif","手舞足蹈":"b2/gx_org.gif","搞笑":"09/gx2_org.gif","痛哭":"eb/gd_org.gif","爆发":"38/fn2_org.gif","发奋":"31/d2_org.gif","不屑":"b0/bx_org.gif","眨眨眼":"3b/zy2_org.gif","杂技":"ec/zs_org.gif","多问号":"17/wh2_org.gif","跳绳":"79/ts_org.gif","强吻":"b1/q3_org.gif","不活了":"37/lb2_org.gif","磕头":"6a/kt_org.gif","呜呜":"55/bya_org.gif","不":"a2/bx2_org.gif","狂笑":"d5/zk_org.gif","冤":"5f/wq2_org.gif","蜷":"87/q2_org.gif","美好":"ae/mh_org.gif","乐和":"5f/m2_org.gif","揪耳朵":"15/j3_org.gif","晃":"bf/h2_org.gif","high":"e7/f_org.gif","蹭":"33/c_org.gif","抱枕":"f4/bz3_org.gif","不公平":"85/bgp_org.gif"};

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