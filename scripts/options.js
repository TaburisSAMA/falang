// @author qleelulu@gmail.com

var KEYCODE_MAP = {8:"BackSpace", 9:"Tab", 12:"Clear", 13:"Enter", 16:"Shift", 17:"Ctrl", 18:"Alt", 19:"Pause", 20:"Caps Lock", 27:"Escape", 32:"Space", 33:"Prior", 34:"Next", 35:"End", 36:"Home", 37:"Left", 38:"Up", 39:"Right", 40:"Down", 41:"Select", 42:"Print", 43:"Execute", 45:"Insert", 46:"Delete", 47:"Help", 48:"0", 49:"1", 50:"2", 51:"3", 52:"4", 53:"5", 54:"6", 55:"7", 56:"8", 57:"9", 65:"A", 66:"B", 67:"C", 68:"D", 69:"E", 70:"F", 71:"G", 72:"H", 73:"I", 74:"J", 75:"K", 76:"L", 77:"M", 78:"N", 79:"O", 80:"P", 81:"Q", 82:"R", 83:"S", 84:"T", 85:"U", 86:"V", 87:"W", 88:"X", 89:"Y", 90:"Z", 96:"KP_0", 97:"KP_1", 98:"KP_2", 99:"KP_3", 100:"KP_4", 101:"KP_5", 102:"KP_6", 103:"KP_7", 104:"KP_8", 105:"KP_9", 106:"KP_Multiply", 107:"KP_Add", 108:"KP_Separator", 109:"KP_Subtract", 110:"KP_Decimal", 111:"KP_Divide", 112:"F1", 113:"F2", 114:"F3", 115:"F4", 116:"F5", 117:"F6", 118:"F7", 119:"F8", 120:"F9", 121:"F10", 122:"F11", 123:"F12", 124:"F13", 125:"F14", 126:"F15", 127:"F16", 128:"F17", 129:"F18", 130:"F19", 131:"F20", 132:"F21", 133:"F22", 134:"F23", 135:"F24", 136:"Num_Lock", 137:"Scroll_Lock", 187:"acute", 188:"comma", 189:"minus", 190:"period", 192:"numbersign", 210:"plusminus", 211:"211", 212:"copyright", 213:"guillemotleft", 214:"masculine", 215:"AE", 216:"cent", 217:"questiondown", 218:"onequarter", 220:"less", 221:"plus", 227:"multiply", 228:"Acircumflex", 229:"Ecircumflex", 230:"Icircumflex", 231:"Ocircumflex", 232:"Ucircumflex", 233:"Ntilde", 234:"Yacute", 235:"Ooblique", 236:"Aring", 237:"Ccedilla", 238:"THORN", 239:"ETH", 240:"diaeresis", 241:"Agrave", 242:"Egrave", 243:"Igrave", 244:"Ograve", 245:"Ugrave", 246:"Adiaeresis", 247:"Ediaeresis", 248:"Idiaeresis", 249:"Odiaeresis", 250:"Udiaeresis", 251:"ssharp", 252:"asciicircum", 253:"sterling", 254:"Mode_switch"};

var SUPPORT_AUTH_TYPES = {
	'tsina': ['oauth', 'baseauth'],
	'tsohu': ['oauth', 'baseauth'],
	't163': ['oauth'],
	'fanfou': ['baseauth'],
	'digu': ['baseauth'],
	'zuosa': ['baseauth'],
	'follow5': ['baseauth'],
	'leihou': ['baseauth'],
	'renjian': ['baseauth'],
	'twitter': ['oauth', 'xauth', 'baseauth'],
	'douban': ['oauth'],
	'buzz': ['oauth']
};

var AUTH_TYPE_NAME = {
    'baseauth': 'Basic Auth',
    'oauth': 'oAuth(更安全)',
    'xauth': 'xAuth(oAuth的简化)'
};

var TWEEN_TYPES = ['Quad', 'Cubic', 'Quart', 'Quint', 'Sine', 'Expo', 'Circ', 'Elastic', 'Back', 'Bounce'];

