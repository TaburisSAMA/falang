/*

*/

var SOURCE = "3097082413"; //encodeURIComponent('');

var result_format = '.json';

var domain_sina = 'http://t.sina.com.cn';

var api_domain_sina = 'http://api.t.sina.com.cn';

//各微博的API接口地址
var apiUrl = {    
    sina : {
        public_timeline:        api_domain_sina + '/statuses/public_timeline' + result_format,
        friends_timeline:       api_domain_sina + '/statuses/friends_timeline' + result_format,
        comments_timeline:      api_domain_sina + '/statuses/comments_timeline' + result_format,
        user_timeline:          api_domain_sina + '/statuses/user_timeline' + result_format,
        mentions:               api_domain_sina + '/statuses/mentions' + result_format,
        update:                 api_domain_sina + '/statuses/update' + result_format,
        repost:                 api_domain_sina + '/statuses/repost' + result_format,
        comment:                api_domain_sina + '/statuses/comment' + result_format,
        destroy:                api_domain_sina + '/statuses/destroy' + result_format,
        destroy_msg:            api_domain_sina + '/direct_messages/destroy' + result_format,
        direct_messages:        api_domain_sina + '/direct_messages' + result_format, //0 表示悄悄话，1 表示戳一下，2 表示升级通知，3 表示代发通知，4 表示系统消息。100表示不分类，都查询。
        new_message:            api_domain_sina + '/direct_messages/new' + result_format,
        verify_credentials:     api_domain_sina + '/account/verify_credentials' + result_format,

        detailUrl:        domain_sina + '/jump?aid=detail&twId=',
        searchUrl:        domain_sina + '/search/'
    },
    
    twitter : {
    
    }
};

var sinaApi = {
    /*
        callbackFn(data, textStatus, errorCode): 
            成功和错误都会调用的方法。
            如果失败则errorCode为服务器返回的错误代码(例如: 400)。
    */
    verify_credentials: function(user, callbackFn, data){
        if(!user || !callbackFn) return;
        var params = {
            url: apiUrl.sina.verify_credentials + '?isAllInfo=true',
            type: 'get',
            user: user,
            data: (data||{})
        };
        _sendRequest(params, callbackFn);
	},
	
	friends_timeline: function(data, callbackFn){
		if(!callbackFn) return;
        var params = {
            url: apiUrl.sina.friends_timeline,
            type: 'get',
            data: (data||{})
        };
        _sendRequest(params, callbackFn);
	},

    comments_timeline: function(data, callbackFn){
		if(!callbackFn) return;
        var params = {
            url: apiUrl.sina.comments_timeline,
            type: 'get',
            data: (data||{})
        };
        _sendRequest(params, callbackFn);
	},

    mentions: function(data, callbackFn){
		if(!callbackFn) return;
        var params = {
            url: apiUrl.sina.mentions,
            type: 'get',
            data: (data||{})
        };
        _sendRequest(params, callbackFn);
	},

    direct_messages: function(data, callbackFn){
		if(!callbackFn) return;
        var params = {
            url: apiUrl.sina.direct_messages,
            type: 'get',
            data: (data||{})
        };
        _sendRequest(params, callbackFn);
	},

    /*data的参数列表：
    content 待发送消息的正文，请确定必要时需要进行URL编码 ( encode ) ，另外，不超过140英文或140汉字。
    message 必须 0 表示悄悄话 1 表示戳一下
    receiveUserId 必须，接收方的用户id
    source 可选，显示在网站上的来自哪里对应的标识符。如果想显示指定的字符，请与官方人员联系。
    */
    new_message: function(data, callbackFn){//悄悄话
		if(!callbackFn) return;
        var params = {
            url: apiUrl.sina.new_message,
            type: 'post',
            data: (data||{})
        };
        _sendRequest(params, callbackFn);
	},
    
    update: function(data, callbackFn){
        if(!callbackFn) return;
        var params = {
            url: apiUrl.sina.update,
            type: 'post',
            data: (data||{})
        };
        _sendRequest(params, callbackFn);
    },

    repost: function(data, callbackFn){
        if(!callbackFn) return;
        var params = {
            url: apiUrl.sina.repost,
            type: 'post',
            data: (data||{})
        };
        _sendRequest(params, callbackFn);
    },

    comment: function(data, callbackFn){
        if(!callbackFn) return;
        var params = {
            url: apiUrl.sina.comment,
            type: 'post',
            data: (data||{})
        };
        _sendRequest(params, callbackFn);
    },

    destroy: function(data, callbackFn){
        if(!callbackFn) return;
        var params = {
            url: apiUrl.sina.destroy,
            type: 'POST',
            data: (data||{})
        };
        _sendRequest(params, callbackFn);
    }
};

function _sendRequest(params, callbackFn){
    if(!callbackFn) return;
    var user = params.user || localStorage.getObject(CURRENT_USER_KEY);
    if(!user) return;
    params.data['source'] = SOURCE;
    params.data['count'] = 100;
    if(params.data.status){
        params.data.status = encodeURIComponent(params.data.status);
    }
    if(params.data.comment){
        params.data.comment = encodeURIComponent(params.data.comment);
    }
    $.ajax({
        url: params.url,
        username: user.userName,
        password: user.password,
        type : params.type,
        data: params.data,
        beforeSend: function(req) {
            req.setRequestHeader('Authorization', make_base_auth_header(user.userName, user.password));
        },
        success: function (data, textStatus) {
            error_code = null;
            if(data){
                if(data.error || data.error_code){
                    showMsg('error: ' + data.error + ', error_code: ' + data.error_code);
                    error_code = data.error_code || error_code;
                }
            }else{error_code = 400;}
            callbackFn(data, textStatus);
            hideLoading();
        },
        error: function (xhr, textStatus, errorThrown) {
            var r = null;
            if(xhr.responseText){
                var r = xhr.responseText
                try{
                    r = JSON.parse(r);
                }
                catch(err){
                    r = null;
                }
                if(r){showMsg('error_code:' + r.error_code + ', error:' + r.error);}
            }
            if(!r){
                textStatus = textStatus ? ('textStatus: ' + textStatus + '; ') : '';
                errorThrown = errorThrown ? ('errorThrown: ' + errorThrown + '; ') : '';
                showMsg('error: ' + textStatus + errorThrown + 'statuCode: ' + xhr.status);
            }
            callbackFn({}, textStatus, xhr.status);
            hideLoading();
        }
    });
};


//以下为一些有用的函数或者扩展

// 生成HTTP Basic Authentication的字符串："Base base64String"
function make_base_auth_header(user, password) {
  var tok = user + ':' + password;
  var hash = Base64.encode(tok);
  return "Basic " + hash;
};
// 生成HTTP Basic Authentication的url："http://userName:password@domain.com"
function make_base_auth_url(domain, user, password) {
  return "http://" + user + ":" + password + "@" + domain;
};
