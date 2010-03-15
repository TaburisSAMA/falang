/*

*/

var SOURCE = "3097082413"; //encodeURIComponent('<a href="http://QLeelulu.cnblogs.com">iDi</a>');

var result_format = '.json';

var domain_digu_bak = 'http://www.digu.com';
var domain_digu = domain_sina = 'http://api.t.sina.com.cn';

var api_domain_digu = 'http://api.minicloud.com.cn';
var api_domain_sina = 'http://api.t.sina.com.cn';
var api_domain_twitter = 'http://api.twitter.com';

//各微博的API接口地址
var apiUrl = {
	
	digu_bak : {
        public_timeline:  api_domain_digu + '/statuses/public_timeline' + result_format,
        friends_timeline: api_domain_digu + '/statuses/friends_timeline' + result_format,
        user_timeline:    api_domain_digu + '/statuses/user_timeline' + result_format,
        replies:          api_domain_digu + '/statuses/replies' + result_format,
        update:           api_domain_digu + '/statuses/update' + result_format,
        replies:          api_domain_digu + '/statuses/replies' + result_format,
        destroy:          api_domain_digu + '/statuses/destroy' + result_format,
        messages:         api_domain_digu + '/messages/100' + result_format, //0 表示悄悄话，1 表示戳一下，2 表示升级通知，3 表示代发通知，4 表示系统消息。100表示不分类，都查询。
        new_message:      api_domain_digu + '/messages/handle/new' + result_format,
        verify:           api_domain_digu + '/account/verify' + result_format,

        detailUrl:        domain_digu + '/jump?aid=detail&twId=',
        searchUrl:        domain_digu + '/search/'
    },
    
    sina : {
        public_timeline:  api_domain_sina + '/statuses/public_timeline' + result_format,
        friends_timeline: api_domain_sina + '/statuses/friends_timeline' + result_format,
        user_timeline:    api_domain_sina + '/statuses/user_timeline' + result_format,
        replies:          api_domain_sina + '/statuses/mentions' + result_format,
        update:           api_domain_sina + '/statuses/update' + result_format,
        destroy:          api_domain_sina + '/statuses/destroy' + result_format,
        messages:         api_domain_sina + '/direct_messages' + result_format, //0 表示悄悄话，1 表示戳一下，2 表示升级通知，3 表示代发通知，4 表示系统消息。100表示不分类，都查询。
        new_message:      api_domain_sina + '/direct_messages/new' + result_format,
        verify:           api_domain_sina + '/account/verify_credentials' + result_format,

        detailUrl:        domain_sina + '/jump?aid=detail&twId=',
        searchUrl:        domain_sina + '/search/'
    },
    
    twitter : {
    
    }
};

apiUrl.digu = apiUrl.sina; //懒得改了，这样换着先吧。