$(function(){
    initTab();

    showAccountList();

    init();

    $("#refresh-account").click(function(){
        refreshAccountInfo();
    });

    $("#show-new-account").click(function(){
        $("#save-account").val('添加');
        $("#account-name").val('');
        $("#account-pwd").val('');
        $("#edit-account-key").val('');
        onSelBlogTypeChange();
        $("#edit-account-info").hide();
        $("#new-account").show();
        $("#user-custom-wrap").hide();
    });

    $("#cancel-save-account, #cancel-save-user-custom").click(function(){
        $("#new-account, #user-custom-wrap, #edit-account-info").hide();
    });

    $("#save-account").click(function(){
        saveAccount();
    });
    
    $("#get-account-pin").click(function(){
    	$('#account-request-token-key').val('');
        $('#account-request-token-secret').val('');
        saveAccount();
        $(this).fadeOut(500).delay(5000).fadeIn(500);
    });

    $("#account-list").change(function(){
        if($(this).val()){
            $("#show-edit-account, #del-account, #stop-account, #show-edit-user-custom").removeAttr('disabled');
            $('#up-account, #down-account').removeAttr('disabled');
        }
    });

    $("#del-account").click(function(){
        if(confirm('你确定要删除该账号吗？')){
            delAccount($("#account-list").val());
        }
    });
    
    $("#stop-account").click(function(){
        var uniqueKey = $("#account-list").val();
        var _user = toggleStopAccount(uniqueKey);
        var stat = _user.disabled ? '停用' : (_user.only_for_send ? '仅发送' : '启用');
        showAccountList();
        $("#account-list").val(uniqueKey);
        _showMsg(_user.screen_name + ' 的状态修改为: ' + stat);
    });

    $("#show-edit-account").click(function(){
        var uniqueKey = $("#account-list").val();
        $("#edit-account-key").val(uniqueKey);
        $("#edit-account-info").show().find('h3').html($(this).text()).end().find('.ainfo').html($("#account-list :selected").text());
        showEditAccount(uniqueKey);
    });

    //用户账号
    $("#show-edit-user-custom").click(function(){
        var uniqueKey = $("#account-list").val();
        $("#edit-account-key").val(uniqueKey);
        var user = getUserByUniqueKey(uniqueKey, 'all');

        if(tapi.get_config(user).support_comment){
            $("#userRefreshTime_comments_timeline").parent().show();
        }else{
            $("#userRefreshTime_comments_timeline").val('0').parent().hide();
        }

        //绑定用户自定刷新时间
        var refTime = 0, refTimeInp = null, timelimes = T_LIST[user.blogType];
        for(var i in timelimes){
            refTimeInp = $("#userRefreshTime_" + timelimes[i]);
            refTimeInp.prev('span:eq(0)').html('('+ Settings.get().globalRefreshTime[timelimes[i]] +')');
            if(user.refreshTime && user.refreshTime[timelimes[i]]){
                refTime = user.refreshTime[timelimes[i]];
            }else{
                refTime = 0;
            }
            refTimeInp.val(refTime);
        }
        calculateUserRefreshTimeHits(user);

        $("#account_only_for_send").attr('checked', user.only_for_send ? true : false);

        $("#new-account").hide();
        $("#edit-account-info").show().find('h3').html($(this).text()).end().find('.ainfo').html($("#account-list :selected").text());
        $("#user-custom-wrap").show();
    });

    //保存用户属性修改
    $("#save-user-custom").click(function(){
        var uniqueKey = $("#edit-account-key").val();
        var user = getUserByUniqueKey(uniqueKey, 'all');
        if(user){
            user.refreshTime = user.refreshTime || {};
            var refTime = 0, refTimeInp = null;
            for(var i in T_LIST.all){
                refTimeInp = $("#userRefreshTime_" + T_LIST.all[i]);
                refTime = Number(refTimeInp.val());
                if(isNaN(refTime)){
                    refTime = 0;
                }else if(refTime!==0 && refTime<30){
                    refTime = 30;
                }
                user.refreshTime[T_LIST.all[i]] = refTime;
                refTimeInp.val(refTime);
            }
            user.only_for_send = $("#account_only_for_send").attr('checked');

            var userList = getUserList('all');
            // 删除旧数据，替换新的
            var found = false;
            $.each(userList, function(i, item){
            	if(item.uniqueKey == uniqueKey){
            		userList[i] = user;
            		found = true;
            		return false;
            	}
            });
            saveUserList(userList);

            showAccountList();
            $("#account-list").val(uniqueKey);

            if(found){
                _showMsg('保存成功');
                var b_view = getBackgroundView();
                if(b_view){
                    b_view.RefreshManager.restart();
                }
            }
        }else{
            _showMsg('保存失败：未指定编辑的用户');
        }
        $("#cancel-save-user-custom").click();
    });

    $("#userRefreshTimeWrap input").change(function(){
        var uniqueKey = $("#edit-account-key").val();
        var user = getUserByUniqueKey(uniqueKey, 'all');
        calculateUserRefreshTimeHits(user);
    });

    $("#gRefreshTimeWrap input").change(function(){
        calculateGlobalRefreshTimeHits();
    });

    $("#cleanLocalStorage").click(function(){
        if(confirm('你确定要清空本地缓存数据吗？')){
            cleanLocalStorageData();
        }
    });

    $("#save-all").click(function(){
        saveAll();
    });
    
    // 绑定认证类型变化时的显示切换
    if($("#account-authType").change(function() {
    	if($(this).val() == 'oauth') {
    		$('.account-oauth').show();
    		$('.account-baseauth').hide('');
    	} else {
    		$('.account-oauth').hide();
    		$('.account-baseauth').show('');
    		// 清空缓存的数据
    		$('#account-pin').val('');
    		$('#account-request-token-key').val('');
    		$('#account-request-token-secret').val('');
    	}
    }));
    
    // 帐号排序按钮
    $('#up-account, #down-account').click(function(){
    	var $item = $("#account-list option:selected");
    	if($(this).attr('direction') == 'up') {
    		$item.prev().before($item);
    	} else {
    		$item.next().after($item);
    	}
    	var new_list = [];
    	var userlist = getUserList('all');
    	$("#account-list option").each(function(){
    		var uniqueKey = $(this).val();
    		$.each(userlist, function(index, user){
    			if(user.uniqueKey == uniqueKey){
    				new_list.push(user);
    				return false;
    			}
    		});
    	});
    	saveUserList(new_list);
    });

    //检查url中有没 #user_set 之类的，有就定位到指定tab
    if(window.location.hash){
        $("#navigation li[target_id=" + window.location.hash + "] a").click();
    }
    
    // 显示语言选项
    var tanslate_options = '';
    for(var k in Languages) {
    	tanslate_options += '<option value="{{value}}">{{name}}</option>'.format({name: k, value: Languages[k]});
    }
    var settings = Settings.get();
    $('#translate_target').html(tanslate_options).val(settings.translate_target);
});

