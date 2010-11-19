// @author qleelulu@gmail.com

var KEYCODE_MAP = {8:"BackSpace", 9:"Tab", 12:"Clear", 13:"Enter", 16:"Shift", 17:"Ctrl", 18:"Alt", 19:"Pause", 20:"Caps Lock", 27:"Escape", 32:"Space", 33:"Prior", 34:"Next", 35:"End", 36:"Home", 37:"Left", 38:"Up", 39:"Right", 40:"Down", 41:"Select", 42:"Print", 43:"Execute", 45:"Insert", 46:"Delete", 47:"Help", 48:"0", 49:"1", 50:"2", 51:"3", 52:"4", 53:"5", 54:"6", 55:"7", 56:"8", 57:"9", 65:"A", 66:"B", 67:"C", 68:"D", 69:"E", 70:"F", 71:"G", 72:"H", 73:"I", 74:"J", 75:"K", 76:"L", 77:"M", 78:"N", 79:"O", 80:"P", 81:"Q", 82:"R", 83:"S", 84:"T", 85:"U", 86:"V", 87:"W", 88:"X", 89:"Y", 90:"Z", 96:"KP_0", 97:"KP_1", 98:"KP_2", 99:"KP_3", 100:"KP_4", 101:"KP_5", 102:"KP_6", 103:"KP_7", 104:"KP_8", 105:"KP_9", 106:"KP_Multiply", 107:"KP_Add", 108:"KP_Separator", 109:"KP_Subtract", 110:"KP_Decimal", 111:"KP_Divide", 112:"F1", 113:"F2", 114:"F3", 115:"F4", 116:"F5", 117:"F6", 118:"F7", 119:"F8", 120:"F9", 121:"F10", 122:"F11", 123:"F12", 124:"F13", 125:"F14", 126:"F15", 127:"F16", 128:"F17", 129:"F18", 130:"F19", 131:"F20", 132:"F21", 133:"F22", 134:"F23", 135:"F24", 136:"Num_Lock", 137:"Scroll_Lock", 187:"acute", 188:"comma", 189:"minus", 190:"period", 192:"numbersign", 210:"plusminus", 211:"211", 212:"copyright", 213:"guillemotleft", 214:"masculine", 215:"AE", 216:"cent", 217:"questiondown", 218:"onequarter", 220:"less", 221:"plus", 227:"multiply", 228:"Acircumflex", 229:"Ecircumflex", 230:"Icircumflex", 231:"Ocircumflex", 232:"Ucircumflex", 233:"Ntilde", 234:"Yacute", 235:"Ooblique", 236:"Aring", 237:"Ccedilla", 238:"THORN", 239:"ETH", 240:"diaeresis", 241:"Agrave", 242:"Egrave", 243:"Igrave", 244:"Ograve", 245:"Ugrave", 246:"Adiaeresis", 247:"Ediaeresis", 248:"Idiaeresis", 249:"Odiaeresis", 250:"Udiaeresis", 251:"ssharp", 252:"asciicircum", 253:"sterling", 254:"Mode_switch"};

var LOCAL_STORAGE_NUM_KEY = 'idi_local_storage_num';

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
        $("#new-account").show();
    });

    $("#cancel-save-account").click(function(){
        $("#new-account").hide();
    });

    $("#save-account").click(function(){
        saveAccount();
    });

    $("#account-list").change(function(){
        if($(this).val()){
            $("#show-edit-account").removeAttr('disabled');
            $("#del-account").removeAttr('disabled');
        }
    });

    $("#del-account").click(function(){
        if(confirm('你确定要删除该账号吗？')){
            delAccount($("#account-list").val());
        }
    });

    $("#show-edit-account").click(function(){
        var userName = $("#account-list").val();
        $("#edit-account-name").val(userName);
        showEditAccount(userName);
    });

    $("#cleanLocalStorage").click(function(){
        if(confirm('你确定要清空本地缓存数据吗？')){
            cleanLocalStorageData();
        }
    });

    $("#save-all").click(function(){
        saveAll();
    });
});

function showAccountList(){
    var userList = localStorage.getObject(USER_LIST_KEY);
    var userCount = 0;
    if(userList){
        var op = '';
        var user = ''
        for(i in userList){
            userCount++;
            user = userList[i];
            op = op + '<option value="' + user.userName + '">' + user.userName + '</option>';
        }
        $("#account-list").html(op);
    }
    if(userCount <= 0){
        $("#tab_user_set").click();
    }
}

