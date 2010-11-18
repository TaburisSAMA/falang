
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

// 格式化内容，处理表情和url等
function tsina_format_text(text) {
	// 格式url
	text = text.replace(/(ssh|ftp|http)s?:\/\/[\w\/\?\&\.=]+/g, function(url) {
		return '<a target="_blank" href="'+ url +'">' + url + '</a>';
	});
	
	// 转化标签 #xxx#
	text = text.replace(/#(\S+?)#/g, function(match, tag) {
		return '<a target="_blank" href="http://t.sina.com.cn/k/'+ encodeURI(tag) +'" title="到新浪微博搜索: ' + tag + '">' + match + '</a>';
	});
	
	// 转化表情
	text = text.replace(/\[(\S+?)\]/g, function(key, keyname) {
		if(TSINA_FACES[keyname]) {
			return "<img src=" + TSINA_FACE_URL_PRE + TSINA_FACES[keyname] + " title=" + key + " />";
		} else {
			return key;
		}
	});
	
	return text;
}

function tsina_get_screen_name_link(user, need_at) {
	var name = need_at ? '@' + user.screen_name : user.screen_name;
	return '<a href="' + user.t_url + '" target="_blank" title="关注：' 
		+ user.friends_count + '个  粉丝：' + user.followers_count + '个  微博：' + user.statuses_count + '条">' + name + '</a>';
}