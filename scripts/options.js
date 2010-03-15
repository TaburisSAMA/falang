
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
}

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
                    showMsg('用户名或者密码不正确，请修改');
                }else{
                    showMsg('出现错误，保存失败。');
                }
            }else{
                var temp_username = $("#edit-account-name").val();
                delete userList[temp_username];
                data.userName = data.email;//兼容预览版
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
                showMsg(btnVal + '用户"' + userName + '"成功！');
            }
        });

        
    }else{
        showMsg('请输入用户名和密码！');
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
        showMsg('成功删除账号"' + userName + '"！');
    }
}

function saveAll(){
    var t = $("#selRefreshTime").val();
    if(t){
        localStorage.setObject(REFRESH_TIME_KEY, t);

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
    var asuwc = $("#autoShortUrlCount").val();
    asuwc = Number(asuwc);
    if(!isNaN(asuwc) && asuwc>0){
        localStorage.setObject(AUTO_SHORT_URL_WORD_COUNT, asuwc);
    }else{
        localStorage.setObject(AUTO_SHORT_URL_WORD_COUNT, 15);
    }
    showMsg('保存成功！');
}

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
                showMsg('刷新“' + user.userName + '”的信息失败，原因：用户名或者密码不正确，请修改。');
            }else{
                showMsg('刷新“' + user.userName + '”的信息失败，原因：出现未知错误。');
            }
            user.userName = (user.userName||user.name).toLowerCase();
            userList[user.userName] = user;
            stat.errorCount++;
        }else{
            data.userName = data.name.toLowerCase();//兼容预览版
            data.password = user.password;
            userList[data.userName] = data;
            stat.successCount++;
            showMsg('成功刷新“' + user.userName + '”的信息，');
        }
        if((stat.errorCount + stat.successCount) == stat.len){
            localStorage.setObject(USER_LIST_KEY, userList);
            var c_user = localStorage.getObject(CURRENT_USER_KEY);
            if(c_user){
                c_user = userList[c_user.userName.toLowerCase()];
                localStorage.setObject(CURRENT_USER_KEY, c_user);
            }
            showMsg('刷新用户信息完成。成功' + stat.successCount + '个，失败' + stat.errorCount + '个。');
            $("#refresh-account").removeAttr("disabled");
        }
    });
}

function cleanLocalStorageData(){
    for(key in localStorage){
        if(key.indexOf('idi')>-1){
            if(key != USER_LIST_KEY && key != CURRENT_USER_KEY){
                localStorage.removeItem(key);
            }
        }
    }
}