//统计全局的刷新间隔设置产生的请求次数
function calculateGlobalRefreshTimeHits(){
    var total = 0, refTime = 0, refTimeInp = null, timelimes = T_LIST.all;
    for(var i in timelimes){
        refTimeInp = $("#gRefreshTime_" + timelimes[i]);
        refTime = Number(refTimeInp.val());
        if(isNaN(refTime)){
            refTime = Settings.defaults.globalRefreshTime[timelimes[i]];
        }else if(refTime<30){
            refTime = 30;
        }
        refTimeInp.val(refTime);
        total += Math.round(60*60/refTime);
    }
    $("#gRefreshTimeHits").html(total);
};

//统计用户自定义的刷新间隔设置产生的请求次数
function calculateUserRefreshTimeHits(user){
    var total = 0, refTime = 0, refTimeInp = null, timelimes = T_LIST[user.blogType];
    for(var i in timelimes){
        refTimeInp = $("#userRefreshTime_" + timelimes[i]);
        refTime = Number(refTimeInp.val());
        if(isNaN(refTime)){
            refTime = 0;
        }else if(refTime!==0 && refTime<30){
            refTime = 30;
        }
        refTimeInp.val(refTime);
        if(refTime==0){
            refTime = Settings.get().globalRefreshTime[timelimes[i]];
        }
        total += Math.round(60*60/refTime);
    }
    $("#userRefreshTimeHits").html(total);
};

function disabledUserEditBtns(){
    $("#show-edit-account, #del-account, #stop-account, #show-edit-user-custom").attr('disabled', true);
};

function showAccountList(){
    var userList = getUserList('all');
    var userCount = 0;
    var needRefresh = false;
    if(userList){
        var op = '';
        var tpl = '<option value="{{uniqueKey}}">({{stat}}) ({{blogTypeName}}) {{screen_name}}</option>';
        for(var i in userList){
            userCount++;
            var user = userList[i];
            if(!user.uniqueKey){ //兼容单微博版本
                needRefresh = true;
            } else {
            	user.blogTypeName = T_NAMES[user.blogType];
                user.stat = user.disabled ? '停用' : (user.only_for_send ? '仅发送' : '启用');
            	op += tpl.format(user);
            }
        }
        $("#account-list").html(op);
    }
    if(needRefresh || userCount <= 0){
        $("#tab_user_set").click();
    }
    if(needRefresh){
        $("#needRefresh").show();
    }
    
    // 显示微博选项
    var blogtype_options = '';
    for(var k in T_NAMES) {
    	blogtype_options += '<option value="{{value}}">{{name}}</option>'.format({name: T_NAMES[k], value: k});
    }
    $('#account-blogType').html(blogtype_options);
    showSupportAuthTypes($('#account-blogType').val());
    
}