function init(){
    var t = localStorage.getObject(REFRESH_TIME_KEY);
    if(t){
        $("#selRefreshTime").val(t);
    }
    var num = localStorage.getObject(LOCAL_STORAGE_NUM_KEY);
    if(num){
        $("#selLocalStorageNum").val(num);
    }
    if(!isAutoShortUrl()){
        $("#autoShortUrl").attr("checked", false);
    }
    var asuwc = getAutoShortUrlWordCount();
    $("#autoShortUrlCount").val(asuwc);

    //初始化是否同步未读提示
    $("#unread_sync_to_page").attr("checked", getIsSyncUnread());

    $("#tp_looking").val(getLookingTemplate()); //我正在看模板

    initSetBadgeText();
    initShowInPage();
    initTheme();
    initWidthAndHeight();
    initFont();
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
        $("#JT").css({top:offset.top-5, left:offset.left + 25, width:jWidth}).css({visibility:'visible', opacity:'0.98'})
    }, function(){
        $("#JT").css({opacity:0, visibility:'hidden'});
    });
}
//初始化设置未读提示信息
function initSetBadgeText(){
    for(i in T_LIST){
        $("#set_badge_" + T_LIST[i]).attr("checked", isSetBadgeText(T_LIST[i]));
    }
};

//初始化设置新消息是否在页面显示
function initShowInPage(){
    for(i in T_LIST){
        $("#set_show_in_page_" + T_LIST[i]).attr("checked", isShowInPage(T_LIST[i]));
    }
};

//初始化主题选择
function initTheme(){
    var theme = getTheme();
    if(theme){
        $("#selTheme").val(theme);
        $("#themePreview").attr("src", '/themes/'+ theme +'/theme.png');
    }
    $("#selTheme").change(function(){
        $("#themePreview").attr("src", '/themes/'+ $(this).val() +'/theme.png');
    });
};

//初始化字体选择
function initFont(){
    var font = getFont();
    if(font){
        $("#selFont").val(font);
    }

    var fontSize = getFontSize();
    if(fontSize){
        $("#selFontSize").val(fontSize);
    }
};

//初始化宽高
function initWidthAndHeight(){
    var wh = getWidthAndHeight();
    $("#set_main_width").val(wh[0]);
    $("#set_main_height").val(wh[1]);
};