var diguApi_bak = {
    /*
        callbackFn(data, textStatus, errorCode): 
            成功和错误都会调用的方法。
            如果失败则errorCode为服务器返回的错误代码(例如: 400)。
    */
    verify: function(user, callbackFn, data){
		if(!user || !callbackFn) return;
        if(data){
            //data['since_id'] = last_id;
        }else{
            //data = {since_id: last_id};
            data = {};
        }
		$.ajax({
			url: apiUrl.digu.verify + '?isAllInfo=true',
			username: user.userName,
			password: user.password,
            type: 'get',
            data: data,
            beforeSend: function(req) {
                req.setRequestHeader('Cookie', '');
                req.setRequestHeader('Authorization', make_base_auth_header(user.userName, user.password));
            },
			success: function (data, textStatus) {
				callbackFn(data, textStatus);
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				textStatus = textStatus ? ('textStatus: ' + textStatus + '; ') : '';
                errorThrown = errorThrown ? ('errorThrown: ' + errorThrown + '; ') : '';
				showMsg('error: ' + textStatus + errorThrown + 'statuCode: ' + XMLHttpRequest.status);
                callbackFn(null, textStatus, XMLHttpRequest.status);
			}
		});
	},
	
	getFriendsTimeline: function(callbackFn, data){
		if(!callbackFn) return;
        var c_user = localStorage.getObject(CURRENT_USER_KEY);
        if(!c_user) return;
        //var last_id = localStorage.getObject(LAST_FRIENDS_TIMELINE_MSG_ID);
        if(data){
            //data['since_id'] = last_id;
        }else{
            //data = {since_id: last_id};
            data = {};
        }
		$.ajax({
			url: apiUrl.digu.friends_timeline,
			username: c_user.userName,
			password: c_user.password,
            type: 'get',
            data: data,
            //dataType: 'html',
            beforeSend: function(req) {
                req.setRequestHeader('Cookie', '');
                req.setRequestHeader('Authorization', make_base_auth_header(c_user.userName, c_user.password));
            },
			success: function (data, textStatus) {
                //data = JSON.parse(data);
				callbackFn(data, textStatus);
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				textStatus = textStatus ? ('textStatus: ' + textStatus + '; ') : '';
                errorThrown = errorThrown ? ('errorThrown: ' + errorThrown + '; ') : '';
				showMsg('error: ' + textStatus + errorThrown + 'statuCode: ' + XMLHttpRequest.status);
                callbackFn(null, textStatus, XMLHttpRequest.status);
			}
		});
	},

    replies: function(callbackFn, data){
		if(!callbackFn) return;
        var c_user = localStorage.getObject(CURRENT_USER_KEY);
        if(!c_user) return;
        if(!data){
            data = {};
        }
        data['source'] = SOURCE;
		$.ajax({
			url: apiUrl.digu.replies,
			username: c_user.userName,
			password: c_user.password,
            type: 'get',
            data: data,
            beforeSend: function(req) {
                req.setRequestHeader('Cookie', '');
                req.setRequestHeader('Authorization', make_base_auth_header(c_user.userName, c_user.password));
            },
			success: function (data, textStatus) {
                //data = JSON.parse(data);
				callbackFn(data, textStatus);
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				textStatus = textStatus ? ('textStatus: ' + textStatus + '; ') : '';
                errorThrown = errorThrown ? ('errorThrown: ' + errorThrown + '; ') : '';
				showMsg('error: ' + textStatus + errorThrown + 'statuCode: ' + XMLHttpRequest.status);
                callbackFn(null, textStatus, XMLHttpRequest.status);
			}
		});
	},

    messages: function(callbackFn, data){
		if(!callbackFn) return;
        var c_user = localStorage.getObject(CURRENT_USER_KEY);
        if(!c_user) return;
        if(!data){
            data = {};
        }
		$.ajax({
			url: apiUrl.digu.messages,
			username: c_user.userName,
			password: c_user.password,
            type: 'get',
            data: data,
            beforeSend: function(req) {
                req.setRequestHeader('Cookie', '');
                req.setRequestHeader('Authorization', make_base_auth_header(c_user.userName, c_user.password));
            },
			success: function (data, textStatus) {
                //data = JSON.parse(data);
				callbackFn(data, textStatus);
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				textStatus = textStatus ? ('textStatus: ' + textStatus + '; ') : '';
                errorThrown = errorThrown ? ('errorThrown: ' + errorThrown + '; ') : '';
				showMsg('error: ' + textStatus + errorThrown + 'statuCode: ' + XMLHttpRequest.status);
                callbackFn(null, textStatus, XMLHttpRequest.status);
			}
		});
	},

    /*data的参数列表：
    content 待发送消息的正文，请确定必要时需要进行URL编码 ( encode ) ，另外，不超过140英文或140汉字。
    message 必须 0 表示悄悄话 1 表示戳一下
    receiveUserId 必须，接收方的用户id
    source 可选，显示在网站上的来自哪里对应的标识符。如果想显示指定的字符，请与官方人员联系。
    */
    new_message: function(callbackFn, data){//悄悄话
		if(!callbackFn) return;
        var c_user = localStorage.getObject(CURRENT_USER_KEY);
        if(!c_user) return;
        if(!data){
            data = {};
        }
        data["message"] = 0;
        data['source'] = SOURCE;
		$.ajax({
			url: apiUrl.digu.new_message,
			username: c_user.userName,
			password: c_user.password,
            type: 'post',
            data: data,
            beforeSend: function(req) {
                req.setRequestHeader('Cookie', '');
                req.setRequestHeader('Authorization', make_base_auth_header(c_user.userName, c_user.password));
            },
			success: function (data, textStatus) {
                //data = JSON.parse(data);
				callbackFn(data, textStatus);
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				textStatus = textStatus ? ('textStatus: ' + textStatus + '; ') : '';
                errorThrown = errorThrown ? ('errorThrown: ' + errorThrown + '; ') : '';
				showMsg('error: ' + textStatus + errorThrown + 'statuCode: ' + XMLHttpRequest.status);
                callbackFn(null, textStatus, XMLHttpRequest.status);
			}
		});
	},
    
    update: function(content, callbackFn, data){
        if(!content || !callbackFn) return;
		var c_user = localStorage.getObject(CURRENT_USER_KEY);
        if(!c_user) return;
        if(!data){
            data={};
        }
        data['content'] = content;
        data['source'] = SOURCE;
        showLoading();
		$.ajax({
			url: apiUrl.digu.update,
			username: c_user.userName,
			password: c_user.password,
            type : 'post',
            data: data,
            beforeSend: function(req) {
                req.setRequestHeader('Cookie', '');
                req.setRequestHeader('Authorization', make_base_auth_header(c_user.userName, c_user.password));
            },
			success: function (data, textStatus) {
                //data = JSON.parse(data);
				callbackFn(data, textStatus);
                hideLoading();
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				textStatus = textStatus ? ('textStatus: ' + textStatus + '; ') : '';
                errorThrown = errorThrown ? ('errorThrown: ' + errorThrown + '; ') : '';
				showMsg('error: ' + textStatus + errorThrown + 'statuCode: ' + XMLHttpRequest.status);
                callbackFn(null, textStatus, XMLHttpRequest.status);
                hideLoading();
			}
		});
    },
    
    destroy: function(msgId, callbackFn){
        if(!msgId || !callbackFn) return;
		var c_user = localStorage.getObject(CURRENT_USER_KEY);
        if(!c_user) return;
        showLoading();
		$.ajax({
			url: apiUrl.digu.destroy,
			username: c_user.userName,
			password: c_user.password,
            type : 'get',
            data: {id: msgId, source:SOURCE},
            beforeSend: function(req) {
                req.setRequestHeader('Cookie', '');
                req.setRequestHeader('Authorization', make_base_auth_header(c_user.userName, c_user.password));
            },
			success: function (data, textStatus) {
                //data = JSON.parse(data);
				callbackFn(data, textStatus);
                hideLoading();
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
                textStatus = textStatus ? ('textStatus: ' + textStatus + '; ') : '';
                errorThrown = errorThrown ? ('errorThrown: ' + errorThrown + '; ') : '';
				showMsg('error: ' + textStatus + errorThrown + 'statuCode: ' + XMLHttpRequest.status);
                callbackFn(null, textStatus, XMLHttpRequest.status);
                hideLoading();
			}
		});
    }


}

