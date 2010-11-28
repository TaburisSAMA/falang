/*
* @author qleelulu@gmail.com
*/

var result_format = '.json';

var sinaApi = {
	
	config: {
		host: 'http://api.t.sina.com.cn',
        user_home_url: 'http://t.sina.com.cn/n/',
        search_url: 'http://t.sina.com.cn/k/',
		result_format: '.json',
		source: '3538199806',
        oauth_key: '3538199806',
        oauth_secret: '18cf587d60e11e3c160114fd92dd1f2b',
        
        support_comment: true, // 判断是否支持评论
		support_upload: true, // 是否支持上传图片
		support_repost: true, // 是否支持新浪形式转载
		repost_pre: '转:', // 转发前缀
		support_favorites: true,
		// 是否支持max_id 分页
		support_max_id: true,
		support_destroy_msg: true, //是否支持删除私信
        
		// api
        public_timeline:      '/statuses/public_timeline',
        friends_timeline:     '/statuses/friends_timeline',
        comments_timeline: 	  '/statuses/comments_timeline',
        user_timeline: 	      '/statuses/user_timeline',
        mentions:             '/statuses/mentions',
        followers:            '/statuses/followers',
        friends:              '/statuses/friends',
        favorites:            '/favorites',
        favorites_create:     '/favorites/create',
        favorites_destroy:    '/favorites/destroy/{{id}}',
        counts:               '/statuses/counts',
        update:               '/statuses/update',
        upload:               '/statuses/upload',
        repost:               '/statuses/repost',
        comment:              '/statuses/comment',
        reply:                '/statuses/reply',
        comment_destroy:      '/statuses/comment_destroy/{{id}}',
        comments:             '/statuses/comments',
        destroy:              '/statuses/destroy/{{id}}',
        destroy_msg:          '/direct_messages/destroy/{{id}}',
        direct_messages:      '/direct_messages', 
        new_message:          '/direct_messages/new',
        verify_credentials:   '/account/verify_credentials',
        rate_limit_status:    '/account/rate_limit_status',
        friendships_create:   '/friendships/create',
        friendships_destroy:  '/friendships/destroy',
        friendships_show:     '/friendships/show',
        reset_count:          '/statuses/reset_count',
        user_show:            '/users/show/{{id}}',
        
        oauth_authorize: 	  '/oauth/authorize',
        oauth_request_token:  '/oauth/request_token',
        oauth_access_token:   '/oauth/access_token',

        detailUrl:        '/jump?aid=detail&twId=',
        searchUrl:        '/search/'
    },
    

	// 设置认证头
	apply_auth: function(url, args, user) {
		if(user.authType == 'baseauth') {
			args.headers['Authorization'] = make_base_auth_header(user.userName, user.password);
		} else if(user.authType == 'oauth' || user.authType == 'xauth') {
			var accessor = {
				consumerSecret: this.config.oauth_secret
			};
			// 已通过oauth认证
			if(user.oauth_token_secret) {
				accessor.tokenSecret = user.oauth_token_secret;
			}
			var parameters = {};
			for(var k in args.data) {
				parameters[k] = args.data[k];
				if(k.substring(0, 6) == 'oauth_') { // 删除oauth_verifier相关参数
					delete args.data[k];
				}
			}
			var message = {
				action: url,
				method: args.type, 
				parameters: parameters
	        };
			message.parameters.oauth_consumer_key = this.config.oauth_key;
			message.parameters.oauth_version = '1.0';
			// 已通过oauth认证
			if(user.oauth_token_key) {
				message.parameters.oauth_token = user.oauth_token_key;
			}
			// 设置时间戳
			OAuth.setTimestampAndNonce(message);
			// 签名参数
		    OAuth.SignatureMethod.sign(message, accessor);
		    // 获取认证头部
		    args.headers['Authorization'] = OAuth.getAuthorizationHeader('', message.parameters);
		}
	},
	
    // 获取认证url
    get_authorization_url: function(user, callbackFn) {
    	if(user.authType == 'oauth') {
    		var login_url = this.config.host + this.config.oauth_authorize + '?oauth_token=';
    		this.get_request_token(user, function(token, text_status, error_code) {
    			if(token) {
    				user.oauth_token_key = token.oauth_token;
        			user.oauth_token_secret = token.oauth_token_secret;
        			// 返回登录url给用户登录
        			login_url += user.oauth_token_key;
    			} else {
    				login_url = null;
    			}
    			callbackFn(login_url, text_status, error_code);
    		});
    	} else {
    		throw new Error(user.authType + ' not support get_authorization_url');
    	}
    },
    
    get_request_token: function(user, callbackFn) {
    	if(user.authType == 'oauth') {
    		var params = {
	            url: this.config.oauth_request_token,
	            type: 'get',
	            user: user,
	            play_load: 'string',
	            need_source: false
	        };
    		this._sendRequest(params, function(token_str, text_status, error_code) {
    			var token = null;
    			if(text_status != 'error') {
    				token = decodeForm(token_str);
    				if(!token.oauth_token) {
    					token = null;
    					error_code = token_str;
    					text_status = 'error';
    				}
    			}
    			callbackFn(token, text_status, error_code);
    		});
    	} else {
    		throw new Error(user.authType + ' not support get_request_token');
    	}
    },
    
    // 必须设置user.oauth_pin
    get_access_token: function(user, callbackFn) {
    	if(user.authType == 'oauth' || user.authType == 'xauth') {
    		var params = {
	            url: this.config.oauth_access_token,
	            type: 'get',
	            user: user,
	            play_load: 'string',
	            data: {'oauth_verifier': user.oauth_pin},
	            need_source: false
	        };
    		this._sendRequest(params, function(token_str, text_status, error_code) {
    			var token = null;
    			if(text_status != 'error') {
    				token = decodeForm(token_str);
    				if(!token.oauth_token) {
    					token = null;
    					error_code = token_str;
    					text_status = 'error';
    				} else {
    					user.oauth_token_key = token.oauth_token;
            			user.oauth_token_secret = token.oauth_token_secret;
    				}
    			}
    			callbackFn(user, text_status, error_code);
    		});
    	} else {
    		throw new Error(user.authType + ' not support get_access_token');
    	}
    },
    
    /*
        callbackFn(data, textStatus, errorCode): 
            成功和错误都会调用的方法。
            如果失败则errorCode为服务器返回的错误代码(例如: 400)。
    */
    verify_credentials: function(user, callbackFn, data){
        if(!user || !callbackFn) return;
        var params = {
            url: this.config.verify_credentials,
            type: 'get',
            user: user,
            play_load: 'user',
            data: data
        };
        this._sendRequest(params, callbackFn);
	},
        
    rate_limit_status: function(data, callbackFn){
        if(!callbackFn) return;
        var params = {
            url: this.config.rate_limit_status,
            type: 'get',
            play_load: 'rate',
            data: data
        };
        this._sendRequest(params, callbackFn);
	},
	
	// since_id, max_id, count, page 
	friends_timeline: function(data, callbackFn){
		if(!callbackFn) return;
        var params = {
            url: this.config.friends_timeline,
            type: 'get',
            play_load: 'status',
            data: data
        };
        this._sendRequest(params, callbackFn);
	},
	
	// id, user_id, screen_name, since_id, max_id, count, page 
    user_timeline: function(data, callbackFn){
		if(!callbackFn) return;
        var params = {
            url: this.config.user_timeline,
            type: 'get',
            play_load: 'status',
            data: data
        };
        this._sendRequest(params, callbackFn);
	},
	
	// id, count, page
    comments_timeline: function(data, callbackFn){
		if(!callbackFn) return;
        var params = {
            url: this.config.comments_timeline,
            type: 'get',
            play_load: 'comment',
            data: data
        };
        this._sendRequest(params, callbackFn);
	},

	// since_id, max_id, count, page 
    mentions: function(data, callbackFn){
		if(!callbackFn) return;
        var params = {
            url: this.config.mentions,
            type: 'get',
            play_load: 'status',
            data: data
        };
        this._sendRequest(params, callbackFn);
	},

	// id, user_id, screen_name, cursor, count
    followers: function(data, callbackFn){
		if(!callbackFn) return;
        var params = {
            url: this.config.followers,
            type: 'get',
            play_load: 'user',
            data: data
        };
        this._sendRequest(params, callbackFn);
	},

	// id, user_id, screen_name, cursor, count
    friends: function(data, callbackFn){
		if(!callbackFn) return;
        var params = {
            url: this.config.friends,
            type: 'get',
            play_load: 'user',
            data: data
        };
        this._sendRequest(params, callbackFn);
	},

	// page
    favorites: function(data, callbackFn){
		if(!callbackFn) return;
        var params = {
            url: this.config.favorites,
            type: 'get',
            play_load: 'status',
            data: data
        };
        this._sendRequest(params, callbackFn);
	},

	// id
    favorites_create: function(data, callbackFn){
		if(!callbackFn) return;
        var params = {
            url: this.config.favorites_create,
            type: 'post',
            play_load: 'status',
            data: data
        };
        this._sendRequest(params, callbackFn);
	},

	// id
    favorites_destroy: function(data, callbackFn){
		if(!callbackFn) return;
        var params = {
            url: this.config.favorites_destroy,
            type: 'post',
            play_load: 'status',
            data: data
        };
        this._sendRequest(params, callbackFn);
	},

	// ids
    counts: function(data, callbackFn){
        if(!callbackFn) return;
        var params = {
            url: this.config.counts,
            type: 'get',
            play_load: 'count',
            data: data
        };
        this._sendRequest(params, callbackFn);
    },

    // id
    user_show: function(data, callbackFn){
        if(!callbackFn) return;
        var params = {
            url: this.config.user_show,
            type: 'get',
            play_load: 'user',
            data: data
        };
        this._sendRequest(params, callbackFn);
    },

    // since_id, max_id, count, page 
    direct_messages: function(data, callbackFn){
		if(!callbackFn) return;
        var params = {
            url: this.config.direct_messages,
            type: 'get',
            play_load: 'message',
            data: data
        };
        this._sendRequest(params, callbackFn);
	},

	// id
    destroy_msg: function(data, callbackFn){
		if(!callbackFn) return;
        var params = {
            url: this.config.destroy_msg,
            type: 'post',
            play_load: 'message',
            data: data
        };
        this._sendRequest(params, callbackFn);
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
            url: this.config.new_message,
            type: 'post',
            play_load: 'message',
            data: data
        };
        this._sendRequest(params, callbackFn);
	},
    
    update: function(data, callbackFn){
        if(!callbackFn) return;
        var params = {
            url: this.config.update,
            type: 'post',
            play_load: 'status',
            data: data
        };
        this._sendRequest(params, callbackFn);
    },
    
    // 格式上传参数，方便子类覆盖做特殊处理
    // 子类可以增加自己的参数
    format_upload_params: function(user, data, pic) {
    	
    },
    
    /* 上传图片
     * user: 当前用户
     * data: {source: xxx, status: xxx, ...}
     * pic: {keyname: 'pic', file: fileobj}
     * before_request: before_request function
     * onprogress: on_progress_callback function
     * callback: finish callback function
     * */
    upload: function(user, data, pic, before_request, onprogress, callback) {
    	var auth_args = {type: 'post', data: {}, headers: {}};
    	this.format_upload_params(user, data, pic);
    	pic.keyname = pic.keyname || 'pic';
    	data.source = data.source || this.config.source;
	    var boundary = '----multipartformboundary' + (new Date).getTime();
	    var dashdash = '--';
	    var crlf = '\r\n';
	
	    /* Build RFC2388 string. */
	    var builder = '';
	
	    builder += dashdash;
	    builder += boundary;
	    builder += crlf;
		
	    for(var key in data) {
	    	/* Generate headers. key */            
		    builder += 'Content-Disposition: form-data; name="' + key + '"';
		    builder += crlf;
		    builder += crlf; 
		     /* Append form data. */
		    var value = this.url_encode(data[key]);
		    builder += this.url_encode(data[key]);
		    builder += crlf;
		    
		    /* Write boundary. */
		    builder += dashdash;
		    builder += boundary;
		    builder += crlf;
		    
		    // set auth params
		    auth_args.data[key] = value;
	    }
	    
	    /* Generate headers. [PIC] */            
	    builder += 'Content-Disposition: form-data; name="' + pic.keyname + '"';
	    if(pic.file.fileName) {
	      builder += '; filename="' + this.url_encode(pic.file.fileName) + '"';
	    }
	    builder += crlf;
	
	    builder += 'Content-Type: '+ pic.file.type;
	    builder += crlf;
	    builder += crlf; 
	
	    var bb = new BlobBuilder(); //NOTE
	    bb.append(builder);
	    bb.append(pic.file);
	    builder = crlf;
	    
	    /* Mark end of the request.*/ 
	    builder += dashdash;
	    builder += boundary;
	    builder += dashdash;
	    builder += crlf;
	
	    bb.append(builder);
	    
	    if(before_request) {
	    	before_request();
	    }
	    var api = user.apiProxy || this.config.host;
		var url = api + this.config.upload + this.config.result_format;
		// 设置认证头部
        this.apply_auth(url, auth_args, user);
	    $.ajax({
	        url: url,
	        cache: false,
	        timeout: 5*60*1000, //5分钟超时
	        type : 'post',
	        data: bb.getBlob(),
	        dataType: 'text',
	        contentType: 'multipart/form-data; boundary=' + boundary,
	        processData: false,
	        beforeSend: function(req) {
		    	for(var k in auth_args.headers) {
		    		req.setRequestHeader(k, auth_args.headers[k]);
	    		}
	            if(onprogress) {
	            	if(req.upload){
		                req.upload.onprogress = function(ev){
		                    onprogress(ev);
		                };
		            }
	            }
	        },
	        success: function(data, textStatus) {
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
	                    _showMsg('error: ' + data.error + ', error_code: ' + data.error_code);
	                    error_code = data.error_code || error_code;
	                }
	            }else{error_code = 400;}
	            callback(data, textStatus, error_code);
	        },
	        error: function (xhr, textStatus, errorThrown) {
	            var r = null, status = 'unknow';
	            if(xhr){
	                if(xhr.status){
	                    status = xhr.status;
	                }
	                if(xhr.responseText){
	                    var r = xhr.responseText;
	                    try{
	                        r = JSON.parse(r);
	                    }
	                    catch(err){
	                        r = null;
	                    }
	                    if(r){_showMsg('error_code:' + r.error_code + ', error:' + r.error);}
	                }
	            }
	            if(!r){
	                textStatus = textStatus ? ('textStatus: ' + textStatus + '; ') : '';
	                errorThrown = errorThrown ? ('errorThrown: ' + errorThrown + '; ') : '';
	                _showMsg('error: ' + textStatus + errorThrown + 'statuCode: ' + status);
	            }
	            callback({}, 'error', status); //不管什么状态，都返回 error
	        }
	    });
    },

    repost: function(data, callbackFn){
        if(!callbackFn) return;
        var params = {
            url: this.config.repost,
            type: 'post',
            play_load: 'status',
            data: data
        };
        this._sendRequest(params, callbackFn);
    },

    comment: function(data, callbackFn){
        if(!callbackFn) return;
        var params = {
            url: this.config.comment,
            type: 'post',
            play_load: 'comment',
            data: data
        };
        this._sendRequest(params, callbackFn);
    },

    reply: function(data, callbackFn){
        if(!callbackFn) return;
        var params = {
            url: this.config.reply,
            type: 'post',
            play_load: 'comment',
            data: data
        };
        this._sendRequest(params, callbackFn);
    },

    comments: function(data, callbackFn){
        if(!callbackFn) return;
        var params = {
            url: this.config.comments,
            type: 'get',
            play_load: 'comment',
            data: data
        };
        this._sendRequest(params, callbackFn);
    },

    // id
    comment_destroy: function(data, callbackFn){
        if(!callbackFn) return;
        var params = {
            url: this.config.comment_destroy,
            type: 'post',
            play_load: 'comment',
            data: data
        };
        this._sendRequest(params, callbackFn);
    },

    friendships_create: function(data, callbackFn){
        if(!callbackFn) return;
        var params = {
            url: this.config.friendships_create,
            type: 'post',
            play_load: 'user',
            data: data
        };
        this._sendRequest(params, callbackFn);
    },

    // id
    friendships_destroy: function(data, callbackFn){
        if(!callbackFn) return;
        var params = {
            url: this.config.friendships_destroy,
            type: 'post',
            play_load: 'user',
            data: data
        };
        this._sendRequest(params, callbackFn);
    },

    friendships_show: function(data, callbackFn){
        if(!callbackFn) return;
        var params = {
            url: this.config.friendships_show,
            type: 'get',
            play_load: 'user',
            data: data
        };
        this._sendRequest(params, callbackFn);
    },

    // type
    reset_count: function(data, callbackFn){
        if(!callbackFn) return;
        var params = {
            url: this.config.reset_count,
            type: 'post',
            play_load: 'result',
            data: data
        };
        this._sendRequest(params, callbackFn);
    },

    // id
    destroy: function(data, callbackFn){
        if(!data || !data.id || !callbackFn){return;}
        var params = {
            url: this.config.destroy,
            type: 'POST',
            play_load: 'status',
            data: data
        };
        this._sendRequest(params, callbackFn);
    },
    
    // 格式化数据格式，其他微博实现兼容新浪微博的数据格式
    // play_load: status, user, comment, message, count, result(reset_count)
    // args: request arguments
    format_result: function(data, play_load, args) {
		if($.isArray(data)) {
	    	for(var i in data) {
	    		data[i] = this.format_result_item(data[i], play_load, args);
	    	}
	    } else {
	    	data = this.format_result_item(data, play_load, args);
	    }
		return data;
	},
	
	format_result_item: function(data, play_load, args) {
		if(play_load == 'user' && data && data.id) {
			data.t_url = 'http://t.sina.com.cn/' + (data.domain || data.id);
		} else if(play_load == 'status') {
			this.format_result_item(data.user, 'user', args);
			if(data.retweeted_status) {
				this.format_result_item(data.retweeted_status.user, 'user', args);
			}
		} else if(play_load == 'message') {
			this.format_result_item(data.sender, 'user', args);
			this.format_result_item(data.recipient, 'user', args);
		} else if(play_load == 'comment') {
			this.format_result_item(data.user, 'user', args);
		} 
		return data;
	},
	
	// urlencode，子类覆盖是否需要urlencode处理
	url_encode: function(text) {
		return encodeURIComponent(text);
	},
    
	before_sendRequest: function(args) {
		
	},
	
    _sendRequest: function(params, callbackFn) {
    	var args = {type: 'get', play_load: 'status', headers: {}};
    	$.extend(args, params);
    	args.data = args.data || {};
    	args.data.source = args.data.source || this.config.source;
    	if(args.need_source === false) {
    		delete args.need_source;
    		delete args.data.source;
    	}
    	if(!args.url) {
    		showMsg('url未指定');
            callbackFn({}, 'error', '400');
            return;
    	}
    	var user = args.user || args.data.user || localStorage.getObject(CURRENT_USER_KEY);
        if(args.data && args.data.user) delete args.data.user;
        
    	var api = user.apiProxy || this.config.host;
    	var url = api + args.url.format(args.data);
    	if(args.play_load != 'string') {
    		url += this.config.result_format;
    	}
    	// 删除已经填充到url中的参数
    	var pattern = /\{\{([\w\s\.\(\)"',-]+)?\}\}/g;
	    args.url.replace(pattern, function(match, key) {
	    	delete args.data[key];
	    });
        if(!user){
            showMsg('用户未指定');
            callbackFn({}, 'error', '400');
            return;
        }
        if(args.data.status){
        	args.data.status = this.url_encode(args.data.status);
        }
        if(args.data.comment){
        	args.data.comment = this.url_encode(args.data.comment);
        }
        // 请求前调用
        this.before_sendRequest(args);
        // 设置认证头部
        this.apply_auth(url, args, user);
        var $this = this;
        var play_load = args.play_load; // 返回的是什么类型的数据格式
        delete args.play_load;
        
        var callmethod = user.uniqueKey + ':' + args.url;
        $.ajax({
            url: url,
//            username: user.userName,
//            password: user.password,
//            cache: false, // chrome不会出现ie本地cache的问题, 若url参数带有_=xxxxx，digu无法获取完整的用户信息
            timeout: 60*1000, //一分钟超时
            type: args.type,
            data: args.data,
            dataType: 'text',
            beforeSend: function(req) {
        		for(var key in args.headers) {
        			req.setRequestHeader(key, args.headers[key]);
        		}
//                req.setRequestHeader('Authorization', make_base_auth_header(user.userName, user.password));
            },
            success: function (data, textStatus) {
            	if(play_load != 'string') {
            		try{
                        data = JSON.parse(data);
                    }
                    catch(err){
                        data = {error:callmethod + ' 服务器返回结果错误，本地解析错误。' + err, error_code:500};
                        textStatus = 'error';
                    }
            	}
                var error_code = null;
                if(data){
                    if(data.error || data.error_code){
                        showMsg(callmethod + ' error: ' + (data.error || data.wrong) + ', error_code: ' + data.error_code);
                        error_code = data.error_code || error_code;
                    } else {
                        //成功再去格式化结果
                    	data = $this.format_result(data, play_load, args);
                    }
                }else{error_code = 400;}
                callbackFn(data, textStatus, error_code);
                hideLoading();
            },
            error: function (xhr, textStatus, errorThrown) {
                var r = null, status = 'unknow';
                try{
                    if(xhr){
                        if(xhr.status){
                            status = xhr.status;
                        }
                        if(xhr.responseText){
                            var r = xhr.responseText;
                            try{
                                r = JSON.parse(r);
                            }
                            catch(err){
                                r = null;
                            }
                            if(r){showMsg(callmethod + ' error_code:' + r.error_code + ', error:' + r.error);}
                        }
                    }
                }catch(err){
                    r = null;
                }
                if(!r){
                    textStatus = textStatus ? ('textStatus: ' + textStatus + '; ') : '';
                    errorThrown = errorThrown ? ('errorThrown: ' + errorThrown + '; ') : '';
                    r = {error:callmethod + ' error: ' + textStatus + errorThrown + 'statuCode: ' + status};
                    showMsg(r.error);
                }
                callbackFn(r||{}, 'error', status); //不管什么状态，都返回 error
                hideLoading();
            }
        });
    }
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

// 搜狐微博api
// 删除接口暂时无效
var TSohuAPI = $.extend({}, sinaApi);

$.extend(TSohuAPI, {
	// 覆盖不同的参数
	config: $.extend({}, sinaApi.config, {
		host: 'http://api.t.sohu.com',
        user_home_url: 'http://t.sohu.com/n/',
        search_url: 'http://t.sohu.com/k/',
		source: 'WbbRPziVG6', // 取得appkey的第三方进行分级处理，分为500，800和1500三个等级。
		support_max_id: false,
	    oauth_key: 'WbbRPziVG6',
        oauth_secret: 'Ca(R$X(Ikxzm4RoYXh0afc8C210J%8',
        favorites: '/favourites',
	    favorites_create: '/favourites/create/{{id}}',
	    favorites_destroy: '/favourites/destroy/{{id}}',
	    repost: '/statuses/transmit/{{id}}',
	    friendships_create:   '/friendship/create/{{id}}',
        friendships_destroy:  '/friendship/destroy/{{id}}',
	    mentions: '/statuses/mentions_timeline',
	    comments: '/statuses/comments/{{id}}',
	    reply: '/statuses/comment',
	    user_timeline: '/statuses/user_timeline/{{id}}'
	}),
	
	before_sendRequest: function(args) {
		if(args.url == this.config.new_message) {
			// id => user
			args.data.user = args.data.id;
			delete args.data.id;
		} else if(args.url == this.config.destroy) { 
			// method => delete
			args.type = 'delete';
		}
	},
	
	format_result_item: function(data, play_load, args) {
		if(play_load == 'status' && data.id) {
			data.thumbnail_pic = data.small_pic;
			delete data.small_pic;
			data.bmiddle_pic = data.middle_pic;
			delete data.middle_pic;
			if(data.in_reply_to_status_text) {
				data.retweeted_status = {
					id: data.in_reply_to_status_id,
					text: data.in_reply_to_status_text,
					has_image: data.in_reply_to_has_image,
					user: {
						id: data.in_reply_to_user_id,
						screen_name: data.in_reply_to_screen_name
					}
				};
				this.format_result_item(data.retweeted_status.user, 'user', args);
				delete data.in_reply_to_has_image;
				delete data.in_reply_to_status_text;
			}
			this.format_result_item(data.user, 'user', args);
		} else if(play_load == 'comment' && data.id) {
			data.status = {
				id: data.in_reply_to_status_id,
				text: data.in_reply_to_status_text,
				user: {
					id: data.in_reply_to_user_id,
					screen_name: data.in_reply_to_screen_name
				}
			};
		} else if(play_load == 'user' && data && data.id) {
			data.t_url = 'http://t.sohu.com/u/' + (data.domain || data.id);
		} else if(play_load == 'message') {
			this.format_result_item(data.sender, 'user', args);
			this.format_result_item(data.recipient, 'user', args);
		} else if(play_load == 'count') {
			data.rt = data.transmit_count;
			data.comments = data.comments_count;
			delete data.transmit_count;
			delete data.comments_count;
		}
		return data;
	}
});

//嘀咕api
var DiguAPI = $.extend({}, sinaApi);

$.extend(DiguAPI, {
	
	// 覆盖不同的参数
	config: $.extend({}, sinaApi.config, {
		host: 'http://api.minicloud.com.cn',
		source: 'fawave', 
	    source2: 'fawave',
	    
	    support_comment: false,
	    support_repost: false,
	    repost_pre: '转载:',
	    
	    verify_credentials:   '/account/verify',
	    
	    mentions:             '/statuses/replies',
	    
	    destroy_msg:          '/messages/handle/destroy/{{id}}',
        direct_messages:      '/messages/100', // message ：0 表示悄悄话，1 表示戳一下，2 表示升级通知，3 表示代发通知，4 表示系统消息。100表示不分类，都查询。其余参数跟
        new_message:          '/messages/handle/new',
        upload: 			  '/statuses/update',
        repost:               '/statuses/update',
        comment:              '/statuses/update',
        reply:                '/statuses/update'
	}),

    rate_limit_status: function(data, callback){
        callback({error:'not support'});
    },
	
	counts: function(data, callback) {
		callback();
	},
	
	comments_timeline: function(data, callback) {
		callback();
	},
	
	/* content[可选]：更新的Digu消息内容， 请确定必要时需要进行UrlEncode编码，另外，不超过140个中文或者英文字。
	 */
	before_sendRequest: function(args) {
		if(args.url == this.config.update) { // repost, update, reply
			// status => content
			// sina_id => digu_id @回应 reply
			if(args.data.status) {
				args.data.content = args.data.status;
				delete args.data.status;
			}
			if(args.data.sina_id) {
				args.data.digu_id = args.data.sina_id;
				delete args.data.sina_id;
			}
		} else if(args.url == this.config.friends || args.url == this.config.followers) {
			// cursor. 选填参数. 单页只能包含100个粉丝列表，为了获取更多则cursor默认从-1开始，
			// 通过增加或减少cursor来获取更多的，如果没有下一页，则next_cursor返回0
			args.data.page = args.data.cursor == -1 ? 1 : args.data.cursor;
			delete args.data.cursor;
			if(!args.data.page) {
				args.data.page = 1;
			}
			delete args.data.user_id;
		} else if(args.url == this.config.new_message) {
			// id => receiveUserId , text => content , message=0: 必须 0 表示悄悄话 1 表示戳一下
			args.data.content = args.data.text;
			args.data.receiveUserId = args.data.id;
			args.data.message = 0;
			delete args.data.text;
			delete args.data.id;
		} else if(args.url == this.config.friendships_create || args.url == this.config.friendships_destroy) {
			// id => userIdOrName
			args.data.userIdOrName = args.data.id;
			delete args.data.id;
		} else if(args.url == this.config.user_timeline) {
			if(args.data.id) {
				args.data.userIdOrName = args.data.id;
				delete args.data.id;
			} else if(args.data.screen_name){
				args.data.userIdOrName = args.data.screen_name;
				delete args.data.screen_name;
			}
		} else if(args.url = this.config.verify_credentials) {
			args.data.isAllInfo = true;
			delete args.data.source;
		}
    },
	
	/* content[可选]：更新的Digu消息内容， 请确定必要时需要进行UrlEncode编码，另外，不超过140个中文或者英文字。
	 * imageX[可选]：发送图片。如果要发送图片，这个不能为空，并且，Form类型为multipart data。
	 * 如 enctype="multipart data"，且，input的type为file类型。最多上传3张图片，每张图片大小不能超过1M。
	 * 如果上传一张，这个X就是数字0，即input的名字是image0，如果上传两张，input的名字分别是image0 image1，以此类推，最多3张。
	 * 格式只支持".png"，".jpg"，".jpeg"，".gif"，".bmp"。
	 * uploadImg[上传图片必须]： 隐含授权码的字段。如果用户想上传图片，需要需要传递此参数，参数值为：xiexiezhichi
	 */
    format_upload_params: function(user, data, pic) {
    	data.uploadImg = 'xiexiezhichi';
    	data.content = data.status;
    	delete data.status;
    	pic.keyname = 'image0';
    },
	
	format_result: function(data, play_load, args) {
		// digu {"wrong":"no data"}
		if(data.wrong == 'no data') {
			data = [];
		}
		if($.isArray(data)) {
	    	for(var i in data) {
	    		data[i] = this.format_result_item(data[i], play_load);
	    	}
	    } else {
	    	data = this.format_result_item(data, play_load);
	    }
		// 若是follwers api，则需要封装成cursor接口
		// cursor. 选填参数. 单页只能包含100个粉丝列表，为了获取更多则cursor默认从-1开始，
		// 通过增加或减少cursor来获取更多的，如果没有下一页，则next_cursor返回0
		if(args.url == this.config.followers || args.url == this.config.friends) {
			data = {users: data, next_cursor: args.data.page + 1, previous_cursor: args.data.page};
			if(data.users.length == 0) {
				data.next_cursor = 0;
			}
		}
		return data;
	},
	
	format_result_item: function(data, play_load, args) {
		if(play_load == 'status' && data.id) {
			data.favorited = data.favorited == 'true';
			if(data.picPath && data.picPath.length > 0) {
				// http://img2.digu.com/100x75/u/1290361951998_9a36990561cf56f66c2333ee836d0441.jpg
				// http://pic.digu.com:80/file/12/93/99/27/201011/d144f3f76aaebf5df71c0003ca0767e9_100x75.JPEG
				data.thumbnail_pic = data.picPath[0];
				data.bmiddle_pic = data.thumbnail_pic.replace(/([\/_])100x75/, function(m, $1) {
					return $1 + '640x480';
				});
				data.original_pic = data.thumbnail_pic.replace(/[\/_]100x75/, '');
			}
			delete data.picPath;
			if(data.in_reply_to_status_id != '0' && data.in_reply_to_status_id != '') {
				data.retweeted_status = {
					id: data.in_reply_to_status_id,
					user: {
						id: data.in_reply_to_user_id,
						screen_name: data.in_reply_to_screen_name,
						name: data.in_reply_to_user_name
					}
				};
				// 查看相关对话的url
				data.related_dialogue_url = 'http://digu.com/relatedDialogue/' + data.id;
				this.format_result_item(data.retweeted_status.user, 'user', args);
			}
			this.format_result_item(data.user, 'user', args);
		} else if(play_load == 'user' && data && data.id) {
			data.t_url = data.url || ('http://digu.com/' + (data.name || data.id));
			// 将小头像从 _24x24 => _48x48
			if(data.profile_image_url) {
				data.profile_image_url = data.profile_image_url.replace(/([\/_])24x24/, function(m, $1) {
					return $1 + '48x48';
				});
			}
		} else if(play_load == 'comment') {
			this.format_result_item(data.user, 'user', args);
		} else if(play_load == 'message') {
			this.format_result_item(data.sender, 'user', args);
			this.format_result_item(data.recipient, 'user', args);
		}
		return data;
	}
	
});

// 做啥api
var ZuosaAPI = $.extend({}, sinaApi);

$.extend(ZuosaAPI, {
	
	// 覆盖不同的参数
	config: $.extend({}, sinaApi.config, {
		host: 'http://api.zuosa.com',
		source: 'fawave', 
		repost_pre: 'ZT',
	    
	    support_comment: false,
	    support_repost: false,
	    support_max_id: false,
	    
	    upload: '/statuses/update',
	    repost: '/statuses/update'
	}),
	
	// 无需urlencode
	url_encode: function(text) {
		return text;
	},
	
	comments_timeline: function(data, callback) {
		callback();
	},
	
	counts: function(data, callback) {
		callback();
	},
	
	// {"authorized":True}，需要再调用 users/show获取用户信息
	verify_credentials: function(user, callbackFn, data){
		if(!user || !callbackFn) return;
        var params = {
            url: this.config.verify_credentials,
            type: 'get',
            user: user,
            play_load: 'user',
            data: data
        };
        var $this = this;
        this._sendRequest(params, function(data, textStatus, error_code) {
	    	if(!error_code && data.authorized) { // 继续获取用户信息
	    		$this.user_show({user: user, id: user.userName}, callbackFn);
	    	} else {
	    		callbackFn(null, 'error', 401);
	    	}
	    });
	},
	
	before_sendRequest: function(args) {
		if(args.url == this.config.friends || args.url == this.config.followers) {
			// cursor. 选填参数. 单页只能包含100个粉丝列表，为了获取更多则cursor默认从-1开始，
			// 通过增加或减少cursor来获取更多的，如果没有下一页，则next_cursor返回0
			args.data.page = args.data.cursor == -1 ? 1 : args.data.cursor;
			delete args.data.cursor;
			if(!args.data.page) {
				args.data.page = 1;
			}
			delete args.data.user_id;
		} else if(args.url == this.config.repost) {
			if(args.data.sina_id) {
				args.data.in_reply_to_status_id = args.data.sina_id;
				delete args.data.sina_id;
			} else if(args.data.id) {
				delete args.data.id;
			}
		} else if(args.url == this.config.new_message) {
			// id => user
			args.data.user = args.data.id;
			delete args.data.id;
		}
    },
	
	format_result: function(data, play_load, args) {
		if($.isArray(data)) {
	    	for(var i in data) {
	    		data[i] = this.format_result_item(data[i], play_load);
	    	}
	    } else {
	    	data = this.format_result_item(data, play_load);
	    }
		// 若是follwers api，则需要封装成cursor接口
		// cursor. 选填参数. 单页只能包含100个粉丝列表，为了获取更多则cursor默认从-1开始，
		// 通过增加或减少cursor来获取更多的，如果没有下一页，则next_cursor返回0
		if(args.url == this.config.followers || args.url == this.config.friends) {
			data = {users: data, next_cursor: args.data.page + 1, previous_cursor: args.data.page};
			if(data.users.length == 0) {
				data.next_cursor = 0;
			}
		}
		return data;
	},
	
	format_result_item: function(data, play_load, args) {
		if(play_load == 'status' && data.id) {
			if(data.mms_img_pre) {
				data.thumbnail_pic = data.mms_img_pre;
				data.bmiddle_pic = data.mms_img;
				data.original_pic = data.bmiddle_pic;
				delete data.mms_img_pre;
				delete data.mms_img;
			}
			if(data.in_reply_to_status_id) {
				data.retweeted_status = {
					id: data.in_reply_to_status_id,
					user: {
						id: data.in_reply_to_user_id,
						screen_name: data.in_reply_to_screen_name,
						name: data.in_reply_to_screen_name
					}
				};
				// 查看相关对话的url
				data.related_dialogue_url = 'http://zuosa.com/reply?eid=' + data.in_reply_to_status_id;
				this.format_result_item(data.retweeted_status.user, 'user', args);
			}
			this.format_result_item(data.user, 'user', args);
		} else if(play_load == 'user' && data && data.id) {
			data.t_url = 'http://zuosa.com/' + (data.screen_name || data.name);
			if(data.profile_image_url) {
				data.profile_image_url = data.profile_image_url.replace('/normal/', '/middle/');
			}
			if(data.homeprovince) {
				data.province = data.homeprovince;
				data.city = data.province;
				delete data.homeprovince;
			} else if(data.location) {
				var province_city = data.location.split('.');
				data.province = province_city[0];
				data.city = province_city[1];
			}
		} 
		else if(play_load == 'comment') {
			this.format_result_item(data.user, 'user', args);
		} else if(play_load == 'message') {
			this.format_result_item(data.sender, 'user', args);
			data.sender.id = data.sender.screen_name;
			this.format_result_item(data.recipient, 'user', args);
		}
		return data;
	}
});

// 雷猴api
var LeiHouAPI = $.extend({}, sinaApi);

$.extend(LeiHouAPI, {
	
	// 覆盖不同的参数
	config: $.extend({}, sinaApi.config, {
		host: 'http://leihou.com',
		source: 'fawave', 
		repost_pre: 'RT',
	    
	    support_comment: false,
	    support_repost: false,
	    
		support_favorites: false,
		support_destroy_msg: false,
	
	    upload: '/statuses/update',
	    repost: '/statuses/update',
	    comment: '/statuses/update'
	}),
	
	// 无需urlencode
	url_encode: function(text) {
		return text;
	},

    rate_limit_status: function(data, callback){
        callback({error:'not support'});
    },
	
	comments_timeline: function(data, callback) {
		callback();
	},
	
	counts: function(data, callback) {
		callback();
	},
	
	before_sendRequest: function(args) {
		if(args.url == this.config.friends || args.url == this.config.followers) {
			// cursor. 选填参数. 单页只能包含100个粉丝列表，为了获取更多则cursor默认从-1开始，
			// 通过增加或减少cursor来获取更多的，如果没有下一页，则next_cursor返回0
			args.data.page = args.data.cursor == -1 ? 1 : args.data.cursor;
			delete args.data.cursor;
			if(!args.data.page) {
				args.data.page = 1;
			}
		} else if(args.url == this.config.repost) {
			// sina_id => in_reply_to_status_id
			if(args.data.sina_id) {
				args.data.in_reply_to_status_id = args.data.sina_id;
				delete args.data.sina_id;
			}
		} else if(args.url == this.config.new_message) {
			// id => user
			args.data.user = args.data.id;
			delete args.data.id;
		}
    },
	
	format_result: function(data, play_load, args) {
		if($.isArray(data)) {
	    	for(var i in data) {
	    		data[i] = this.format_result_item(data[i], play_load);
	    	}
	    } else {
	    	data = this.format_result_item(data, play_load);
	    }
		// 若是follwers api，则需要封装成cursor接口
		// cursor. 选填参数. 单页只能包含100个粉丝列表，为了获取更多则cursor默认从-1开始，
		// 通过增加或减少cursor来获取更多的，如果没有下一页，则next_cursor返回0
		if(args.url == this.config.followers || args.url == this.config.friends) {
			data = {users: data, next_cursor: args.data.page + 1, previous_cursor: args.data.page};
			if(data.users.length == 0) {
				data.next_cursor = 0;
			}
		}
		return data;
	},
	
	format_result_item: function(data, play_load, args) {
		if(play_load == 'status' && data.id) {
			// 'text': u'http://pic.leihou.com/428ed1 \u6d4b\u8bd523\u5e26\u56fe\u7247\u7684\u5fae\u535a\u4fe1\u606f',
			var pic = /http:\/\/pic\.leihou\.com\/(\w+)/.exec(data.text);
			if(pic && pic.length == 2) {
				data.thumbnail_pic = 'http://pic.leihou.com/pic/' + pic[1] + '_medium.jpg';
				data.bmiddle_pic = 'http://pic.leihou.com/pic/' + pic[1] + '_large.jpg';
				data.original_pic = data.bmiddle_pic;
			}
			if(data.in_reply_to_status_id) {
				data.retweeted_status = {
					id: data.in_reply_to_status_id,
					user: {
						id: data.in_reply_to_user_id,
						screen_name: data.in_reply_to_screen_name,
						name: data.in_reply_to_screen_name
					}
				};
				// 查看相关对话的url
				data.related_dialogue_url = 'http://leihou.com/dialog/' + data.id;
				this.format_result_item(data.retweeted_status.user, 'user', args);
			}
			this.format_result_item(data.user, 'user', args);
		} else if(play_load == 'user' && data && data.id) {
			data.t_url = 'http://leihou.com/' + (data.screen_name || data.id);
			if(data.profile_image_url) {
				// 'profile_image_url': u'http://a1.leihou.com/avatar/5c/0c/13879_0_m.png'
				data.profile_image_url = data.profile_image_url.replace('_m.', '_s.');
			}
			if(data.location) {
				var province_city = data.location.split('.');
				data.province = province_city[0];
				data.city = province_city[1] || province_city[0];
			}
		} 
		else if(play_load == 'comment') {
			this.format_result_item(data.user, 'user', args);
		} else if(play_load == 'message') {
			this.format_result_item(data.sender, 'user', args);
			data.sender.id = data.sender.screen_name;
			this.format_result_item(data.recipient, 'user', args);
		}
		return data;
	}
});

// follow5 api: http://www.follow5.com/f5/jsp/other/api/api.jsp
var Follow5API = $.extend({}, sinaApi);

$.extend(Follow5API, {
	
	// 覆盖不同的参数
	config: $.extend({}, sinaApi.config, {
		host: 'http://api.follow5.com/api',
		source: '34140E56A31887F770053C2AF6D7B2AC', // 需要申请
		repost_pre: '转发:',
	    
	    support_max_id: false,
	    support_comment: false,
	    support_repost: false,
	    support_upload: false,

	    verify_credentials: '/users/verify_credentials',
	    direct_messages: '/destroy_messages', 
	    followers: '/users/followed',
        friends: '/users/followers',
        friendships_create: '/follow/create',
        friendships_destroy: '/follow/destroy',
        comments_timeline: '/statuses/replies_timeline',
	    mentions: '/statuses/mentions_me',
	    destroy: '/statuses/destroy',
//	    upload: '/statuses/update',
	    repost: '/statuses/update'
	}),
	
	// 无需urlencode
	url_encode: function(text) {
		return text;
	},

    rate_limit_status: function(data, callback){
        callback({error:'not support'});
    },
	
//	comments_timeline: function(data, callback) {
//		callback();
//	},
	
	counts: function(data, callback) {
		callback();
	},
	
	before_sendRequest: function(args) {
		// args.data.source => args.data.app_key
		args.data.api_key = args.data.source;
		delete args.data.source;
		if(args.url == this.config.friends || args.url == this.config.followers) {
			// cursor. 选填参数. 单页只能包含100个粉丝列表，为了获取更多则cursor默认从-1开始，
			// 通过增加或减少cursor来获取更多的，如果没有下一页，则next_cursor返回0
			args.data.page = args.data.cursor == -1 ? 1 : args.data.cursor;
			delete args.data.cursor;
			if(!args.data.page) {
				args.data.page = 1;
			}
		} 
		else if(args.url == this.config.new_message) {
			// id => fid
			// text => status
			if(args.data.id) {
				args.data.fid = args.data.id;
				delete args.data.id;
			}
			if(args.data.text) {
				args.data.status = args.data.text;
				delete args.data.text;
			}
		} 
    },
	
	format_result: function(data, play_load, args) {
		if($.isArray(data)) {
			if(data.length == 1 && data[0] == null) {
				// [null]
				data = [];
			}
	    	for(var i in data) {
	    		data[i] = this.format_result_item(data[i], play_load);
	    	}
	    } else {
	    	data = this.format_result_item(data, play_load);
	    }
		// 若是follwers api，则需要封装成cursor接口
		// cursor. 选填参数. 单页只能包含100个粉丝列表，为了获取更多则cursor默认从-1开始，
		// 通过增加或减少cursor来获取更多的，如果没有下一页，则next_cursor返回0
		if(args.url == this.config.followers || args.url == this.config.friends) {
			data = {users: data, next_cursor: args.data.page + 1, previous_cursor: args.data.page};
			if(data.users.length == 0) {
				data.next_cursor = 0;
			}
		}
		return data;
	},
	
	format_result_item: function(data, play_load, args) {
		if(play_load == 'status' && data.id) {
			// 'image_address': u'http://pic2.follow5.com/imgs/note/2010/11/24/20/58/49/26101101124205849_l.jpg',
			if(data.image_address) {
				data.thumbnail_pic = data.image_address.replace('_l.', '_s.');
				data.bmiddle_pic = data.image_address.replace('_l.', '_m.');
				data.original_pic = data.image_address;
				delete data.image_address;
			}
			this.format_result_item(data.user, 'user', args);
		} else if(play_load == 'user' && data && data.id) {
			data.t_url = data.url;
			if(!data.screen_name) {
				data.screen_name = data.name;
			}
			if(data.location) {
				// 'location': u'440100', 44 广东 1广州
				data.province = data.location.substring(0, 2);
				if(data.province) {
					data.province = parseInt(data.province).toString();
					data.city = parseInt(data.location.substring(2, 4)).toString();
				}
			}
			// 'profile_image_url': u'http://pic1.follow5.com/imgs/account/00/00/10/04/09/100409_l.jpg',
			if(data.profile_image_url) {
				data.profile_image_url = data.profile_image_url.replace('_l.', '_s.');
			}
		} 
		else if(play_load == 'comment') {
			this.format_result_item(data.user, 'user', args);
		} else if(play_load == 'message') {
			this.format_result_item(data.sender, 'user', args);
			data.sender.id = data.sender.screen_name;
			this.format_result_item(data.recipient, 'user', args);
		}
		return data;
	}
});

//twitter api
var TwitterAPI = $.extend({}, sinaApi);

$.extend(TwitterAPI, {
	
	// 覆盖不同的参数
	config: $.extend({}, sinaApi.config, {
		host: 'http://api.twitter.com',
		source: 'fawave', 
        oauth_key: 'i1aAkHo2GkZRWbUOQe8zA',
        oauth_secret: 'MCskw4dW5dhWAYKGl3laRVTLzT8jTonOIOpmzEY',
        repost_pre: 'RT',
	    support_comment: false,
	    support_repost: false,
	    support_upload: false,
	    
	    repost: '/statuses/update'
	}),
	
	// 无需urlencode
	url_encode: function(text) {
		return text;
	},
	
	comments_timeline: function(data, callback) {
		callback();
	},
	
	counts: function(data, callback) {
		callback();
	},
	
	before_sendRequest: function(args) {
		if(args.url == this.config.repost) {
			if(args.data.sina_id) {
				args.data.in_reply_to_status_id = args.data.sina_id;
				delete args.data.sina_id;
			} else if(args.data.id) {
				delete args.data.id;
			}
		} else if(args.url == this.config.new_message) {
			// id => user
			args.data.user = args.data.id;
			delete args.data.id;
		}
    },

    format_result_item: function(data, play_load, args) {
		if(play_load == 'status' && data.id) {

		} else if(play_load == 'user' && data && data.id) {
			data.t_url = 'http://twitter.com/' + (data.screen_name || data.id);
			if(data.profile_image_url) {
			}
			if(data.location) {
			}
		}
		return data;
	}
});

var T163API = $.extend({}, sinaApi);

$.extend(T163API, {
	
	// 覆盖不同的参数
	config: $.extend({}, sinaApi.config, {
		host: 'http://api.t.163.com',
		source: 'CMlCI0PLHNtmjzCA', // 需要申请
		oauth_key: 'CMlCI0PLHNtmjzCA',
        oauth_secret: 'tYU2lK30IlSRhuX8ouUtEx8Uk2fRf8Yk',
        
        oauth_authorize: '/oauth/authenticate',
        friends_timeline: '/statuses/home_timeline',
	})
});

var T_APIS = {
	'tsina': sinaApi,
	'tsohu': TSohuAPI,
	'digu': DiguAPI,
	'zuosa': ZuosaAPI,
	'leihou': LeiHouAPI,
	'follow5': Follow5API,
	't163': T163API,
	'twitter': TwitterAPI // fxxx gxfxw first.
};


// 封装兼容所有微博的api，自动判断微博类型
var tapi = {

    // 自动判断当前用户所使用的api, 根据user.blogType判断
    api_dispatch: function(data) {
		return T_APIS[(data.user ? data.user.blogType : data.blogType) || 'tsina'];
	},
	
	get_config: function(user) {
		return this.api_dispatch(user).config;
	},
	
	get_authorization_url: function(user, callbackFn) {
		return this.api_dispatch(user).get_authorization_url(user, callbackFn);
	},
	
	get_request_token: function(user, callbackFn) {
		return this.api_dispatch(user).get_request_token(user, callbackFn);
	},
	
	get_access_token: function(user, callbackFn) {
		return this.api_dispatch(user).get_access_token(user, callbackFn);
	},
	
	verify_credentials: function(user, callbackFn, data){
	    return this.api_dispatch(user).verify_credentials(user, callbackFn, data);
	},
        
    rate_limit_status: function(data, callbackFn){
	    return this.api_dispatch(data).rate_limit_status(data, callbackFn);
	},

	// since_id, max_id, count, page 
	friends_timeline: function(data, callbackFn){
		return this.api_dispatch(data).friends_timeline(data, callbackFn);
	},
	
	// id, user_id, screen_name, since_id, max_id, count, page 
	user_timeline: function(data, callbackFn){
		return this.api_dispatch(data).user_timeline(data, callbackFn);
	},
	
	// id, count, page
	comments_timeline: function(data, callbackFn){
		return this.api_dispatch(data).comments_timeline(data, callbackFn);
	},
	
	// since_id, max_id, count, page 
	mentions: function(data, callbackFn){
		return this.api_dispatch(data).mentions(data, callbackFn);
	},
	
	// id, user_id, screen_name, cursor, count
	followers: function(data, callbackFn){
		return this.api_dispatch(data).followers(data, callbackFn);
	},
	
	// id, user_id, screen_name, cursor, count
	friends: function(data, callbackFn){
		return this.api_dispatch(data).friends(data, callbackFn);
	},
	
	// page
	favorites: function(data, callbackFn){
		return this.api_dispatch(data).favorites(data, callbackFn);
	},
	
	// id
	favorites_create: function(data, callbackFn){
		return this.api_dispatch(data).favorites_create(data, callbackFn);
	},
	
	// id
	favorites_destroy: function(data, callbackFn){
		return this.api_dispatch(data).favorites_destroy(data, callbackFn);
	},
	
	// ids
	counts: function(data, callbackFn){
		return this.api_dispatch(data).counts(data, callbackFn);
	},
	
	// id
	user_show: function(data, callbackFn){
		return this.api_dispatch(data).user_show(data, callbackFn);
	},
	
	// since_id, max_id, count, page 
	direct_messages: function(data, callbackFn){
		return this.api_dispatch(data).direct_messages(data, callbackFn);
	},
	
	// id
	destroy_msg: function(data, callbackFn){
		return this.api_dispatch(data).destroy_msg(data, callbackFn);
	},
	
	new_message: function(data, callbackFn){
		return this.api_dispatch(data).new_message(data, callbackFn);
	},
	
	update: function(data, callbackFn){
		return this.api_dispatch(data).update(data, callbackFn);
	},
	
	upload: function(user, data, pic, before_request, onprogress, callback){
		return this.api_dispatch(user).upload(user, data, pic, before_request, onprogress, callback);
	},
	
	repost: function(data, callbackFn){
		return this.api_dispatch(data).repost(data, callbackFn);
	},
	
	comment: function(data, callbackFn){
		return this.api_dispatch(data).comment(data, callbackFn);
	},
	
	reply: function(data, callbackFn){
		return this.api_dispatch(data).reply(data, callbackFn);
	},
	
	comments: function(data, callbackFn){
		return this.api_dispatch(data).comments(data, callbackFn);
	},
	
	// id
	comment_destroy: function(data, callbackFn){
		return this.api_dispatch(data).comment_destroy(data, callbackFn);
	},
	
	friendships_create: function(data, callbackFn){
		return this.api_dispatch(data).friendships_create(data, callbackFn);
	},
	
	// id
	friendships_destroy: function(data, callbackFn){
		return this.api_dispatch(data).friendships_destroy(data, callbackFn);
	},
	
	friendships_show: function(data, callbackFn){
		return this.api_dispatch(data).friendships_show(data, callbackFn);
	},
	
	// type
	reset_count: function(data, callbackFn){
		return this.api_dispatch(data).reset_count(data, callbackFn);
	},
	
	// id
	destroy: function(data, callbackFn){
		return this.api_dispatch(data).destroy(data, callbackFn);
	}
};