//初始化快速发送热键
var TEMP_SET_KEYS = [];
function initQuickSendHotKey(){
    var keys = getQuickSendHotKey();
    keys = keys.split(',');
    var key_maps = '';
    for(i in keys){
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

function saveAccount(){
    var userName = $.trim($("#account-name").val());
    var pwd = $.trim($("#account-pwd").val());
    if(userName && pwd){
        userName = userName.toLowerCase(); //小写
        var userList = localStorage.getObject(USER_LIST_KEY);
        if(!userList){
            userList = {};
        }
        var user = {userName:userName, password:pwd};
        sinaApi.verify_credentials(user,function(data, textStatus, errorCode){
            if(errorCode){
                if(errorCode==400||errorCode==401||errorCode==403){
                    _showMsg('用户名或者密码不正确，请修改');
                }else{
                    _showMsg('出现错误，保存失败。');
                }
            }else{
                var temp_username = $("#edit-account-name").val();
                delete userList[temp_username];
                data.userName = user.userName;//兼容预览版
                data.password = user.password;
                userList[userName] = data;
                localStorage.setObject(USER_LIST_KEY, userList);
                var c_user = getUser(CURRENT_USER_KEY);
                if(!c_user || c_user.userName == temp_username){
                    setUser(CURRENT_USER_KEY, user);
                }
                var btnVal = $("#save-account").val();
                if(btnVal == '添加'){
                    var op = '<option value="' + user.userName + '">' + user.userName + '</option>';
                    $("#account-list").append(op);
                }else if(btnVal == '保存'){
                    var temp_username = $("#edit-account-name").val();
                    var ots = $("#account-list option");
                    for(i in ots){
                        if($(ots[i]).val() == temp_username){
                            $(ots[i]).val(user.userName).text(user.userName);
                            break;
                        }
                    }
                }
                    
                $("#new-account").hide();
                $("#account-name").val('');
                $("#account-pwd").val('');
                _showMsg(btnVal + '用户"' + userName + '"成功！');
            }
        });

        
    }else{
        _showMsg('请输入用户名和密码！');
    }
}

function showEditAccount(userName){
    if(userName){
        var option = $("#account-list").find('option:selected');
        var userList = localStorage.getObject(USER_LIST_KEY);
        if(!userList){
            userList = {};
        }
        var user = userList[userName];
        if(user){
            $("#new-account").show();
            $("#account-name").val(user.userName);
            $("#account-pwd").val(user.password);
            $("#save-account").val('保存');
        }
    }
}

function delAccount(userName){
    if(userName){
        var option = $("#account-list").find('option:selected');
        option.remove();
        var userList = localStorage.getObject(USER_LIST_KEY);
        if(!userList){
            userList = {};
        }
        for(key in userList){
            if(key.toLowerCase() == userName.toLowerCase()){
                delete userList[key];
                localStorage.setObject(USER_LIST_KEY, userList);
                //TODO: 删除该用户的缓存数据？
                var c_user = getUser();
                if(c_user && c_user.userName.toLowerCase() == userName.toLowerCase()){
                    var b_view = getBackgroundView();
                    if(b_view){
                        b_view.setUser('');
                        b_view.onChangeUser();
                    }
                }
                break;
            }
        }
        _showMsg('成功删除账号"' + userName + '"！');
    }
}

function saveAll(){
    var t = $("#selRefreshTime").val(); //刷新频率
    if(t){
        localStorage.setObject(REFRESH_TIME_KEY, t);
        var b_view = getBackgroundView();
        if(b_view){
            b_view.refreshInterval();
        }
    }
    var num = $("#selLocalStorageNum").val();
    if(num){
        localStorage.setObject(LOCAL_STORAGE_NUM_KEY, num);
    }

    var asu = ($("#autoShortUrl").attr("checked")== true);
    if(asu){
        localStorage.setObject(AUTO_SHORT_URL, 1);
    }else{
        localStorage.setObject(AUTO_SHORT_URL, 0);
    }
    var asuwc = $("#autoShortUrlCount").val(); //自动缩短网址
    asuwc = Number(asuwc);
    if(!isNaN(asuwc) && asuwc>0){
        localStorage.setObject(AUTO_SHORT_URL_WORD_COUNT, asuwc);
    }else{
        localStorage.setObject(AUTO_SHORT_URL_WORD_COUNT, 15);
    }

    setIsSyncUnread($("#unread_sync_to_page").attr("checked") ? 1 : 0);

    setLookingTemplate($("#tp_looking").val()); //我正在看模板

    setQuickSendHotKey($("#set_quick_send_key").val()); //快速发送微博快捷键

    saveSetBadgeText();
    saveSetShowInPage();
    saveTheme();
    saveWidthAndHeight();
    saveFont();

    _showMsg('保存成功！');
};

//保存未读提示
function saveSetBadgeText(){
    $("#set_badge_wrap :checkbox").each(function(){
        var $this = $(this);
        setSetBadgeText($this.attr('id').replace('set_badge_',''), ($this.attr("checked") ? 1 : 0));
    });
};

//保存是否在页面提示新消息
function saveSetShowInPage(){
    $("#set_show_in_page_wrap :checkbox").each(function(){
        var $this = $(this);
        setShowInPage($this.attr('id').replace('set_show_in_page_',''), ($this.attr("checked") ? 1 : 0));
    });
};

//保存主题
function saveTheme(){
    var theme = $("#selTheme").val();
    setTheme(theme);
};

//保存字体
function saveFont(){
    var font = $("#selFont").val();
    setFont(font);
    var fontSize = $("#selFontSize").val();
    setFontSize(fontSize);
};

//保存宽高
function saveWidthAndHeight(){
    var w = $("#set_main_width").val();
    var h = $("#set_main_height").val();
    var wh = setWidthAndHeight(w, h);
    $("#set_main_width").val(wh[0]);
    $("#set_main_height").val(wh[1]);
};

//刷新账号信息
function refreshAccountInfo(){
    var stat = {};
    stat.len = 0;
    stat.errorCount = 0;
    stat.successCount = 0;
    var userList = localStorage.getObject(USER_LIST_KEY);
    if(userList){
        $("#refresh-account").attr("disabled", true);
        var temp_userList = {};
        for(key in userList){
            stat.len++;
        }
        var user;
        for(key in userList){
            user = userList[key];
            refreshAccountWarp(temp_userList, user, stat);//由于闭包会造成变量共享问题，所以写多一个包装函数。
        }
    }
}

function refreshAccountWarp(userList, r_user, stat){
    var user = r_user;
    sinaApi.verify_credentials(user,function(data, textStatus, errorCode){
        if(errorCode){
            if(errorCode==400){
                _showMsg('刷新“' + user.userName + '”的信息失败，原因：用户名或者密码不正确，请修改。');
            }else{
                _showMsg('刷新“' + user.userName + '”的信息失败，原因：出现未知错误。');
            }
            user.userName = (user.userName||user.name).toLowerCase();
            userList[user.userName] = user;
            stat.errorCount++;
        }else{
            data.userName = user.userName;//兼容预览版
            data.password = user.password;
            userList[data.userName] = data;
            stat.successCount++;
            _showMsg('成功刷新“' + user.userName + '”的信息，');
        }
        if((stat.errorCount + stat.successCount) == stat.len){
            localStorage.setObject(USER_LIST_KEY, userList);
            var c_user = localStorage.getObject(CURRENT_USER_KEY);
            if(c_user){
                c_user = userList[c_user.userName.toLowerCase()];
                localStorage.setObject(CURRENT_USER_KEY, c_user);
            }
            _showMsg('刷新用户信息完成。成功' + stat.successCount + '个，失败' + stat.errorCount + '个。');
            $("#refresh-account").removeAttr("disabled");
        }
    });
}

//清空本地缓存数据
function cleanLocalStorageData(){
    for(key in localStorage){
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
        b_view.refreshInterval();
    }
}