var sinaApi = diguApi = {
    /*
        callbackFn(data, textStatus, errorCode): 
            成功和错误都会调用的方法。
            如果失败则errorCode为服务器返回的错误代码(例如: 400)。
    */
    verify: function(user, callbackFn, data){
		if(!user || !callbackFn) return;
        if(data){
            //data['since_id'] = last_id;
        }else{
            //data = {since_id: last_id};
            data = {};
        }
        data['source'] = SOURCE;
		$.ajax({
			url: apiUrl.sina.verify + '?isAllInfo=true',
			username: user.userName,
			password: user.password,
            type: 'get',
            data: data,
            beforeSend: function(req) {
                req.setRequestHeader('Cookie', null, false);
                req.setRequestHeader('Authorization', make_base_auth_header(user.userName, user.password));
            },
			success: function (data, textStatus, xhr) {
                error_code = null;
                if(data){
                    if(data.error || data.error_code){
                        showMsg('error: ' + data.error + ', error_code: ' + data.error_code);
                        error_code = data.error_code || error_code;
                    }
                }else{error_code = 400;}
				callbackFn(data, textStatus, error_code);
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				textStatus = textStatus ? ('textStatus: ' + textStatus + '; ') : '';
                errorThrown = errorThrown ? ('errorThrown: ' + errorThrown + '; ') : '';
				showMsg('error: ' + textStatus + errorThrown + 'statuCode: ' + XMLHttpRequest.status);
                callbackFn(null, textStatus, XMLHttpRequest.status);
			}
		});
	},
	
	getFriendsTimeline: function(callbackFn, data){
		if(!callbackFn) return;
        var c_user = localStorage.getObject(CURRENT_USER_KEY);
        if(!c_user) return;
        //var last_id = localStorage.getObject(LAST_FRIENDS_TIMELINE_MSG_ID);
        if(data){
            //data['since_id'] = last_id;
        }else{
            //data = {since_id: last_id};
            data = {};
        }
        data['source'] = SOURCE;
		$.ajax({
			url: apiUrl.sina.friends_timeline,
			username: c_user.userName,
			password: c_user.password,
            type: 'get',
            data: data,
            //dataType: 'html',
            beforeSend: function(req) {
                req.setRequestHeader('Cookie', '');
                req.setRequestHeader('Authorization', make_base_auth_header(c_user.userName, c_user.password));
            },
			success: function (data, textStatus) {
                //data = JSON.parse(data);
				error_code = null;
                if(data){
                    if(data.error || data.error_code){
                        showMsg('error: ' + data.error + ', error_code: ' + data.error_code);
                        error_code = data.error_code || error_code;
                    }
                }else{error_code = 400;}
				callbackFn(data, textStatus, error_code);
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				textStatus = textStatus ? ('textStatus: ' + textStatus + '; ') : '';
                errorThrown = errorThrown ? ('errorThrown: ' + errorThrown + '; ') : '';
				showMsg('error: ' + textStatus + errorThrown + 'statuCode: ' + XMLHttpRequest.status);
                callbackFn(null, textStatus, XMLHttpRequest.status);
			}
		});
	},

    replies: function(callbackFn, data){
		if(!callbackFn) return;
        var c_user = localStorage.getObject(CURRENT_USER_KEY);
        if(!c_user) return;
        if(!data){
            data = {};
        }
        data['source'] = SOURCE;
		$.ajax({
			url: apiUrl.sina.replies,
			username: c_user.userName,
			password: c_user.password,
            type: 'get',
            data: data,
            beforeSend: function(req) {
                req.setRequestHeader('Cookie', '');
                req.setRequestHeader('Authorization', make_base_auth_header(c_user.userName, c_user.password));
            },
			success: function (data, textStatus) {
                error_code = null;
                if(data){
                    if(data.error || data.error_code){
                        showMsg('error: ' + data.error + ', error_code: ' + data.error_code);
                        error_code = data.error_code || error_code;
                    }
                }else{error_code = 400;}
				callbackFn(data, textStatus, error_code);
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				textStatus = textStatus ? ('textStatus: ' + textStatus + '; ') : '';
                errorThrown = errorThrown ? ('errorThrown: ' + errorThrown + '; ') : '';
				showMsg('error: ' + textStatus + errorThrown + 'statuCode: ' + XMLHttpRequest.status);
                callbackFn(null, textStatus, XMLHttpRequest.status);
			}
		});
	},

    messages: function(callbackFn, data){
		if(!callbackFn) return;
        var c_user = localStorage.getObject(CURRENT_USER_KEY);
        if(!c_user) return;
        if(!data){
            data = {};
        }
        data['source'] = SOURCE;
		$.ajax({
			url: apiUrl.sina.messages,
			username: c_user.userName,
			password: c_user.password,
            type: 'get',
            data: data,
            beforeSend: function(req) {
                req.setRequestHeader('Cookie', '');
                req.setRequestHeader('Authorization', make_base_auth_header(c_user.userName, c_user.password));
            },
			success: function (data, textStatus) {
                error_code = null;
                if(data){
                    if(data.error || data.error_code){
                        showMsg('error: ' + data.error + ', error_code: ' + data.error_code);
                        error_code = data.error_code || error_code;
                    }
                }else{error_code = 400;}
				callbackFn(data, textStatus, error_code);
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				textStatus = textStatus ? ('textStatus: ' + textStatus + '; ') : '';
                errorThrown = errorThrown ? ('errorThrown: ' + errorThrown + '; ') : '';
				showMsg('error: ' + textStatus + errorThrown + 'statuCode: ' + XMLHttpRequest.status);
                callbackFn(null, textStatus, XMLHttpRequest.status);
			}
		});
	},

    /*data的参数列表：
    content 待发送消息的正文，请确定必要时需要进行URL编码 ( encode ) ，另外，不超过140英文或140汉字。
    message 必须 0 表示悄悄话 1 表示戳一下
    receiveUserId 必须，接收方的用户id
    source 可选，显示在网站上的来自哪里对应的标识符。如果想显示指定的字符，请与官方人员联系。
    */
    new_message: function(callbackFn, data){//悄悄话
		if(!callbackFn) return;
        var c_user = localStorage.getObject(CURRENT_USER_KEY);
        if(!c_user) return;
        if(!data){
            data = {};
        }
        data["message"] = 0;
        data['source'] = SOURCE;
		$.ajax({
			url: apiUrl.sina.new_message,
			username: c_user.userName,
			password: c_user.password,
            type: 'post',
            data: data,
            beforeSend: function(req) {
                req.setRequestHeader('Cookie', '');
                req.setRequestHeader('Authorization', make_base_auth_header(c_user.userName, c_user.password));
            },
			success: function (data, textStatus) {
                error_code = null;
                if(data){
                    if(data.error || data.error_code){
                        showMsg('error: ' + data.error + ', error_code: ' + data.error_code);
                        error_code = data.error_code || error_code;
                    }
                }else{error_code = 400;}
				callbackFn(data, textStatus, error_code);
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				textStatus = textStatus ? ('textStatus: ' + textStatus + '; ') : '';
                errorThrown = errorThrown ? ('errorThrown: ' + errorThrown + '; ') : '';
				showMsg('error: ' + textStatus + errorThrown + 'statuCode: ' + XMLHttpRequest.status);
                callbackFn(null, textStatus, XMLHttpRequest.status);
			}
		});
	},
    
    update: function(content, callbackFn, data){
        if(!content || !callbackFn) return;
		var c_user = localStorage.getObject(CURRENT_USER_KEY);
        if(!c_user) return;
        if(!data){
            data={};
        }
        data['status'] = content;
        data['source'] = SOURCE;
        showLoading();
		$.ajax({
			url: apiUrl.sina.update,
			username: c_user.userName,
			password: c_user.password,
            type : 'post',
            data: data,
            beforeSend: function(req) {
                req.setRequestHeader('Cookie', '');
                req.setRequestHeader('Authorization', make_base_auth_header(c_user.userName, c_user.password));
            },
			success: function (data, textStatus) {
                error_code = null;
                if(data){
                    if(data.error || data.error_code){
                        showMsg('error: ' + data.error + ', error_code: ' + data.error_code);
                        error_code = data.error_code || error_code;
                    }
                }else{error_code = 400;}
				callbackFn(data, textStatus, error_code);
                hideLoading();
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				textStatus = textStatus ? ('textStatus: ' + textStatus + '; ') : '';
                errorThrown = errorThrown ? ('errorThrown: ' + errorThrown + '; ') : '';
				showMsg('error: ' + textStatus + errorThrown + 'statuCode: ' + XMLHttpRequest.status);
                callbackFn(null, textStatus, XMLHttpRequest.status);
                hideLoading();
			}
		});
    },
    
    destroy: function(msgId, callbackFn){
        if(!msgId || !callbackFn) return;
		var c_user = localStorage.getObject(CURRENT_USER_KEY);
        if(!c_user) return;
        showLoading();
        data['source'] = SOURCE;
		$.ajax({
			url: apiUrl.sina.destroy,
			username: c_user.userName,
			password: c_user.password,
            type : 'get',
            data: {id: msgId, source:SOURCE},
            beforeSend: function(req) {
                req.setRequestHeader('Cookie', '');
                req.setRequestHeader('Authorization', make_base_auth_header(c_user.userName, c_user.password));
            },
			success: function (data, textStatus) {
                error_code = null;
                if(data){
                    if(data.error || data.error_code){
                        showMsg('error: ' + data.error + ', error_code: ' + data.error_code);
                        error_code = data.error_code || error_code;
                    }
                }else{error_code = 400;}
				callbackFn(data, textStatus, error_code);
                hideLoading();
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
                textStatus = textStatus ? ('textStatus: ' + textStatus + '; ') : '';
                errorThrown = errorThrown ? ('errorThrown: ' + errorThrown + '; ') : '';
				showMsg('error: ' + textStatus + errorThrown + 'statuCode: ' + XMLHttpRequest.status);
                callbackFn(null, textStatus, XMLHttpRequest.status);
                hideLoading();
			}
		});
    }


}


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