function init(){
    var settings = Settings.get();

    //初始化全局信息刷新时间
    for(var i in T_LIST.all){
        $("#gRefreshTime_" + T_LIST.all[i]).val(settings.globalRefreshTime[T_LIST.all[i]]);
    }
    calculateGlobalRefreshTimeHits();

    if(!settings.isSharedUrlAutoShort){
        $("#autoShortUrl").attr("checked", false);
    }
    
    //平滑滚动
    $("#isSmoothScroller").attr("checked", settings.isSmoothScroller);
    var tween_options = '';
    for(var i in TWEEN_TYPES){
        tween_options += '<option value="{{name}}">{{name}}</option>'.format({name: TWEEN_TYPES[i]});
    }
    $("#tween_type").html(tween_options).val(settings.smoothTweenType);
    $("#ease_type").val(settings.smoothSeaeType);
    $("#tween_type, #ease_type").change(function(){
        SmoothScrollerDemo.start();
    });


    $("#autoShortUrlCount").val(settings.sharedUrlAutoShortWordCount);

    //初始化是否同步未读提示到新浪微博
    $("#unread_sync_to_page").attr("checked", settings.isSyncReadedToSina);

    $("#tp_looking").val(settings.lookingTemplate); //我正在看模板

    //初始化设置未读提示信息
    for(var i in T_LIST.all){
        $("#set_badge_" + T_LIST.all[i]).attr("checked", settings.isSetBadgeText[T_LIST.all[i]]);
    }

    //初始化设置新消息是否在页面显示
    for(var i in T_LIST.all){
        $("#set_show_in_page_" + T_LIST.all[i]).attr("checked", settings.isShowInPage[T_LIST.all[i]]);
    }

    //初始化是否声音提示
    for(var i in T_LIST.all){
        $("#sound_alert_" + T_LIST.all[i]).attr("checked", settings.isEnabledSound[T_LIST.all[i]]);
    }
    $("#inpSoundFile").val(settings.soundSrc);

    //初始化是否桌面显示
    for(var i in T_LIST.all){
        $("#destop_alert_" + T_LIST.all[i]).attr("checked", settings.isDesktopNotifications[T_LIST.all[i]]);
    }
    $("#inpDesktopNotificationsTimeout").val(settings.desktopNotificationsTimeout);

    //初始化主题选择
    var theme = settings.theme;
    if(theme){
        $("#selTheme").val(theme);
        $("#themePreview").attr("src", '/themes/'+ theme +'/theme.png');
    }
    $("#selTheme").change(function(){
        $("#themePreview").attr("src", '/themes/'+ $(this).val() +'/theme.png');
    });

    //初始化字体选择
    $("#selFont").val(settings.font);
    $("#selFontSize").val(settings.fontSite);


    //初始化宽高
    var w = settings.popupWidth, h = settings.popupHeight;
    $("#set_main_width").val(w);
    $("#set_main_height").val(h);

    initQuickSendHotKey();

    initJtip();
};
//初始化Tab标签
function initTab(){
    $("ul#navigation li a").click(function() {
        var old_t = $("ul#navigation li.selected").attr('target_id');
        $(old_t).hide();
		$("ul#navigation li").removeClass("selected");
        var new_t = $(this).parents();
		new_t.addClass("selected");
        $(new_t.attr('target_id')).show();
        if(new_t.attr('hide_save_btn')){
            $("#save-all").hide();
        }else{
            $("#save-all").show();
        }
		return false;
	});
};
// jTip
function initJtip(){
    $(".jTip").hover(function(){
        var _t = $(this);
        var offset = _t.offset();
        $("#JT_close_left").html(_t.attr('jTitle')||'　');
        $("#JT_copy").html(_t.find('.c').html());
        var jWidth = _t.attr('jWidth') || '';
        $("#JT").css({top:offset.top-5, left:offset.left + 25, width:jWidth}).css({visibility:'visible', opacity:'0.98'});
    }, function(){
        $("#JT").css({opacity:0, visibility:'hidden'});
    });
};

