
var LOCAL_STORAGE_NUM_KEY = 'idi_local_storage_num';

$(function(){
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
    if(userList){
        var op = '';
        var user = ''
        for(i in userList){
            user = userList[i];
            op = op + '<option value="' + user.userName + '">' + user.userName + '</option>';
        }
        $("#account-list").html(op);
    }
}

function init(){
    initTab();

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

    initSetBadgeText();
    initShowInPage();
    initTheme();
    initWidthAndHeight();
    initFont();
};
function initTab(){
    $("ul#navigation li a").click(function() {
        var old_t = $("ul#navigation li.selected").attr('target_id');
        $(old_t).hide();
		$("ul#navigation li").removeClass("selected");
        var new_t = $(this).parents();
		new_t.addClass("selected");
        $(new_t.attr('target_id')).show();
		return false;
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
        $("#themePreview").attr("src", '/themes/'+ theme +'/theme.gif');
    }
    $("#selTheme").change(function(){
        $("#themePreview").attr("src", '/themes/'+ $(this).val() +'/theme.gif');
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