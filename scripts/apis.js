/*
* @author qleelulu@gmail.com
*/

var sinaApi = {
	
	config: {
		host: 'http://api.t.sina.com.cn',
        user_home_url: 'http://t.sina.com.cn/n/',
        search_url: 'http://t.sina.com.cn/k/',
		result_format: '.json',
		source: '3538199806',
        oauth_key: '3538199806',
        oauth_secret: '18cf587d60e11e3c160114fd92dd1f2b',
        // google app key
        google_appkey: 'AIzaSyAu4vq6sYO3WuKxP2G64fYg6T1LdIDu3pk',
        
        userinfo_has_counts: true, // 用户信息中是否包含粉丝数、微博数等信息
        support_counts: true, // 是否支持批量获取转发和评论数
        support_comment: true, // 判断是否支持评论
		support_upload: true, // 是否支持上传图片
		support_repost: true, // 是否支持新浪形式转载
		repost_pre: '转:', // 转发前缀
		support_favorites: true,
		// 是否支持max_id 分页
		support_max_id: true,
		support_destroy_msg: true, //是否支持删除私信
		support_direct_messages: true, 
		support_sent_direct_messages: true, //是否支持自己发送的私信
		support_mentions: true, 
		support_friendships_create: true,
		need_processMsg: true, //是否需要处理消息的内容
        
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
        repost_timeline:      '/statuses/repost_timeline',
        comment:              '/statuses/comment',
        reply:                '/statuses/reply',
        comment_destroy:      '/statuses/comment_destroy/{{id}}',
        comments:             '/statuses/comments',
        destroy:              '/statuses/destroy/{{id}}',
        destroy_msg:          '/direct_messages/destroy/{{id}}',
        direct_messages:      '/direct_messages', 
        sent_direct_messages: '/direct_messages/sent', 
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
        oauth_callback: 'oob',
        oauth_access_token:   '/oauth/access_token',

        detailUrl:        '/jump?aid=detail&twId=',
        searchUrl:        '/search/',
        
        ErrorCodes: {
        	"40025:Error: repeated weibo text!": "重复发送",
        	"40031:Error: target weibo does not exist!": "不存在的微博ID",
        	"40015:Error: not your own comment!": "评论ID不在登录用户的comments_by_me列表中",
        	"40303:Error: already followed": "已跟随"
        }
    },
    
    // 翻译
    translate: function(text, target, callback) {
    	var api = 'https://www.googleapis.com/language/translate/v2';
    	if(!target || target == 'zh-CN' || target == 'zh-TW') {
    		target = 'zh';
    	}
    	var params = {key: this.config.google_appkey, target: target, q: text};
    	$.ajax({
			url: api,
		  	dataType: 'json',
		  	data: params,
		  	success: function(data, status) {
				var tran = data.data.translations[0];
				var detectedSourceLanguage = tran.detectedSourceLanguage;
				if(detectedSourceLanguage == 'zh-CN' || detectedSourceLanguage == 'zh-TW') {
		    		detectedSourceLanguage = 'zh';
		    	}
				if(detectedSourceLanguage == target) {
					showMsg('无需翻译');
					callback(null);
				} else {
					callback(tran.translatedText);
				}
		  	}, 
		  	error: function(xhr, status) {
		  		var error = {message: status + ': ' + xhr.statusText};
		  		try {
		  			error = JSON.parse(xhr.responseText).error;
		  		} catch(e) {
		  		}
		  		if(error.message == 'The source language could not be detected') {
		  			showMsg('无需翻译');
		  		} else {
		  			showMsg('暂时无法翻译, ' + error.message);
		  		}
		  		callback(null);
		  	}
		});
    },

    /**
     * 处理内容
     */
    processMsg: function (str, notEncode) {
        if(!str){ return ''; }
        if(!this.config.need_processMsg) { // 无需处理
        	return str;
        }
        if(!notEncode){
            str = HTMLEnCode(str);
        }

        var re = new RegExp('(?:\\[url\\s*=\\s*|)((?:www\\.|http[s]?://)[\\w\\.\\?%&\\-/#=;:!\\+]+)(?:\\](.+)\\[/url\\]|)', 'ig');
        str = str.replace(re, this._replaceUrl);
        
        str = this.processAt(str); //@***

        str = this.processSearch(str);
       
        str = this.processEmotional(str);

        str = str.replace( /([\uE001-\uE537])/gi, this.getIphoneEmoji );
        
        return str;
    },
    getIphoneEmoji: function(str){
        return "<span class=\"iphoneEmoji "+ str.charCodeAt(0).toString(16).toUpperCase()+"\"></span>";
    },
    processSearch: function (str) {
        str = str.replace(/#([^#]+)#/g, '<a target="_blank" href="'+ this.config.search_url +'$1" title="Search #$1">#$1#</a>');
        return str;
    },
    processAt: function (str) { //@***
        str = str.replace(/^@([\w\-\u4e00-\u9fa5|\_]+)/g, ' <a target="_blank" href="javascript:getUserTimeline(\'$1\');" rhref="'+ this.config.user_home_url +'$1" title="左键查看微薄，右键打开主页">@$1</a>');
        str = str.replace(/([^\w#])@([\w\-\u4e00-\u9fa5|\_]+)/g, '$1<a target="_blank" href="javascript:getUserTimeline(\'$2\');" rhref="'+ this.config.user_home_url +'$2" title="左键查看微薄，右键打开主页">@$2</a>');
        
        return str;
    },
    processEmotional: function(str){
        str = str.replace(/\[([\u4e00-\u9fff,\uff1f,\w]{1,4})\]/g, this._replaceEmotional);
        return str;
    },
    _replaceUrl: function(m, g1, g2){
        var _url = g1;
        if(g1.indexOf('http') != 0){
            _url = 'http://' + g1;
        }
        return '<a target="_blank" href="{{url}}" title="{{title}}">{{value}}</a>'.format({
            url: _url, title: g1, value: g2||g1
        });
    },
    _replaceEmotional: function(m, g1){
        var tpl = '<img title="{{title}}" src="{{src}}" />';
        if(window.emotionalDict && g1) {
            if(emotionalDict[g1]){
                var src = emotionalDict[g1];
                if(src.indexOf('http') != 0){
                    src = '/images/faces/' + src + '.gif';
                }
                return tpl.format({title: m, src: src});
            }
            var other = TSINA_API_EMOTIONS[g1] || TSINA_FACES[g1];
            if(other) {
                return tpl.format({title: m, src: TSINA_FACE_URL_PRE + other});
            }
        }
        return m;
    },
    

	// 设置认证头
	apply_auth: function(url, args, user) {
        user.authType = user.authType || 'baseauth'; //兼容旧版本
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
		    args.headers['Authorization'] = OAuth.getAuthorizationHeader(this.config.oauth_realm, message.parameters);
		}
	},
	
	format_authorization_url: function(params) {
		var login_url = (this.config.oauth_host || this.config.host) + this.config.oauth_authorize;
		return OAuth.addToURL(login_url, params);
	},
	
    // 获取认证url
    get_authorization_url: function(user, callbackFn) {
    	if(user.authType == 'oauth') {
    		var login_url = null;
    		var me = this;
    		this.get_request_token(user, function(token, text_status, error_code) {
    			if(token) {
    				user.oauth_token_key = token.oauth_token;
        			user.oauth_token_secret = token.oauth_token_secret;
        			// 返回登录url给用户登录
        			var params = {oauth_token: user.oauth_token_key};
        			if(me.config.oauth_callback) {
            			params.oauth_callback = me.config.oauth_callback;
            		}
        			login_url = me.format_authorization_url(params);
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
	            apiHost: this.config.oauth_host,
	            data: {},
	            need_source: false
	        };
    		if(this.config.oauth_callback) {
    			params.data.oauth_callback = this.config.oauth_callback;
    		}
    		if(this.config.oauth_request_params){
    			$.extend(params.data, this.config.oauth_request_params);
    		}
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
	            apiHost: this.config.oauth_host,
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
    			callbackFn(token ? user : null, text_status, error_code);
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
                    var error = data.errors || data.error;
	                if(error || data.error_code){
	                	data.error = error;
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
			var tpl = this.config.host + '/{{user.id}}/statuses/{{id}}';
			if(data.retweeted_status) {
				this.format_result_item(data.retweeted_status, 'status', args);
			}
			// 设置status的t_url
			data.t_url = tpl.format(data);
		} else if(play_load == 'message') {
			this.format_result_item(data.sender, 'user', args);
			this.format_result_item(data.recipient, 'user', args);
		} else if(play_load == 'comment') {
			this.format_result_item(data.user, 'user', args);
			this.format_result_item(data.status, 'status', args);
		} 
		return data;
	},
	
	// urlencode，子类覆盖是否需要urlencode处理
	url_encode: function(text) {
		return encodeURIComponent(text);
	},
    
	before_sendRequest: function(args) {
		
	},
	
	format_error: function(error, error_code) {
		if(this.config.ErrorCodes){
			error = this.config.ErrorCodes[error] || error;
		}
		return error;
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
    	if(!user){
            showMsg('用户未指定');
            callbackFn({}, 'error', 400);
            return;
        }
        if(args.data && args.data.user) delete args.data.user;
        
        if(args.data.status){
        	args.data.status = this.url_encode(args.data.status);
        }
        if(args.data.comment){
        	args.data.comment = this.url_encode(args.data.comment);
        }
        // 请求前调用
        this.before_sendRequest(args, user);
        var api = user.apiProxy || args.apiHost || this.config.host;
    	var url = api + args.url.format(args.data);
    	if(args.play_load != 'string') {
    		url += this.config.result_format;
    	}
    	// 删除已经填充到url中的参数
    	var pattern = /\{\{([\w\s\.\(\)"',-]+)?\}\}/g;
	    args.url.replace(pattern, function(match, key) {
	    	delete args.data[key];
	    });
        // 设置认证头部
        this.apply_auth(url, args, user);
        var play_load = args.play_load; // 返回的是什么类型的数据格式
        delete args.play_load;
        var callmethod = user.uniqueKey + ':' + args.url;
        var request_data = args.content || args.data;
        var processData = !args.content;
        var contentType = args.contentType || 'application/x-www-form-urlencoded';
        $.ajax({
            url: url,
//            username: user.userName,
//            password: user.password,
//            cache: false, // chrome不会出现ie本地cache的问题, 若url参数带有_=xxxxx，digu无法获取完整的用户信息
            timeout: 60*1000, //一分钟超时
            type: args.type,
            data: request_data,
            contentType: contentType,
            processData: processData,
            dataType: 'text',
            context: this,
            beforeSend: function(req) {
        		for(var key in args.headers) {
        			req.setRequestHeader(key, args.headers[key]);
        		}
        	},
            success: function (data, textStatus, xhr) {
            	if(play_load != 'string') {
            		try{
                        data = JSON.parse(data);
                    }
                    catch(err){
                    	if(xhr.status == 201 || xhr.statusText == "Created") { // rest成功
                    		data = data;
                    	} else {
                    		if(data.indexOf('{"wrong":"no data"}') > -1 || data == '' || data.toLowerCase() == 'ok'){
                        		data = [];
                        	} else {
                                data = {error: callmethod + ' 服务器返回结果错误，本地解析错误。' + err, error_code:500};
                                textStatus = 'error';
                        	}
                    	}
                    }
            	}
                var error_code = null;
                if(data){
                	error_code = data.error_code || data.code;
                    var error = data.error;
                    if(!error && data.errors){
                        if(typeof(data.errors)==='string'){
                            error = data.errors;
                        }else if(data.errors.length){ //'{"errors":[{"code":53,"message":"Basic authentication is not supported"}]}'
                            if(data.errors[0].message){
                                error = data.errors[0].message;
                            }else{
                                for(var i in data.errors[0]){
                                    error += i + ': ' + data.errors[0][i];
                                }
                            }
                        }
                    }
                    if(error || error_code){
                    	data.error = error;
                    	textStatus = this.format_error(data.error || data.wrong || data.message, error_code);
                    	var error_msg = callmethod + ' error: ' + textStatus;
                    	if(!textStatus && error_code){ // 错误为空，才显示错误代码
                    		error_msg += ', error_code: ' + error_code;
                    	}
                        error_code = error_code || 'unknow';
                        showMsg(error_msg);
                    } else {
                        //成功再去格式化结果
                    	data = this.format_result(data, play_load, args);
                    }
                } else {
                	error_code = 400;
                }
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
                            if(r){
                            	var error_code = r.error_code || r.code;
                            	r.error = this.format_error(r.error || r.wrong || r.message, error_code);
		                    	var error_msg = callmethod + ' error: ' + r.error;
		                    	if(!r.error && error_code){ // 错误为空，才显示错误代码
		                    		error_msg += ', error_code: ' + error_code;
		                    	}
		                    	showMsg(error_msg);
                            }
                        }
                    }
                }catch(err){
                    r = null;
                }
                if(!r){
                    textStatus = textStatus ? ('textStatus: ' + textStatus + '; ') : '';
                    errorThrown = errorThrown ? ('errorThrown: ' + errorThrown + '; ') : '';
                    r = {error:callmethod + ' error: ' + textStatus + errorThrown + ' statuCode: ' + status};
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
		source: '5vi74qXPB5J97GNzsevN', // 取得appkey的第三方进行分级处理，分为500，800和1500三个等级。
		
	    oauth_key: '5vi74qXPB5J97GNzsevN',
        oauth_secret: 'fxZbb-07bCvv-BCA1Qci2lO^7wnl0%pRE$mvG1K#',
        
        support_max_id: false,
        favorites: '/favourites',
	    favorites_create: '/favourites/create/{{id}}',
	    favorites_destroy: '/favourites/destroy/{{id}}',
	    repost: '/statuses/transmit/{{id}}',
	    friendships_create:   '/friendship/create/{{id}}',
        friendships_destroy:  '/friendship/destroy/{{id}}',
        friends: '/statuses/friends/{{user_id}}',
        followers: '/statuses/followers/{{user_id}}',
	    mentions: '/statuses/mentions_timeline',
	    comments: '/statuses/comments/{{id}}',
	    reply: '/statuses/comment',
	    user_timeline: '/statuses/user_timeline/{{id}}',
	    
	    ErrorCodes: {
        	"Reached max access time per hour.": "已达到请求数上限",
        	"Could not follow user: id is already on your list": "已跟随",
        	"You are not friends with the specified user": "你没有跟随他",
        	"can't send direct message to user who is not your follower!": "不能发私信给没有跟随你的人"
        }
	}),
	
	reset_count: function(data, callback) {
		callback();
	},
	
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
	
    format_result: function(data, play_load, args) {
		if($.isArray(data)) {
	    	for(var i in data) {
	    		data[i] = this.format_result_item(data[i], play_load, args);
	    	}
	    } else {
	    	data = this.format_result_item(data, play_load, args);
	    }
	    if(args.url == this.config.friends || args.url == this.config.followers){
	    	data.next_cursor = data.cursor_id;
	    	delete data.cursor_id;
	    }
		return data;
	},
	
	format_result_item: function(data, play_load, args) {
		if(play_load == 'status' && data.id) {
			data.thumbnail_pic = data.small_pic;
			delete data.small_pic;
			data.bmiddle_pic = data.middle_pic;
			delete data.middle_pic;
			var tpl = 'http://t.sohu.com/m/';
			if(data.in_reply_to_status_text) {
				data.retweeted_status = {
					id: data.in_reply_to_status_id,
					text: data.in_reply_to_status_text,
					has_image: data.in_reply_to_has_image,
					user: {
						id: data.in_reply_to_user_id,
						screen_name: data.in_reply_to_screen_name
					},
					t_url: tpl + data.in_reply_to_status_id
				};
				this.format_result_item(data.retweeted_status.user, 'user', args);
				delete data.in_reply_to_has_image;
				delete data.in_reply_to_status_text;
			}
			data.t_url = tpl + data.id;
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
		if(data.cursor_id) {
			data.next_cursor = data.cursor_id;
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
        user_home_url: 'http://digu.com/',
        search_url: 'http://digu.com/search/',
		source: 'fawave', 
	    source2: 'fawave',
	    
	    support_comment: false,
	    support_repost: false,
	    support_max_id: false,
	    support_sent_direct_messages: false,
	    repost_pre: '转载:',
	    
	    verify_credentials:   '/account/verify',
	    
	    mentions:             '/statuses/replies',
	    
	    destroy_msg:          '/messages/handle/destroy/{{id}}',
        direct_messages:      '/messages/100', // message ：0 表示悄悄话，1 表示戳一下，2 表示升级通知，3 表示代发通知，4 表示系统消息。100表示不分类，都查询。其余参数跟
        new_message:          '/messages/handle/new',
        upload: 			  '/statuses/update',
        repost:               '/statuses/update',
        comment:              '/statuses/update',
        reply:                '/statuses/update',
        
        ErrorCodes: {
        	'-1': '服务器错误',
			'0': '未知原因',
			'1': '用户名或者密码为空',
			'2': '用户名或者密码错误',
			'3': '访问的URL不正确',
			'4': 'id指定的记录信息不存在。',
			'5': '重复发送',
			'6': '包含敏感非法关键字，禁止发表',
			'7': '包含敏感信息进入后台审核',
			'8': '认证帐号被关小黑屋，被禁言，不能够发表信息了。',
			'9': '表示发送悄悄话失败',
			'10': '没有操作权限（比如删除只能删除自己发的，或者自己收藏的，或者自己收到的信息）',
			'11': '指定的用户不存在',
			'12': '注册的用户已经存在',
			'13': '表单值是空值，或者没有合法的颜色值，没有修改。修改失败。',
			'14': '上传文件异常，请检查是否符合要求',
			'15': '更新用户信息失败。',
			'16': '删除失败，删除收藏夹分类时，分类的名字是必须的。',
			'17': '删除失败，删除收藏夹分类时,分类不存在',
			'18': '传递过来的参数为空或者异常',
			'19': '重复收藏',
			'20': '只能给跟随自己的人发送信息',
			'21': '用户名、昵称或者密码不合法，用户名、昵称或者密码必须是4-12位，只支持字母、数字、下划线',
			'22': '两次输入的秘密不正确',
			'23': 'Email格式不正确。',
			'24': '这个的帐号已被占用',
			'25': '发送太频繁，帐号暂时被封',
			'26': '服务器繁忙或者你访问的频率太高，超出了规定的限制',
			'27': '对不起，你的ip被官方封掉了，请联系我们的工作人员，进行相关处理',
			'28': '对不起，用户昵称中包含非法关键字。',
			'9': '对不起，所在地包含非法关键字。',
			'30': '对不起，个人兴趣包含非法关键字。',
			'31': '对不起，签名（个人简介）包含非法关键字。',
			'32': '对不起，昵称已经被占用',
			'33': 'Http请求方法不正确'
        }
	}),

    processAt: function (str) { //@***
        str = str.replace(/^@([\w\-\u4e00-\u9fa5|\_]+)/g, ' <a target="_blank" href="http://digu.com/search/friend/' +'$1" title="点击打开用户主页">@$1</a>');
        str = str.replace(/([^\w#])@([\w\-\u4e00-\u9fa5|\_]+)/g, '$1<a target="_blank" href="http://digu.com/search/friend/' +'$2" title="点击打开用户主页">@$2</a>');
        
        return str;
    },
    processSearch: function (str) {
        str = str.replace(/(^|&lt;|a-zA-Z_0-9|\s)(#|$)([\w\u4e00-\u9fa5|\_]*|$)/g, ' <a title="Search $2$3" href="' + this.config.search_url + '%23$3" target="_blank">$2$3</a>');
        //str = str.replace(/[^\w]#([\w\u4e00-\u9fa5|\_]+)/g, ' <a target="_blank" href="'+ this.config.search_url +'%23$1" title="Search #$1">#$1</a>');
        return str;
    },
    processEmotional: function(str){
        str = str.replace(/\[:(\d{2})\]|\{([\u4e00-\u9fa5,\uff1f]{2,})\}/g, this._replaceEmotional);
        return str;
    },
    _replaceEmotional: function(m, g, g2){
        if(g2 && window.DIGU_EMOTIONS && DIGU_EMOTIONS[g2]){
            return '<img src="http://images.digu.com/web_res_v1/emotion/' + DIGU_EMOTIONS[g2] + '.gif" />';
        }else if(g && (g>0) && (g<33)){
            return '<img src="http://images.digu.com/web_res_v1/emotion/' + g + '.gif" />';
        }else{
            return m;
        }
    },

    rate_limit_status: function(data, callback){
        callback({error:'没有提供接口'});
    },
    
    reset_count: function(data, callback) {
		callback();
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
			args.data.page = args.data.cursor == '-1' ? 1 : args.data.cursor;
			delete args.data.cursor;
			if(!args.data.page){
				args.data.page = 1;
			}
			if(args.data.user_id){
				args.data.friendUserId = args.data.user_id;
			}
			if(args.data.screen_name){
				args.data.friendUsername = args.data.screen_name;
			}
			delete args.data.user_id;
			delete args.data.screen_name;
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
		} else if(args.url == this.config.verify_credentials) {
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
			data = {users: data, next_cursor: Number(args.data.page) + 1, previous_cursor: args.data.page};
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
			var tpl = 'http://digu.com/detail/';
			if(data.in_reply_to_status_id != '0' && data.in_reply_to_status_id != '') {
				data.retweeted_status = {
					id: data.in_reply_to_status_id,
					user: {
						id: data.in_reply_to_user_id,
						screen_name: data.in_reply_to_screen_name,
						name: data.in_reply_to_user_name
					}
				};
				data.retweeted_status.t_url = tpl + data.retweeted_status.id;
				// 查看相关对话的url
				data.related_dialogue_url = 'http://digu.com/relatedDialogue/' + data.id;
				this.format_result_item(data.retweeted_status.user, 'user', args);
			}
			data.t_url = tpl + data.id;
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
        user_home_url: 'http://zuosa.com/',
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
	
	reset_count: function(data, callback) {
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
			args.data.page = args.data.cursor == '-1' ? 1 : args.data.cursor;
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
			var tpl = 'http://zuosa.com/Status/';
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
				data.retweeted_status.t_url = tpl + data.retweeted_status.id;
			}
			data.t_url = tpl + data.id;
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
        user_home_url: 'http://leihou.com/',
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
        callback({error:'没有提供接口'});
    },
	
	comments_timeline: function(data, callback) {
		callback();
	},
	
	reset_count: function(data, callback) {
		callback();
	},
	
	counts: function(data, callback) {
		callback();
	},
	
	before_sendRequest: function(args) {
		if(args.url == this.config.friends || args.url == this.config.followers) {
			// cursor. 选填参数. 单页只能包含100个粉丝列表，为了获取更多则cursor默认从-1开始，
			// 通过增加或减少cursor来获取更多的，如果没有下一页，则next_cursor返回0
			args.data.page = args.data.cursor == '-1' ? 1 : args.data.cursor;
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
			var tpl = 'http://leihou.com/{{user.screen_name}}/lei/{{id}}';
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
				data.retweeted_status.t_url = tpl.format(data.retweeted_status);
			}
			this.format_result_item(data.user, 'user', args);
			data.t_url = tpl.format(data);
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
        user_home_url: 'http://follow5.com',
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
        callback({error:'没有提供接口'});
    },
	
//	comments_timeline: function(data, callback) {
//		callback();
//	},
	
	reset_count: function(data, callback) {
		callback();
	},
	
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
			args.data.page = args.data.cursor == '-1' ? 1 : args.data.cursor;
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
			data.t_url = 'http://www.follow5.com/f5/mwfm/home?c=note&nid=' + data.id;
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
        user_home_url: 'http://twitter.com/',
        search_url: 'http://twitter.com/search?q=',
		source: 'fawave', 
        oauth_key: 'i1aAkHo2GkZRWbUOQe8zA',
        oauth_secret: 'MCskw4dW5dhWAYKGl3laRVTLzT8jTonOIOpmzEY',
        repost_pre: 'RT',
	    support_comment: false,
	    support_repost: false,
	    support_upload: false,
	    
	    repost: '/statuses/update',
        retweet: '/statuses/retweet/{{id}}',
        favorites_create: '/favorites/create/{{id}}',
        friends_timeline: '/statuses/home_timeline'
	}),
       
    processSearch: function (str) {
        str = str.replace(/(^|&lt;|a-zA-Z_0-9|\s)(#|$)([\w\u4e00-\u9fa5|\_]*|$)/g,' <a class="tag" title="$3" href="http://twitter.com/search?q=%23$3" target="_blank">$2$3</a>');
        //str = str.replace(/[^\w]#([\w\u4e00-\u9fa5|\_]+)/g, ' <a target="_blank" href="'+ this.config.search_url +'%23$1" title="Search #$1">#$1</a>');
        return str;
    },
    processEmotional: function(str){
        return str;
    },
	
	// 无需urlencode
	url_encode: function(text) {
		return text;
	},
	
	comments_timeline: function(data, callback) {
		callback();
	},
	
	reset_count: function(data, callback) {
		callback();
	},
	
	counts: function(data, callback) {
		callback();
	},

    retweet: function(data, callbackFn){
		if(!callbackFn) return;
        var params = {
            url: this.config.retweet,
            type: 'post',
            play_load: 'status',
            data: data
        };
        this._sendRequest(params, callbackFn);
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
            data.id = data.id_str || data.id;
			var tpl = 'http://twitter.com/{{user.screen_name}}/status/{{id}}';
			data.t_url = tpl.format(data);
			this.format_result_item(data.user, 'user', args);
			if(data.retweeted_status) {
				data.retweeted_status.t_url = tpl.format(data.retweeted_status);
				this.format_result_item(data.retweeted_status.user, 'user', args);
			}
		} else if(play_load == 'user' && data && data.id) {
			data.t_url = 'http://twitter.com/' + (data.screen_name || data.id);
		}
		return data;
	}
});

var FanfouAPI = $.extend({}, sinaApi);

$.extend(FanfouAPI, {
	
	// 覆盖不同的参数
	config: $.extend({}, sinaApi.config, {
		host: 'http://api2.fanfou.com',
        user_home_url: 'http://fanfou.com/',
        search_url: 'http://fanfou.com/q/',
		source: 'fawave',
		repost_pre: '转',
	    support_comment: false,
	    support_repost: false,
	    upload: '/photos/upload'
	}),
	
	// 无需urlencode
	url_encode: function(text) {
		return text;
	},
    
    processAt: function (str) { //@*** ,饭否的用户名支持“.”
        str = str.replace(/^@([\w\-\u4e00-\u9fa5|\_\.]+)/g, ' <a target="_blank" href="javascript:getUserTimeline(\'$1\');" rhref="'+ this.config.user_home_url +'$1" title="左键查看微薄，右键打开主页">@$1</a>');
        str = str.replace(/([^\w#])@([\w\-\u4e00-\u9fa5|\_\.]+)/g, '$1<a target="_blank" href="javascript:getUserTimeline(\'$2\');" rhref="'+ this.config.user_home_url +'$2" title="左键查看微薄，右键打开主页">@$2</a>');
        
        return str;
    },
	
	reset_count: function(data, callback) {
		callback();
	},
	
	counts: function(data, callback) {
		callback();
	},
	
	before_sendRequest: function(args, user) {
		if(args.url == this.config.new_message) {
			// id => user
			args.data.user = args.data.id;
			delete args.data.id;
		} else if(args.url == this.config.update){
			if(args.data.sina_id){
				args.data.in_reply_to_status_id = args.data.sina_id;
				delete args.data.sina_id;
			}
		}
    },
	
	/* photo（必须）- 照片文件。和<input type="file" name="photo" />效果一样
	 * */
	format_upload_params: function(user, data, pic) {
    	pic.keyname = 'photo';
    },
	
	format_result_item: function(data, play_load, args) {
		if(play_load == 'status' && data.id) {
			var tpl = 'http://fanfou.com/statuses/{{id}}';
			data.t_url = tpl.format(data);
			this.format_result_item(data.user, 'user', args);
			// 'photo': {u'largeurl': u'http://photo.fanfou.com/n0/00/as/vd_161837.jpg', 
			// u'imageurl': u'http://photo.fanfou.com/m0/00/as/vd_161837.jpg', // 太小了
			// u'thumburl': u'http://photo.fanfou.com/t0/00/as/vd_161837.jpg'},
   			if(data.photo){
   				data.thumbnail_pic = data.photo.thumburl;
				data.bmiddle_pic = data.photo.largeurl;
				data.original_pic = data.photo.largeurl;
				delete data.photo;
   			}
   			if(data.in_reply_to_status_id){
   				data.related_dialogue_url = 'http://fanfou.com/statuses/' + data.in_reply_to_status_id + '?fr=viewreply';
   			}
		} else if(play_load == 'user' && data && data.id) {
			data.t_url = 'http://fanfou.com/' + (data.id || data.screen_name);
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
        friends_timeline: '/statuses/home_timeline'
	})
});

// 人间
var RenjianAPI = $.extend({}, sinaApi);

$.extend(RenjianAPI, {
	
	// 覆盖不同的参数
	config: $.extend({}, sinaApi.config, {
		host: 'http://api.renjian.com/v2',
		source: 'fawave', 
		support_comment: false,
		support_repost: false,
	    
		favorites: '/statuses/likes',
        favorites_create: '/statuses/like/{{id}}',
        favorites_destroy: '/statuses/unlike/{{id}}',
	    upload: '/statuses/create',
	    repost: '/statuses/create',
	    friends_timeline: '/statuses/friends_timeline',
	    friends: '/statuses/followings/{{user_id}}',
	    followers: '/statuses/followers/{{user_id}}',
	    direct_messages: '/direct_messages/receive'
	}),
	
	// 无需urlencode
	url_encode: function(text) {
		return text;
	},
	
	comments_timeline: function(data, callback) {
		callback();
	},
	
	rate_limit_status: function(data, callback){
        callback({error:'没有提供接口'});
    },
	
	reset_count: function(data, callback) {
		callback();
	},
	
	counts: function(data, callback) {
		callback();
	},
	
	verify_credentials: function(user, callbackFn, data){
        this.user_show({id: user.userName}, callbackFn);
	},
	
	/* status_type	类型，PICTURE/LINK/MUSIC
	 * picture	上传文件，需是multipart
	 */
    format_upload_params: function(user, data, pic) {
    	data.text = data.status;
    	delete data.status;
    	data.status_type = 'PICTURE';
    	pic.keyname = 'picture';
    },
	
	before_sendRequest: function(args, user) {
		if(args.url == this.config.update) {
			// status => text
			args.data.text = args.data.status;
			delete args.data.status;
			if(args.data.sina_id){
				args.data.in_reply_to_status_id = args.data.sina_id;
				delete args.data.sina_id;
			}
		} else if(args.url == this.config.friends_timeline){
			args.data.id = user.id;
		} else if(args.url == this.config.friends || args.url == this.config.followers) {
			// cursor. 选填参数. 单页只能包含100个粉丝列表，为了获取更多则cursor默认从-1开始，
			// 通过增加或减少cursor来获取更多的，如果没有下一页，则next_cursor返回0
			args.data.page = args.data.cursor == '-1' ? 1 : args.data.cursor;
			delete args.data.cursor;
			if(!args.data.page){
				args.data.page = 1;
			}
		}
    },
    
    format_result: function(data, play_load, args) {
		if($.isArray(data)) {
	    	for(var i in data) {
	    		data[i] = this.format_result_item(data[i], play_load, args);
	    	}
	    } else {
	    	data = this.format_result_item(data, play_load, args);
	    }
		// 若是follwers api，则需要封装成cursor接口
		// cursor. 选填参数. 单页只能包含100个粉丝列表，为了获取更多则cursor默认从-1开始，
		// 通过增加或减少cursor来获取更多的，如果没有下一页，则next_cursor返回0
		if(args.url == this.config.followers || args.url == this.config.friends) {
			data = {users: data, next_cursor: Number(args.data.page) + 1, previous_cursor: args.data.page};
			if(data.users.length == 0) {
				data.next_cursor = 0;
			}
		}
		return data;
	},
	
	format_result_item: function(data, play_load, args) {
		if(play_load == 'status' && data.id) {
			data.favorited = data.liked;
			delete data.liked;
			if(data.attachment && data.attachment.type == 'PICTURE'){
				data.thumbnail_pic = data.attachment.thumbnail;
				data.bmiddle_pic = data.attachment.url;
				data.original_pic = data.bmiddle_pic;
				delete data.attachment;
			}
			var tpl = 'http://renjian.com/c/';
			if(data.replyed_status) {
				data.retweeted_status = data.replyed_status;
				delete data.replyed_status;
				this.format_result_item(data.retweeted_status, 'status', args);
			}
			data.t_url = tpl + data.id;
			this.format_result_item(data.user, 'user', args);
		} else if(play_load == 'user' && data && data.id) {
			data.friends_count = data.following_count;
			delete data.following_count;
			data.t_url = 'http://renjian.com/' + data.id;
			if(data.profile_image_url) {
				data.profile_image_url = data.profile_image_url.replace('120x120', '48x48');
			}
			data.name = data.name || data.screen_name;
		} 
		else if(play_load == 'comment') {
			this.format_result_item(data.user, 'user', args);
		} else if(play_load == 'message') {
			this.format_result_item(data.sender, 'user', args);
			this.format_result_item(data.recipient, 'user', args);
		}
		return data;
	}
});

var BuzzAPI = $.extend({}, sinaApi);
$.extend(BuzzAPI, {
	config: $.extend({}, sinaApi.config, {
		host: 'https://www.googleapis.com/buzz/v1',
		source: 'AIzaSyAu4vq6sYO3WuKxP2G64fYg6T1LdIDu3pk', // https://code.google.com/apis/console/#project:828316891836:apis_keys
		oauth_key: 'net4team.net',
		oauth_secret: 'y+6SWcLVshQvogadDzXtSra+',
        result_format: '', // 由alt参数确定返回值格式
        
        userinfo_has_counts: false, //用户信息中是否包含粉丝数、微博数等信息
        support_counts: false,
		support_upload: false, // 是否支持上传图片
		support_comment: false,
		support_cursor_only: true,  // 只支持游标方式翻页
		support_mentions: false,
		support_direct_messages: false,
		support_upload: false,
		need_processMsg: false,
		repost_pre: 'RT ',
		
		oauth_host: 'https://www.google.com',
		oauth_authorize: 	  '/accounts/OAuthAuthorizeToken',
        oauth_request_token:  '/accounts/OAuthGetRequestToken',
        oauth_request_params: {
        	scope: 'https://www.googleapis.com/auth/buzz'
        },
        oauth_access_token:   '/accounts/OAuthGetAccessToken',
        oauth_realm: '',
        friends_timeline: '/activities/@me/@consumption',
        user_timeline: '/activities/{{id}}/@self',
        followers: '/people/{{user_id}}/@groups/@followers',
        friends: '/people/{{user_id}}/@groups/@following',
        favorites: '/activities/@me/@liked',
        favorites_create: '/activities/@me/@liked/{{id}}?key={{key}}&alt={{alt}}',
        favorites_destroy: '/activities/@me/@liked/{{id}}?key={{key}}&alt={{alt}}_delete',
        friendships_create: '/people/@me/@groups/@following/{{id}}?key={{key}}&alt={{alt}}',
        friendships_destroy: '/people/@me/@groups/@following/{{id}}?key={{key}}&alt={{alt}}_delete',
        update: '/activities/@me/@self?key={{key}}&alt={{alt}}',
        repost: '/activities/@me/@self?key={{key}}&alt={{alt}}_repost',
        repost_real: '/activities/@me/@self?key={{key}}&alt={{alt}}',
        destroy: '/activities/@me/@self/{{id}}?key={{key}}&alt={{alt}}',
		verify_credentials: '/people/@me/@self'
	}),
	
	url_encode: function(text) {
		return text;
	},
	
	reset_count: function(data, callback) {
		callback();
	},
	
	counts: function(data, callback) {
		callback();
	},
	
	format_authorization_url: function(params) {
		var login_url = 'https://www.google.com/buzz/api/auth/OAuthAuthorizeToken';
		params.domain = this.config.oauth_key;
		params.iconUrl = 'http://falang.googlecode.com/svn/trunk/icons/icon48.png';
		$.extend(params, this.config.oauth_request_params);
		return OAuth.addToURL(login_url, params);
	},
	
	before_sendRequest: function(args, user) {
		if(args.url == this.config.oauth_request_token || args.url == this.config.oauth_access_token) {
			return;
		}
		args.data.alt = 'json';
		// google fawave 应用统计用的key
		args.data.key = args.data.source;
		delete args.data.source;
		delete args.data.screen_name;
		delete args.data.since_id;
		// 分页记录大小
		if(args.data.count) {
			args.data['max-results'] = args.data.count;
			delete args.data.count;
		}
		// 游标分页
		if(args.data.cursor) {
			args.data.c = args.data.cursor;
			delete args.data.cursor;
		}
		if(args.url == this.config.favorites_create || args.url == this.config.friendships_create) {
			args.type = 'PUT';
			args.contentType = 'application/json';
		} else if(args.url == this.config.favorites_destroy || args.url == this.config.friendships_destroy) {
			args.type = 'DELETE';
			args.url = args.url.replace('_delete', '');
		} else if(args.url == this.config.update) {
			delete args.data.sina_id;
			args.content = JSON.stringify({data: {object: {type: 'note', content: args.data.status}}});
			args.contentType = 'application/json';
			delete args.data.status;
		} else if(args.url == this.config.destroy) {
			args.type = 'DELETE';
		} else if(args.url == this.config.repost) {
			args.content = JSON.stringify({
				data: {
					annotation: args.data.status,
					verbs: ["share"],
					object: {id: args.data.id}
				}
			});
			args.contentType = 'application/json';
			args.url = this.config.repost_real;
			delete args.data.status;
			delete args.data.id;
		}
	},
	
	format_result: function(data, play_load, args) {
		if(args.url == this.config.friendships_create) {
			return true;
		}
		if(data.data) {
			data = data.data;
		}
		var items = data.items || data.entry || data;
		if($.isArray(items)) {
	    	for(var i in items) {
	    		items[i] = this.format_result_item(items[i], play_load, args);
	    	}
	    	if(data.links && data.links.next) {
	    		var next = data.links.next[0].href;
	    		var params = decodeForm(next);
	    		if(params.c) {
	    			data.next_cursor = params.c;
	    		}
	    	}
	    	data.items = items;
	    } else {
	    	data = this.format_result_item(data, play_load, args);
	    }
		return data;
	},
	
	format_result_item: function(data, play_load, args) {
		if(play_load == 'user' && data && data.id) {
			data.screen_name = data.displayName || data.name;
			data.t_url = data.profileUrl;
			data.profile_image_url = data.thumbnailUrl;
			data.description = data.aboutMe;
//			data.friends_count = '';
//			data.followers_count = '';
//			data.statuses_count = '';
			delete data.aboutMe;
			delete data.thumbnailUrl;
			delete data.displayName;
			delete data.profileUrl;
		} else if(play_load == 'status') {
//			data.text = data.object.content;
			if(data.object && data.object.type == 'activity') { // reshare => repost, 就是相当于新浪的repost
				data.text = data.annotation;
				data.retweeted_status = this.format_result_item(data.object, 'status', args);
			} else {
				data.text = data.object ? data.object.content : data.content;
//				if(data.crosspostSource) {
//					var url = data.crosspostSource.substring(data.crosspostSource.indexOf('http://'));
//					data.text += ' <a href="' + url + '">' + url + '</a>';
//				}
				var attachments = data.object ? data.object.attachments : data.attachments;
				if(attachments && attachments[0].type == 'photo') {
					data.thumbnail_pic = attachments[0].links.preview[0].href;
					data.bmiddle_pic = attachments[0].links.enclosure[0].href;
					data.original_pic = data.bmiddle_pic;
				}
				if(data.text == '-' && attachments && attachments[0].type == 'article') {
					data.text = attachments[0].title + ' -- ' + attachments[0].content;
					if(attachments[0].links.alternate) {
						data.text += ' ' + attachments[0].links.alternate[0].href;
					}
				}
			}
			if(data.source) {
				data.source = data.source.title;
				if(data.source == 'net4team.net') {
					data.source = '<a href="https://chrome.google.com/extensions/detail/aicelmgbddfgmpieedjiggifabdpcnln" target="_blank">FaWave</a>';
				}
			}
			data.created_at = data.published;
			var link = data.links.alternate || data.links.self;
			data.t_url = link[0].href;
			
			data.user = this.format_result_item(data.actor, 'user', args);
			if(args.url == this.config.favorites) {
				data.favorited = true;
			}
			delete data.annotation;
			delete data.crosspostSource;
			delete data.published;
			delete data.object;
			delete data.title;
			delete data.links;
			delete data.actor;
		}
		return data;
	}

});

// 豆瓣
var DoubanAPI = $.extend({}, sinaApi);
/*
 * 豆瓣 API 通过HTTP Status Code来说明 API 请求是否成功 下面的表格中展示了可能的HTTP Status Code以及其含义

状态码	含义
200 OK	请求成功
201 CREATED	创建成功
202 ACCEPTED	更新成功
400 BAD REQUEST	请求的地址不存在或者包含不支持的参数
401 UNAUTHORIZED	未授权
403 FORBIDDEN	被禁止访问
404 NOT FOUND	请求的资源不存在
500 INTERNAL SERVER ERROR	内部错误

 */
$.extend(DoubanAPI, {
	config: $.extend({}, sinaApi.config, {
		host: 'http://api.douban.com',
		source: '05e787211a7ff69311b695634f7fe3b9', 
		oauth_key: '05e787211a7ff69311b695634f7fe3b9',
        oauth_secret: 'a29252a52eaa835d',
        result_format: '', // 豆瓣由alt参数确定返回值格式
        
		userinfo_has_counts: false, // 用户信息中是否包含粉丝数、微博数等信息
        support_comment: false,
		support_repost: false,
		support_max_id: false,
		support_favorites: false,
		support_mentions: false,
		support_upload: false,
		need_processMsg: false,
		support_cursor_only: true,
		
		oauth_callback: null,
		oauth_host: 'http://www.douban.com',
		oauth_authorize: 	  '/service/auth/authorize',
        oauth_request_token:  '/service/auth/request_token',
        oauth_access_token:   '/service/auth/access_token',
        // douban需要 oauth_realm
        oauth_realm: 'fawave',
        friends_timeline: '/people/%40me/miniblog/contacts',
        user_timeline: '/people/{{id}}/miniblog',
        update: '/miniblog/saying',
        destroy: '/miniblog/{{id}}',
        direct_messages: '/doumail/inbox',
        friends: '/people/{{user_id}}/contacts',
        followers: '/people/{{user_id}}/friends',
        new_message: '/doumails',
        destroy_msg: '/doumail/{{id}}',
		verify_credentials: '/people/%40me'
	}),
	
	counts: function(data, callback) {
		callback();
	},
	
	MSG_TPL: '<?xml version="1.0" encoding="UTF-8"?><entry xmlns="http://www.w3.org/2005/Atom" xmlns:db="http://www.douban.com/xmlns/" xmlns:gd="http://schemas.google.com/g/2005" xmlns:opensearch="http://a9.com/-/spec/opensearchrss/1.0/"><db:entity name="receiver"><uri>http://api.douban.com/people/{{id}}</uri></db:entity><content>{{text}}</content><title>{{text}}</title></entry>',
	
	/*
	 * start-index	 返回多个元素时，起始元素的下标	 下标从1开始
	 * max-results	 返回多个entry时，每页最多的结果数	 除非特别说明，
	 * max-results的最大值为50，参数值超过50返回50个结果
	 */
	before_sendRequest: function(args) {
		if(args.url != this.config.oauth_request_token && args.url != this.config.oauth_access_token) {
			args.data.alt = 'json';
			if(args.data.count) {
				args.data['max-results'] = args.data.count;
				if(args.data.cursor) {
					args.data['start-index'] = args.data.cursor;
					// 设置下一页
					args.data.cursor = Number(args.data.cursor);
					if(args.data.cursor == -1) {
						args.data.cursor = 1;
					}
					args.next_cursor = args.data.cursor + args.data.count;
					delete args.data.cursor;
				} else {
					args.next_cursor = args.data.count + 1;
				}
				delete args.data.count;
			}
			delete args.data.screen_name;
			delete args.data.since_id;
			// args.data.source => args.data.apikey
			args.data.apikey = args.data.source;
			delete args.data.source;
			if(args.url == this.config.update) {
				var tpl = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns:ns0="http://www.w3.org/2005/Atom" xmlns:db="http://www.douban.com/xmlns/"><content>{{status}}</content></entry>';
				args.content = tpl.format(args.data);
				args.contentType = 'application/atom+xml; charset=utf-8';
				args.data = {};
			} else if(args.url == this.config.destroy || args.url == this.config.destroy_msg) {
				delete args.data.apikey;
				delete args.data.alt;
				args.type = 'DELETE';
			} else if(args.url == this.config.friends_timeline || args.url == this.config.user_timeline) {
				args.data.type = 'all';
			} else if(args.url == this.config.new_message) {
				args.content = this.MSG_TPL.format(args.data);
				args.contentType = 'application/atom+xml; charset=utf-8';
				args.data = {};
			}
		}
	},
	
	format_result: function(data, play_load, args) {
		if(args.url == this.config.update || args.url == this.config.destroy 
				|| args.url == this.config.destroy_msg || args.url == this.config.new_message) {
			return true;
		}
		var items = data.entry || data;
		if($.isArray(items)) {
			if(data.author) {
				data.user = this.format_result_item(data.author, 'user', args);
			}
	    	for(var i in items) {
	    		items[i] = this.format_result_item(items[i], play_load, args);
	    		if(!items[i].user) {
	    			items[i].user = data.user;
	    		}
	    	}
	    	data.items = items;
	    	if(items.length == 0) {
	    		args.next_cursor = '0';
	    	}
	    	if(args.next_cursor) {
	    		data.next_cursor = args.next_cursor;
	    	}
	    } else {
	    	data = this.format_result_item(data, play_load, args);
	    }
		return data;
	},
	
	format_result_item: function(data, play_load, args) {
		if(play_load == 'user' && data) {
			if(data.link) {
				var url_index = 1, icon_index = 2;
				if(data.link.length == 2) {
					url_index = 0;
					icon_index = 1;
				}
				data.t_url = data.link[url_index]['@href'];
				data.profile_image_url = data.link[icon_index]['@href'];
			} else {
				data.t_url = data.uri['$t'];
			}
			if(data['db:uid']) {
				data.id = data['db:uid']['$t'];
			} else {
				data.id = data.t_url.substring(data.t_url.lastIndexOf('/people/') + 8, data.t_url.length - 1);
			}
			if(data.content) {
				data.description = data.content['$t'];
				delete data.content;
			}
			if(data['db:location']) {
				data.province = data['db:location']['$t'];
				delete data.location;
			}
			data.screen_name = data.title ? data.title['$t'] : data.name['$t'];
			data.name = data.id;
			delete data.link;
			delete data.title;
		} else if(play_load == 'status') {
			if(data.author) {
				data.user = this.format_result_item(data.author, 'user', args);
			}
			if(data['db:uid']) {
				data.id = data['db:uid']['$t'];
			} else {
				data.id = data.id['$t'];
				data.id = data.id.substring(data.id.lastIndexOf('/miniblog/') + 10, data.id.length);
			}
			data.text = data.content['$t'];
			delete data.author;
			delete data.content;
		} else if(play_load == 'message') {
			data.sender = data.user = this.format_result_item(data.author, 'user', args);
			data.text = data.title['$t'];
			data.id = data.id['$t'];
			data.id = data.id.substring(data.id.lastIndexOf('/doumail/') + 9, data.id.length);
			data.t_url = data.link[1]['@href'];
			data.text += ' <a href="{{t_url}}">查看</a>'.format(data);
			delete data.title;
		} else if(play_load == 'comment') {
			this.format_result_item(data.user, 'user', args);
			this.format_result_item(data.status, 'status', args);
		}
		if(data.published) {
			data.created_at = data.published['$t'];
			delete data.published;
		}
		return data;
	},
	
	// urlencode，子类覆盖是否需要urlencode处理
	url_encode: function(text) {
		return text;
	}
});

var T_APIS = {
	'tsina': sinaApi,
	'tsohu': TSohuAPI,
	'digu': DiguAPI,
	'zuosa': ZuosaAPI,
	'leihou': LeiHouAPI,
	'follow5': Follow5API,
	't163': T163API,
	'fanfou': FanfouAPI,
	'renjian': RenjianAPI,
	'douban': DoubanAPI,
	'buzz': BuzzAPI,
	'twitter': TwitterAPI // fxxx gxfxw first.
};


// 封装兼容所有微博的api，自动判断微博类型
var tapi = {

    // 自动判断当前用户所使用的api, 根据user.blogType判断
    api_dispatch: function(data) {
		return T_APIS[(data.user ? data.user.blogType : data.blogType) || 'tsina'];
	},
	
	translate: function(user, text, target, callback) {
		return tapi.api_dispatch(user).translate(text, target, callback);
	},
	
	processMsg: function(user, str, notEncode) {
		return tapi.api_dispatch(user).processMsg(str, notEncode);
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
	retweet: function(data, callbackFn){
		return this.api_dispatch(data).retweet(data, callbackFn);
	},
	
	// id
	destroy: function(data, callbackFn){
		return this.api_dispatch(data).destroy(data, callbackFn);
	}
};