//初始化快速发送热键
var TEMP_SET_KEYS = [];
function initQuickSendHotKey(){
    var keys = Settings.get().quickSendHotKey;
    keys = keys.split(',');
    var key_maps = '';
    for(var i in keys){
        var _i = keys[i];
        if(KEYCODE_MAP[_i]){
            _i = KEYCODE_MAP[_i];
        }
        if(key_maps){ key_maps += ' + '; }
        key_maps += _i;
    }
    $("#set_quick_send_key_inp").val(key_maps);
    $("#set_quick_send_key").val(keys);
    $("#set_quick_send_key_inp").focus(function(){
        $("#set_quick_send_key_tip").show();
        $(this).bind('keydown', function(e){
            if(e.keyCode == 8){ //如果是退格键，则通行
                $("#set_quick_send_key_inp").val('');
                return true;
            }
            //如果是同一个键,则无视
            if(TEMP_SET_KEYS.length && e.keyCode == TEMP_SET_KEYS[TEMP_SET_KEYS.length-1]){
                return false;
            }
            var _t = $(this);
            if(!TEMP_SET_KEYS.length){ _t.val(''); }
            TEMP_SET_KEYS.push(e.keyCode);
            var key_name = e.keyCode;
            if(KEYCODE_MAP[e.keyCode]){
                key_name = KEYCODE_MAP[e.keyCode];
            }
            if(_t.val()){
                _t.val(_t.val() + ' + ');
            }
            _t.val(_t.val() + key_name);
            return false;
        });
        $(this).bind('keyup', function(e){
            if(TEMP_SET_KEYS.length){
                $("#set_quick_send_key").val(TEMP_SET_KEYS.toString());
            }
            TEMP_SET_KEYS = [];
        });
    }).blur(function(){
        $(this).unbind('keydown');
        $(this).unbind('keyup');
        if(TEMP_SET_KEYS.length){
            $("#set_quick_send_key").val(TEMP_SET_KEYS.toString());
        }
        TEMP_SET_KEYS = [];
        $("#set_quick_send_key_tip").hide();
    });
};

function _verify_credentials(user) {
	if(!user) {
		_showMsg('用户名或者密码不正确，请修改');
		$('#save-account').removeAttr('disabled');
		return;
	}
	tapi.verify_credentials(user, function(data, textStatus, errorCode){
		$('#save-account').removeAttr('disabled');
        if(errorCode || textStatus=='error'){
            if(errorCode==400||errorCode==401||errorCode==403){
                _showMsg('用户名或者密码不正确，请修改');
            }else{
                var err_msg = '';
                if(data.error){
                    err_msg = 'error: ' + data.error;
                }
                _showMsg('出现错误，保存失败。' + err_msg);
            }
        } else {
        	var userList = getUserList('all');
            $.extend(user, data);
            user.uniqueKey = user.blogType + '_' + user.id;
            user.screen_name = user.screen_name || user.name;
            var temp_uniqueKey = $("#edit-account-key").val() || user.uniqueKey;
            // 删除旧数据，替换新的
            var found = false;
            $.each(userList, function(i, item){
            	if(item.uniqueKey == temp_uniqueKey){
            		userList[i] = user;
            		found = true;
            		return false;
            	}
            });
            if(!found) {
            	userList.push(user);
            }
            saveUserList(userList);
            var c_user = getUser();
            if(!c_user || c_user.uniqueKey == temp_uniqueKey){
                setUser(user);
            }
            var btnVal = $("#save-account").val();
            showAccountList();

            $("#new-account").hide();
            $("#account-name").val('');
            $("#account-pwd").val('');
            $("#account-pin").val('');
            _showMsg(btnVal + '用户"' + data.screen_name + '"成功！');
        }
    });
}

