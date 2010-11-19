/*
* @author qleelulu@gmail.com
*/

var SOURCE = "3538199806"; //encodeURIComponent('');
var SOURCE2 = "2721776383";

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
        followers:              api_domain_sina + '/statuses/followers' + result_format,
        friends:                api_domain_sina + '/statuses/friends' + result_format,
        favorite:               api_domain_sina + '/favorite' + result_format,
        favorites_create:       api_domain_sina + '/favorites/create' + result_format,
        favorites_destroy:      api_domain_sina + '/favorites/destroy/{id}' + result_format,
        counts:                 api_domain_sina + '/statuses/counts' + result_format,
        update:                 api_domain_sina + '/statuses/update' + result_format,
        upload:                 api_domain_sina + '/statuses/upload' + result_format,
        repost:                 api_domain_sina + '/statuses/repost' + result_format,
        comment:                api_domain_sina + '/statuses/comment' + result_format,
        reply:                  api_domain_sina + '/statuses/reply' + result_format,
        comment_destroy:        api_domain_sina + '/statuses/comment_destroy/{id}' + result_format,
        comments:               api_domain_sina + '/statuses/comments' + result_format,
        destroy:                api_domain_sina + '/statuses/destroy' + result_format,
        destroy_msg:            api_domain_sina + '/direct_messages/destroy/{id}' + result_format,
        direct_messages:        api_domain_sina + '/direct_messages' + result_format, 
        new_message:            api_domain_sina + '/direct_messages/new' + result_format,
        verify_credentials:     api_domain_sina + '/account/verify_credentials' + result_format,
        friendships_create:     api_domain_sina + '/friendships/create' + result_format,
        friendships_destroy:    api_domain_sina + '/friendships/destroy' + result_format,
        friendships_show:       api_domain_sina + '/friendships/show' + result_format,
        reset_count:            api_domain_sina + '/statuses/reset_count' + result_format,

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
            source: SOURCE2,
            data: (data||{})
        };
        _sendRequest(params, callbackFn);
	},

    user_timeline: function(data, callbackFn){
		if(!callbackFn) return;
        var params = {
            url: apiUrl.sina.user_timeline,
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
            source: SOURCE2,
            data: (data||{})
        };
        _sendRequest(params, callbackFn);
	},

    mentions: function(data, callbackFn){
		if(!callbackFn) return;
        var params = {
            url: apiUrl.sina.mentions,
            type: 'get',
            source: SOURCE2,
            data: (data||{})
        };
        _sendRequest(params, callbackFn);
	},

    followers: function(data, callbackFn){
		if(!callbackFn) return;
        var params = {
            url: apiUrl.sina.followers,
            type: 'get',
            data: (data||{})
        };
        _sendRequest(params, callbackFn);
	},

    friends: function(data, callbackFn){
		if(!callbackFn) return;
        var params = {
            url: apiUrl.sina.friends,
            type: 'get',
            data: (data||{})
        };
        _sendRequest(params, callbackFn);
	},

    favorite: function(data, callbackFn){
		if(!callbackFn) return;
        var params = {
            url: apiUrl.sina.favorite,
            type: 'get',
            data: (data||{})
        };
        _sendRequest(params, callbackFn);
	},

    favorites_create: function(data, callbackFn){
		if(!callbackFn) return;
        var params = {
            url: apiUrl.sina.favorites_create,
            type: 'post',
            data: (data||{})
        };
        _sendRequest(params, callbackFn);
	},

    favorites_destroy: function(data, callbackFn){
		if(!callbackFn) return;
        var params = {
            url: apiUrl.sina.favorites_destroy.replace('{id}', data.id),
            type: 'post',
            data: (data||{})
        };
        _sendRequest(params, callbackFn);
	},

    counts: function(data, callbackFn){
        if(!callbackFn) return;
        var params = {
            url: apiUrl.sina.counts,
            type: 'get',
            data: (data||{})
        };
        _sendRequest(params, callbackFn);
    },

    user_show: function(data, callbackFn){
        if(!callbackFn) return;
        var params = {
            url: apiUrl.sina.user_show,
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
            source: SOURCE2,
            data: (data||{})
        };
        _sendRequest(params, callbackFn);
	},

    destroy_msg: function(data, callbackFn){
		if(!callbackFn) return;
        var params = {
            url: apiUrl.sina.destroy_msg.replace('{id}',data.id),
            type: 'post',
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
    
    upload: function(data, callbackFn){
        if(!callbackFn) return;
        var params = {
            url: apiUrl.sina.upload,
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

    reply: function(data, callbackFn){
        if(!callbackFn) return;
        var params = {
            url: apiUrl.sina.reply,
            type: 'post',
            data: (data||{})
        };
        _sendRequest(params, callbackFn);
    },

    comments: function(data, callbackFn){
        if(!callbackFn) return;
        var params = {
            url: apiUrl.sina.comments,
            type: 'get',
            data: (data||{})
        };
        _sendRequest(params, callbackFn);
    },

    comment_destroy: function(data, callbackFn){
        if(!callbackFn) return;
        var params = {
            url: apiUrl.sina.comment_destroy.replace('{id}', data.id),
            type: 'post',
            data: (data||{})
        };
        _sendRequest(params, callbackFn);
    },

    friendships_create: function(data, callbackFn){
        if(!callbackFn) return;
        var params = {
            url: apiUrl.sina.friendships_create,
            type: 'post',
            data: (data||{})
        };
        _sendRequest(params, callbackFn);
    },

    friendships_destroy: function(data, callbackFn){
        if(!callbackFn) return;
        var params = {
            url: apiUrl.sina.friendships_destroy,
            type: 'post',
            data: (data||{})
        };
        _sendRequest(params, callbackFn);
    },

    friendships_show: function(data, callbackFn){
        if(!callbackFn) return;
        var params = {
            url: apiUrl.sina.friendships_show,
            type: 'get',
            data: (data||{})
        };
        _sendRequest(params, callbackFn);
    },

    reset_count: function(data, callbackFn){
        if(!callbackFn) return;
        var params = {
            url: apiUrl.sina.reset_count,
            type: 'post',
            data: (data||{})
        };
        _sendRequest(params, callbackFn);
    },

    destroy: function(data, callbackFn){
        if(!data || !data.id){return;}
        if(!callbackFn){ return; }
        var params = {
            url: apiUrl.sina.destroy.replace(result_format, '/' + data.id + result_format),
            type: 'POST',
            data: (data||{})
        };
        _sendRequest(params, callbackFn);
    }
};

function _sendRequest(params, callbackFn){
    if(!callbackFn) return;
    var user = params.user || localStorage.getObject(CURRENT_USER_KEY);
    if(!user){
        showMsg('用户未指定');
        callbackFn({}, 'error', '400');
        return;
    }
    if(params.source){
        params.data['source'] = params.source;
    }else{
        params.data['source'] = SOURCE;
    }
    //params.data['count'] = 100;
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
        cache: false,
        timeout: 60*1000, //一分钟超时
        type : params.type,
        data: params.data,
        dataType: 'text',
        beforeSend: function(req) {
            req.setRequestHeader('Authorization', make_base_auth_header(user.userName, user.password));
        },
        success: function (data, textStatus) {
            try{
                data = JSON.parse(data);
            }
            catch(err){
                //data = null;
                data = {error:'服务器返回结果错误，本地解析错误。', error_code:500};
                textStatus = 'error';
            }
            var error_code = null;
            if(data){
                if(data.error || data.error_code){
                    showMsg('error: ' + data.error + ', error_code: ' + data.error_code);
                    error_code = data.error_code || error_code;
                }
            }else{error_code = 400;}
            callbackFn(data, textStatus, error_code);
            hideLoading();
        },
        error: function (xhr, textStatus, errorThrown) {
            var r = null, status = 'unknow';
            if(xhr){
                if(xhr.status){
                    status = xhr.status;
                }
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
            }
            if(!r){
                textStatus = textStatus ? ('textStatus: ' + textStatus + '; ') : '';
                errorThrown = errorThrown ? ('errorThrown: ' + errorThrown + '; ') : '';
                r = {error:'error: ' + textStatus + errorThrown + 'statuCode: ' + status};
                showMsg(r.error);
            }
            callbackFn(r||{}, 'error', status); //不管什么状态，都返回 error
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