//保存用户账号
//如果其他微博类型的字段名与新浪的不同，则与新浪的为准，修改后再保存
// 保存的账号信息有以下附加属性：
//   - uniqueKey: 唯一标识账号的键， blogType_userId , userId为返回的用户信息的用户id. 用下划线分隔是因为下划线可以用在css class里面
//   - authType: 认证类型：oauth, baseauth, xauth
//   - userName: baseAuth认证的用户名
//   - password: baseAuth认证的密码
//   - oauth_token_key: oauth认证获取到的的key
//   - oauth_token_secret: oAuth认证获取到的secret
//   - blogType: 微博类型：tsina, t163, tsohu, twitter, digu
//   - apiProxy: api代理, 目前twitter支持
//   - disabled: 账号是否已停用
function saveAccount(){
    var userName = $.trim($("#account-name").val());
    var pwd = $.trim($("#account-pwd").val());
    var blogType = $.trim($("#account-blogType").val()) || 'tsina'; //微博类型，兼容，默认tsina
    var authType = $.trim($("#account-authType").val()); //登录验证类型
    var pin = $.trim($('#account-pin').val()); // oauth pin码
    var apiProxy = $.trim($('#account-proxy-api').val());
    var user = {
    	blogType: blogType, authType: authType
    };
    // 目前只允许twitter设置代理
    if(blogType == 'twitter' && apiProxy) {
    	user.apiProxy = apiProxy;
    }
    if((authType == 'baseauth' || authType == 'xauth') && userName && pwd){ // TODO: xauth还未支持
        //userName = userName.toLowerCase(); //小写
        user.userName = userName;
        user.password = pwd;
        _verify_credentials(user);
    } else if(authType == 'oauth') {
    	var request_token_key = $('#account-request-token-key').val();
    	var request_token_secret = $('#account-request-token-secret').val();
    	if(pin && request_token_key && request_token_secret) {
    		user.oauth_pin = pin;
    		// 设置request token
    		user.oauth_token_key = request_token_key;
    		user.oauth_token_secret = request_token_secret;
    		$('#save-account').attr('disabled', true);
    		tapi.get_access_token(user, function(auth_user) {
    			_verify_credentials(auth_user);
    		});
    	} else { // 跳到登录页面
    		tapi.get_authorization_url(user, function(login_url, text_status, error_code) {
    			if(!login_url) {
    				_showMsg('get_authorization_url error: ' + text_status + ' code: ' + error_code);
    			} else {
    				if(blogType == 'douban') {
    					// 豆瓣无需pin，随便填充douban
    					$('#account-pin').val('douban');
    				}
    				// 在当前页保存 request token
        			$('#account-request-token-key').val(user.oauth_token_key);
        			$('#account-request-token-secret').val(user.oauth_token_secret);
            		var l = (window.screen.availWidth-510)/2;
            		window.open(login_url, 'FaWaveOAuth', 'left=' + l 
            	    		+ ',top=30,width=600,height=450,menubar=no,location=yes,resizable=no,scrollbars=yes,status=yes');
    			}
    		});
    	}
    } else {
        _showMsg('请输入用户名和密码！');
    }
};

function onSelBlogTypeChange(){
    var blogType = $("#account-blogType").val();
    $("#account-blogType-img").attr('src', 'images/blogs/' + blogType + '_16.png');
    showSupportAuthTypes(blogType);
};

function showSupportAuthTypes(blogType, authType){
    var types = SUPPORT_AUTH_TYPES[blogType];
    if(!types){
        _showMsg('没有"' + blogType + '"支持的验证类型');
        return;
    }
    var selAT = $("#account-authType");
    selAT.html('');
    // 添加认证类型
    var authtype_options = '';
    for(var i in types) {
    	authtype_options += '<option value="{{value}}" {{selected}}>{{name}}</option>'.format({
    		name: AUTH_TYPE_NAME[types[i]], value: types[i],
    		selected: types[i] == authType ? 'selected="selected"' : ''
    	});
    }
    selAT.html(authtype_options);
    selAT.change();
    if(blogType == 'twitter') {
    	$('.account-proxy').show();
    } else {
    	$('.account-proxy').hide();
    }
};

function showEditAccount(uniqueKey){
    if(uniqueKey){
        var userList = getUserList('all');
        var user = null;
        $.each(userList, function(index, item) {
        	if(item.uniqueKey == uniqueKey){
        		user = item;
        		return false;
        	}
        });
        if(user){
            $("#user-custom-wrap").hide();
            $("#new-account").show();
            $("#account-blogType").val(user.blogType);
            showSupportAuthTypes(user.blogType, user.authType);
            $("#account-name").val(user.userName || '');
            $("#account-pwd").val(user.password || '');
            $("#account-proxy-api").val(user.apiProxy || '');
            $("#save-account").val('保存');
        }
    }
};

function delAccount(uniqueKey){
	$("#account-list option:selected").remove();
    var userList = getUserList('all');
    var new_list = [];
    var delete_user = {};
    for(var i in userList){
    	var user = userList[i];
        if(user.uniqueKey.toLowerCase() == uniqueKey.toLowerCase()){
        	delete_user = user;
            //TODO: 删除该用户的缓存数据？
            for(var key in localStorage){
                if(key.indexOf(uniqueKey)>-1){
                    if(key != USER_LIST_KEY && key != CURRENT_USER_KEY){
                        localStorage.removeItem(key);
                    }
                }
            }
            var c_user = getUser();
            if(c_user && c_user.uniqueKey.toLowerCase() == uniqueKey.toLowerCase()){
                var b_view = getBackgroundView();
                if(b_view){
                    b_view.setUser('');
                    b_view.onChangeUser();
                }
            }
        } else {
        	new_list.push(user);
        }
    }
    saveUserList(new_list);
    disabledUserEditBtns();
    _showMsg('成功删除账号 (' + T_NAMES[delete_user.blogType] + ')' + delete_user.screen_name + '！');
};

//停、启用用户账号
function toggleStopAccount(uniqueKey, is_stop){
    if(!uniqueKey){ return null; }
    var userList = getUserList('all');
    var user = null;
    $.each(userList, function(i, item){
    	if(item.uniqueKey == uniqueKey){
    		user = item;
    		return false;
    	}
    });
    if(user){
    	user.disabled = (is_stop == undefined) ? (!user.disabled) : is_stop;
        var c_user = getUser();
        saveUserList(userList);
        if(c_user && c_user.uniqueKey.toLowerCase() == uniqueKey.toLowerCase()){
            var b_view = getBackgroundView();
            if(b_view){
                b_view.setUser('');
                b_view.onChangeUser();
            }
        }
    }
    return user;
};

function saveAll(){
    var settings = Settings.get();

    //保存全局信息刷新时间间隔
    var gr = null, grv = null;
    for(var i in T_LIST.all){
        gr = $("#gRefreshTime_" + T_LIST.all[i]);
        grv = Number(gr.val());
        if(isNaN(grv)){
            grv = Settings.defaults.globalRefreshTime[T_LIST.all[i]];
        }else if(grv < 30){ //最低30秒
            grv = 30;
        }
        settings.globalRefreshTime[T_LIST.all[i]] = grv;
        gr.val(grv);
    }
    var b_view = getBackgroundView();
    if(b_view){
        b_view.RefreshManager.restart(); //TODO: 需要确认
    }


    var asu = ($("#autoShortUrl").attr("checked")== true);
    settings.isSharedUrlAutoShort = asu;
    var asuwc = $("#autoShortUrlCount").val(); //自动缩短网址
    asuwc = Number(asuwc);
    if(!isNaN(asuwc) && asuwc>0){
        settings.sharedUrlAutoShortWordCount = asuwc;
    }else{
        settings.sharedUrlAutoShortWordCount = Settings.defaults.sharedUrlAutoShortWordCount;
    }

    //平滑滚动
    settings.isSmoothScroller = $("#isSmoothScroller").attr("checked") ? true : false;
    settings.smoothTweenType = $("#tween_type").val();
    settings.smoothSeaeType = $("#ease_type").val();

    settings.isSyncReadedToSina = $("#unread_sync_to_page").attr("checked") ? true : false;

    settings.lookingTemplate = $("#tp_looking").val(); //我正在看模板

    if($("#set_quick_send_key_inp").val()){
        settings.quickSendHotKey = $("#set_quick_send_key").val(); //快速发送微博快捷键
    }

    //保存未读提示
    $("#set_badge_wrap :checkbox").each(function(){
        var $this = $(this);
        settings.isSetBadgeText[$this.attr('id').replace('set_badge_','')] = ($this.attr("checked") ? true : false);
    });

    //保存是否在页面提示新消息
    $("#set_show_in_page_wrap :checkbox").each(function(){
        var $this = $(this);
        settings.isShowInPage[$this.attr('id').replace('set_show_in_page_','')] = ($this.attr("checked") ? true : false);
    });

    //保存是否声音提示
    $("#set_sound_alert_wrap :checkbox").each(function(){
        var $this = $(this);
        settings.isEnabledSound[$this.attr('id').replace('sound_alert_','')] = ($this.attr("checked") ? true : false);
    });
    var _soundFile = $.trim($("#inpSoundFile").val());
    if(_soundFile){
        settings.soundSrc = _soundFile;
        var bg = getBackgroundView();
        bg.AlertaAudioFile.src = _soundFile;
    }

    //初始化是否桌面显示
    $("#set_destop_alert_wrap :checkbox").each(function(){
        var $this = $(this);
        settings.isDesktopNotifications[$this.attr('id').replace('destop_alert_','')] = ($this.attr("checked") ? true : false);
    });
    var nfTimeout = $("#inpDesktopNotificationsTimeout").val();
    nfTimeout = Number(nfTimeout);
    if(isNaN(nfTimeout) || nfTimeout < 3){
        nfTimeout = 3;
    }
    settings.desktopNotificationsTimeout = nfTimeout;

    //保存主题
    var theme = $("#selTheme").val();
    settings.theme =  theme;

    //保存宽高
    var w = $("#set_main_width").val();
    var h = $("#set_main_height").val();
    w = Number(w);
    h = Number(h);
    if(isNaN(w) || w < 350){
        w = 350;
    }
    if(isNaN(h) || h < 350){
        h = 350;
    }
    settings.popupWidth = w;
    settings.popupHeight = h;
    $("#set_main_width").val(w);
    $("#set_main_height").val(h);

    //保存字体
    var font = $("#selFont").val();
    settings.font =  font;
    var fontSize = $("#selFontSize").val();
    settings.fontSite = fontSize;
    
    settings.translate_target = $('#translate_target').val();

    Settings.save();

    _showMsg('保存成功！');
};

//平滑滚动
/*
 t: current time（当前时间）；
 b: beginning value（初始值）；
 c: change in value（变化量）；
 d: duration（持续时间）。
*/
var SmoothScrollerDemo = {
    T: '', //setTimeout引用
    movable_block: '',
    ease_type: 'easeOut',
    tween_type: 'Quad',
    status:{t:0, b:0, c:90, d:100},
    start: function(){
        clearTimeout(this.T);
        this.movable_block = $("#tween_demo span").css('margin-left', 0);
        this.ease_type = $("#ease_type").val();
        this.tween_type = $("#tween_type").val();
        this.status.t = 0;
        this.status.b = 0;
        this.run();
    },
    run: function(){
        var _t = SmoothScrollerDemo;
        var _left = Math.ceil(Tween[_t.tween_type][_t.ease_type](_t.status.t, _t.status.b, _t.status.c, _t.status.d));
        _t.movable_block.css('margin-left', _left);
        if(_t.status.t < _t.status.d){ _t.status.t++; setTimeout(_t.run, 10); }
    }
};


//刷新账号信息
function refreshAccountInfo(){
    var stat = {errorCount: 0, successCount: 0};
    // 获取排序信息
    stat.userList = getUserList('all');
    $("#refresh-account").attr("disabled", true);
    for(var i in stat.userList){
        refreshAccountWarp(stat.userList[i], stat);//由于闭包会造成变量共享问题，所以写多一个包装函数。
    }
}

function refreshAccountWarp(user, stat){
    tapi.verify_credentials(user, function(data, textStatus, errorCode){
    	user.blogType = user.blogType || 'tsina'; //兼容单微博版
        user.authType = user.authType || 'baseauth'; //兼容单微博版
        var blogName = T_NAMES[user.blogType];
        if(errorCode){
            if(errorCode==400){
                _showMsg('刷新(' + blogName + ')' + user.screen_name + ' 的信息失败，原因：用户名或者密码不正确，请修改。');
            } else {
                _showMsg('刷新(' + blogName + + ')' + user.screen_name + ' 的信息失败，原因：出现未知错误。errorCode: ' + errorCode);
            }
//            userList[user.uniqueKey] = user;
            stat.errorCount++;
        } else {
            $.extend(user, data); //合并，以data的数据为准
            user.uniqueKey = user.blogType + '_' + user.id;
//            stat.userList[i] = user;
//            userList[data.uniqueKey] = data;
            stat.successCount++;
            _showMsg('成功刷新(' + blogName + ')' + user.screen_name + ' 的信息');
        }
        if((stat.errorCount + stat.successCount) == stat.userList.length){
        	// 全部刷新完，更新
            saveUserList(stat.userList);
            var c_user = getUser();
            if(c_user){
                if(!c_user.uniqueKey){ //兼容单微博版本
                    c_user.uniqueKey = (c_user.blogType||'tsina') + '_' + c_user.id;
                }
                $.each(stat.userList, function(index, item){
                	if(c_user.uniqueKey.toLowerCase() == item.uniqueKey){
                		c_user = item;
                		return false;
                	}
                });
//                c_user = userList[c_user.uniqueKey.toLowerCase()];
                setUser(c_user);
            }
            _showMsg('刷新用户信息完成。成功' + stat.successCount + '个，失败' + stat.errorCount + '个。');
            $("#refresh-account").removeAttr("disabled");
            if($("#needRefresh").css('display') != 'none'){ //如果是强制需要刷新用户信息的，则在刷新后刷新页面
                window.location.reload(); //TODO: 修改为不用刷新页面的
            }
        }
    });
}

//清空本地缓存数据
function cleanLocalStorageData(){
    for(var key in localStorage){
        if(key.indexOf('idi')>-1){
            if(key != USER_LIST_KEY && key != CURRENT_USER_KEY){
                localStorage.removeItem(key);
            }
        }
    }
    var b_view = getBackgroundView();
    if(b_view){
        b_view.tweets = {};
        b_view.MAX_MSG_ID = {};
        b_view.checking={};
        b_view.paging={};
        b_view.RefreshManager.restart();
    }
}