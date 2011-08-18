/*
* @author qleelulu@gmail.com
*/

if(typeof BlobBuilder === 'undefined' && typeof WebKitBlobBuilder !== 'undefined') {
	var BlobBuilder = WebKitBlobBuilder;
}

function Combo(callback) {
    this.callback = callback;
    this.items = 0;
    this.results = [];
}

Combo.prototype = {
    add: function () {
      var self = this,
          id = this.items;
      this.items++;
      return function () {
        self.check(id, arguments);
      };
    },
    check: function (id, arguments) {
      this.results[id] = Array.prototype.slice.call(arguments);
      this.items--;
      if (this.items == 0) {
        this.callback.apply(this, this.results);
      }
    }
};

//destination, source1[, source2, ...]
Object.inherits = function(destination) {
    for(var i = 1, len = arguments.length; i < len; i++) {
        var source = arguments[i];
        if(!source) {
            continue;
        }
        for(var property in source) {
            destination[property] = source[property];
        }
        if(destination.super_ === undefined) {
            destination.super_ = source;
        }
    }
    return destination;
};

var OAUTH_CALLBACK_URL = chrome.extension.getURL('oauth_cb.html');
var FAWAVE_OAUTH_CALLBACK_URL = 'http://fawave.net4team.net/';
var RE_JSON_BAD_WORD = /[\u000B\u000C]/ig; //具体见：http://www.cnblogs.com/rubylouvre/archive/2011/02/12/1951760.html
var URL_RE = new RegExp('(?:\\[url\\s*=\\s*|)((?:www\\.|http[s]?://)[\\w\\.\\?%&\\-/#=;:!\\+~]+)(?:\\](.+)\\[/url\\]|)', 'ig');

// 伪装成微博AIR
var TSINA_APPKEYS = {
    'fawave': ['FaWave', '3538199806', '18cf587d60e11e3c160114fd92dd1f2b']
};

var sinaApi = {
	combo: function(callback) {
	    return new Combo(callback);
	},
	config: {
		host: 'http://api.t.sina.com.cn',
        user_home_url: 'http://weibo.com/n/',
        search_url: 'http://weibo.com/k/',
		result_format: '.json',
		source: '3538199806',
        oauth_key: '3538199806',
        oauth_secret: '18cf587d60e11e3c160114fd92dd1f2b',
        // google app key
        google_appkey: 'AIzaSyAu4vq6sYO3WuKxP2G64fYg6T1LdIDu3pk',
        
        user_timeline_need_friendship: true, // 获取用户微博列表时是否需要额外获取与当前用户的关系信息
        max_text_length: 140,
        max_image_size: 5 * 1024 * 1024,
        userinfo_has_counts: true, // 用户信息中是否包含粉丝数、微博数等信息
        support_double_char: true, // 是否按双字节计算长度
        support_counts: true, // 是否支持批量获取转发和评论数
        support_comment: true, // 判断是否支持评论列表
        support_do_comment: true, // 判断是否支持发送评论
        support_repost_comment: true, // 判断是否支持转发同时发评论
        support_repost_comment_to_root: false, // 判断是否支持转发同时给原文作者发评论
        support_repost: true, // 是否支持新浪形式转载
        support_repost_timeline: true, // 支持查看转发列表
		support_upload: true, // 是否支持上传图片
		repost_pre: '转:', // 转发前缀
        repost_delimiter: '//', //转发的分隔符
		image_shorturl_pre: ' [图] ', // RT图片缩址前缀
		support_favorites: true, // 判断是否支持收藏列表
		support_do_favorite: true, // 判断是否支持收藏功能
        support_geo: true, //是否支持地理位置信息上传
        latitude_field: 'lat', // 纬度参数名
        longitude_field: 'long', // 经度参数名
		// 是否支持max_id 分页
		support_max_id: true,
		support_destroy_msg: true, //是否支持删除私信
		support_direct_messages: true, 
		support_sent_direct_messages: true, //是否支持自己发送的私信
		support_mentions: true, 
		support_friendships_create: true,
		support_search: true,
		support_user_search: true, // 支持搜人
		support_search_max_id: false,
		support_favorites_max_id: false, // 收藏分页使用max_id
		support_auto_shorten_url: true, // 是否会自动对url进行缩短，如何会，则无须使用缩短服务
		rt_need_source: true, // RT的时候是否需要原始微博
		
		need_processMsg: true, //是否需要处理消息的内容
		comment_need_user_id: false, // 评论是否需要使用到用户id，默认为false，兼容所有旧接口
		user_timeline_need_user: false, // user_timeline 是否需要调用show_user获取详细用户信息
        
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
        status_show:          '/statuses/show/{{id}}',
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
        sent_direct_messages: '/direct_messages/sent', //自己发送的私信列表，我当时为什么要命名为sent_direct_messages捏，我擦
        new_message:          '/direct_messages/new',
        verify_credentials:   '/account/verify_credentials',
        rate_limit_status:    '/account/rate_limit_status',
        friendships_create:   '/friendships/create',
        friendships_destroy:  '/friendships/destroy',
        friendships_show:     '/friendships/show',
        reset_count:          '/statuses/reset_count',
        user_show:            '/users/show/{{id}}',
        
        // 用户标签
        tags: 				  '/tags',
        create_tag: 	      '/tags/create',
        destroy_tag:          '/tags/destroy',
        tags_suggestions:	  '/tags/suggestions',
        
        // 搜索
        search:               '/statuses/search',
        user_search:               '/users/search',
        
        oauth_authorize: 	  '/oauth/authorize',
        oauth_request_token:  '/oauth/request_token',
        oauth_callback: OAUTH_CALLBACK_URL,
        oauth_access_token:   '/oauth/access_token',

        detailUrl:        '/jump?aid=detail&twId=',
        searchUrl:        '/search/',
        
        ErrorCodes: {
        	"40025:Error: repeated weibo text!": "重复发送",
        	"40028:": "新浪微博接口内部错误",
        	"40031:Error: target weibo does not exist!": "不存在的微博ID",
        	"40015:Error: not your own comment!": "评论ID不在登录用户的comments_by_me列表中",
        	"40303:Error: already followed": "已跟随"
        }
    },
    
    // 翻译
    translate: function(text, target, callback, context) {
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
					showMsg(_u.i18n("comm_not_need_tran"), true);
					callback.call(context, null);
				} else {
					callback.call(context, tran.translatedText);
				}
		  	}, 
		  	error: function(xhr, status) {
		  		var error = {message: status + ': ' + xhr.statusText};
		  		try {
		  			error = JSON.parse(xhr.responseText).error;
		  		} catch(e) {
		  		}
		  		if(error.message == 'The source language could not be detected') {
		  			showMsg(_u.i18n("comm_not_need_tran"), true);
		  		} else {
		  			showMsg(_u.i18n("comm_could_not_tran") + error.message, true);
		  		}
		  		callback.call(context, null);
		  	}
		});
    },

    /**
     * 处理内容
     */
    processMsg: function(str_or_status, notEncode) {
    	var str = str_or_status;
    	if(str_or_status.text !== undefined) {
    		str = str_or_status.text;
    	}
        if(str && this.config.need_processMsg){
	        if(!notEncode){
	            str = HTMLEnCode(str);
	        }
	        str = str.replace(URL_RE, this._replaceUrl);
	        
	        str = this.processAt(str, str_or_status); //@***
	
	        str = this.processEmotional(str); 
	
	        str = this.processSearch(str); //#xxXX#
	
	        str = str.replace( /([\uE001-\uE537])/gi, this.getIphoneEmoji);
        }
        return str || '&nbsp;';
    },
    
    getIphoneEmoji: function(str){
        return "<span class=\"iphoneEmoji "+ str.charCodeAt(0).toString(16).toUpperCase()+"\"></span>";
    },
    searchMatchReg: /#([^#]+)#/g,
    processSearch: function(str) {
    	var search_url = this.config.search_url;
        str = str.replace(this.searchMatchReg, function(m, g1) {
        	// 修复#xxx@xxx#嵌套问题
        	var search = g1.remove_html_tag();
        	return '<a target="_blank" href="'+ search_url + '{{search}}" title="Search #{{search}}">#{{search}}#</a>'.format({search: search});
        });
        return str;
    },
    // return [[hash1, hash_value], ..., [#xxx#, xxx]]
    findSearchText: function(str) {
    	var matchs = str.match(this.searchMatchReg);
    	var result = [];
    	if(matchs) {
    		for(var i = 0, len = matchs.length; i < len; i++) {
    			var s = matchs[i];
    			result.push([s, s.substring(1, s.length - 1)]);
    		}
    	}
    	return result;
    },
    formatSearchText: function(str) { // 格式化主题
    	return '#' + str.trim() + '#';
    },
    processAt: function (str) { 
    	//@*** u4e00-\u9fa5:中文字符 \u2E80-\u9FFF:中日韩字符
    	//【观点·@任志强】今年提出的1000万套的保障房任务可能根本完不成
    	// http://blog.oasisfeng.com/2006/10/19/full-cjk-unicode-range/
    	// CJK标点符号：3000-303F
        str = str.replace(/@([\w\-\_\u2E80-\u3000\u303F-\u9FFF]+)/g, 
        	'<a target="_blank" href="javascript:getUserTimeline(\'$1\');" rhref="'
        		+ this.config.user_home_url + '$1" title="'
        		+ _u.i18n("btn_show_user_title") +'">@$1</a>');
        return str;
    },
    processEmotional: function(str){
        return str.replace(/\[([\u4e00-\u9fff,\uff1f,\w]{1,4})\]/g, this._replaceEmotional);
    },
    _replaceUrl: function(m, g1, g2){
        var _url = g1;
        if(g1.indexOf('http') != 0){
            _url = 'http://' + g1;
        }
        return '<a target="_blank" class="link" href="{{url}}">{{value}}</a>'.format({
            url: _url, title: g1, value: g2||g1
        });
    },
    _replaceEmotional: function(m, g1){
        var tpl = '<img title="{{title}}" src="{{src}}" />';
        if(g1) {
            var face = TSINA_API_EMOTIONS[g1];
            if(face) {
                return tpl.format({title: m, src: TSINA_FACE_URL_PRE + face});
            }
        }
        return m;
    },

	// 设置认证头
	apply_auth: function(url, args, user) {
//    	var appkey = null;
//    	if(user.blogType === 'tsina' && user.appkey) {
//			// 设在其他key
//			appkey = TSINA_APPKEYS[user.appkey] || [user.appkey, user.appkey];
//			if(appkey && args.data.source) {
//				args.data.source = appkey[1];
//			}
//		}
	    if(user.blogType === 'tsina') {
	        delete args.data.source;
	    }
        user.authType = user.authType || 'baseauth'; //兼容旧版本
		if(user.authType == 'baseauth') {
			args.headers['Authorization'] = make_base_auth_header(user.userName, user.password);
		} else if(user.authType == 'oauth' || user.authType == 'xauth') {
			var oauth_secret = this.config.oauth_secret;
			var oauth_key = this.config.oauth_key;
//			if(appkey) {
//				oauth_key = appkey[1];
//				oauth_secret = user.appkey_secret || appkey[2];
//			}
			var accessor = {
				consumerSecret: oauth_secret
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
			message.parameters.oauth_consumer_key = oauth_key;
			message.parameters.oauth_version = '1.0';
			// 已通过oauth认证
			if(user.oauth_token_key) {
				message.parameters.oauth_token = user.oauth_token_key;
			}
			// 设置时间戳
			OAuth.setTimestampAndNonce(message);
			// 签名参数
		    OAuth.SignatureMethod.sign(message, accessor);
		    // oauth参数通过get方式传递
		    if(this.config.oauth_params_by_get === true) {
		    	args.data = message.parameters;
		    } else {
		    	// 获取认证头部
			    args.headers['Authorization'] = OAuth.getAuthorizationHeader(this.config.oauth_realm, message.parameters);
		    }
		}
	},
	
	format_authorization_url: function(params) {
		var login_url = (this.config.oauth_host || this.config.host) + this.config.oauth_authorize;
		return OAuth.addToURL(login_url, params);
	},
	
    // 获取认证url
    get_authorization_url: function(user, callback, context) {
    	if(user.authType == 'oauth') {
    		var login_url = null;
    		this.get_request_token(user, function(token, text_status, error_code) {
    			if(token) {
    				user.oauth_token_key = token.oauth_token;
        			user.oauth_token_secret = token.oauth_token_secret;
        			// 返回登录url给用户登录
        			var params = {oauth_token: user.oauth_token_key};
        			if(this.config.oauth_callback) {
            			params.oauth_callback = this.config.oauth_callback;
            		}
        			login_url = this.format_authorization_url(params);
    			}
    			callback.call(context, login_url, text_status, error_code);
    		}, this);
    	} else {
    		throw new Error(user.authType + ' not support get_authorization_url');
    	}
    },
    
    get_request_token: function(user, callback, context) {
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
    			callback.call(context, token, text_status, error_code);
    		});
    	} else {
    		throw new Error(user.authType + ' not support get_request_token');
    	}
    },
    
    // 必须设置user.oauth_pin
    get_access_token: function(user, callback, context) {
    	if(user.authType == 'oauth' || user.authType == 'xauth') {
    		var params = {
	            url: this.config.oauth_access_token,
	            type: 'get',
	            user: user,
	            play_load: 'string',
	            apiHost: this.config.oauth_host,
	            data: {},
	            need_source: false
	        };
	        if(user.oauth_pin) {
	        	params.data.oauth_verifier = user.oauth_pin;
	        }
	        if(user.authType == 'xauth') {
	        	params.data.x_auth_username = user.userName;
				params.data.x_auth_password = user.password;
				params.data.x_auth_mode = "client_auth";
	        }
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
    			callback.call(context, token ? user : null, text_status, error_code);
    		});
    	} else {
    		throw new Error(user.authType + ' not support get_access_token');
    	}
    },
    
    /**
     * callbackFn(data, textStatus, errorCode): 
            成功和错误都会调用的方法。
            如果失败则errorCode为服务器返回的错误代码(例如: 400)。
    */
    verify_credentials: function(user, callback, data, context){
        if(!user) return callback && callback();
        var params = {
            url: this.config.verify_credentials,
            type: 'get',
            user: user,
            play_load: 'user',
            data: data
        };
        this._sendRequest(params, callback, context);
	},
        
    rate_limit_status: function(data, callback, context){
        if(!callback) return;
        var params = {
            url: this.config.rate_limit_status,
            type: 'get',
            play_load: 'rate',
            data: data
        };
        this._sendRequest(params, callback, context);
	},
	
	// since_id, max_id, count, page 
	friends_timeline: function(data, callback, context) {
        var params = {
            url: this.config.friends_timeline,
            type: 'get',
            play_load: 'status',
            data: data
        };
        this._sendRequest(params, callback, context);
	},
	
	// id, user_id, screen_name, since_id, max_id, count, page 
    user_timeline: function(data, callback, context) {
        var need_friendship = this.config.user_timeline_need_friendship && data.need_friendship;
        delete data.need_friendship;
        var params = {
            url: this.config.user_timeline,
            type: 'get',
            play_load: 'status',
            data: data
        };
        
        // Make a Combo object.
        var both = this.combo(function(statuses_args, friendship_args, show_user_args) {
            var friendship = null;
            if(friendship_args && friendship_args[0]) {
                friendship = friendship_args[0].target || friendship_args[0];
            }
            var statuses_result = statuses_args[0];
            // statuses_result 分为 [] 和 {items:[], user:xx}  两种类型
            var user_info = show_user_args[0];
            if(statuses_result && !user_info) {
                var statuses = statuses_result.items || statuses_result || [];
                if(statuses.length > 0) {
                    // 取数组的第一个的user
                    user_info = statuses[0].user || statuses[0].sender;
                }
            }
            if(user_info && friendship) {
                user_info.following = friendship.following;
                user_info.followed_by = friendship.followed_by;
            }
            if(statuses_result.items) {
                statuses_result.user = user_info;
            }
            return callback.apply(context, statuses_args);
        });
        var oauth_user = data.user
          , user_id = data.id || data.name
          , screen_name = data.screen_name || data.name;
        this._sendRequest(params, both.add());
        // 获取friendships_show
        var friendship_callback = both.add();
        var user_timeline_callback = both.add();
        if(need_friendship) {
            var args = {user: oauth_user};
            args.target_id = user_id;
            if(!args.target_id) {
                delete args.target_id;
            }
            if(screen_name) {
                args.target_screen_name = screen_name;
            }
            this.friendships_show(args, friendship_callback);
        } else {
            friendship_callback();
        }
        // 需要调用show user获取详细的用户信息
        if(this.config.user_timeline_need_user) {
            var args = {user: oauth_user};
            args.id = user_id;
            args.screen_name = screen_name;
            this.user_show(args, user_timeline_callback);
        } else {
            user_timeline_callback();
        }
	},
	
	// id, count, page
    comments_timeline: function(data, callbackFn, context){
		if(!callbackFn) return;
        var params = {
            url: this.config.comments_timeline,
            type: 'get',
            play_load: 'comment',
            data: data
        };
        this._sendRequest(params, callbackFn, context);
	},
	
	// id, count, page
    repost_timeline: function(data, callback, context){
        var params = {
            url: this.config.repost_timeline,
            type: 'get',
            play_load: 'status',
            data: data
        };
        this._sendRequest(params, callback, context);
	},

	// since_id, max_id, count, page 
    mentions: function(data, callbackFn, context){
		if(!callbackFn) return;
        var params = {
            url: this.config.mentions,
            type: 'get',
            play_load: 'status',
            data: data
        };
        this._sendRequest(params, callbackFn, context);
	},

	// id, user_id, screen_name, cursor, count
    followers: function(data, callback, context){
        var params = {
            url: this.config.followers,
            type: 'get',
            play_load: 'user',
            data: data
        };
        this._sendRequest(params, callback, context);
	},

	// id, user_id, screen_name, cursor, count
    friends: function(data, callback, context){
        var params = {
            url: this.config.friends,
            type: 'get',
            play_load: 'user',
            data: data
        };
        this._sendRequest(params, callback, context);
	},

	// page
    favorites: function(data, callbackFn, context){
		if(!callbackFn) return;
        var params = {
            url: this.config.favorites,
            type: 'get',
            play_load: 'status',
            data: data
        };
        this._sendRequest(params, callbackFn, context);
	},

	// id
    favorites_create: function(data, callbackFn, context){
		if(!callbackFn) return;
        var params = {
            url: this.config.favorites_create,
            type: 'post',
            play_load: 'status',
            data: data
        };
        this._sendRequest(params, callbackFn, context);
	},

	// id
    favorites_destroy: function(data, callbackFn, context){
		if(!callbackFn) return;
        var params = {
            url: this.config.favorites_destroy,
            type: 'post',
            play_load: 'status',
            data: data
        };
        this._sendRequest(params, callbackFn, context);
	},

	// ids
    counts: function(data, callbackFn, context){
        if(!callbackFn) return;
        var params = {
            url: this.config.counts,
            type: 'get',
            play_load: 'count',
            data: data
        };
        this._sendRequest(params, callbackFn, context);
    },

    // id
    user_show: function(data, callback, context){
        var params = {
            url: this.config.user_show,
            type: 'get',
            play_load: 'user',
            data: data
        };
        this._sendRequest(params, callback, context);
    },

    // since_id, max_id, count
    direct_messages: function(data, callback, context){
        var params = {
            url: this.config.direct_messages,
            type: 'get',
            play_load: 'message',
            data: data
        };
        this._sendRequest(params, callback, context);
	},
	
	// since_id, max_id, count
	sent_direct_messages: function(data, callback, context) {
		var params = {
            url: this.config.sent_direct_messages,
            type: 'get',
            play_load: 'message',
            data: data
        };
        this._sendRequest(params, callback, context);
	},

	// id
    destroy_msg: function(data, callbackFn, context){
		if(!callbackFn) return;
        var params = {
            url: this.config.destroy_msg,
            type: 'post',
            play_load: 'message',
            data: data
        };
        this._sendRequest(params, callbackFn, context);
	},

    /*data的参数列表：
    content 待发送消息的正文，请确定必要时需要进行URL编码 ( encode ) ，另外，不超过140英文或140汉字。
    message 必须 0 表示悄悄话 1 表示戳一下
    receiveUserId 必须，接收方的用户id
    source 可选，显示在网站上的来自哪里对应的标识符。如果想显示指定的字符，请与官方人员联系。
    */
    new_message: function(data, callbackFn, context){//悄悄话
		if(!callbackFn) return;
        var params = {
            url: this.config.new_message,
            type: 'post',
            play_load: 'message',
            data: data
        };
        this._sendRequest(params, callbackFn, context);
	},
	
	// id
	status_show: function(data, callback, context) {
		var params = {
			url: this.config.status_show,
			play_load: 'status',
			data: data
		};
		this._sendRequest(params, callback, context);
	},
	
	get_geo: function() {
		var settings = Settings.get();
        if(this.config.support_geo && settings.isGeoEnabled && settings.geoPosition){
        	if(settings.geoPosition.latitude) {
    			return settings.geoPosition;
    		}
        }
        return null;
	},
	
	// 格式化经纬度参数
	format_geo_arguments: function(data, geo){
		data[this.config.latitude_field] = geo.latitude;
        data[this.config.longitude_field] = geo.longitude;
	},
    
    update: function(data, callback, context){
		var geo = this.get_geo();
		if(geo) {
			this.format_geo_arguments(data, geo);
		}
        var params = {
            url: this.config.update,
            type: 'post',
            play_load: 'status',
            data: data
        };
        this._sendRequest(params, callback, context);
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
    upload: function(user, data, pic, before_request, onprogress, callback, context) {
    	var auth_args = {type: 'post', data: {}, headers: {}};
    	pic.keyname = pic.keyname || 'pic';
    	data.source = data.source || this.config.source;
    	var geo = this.get_geo();
    	if(geo) {
			this.format_geo_arguments(data, geo);
		}
    	this.format_upload_params(user, data, pic);
	    var boundary = '----multipartformboundary' + (new Date).getTime();
	    var dashdash = '--';
	    var crlf = '\r\n';
	
	    /* Build RFC2388 string. */
	    var builder = '';
	
	    builder += dashdash;
	    builder += boundary;
	    builder += crlf;
		
	    for(var key in data) {
		    var value = this.url_encode(data[key]);
		    // set auth params
		    auth_args.data[key] = value;
	    }
	    var api = user.apiProxy || this.config.host;
		var url = api + this.config.upload + this.config.result_format;
		if(this.config.use_method_param) {
			// 只使用method 做参数, 走rest api
			url = api;
		}
		// 设置认证头部
        this.apply_auth(url, auth_args, user);
        for(var key in auth_args.data) {
	    	/* Generate headers. key */            
		    builder += 'Content-Disposition: form-data; name="' + key + '"';
		    builder += crlf;
		    builder += crlf; 
		     /* Append form data. */
		    builder += auth_args.data[key];
		    builder += crlf;
		    
		    /* Write boundary. */
		    builder += dashdash;
		    builder += boundary;
		    builder += crlf;
	    }
	    /* Generate headers. [PIC] */            
	    builder += 'Content-Disposition: form-data; name="' + pic.keyname + '"';
	    if(pic.file.fileName) {
	      builder += '; filename="' + this.url_encode(pic.file.fileName) + '"';
	    }
	    builder += crlf;
	
	    builder += 'Content-Type: '+ (pic.file.fileType || pic.file.type);
	    builder += crlf;
	    builder += crlf; 
	    var bb = new BlobBuilder(); //NOTE change to WebKitBlogBuilder
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
		var that = this;
	    $.ajax({
	        url: url,
	        cache: false,
	        timeout: 5*60*1000, //5分钟超时
	        type : 'post',
	        data: bb.getBlob(),
	        dataType: 'text',
	        contentType: 'multipart/form-data; boundary=' + boundary,
	        processData: false,
	        xhr: xhr_provider(onprogress),
	        beforeSend: function(req) {
		    	for(var k in auth_args.headers) {
		    		req.setRequestHeader(k, auth_args.headers[k]);
	    		}
	        },
	        success: function(data, textStatus, xhr) {
	         // 如果没有网络，则会返回['', 'success', xhr.status === 0, xhr.statusText === '']
                var no_net_work = false;
                if(data === '' && textStatus === 'success' && xhr.status === 0 && xhr.statusText === '') {
                    no_net_work = true;
                    textStatus = 'error';
                    data = {error: 'No network', error_code: 10000};
                }
                if(!no_net_work) {
                    try {
                        data = JSON.parse(data);
                    }
                    catch(err) {
                        data = {error: _u.i18n("comm_error_return") + ' [json parse error]', error_code: 500};
                        textStatus = 'error';
                    }
                }
	            var error_code = null;
	            if(data) {
	                error_code = data.error_code;
                    var error = data.errors || data.error || data.wrong || data.error_msg;
                    if(data.ret && data.ret !== 0) { //腾讯
                        error = data.msg;
                        error_code = data.ret;
                    }
	                if(error){
	                	data.error = error;
	                	textStatus = 'error';
	                	var message = that.format_error(error, error_code, data);
	                    _showMsg('error: ' + message + ', error_code: ' + error_code, false);
	                }
	            } else {
	                error_code = 400;
	            }
	            callback.call(context, data, textStatus, error_code);
	        },
	        error: function (xhr, textStatus, errorThrown) {
	            var r = null, status = 'unknow';
	            if(xhr) {
	                if(xhr.status) {
	                    status = xhr.status;
	                }
	                if(xhr.responseText) {
	                    var r = xhr.responseText;
	                    try {
	                        r = JSON.parse(r);
	                    }
	                    catch(err) {
	                        r = null;
	                    }
	                    if(r){_showMsg('error_code:' + r.error_code + ', error:' + r.error, false);}
	                }
	            }
	            if(!r){
	                textStatus = textStatus ? ('textStatus: ' + textStatus + '; ') : '';
	                errorThrown = errorThrown ? ('errorThrown: ' + errorThrown + '; ') : '';
	                _showMsg('error: ' + textStatus + errorThrown + 'statuCode: ' + status, false);
	            }
	            callback.call(context, r || {}, 'error', status); //不管什么状态，都返回 error
	        }
	    });
    },

    repost: function(data, callback, context){
        if(!callback) return;
        var params = {
            url: this.config.repost,
            type: 'post',
            play_load: 'status',
            data: data
        };
        this._sendRequest(params, callback, context);
    },

    comment: function(data, callback, context){
        if(!callback) return;
        var params = {
            url: this.config.comment,
            type: 'post',
            play_load: 'comment',
            data: data
        };
        this._sendRequest(params, callback, context);
    },

    reply: function(data, callback, context){
        if(!callback) return;
        var params = {
            url: this.config.reply,
            type: 'post',
            play_load: 'comment',
            data: data
        };
        this._sendRequest(params, callback, context);
    },

    comments: function(data, callback, context){
        if(!callback) return;
        var params = {
            url: this.config.comments,
            type: 'get',
            play_load: 'comment',
            data: data
        };
        this._sendRequest(params, callback, context);
    },

    // id
    comment_destroy: function(data, callback, context){
        if(!callback) return;
        var params = {
            url: this.config.comment_destroy,
            type: 'post',
            play_load: 'comment',
            data: data
        };
        this._sendRequest(params, callback, context);
    },

    friendships_create: function(data, callback, context){
        if(!callback) return;
        var params = {
            url: this.config.friendships_create,
            type: 'post',
            play_load: 'user',
            data: data
        };
        this._sendRequest(params, callback, context);
    },

    // id
    friendships_destroy: function(data, callback, context){
        var params = {
            url: this.config.friendships_destroy,
            type: 'post',
            play_load: 'user',
            data: data
        };
        this._sendRequest(params, callback, context);
    },
    // [source_id, source_screen_name, ]target_id, target_screen_name
    friendships_show: function(data, callback, context){
        var params = {
            url: this.config.friendships_show,
            type: 'get',
            play_load: 'object',
            data: data
        };
        this._sendRequest(params, callback, context);
    },

    // type
    reset_count: function(data, callback, context){
        var params = {
            url: this.config.reset_count,
            type: 'post',
            play_load: 'result',
            data: data
        };
        this._sendRequest(params, callback, context);
    },
    
    // user_id, count, page
    tags: function(data, callback, context) {
    	var params = {
            url: this.config.tags,
            play_load: 'tag',
            data: data
        };
        this._sendRequest(params, callback, context);
    },
    
    // count, page
    tags_suggestions: function(data, callback, context) {
    	var params = {
            url: this.config.tags_suggestions,
            play_load: 'tag',
            data: data
        };
        this._sendRequest(params, callback, context);
    },
    
    // tags
    create_tag: function(data, callback, context) {
    	var params = {
            url: this.config.create_tag,
            type: 'post',
            play_load: 'tag',
            data: data
        };
        this._sendRequest(params, callback, context);
    },
    
    // tag_id
    destroy_tag: function(data, callback, context) {
    	var params = {
            url: this.config.destroy_tag,
            type: 'post',
            play_load: 'tag',
            data: data
        };
        this._sendRequest(params, callback, context);
    },

    // id
    destroy: function(data, callback, context){
        var params = {
            url: this.config.destroy,
            type: 'POST',
            play_load: 'status',
            data: data
        };
        this._sendRequest(params, callback, context);
    },
    
    // q, max_id, count
    search: function(data, callback, context) {
    	var params = {
            url: this.config.search,
            play_load: 'status',
            data: data
        };
        this._sendRequest(params, callback, context);
    },
    
    // q, page, count
    user_search: function(data, callback, context) {
    	var params = {
            url: this.config.user_search,
            play_load: 'user',
            data: data
        };
        this._sendRequest(params, callback, context);
    },
    
    // 格式化数据格式，其他微博实现兼容新浪微博的数据格式
    // play_load: status, user, comment, message, count, result(reset_count)
    // args: request arguments
    format_result: function(data, play_load, args) {
    	var items = data;
    	if(!$.isArray(items)) {
    		items = data.results || data.users;
    	}
		if($.isArray(items)) {
	    	for(var i in items) {
	    		items[i] = this.format_result_item(items[i], play_load, args);
	    	}
	    } else {
	    	data = this.format_result_item(data, play_load, args);
	    }
	    if(args.url == this.config.search && data.next_page) {
	    	// "next_page":"?page=2&max_id=1291867917&q=fawave", 提取max_id
	    	var p = decodeForm(data.next_page);
	    	data.max_id = p.max_id;
	    }
		return data;
	},
	
	format_result_item: function(data, play_load, args) {
		if(play_load == 'user' && data && data.id) {
			data.t_url = 'http://weibo.com/' + (data.domain || data.id);
		} else if(play_load == 'status') {
			if(!data.user) { // search data
				data.user = {
					screen_name: data.from_user,
					profile_image_url: data.profile_image_url,
					id: data.from_user_id
				};
				delete data.profile_image_url;
				delete data.from_user;
				delete data.from_user_id;
			}
			this.format_result_item(data.user, 'user', args);
//			var tpl = this.config.host + '/{{user.id}}/statuses/{{id}}';
//			// 设置status的t_url
//			data.t_url = tpl.format(data);
			data.t_url = 'http://weibo.com/' + data.user.id + '/' + WeiboUtil.mid2url(data.mid); 
			if(data.retweeted_status) {
				data.retweeted_status = this.format_result_item(data.retweeted_status, 'status', args);
			}
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
		return OAuth.percentEncode(text);
	},
    
	before_sendRequest: function(args, user) {
		
	},
	
	format_error: function(error, error_code, data) {
		if(this.config.ErrorCodes){
			error = this.config.ErrorCodes[error] || error;
		}
		return error;
	},
	
    _sendRequest: function(params, callbackFn, context) {
    	var args = {type: 'get', play_load: 'status', headers: {}};
    	$.extend(args, params);
    	args.data = args.data || {};
    	args.data.source = args.data.source || this.config.source;
    	if(args.need_source === false) {
    		delete args.need_source;
    		delete args.data.source;
    	}
    	if(!args.url) {
    		showMsg('url未指定', true);
            callbackFn({}, 'error', '400');
            return;
    	}
    	var user = args.user || args.data.user || localStorage.getObject(CURRENT_USER_KEY);
    	if(!user){
            showMsg('用户未指定', true);
            callbackFn({}, 'error', 400);
            return;
        }
        args.user = user;
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
    	if(args.play_load != 'string' && this.config.result_format) {
    		url += this.config.result_format;
    	}
    	// 删除已经填充到url中的参数
    	var pattern = /\{\{([\w\s\.\(\)\'\",-]+)?\}\}/g;
	    args.url.replace(pattern, function(match, key) {
	    	delete args.data[key];
	    });
        // 设置认证头部
        this.apply_auth(url, args, user);
        var play_load = args.play_load; // 返回的是什么类型的数据格式
        delete args.play_load;
        var callmethod = user.uniqueKey + ': ' + args.type + ' ' + args.url;
        var request_data = args.content || args.data;
        var processData = !args.content;
        var contentType = args.contentType || 'application/x-www-form-urlencoded';
        $.ajax({
            url: url,
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
                // 如果没有网络，则会返回['', 'success', xhr.status === 0, xhr.statusText === '']
                var no_net_work = false;
                if(data === '' && textStatus === 'success' && xhr.status === 0 && xhr.statusText === '') {
                    no_net_work = true;
                    textStatus = 'error';
                    data = {error: 'No network', error_code: 10000};
                }
                /******
                 * FaWave内部错误码：
                 *   800: JSON解析错误
                 *   999: 服务器返回结果不对，未知错误
                 */
            	if(play_load != 'string' && !no_net_work) {
                    data = data.replace(RE_JSON_BAD_WORD, '');
            		try {
                        data = JSON.parse(data);
                    }
                    catch(err) {
                    	if(xhr.status == 201 || xhr.statusText == "Created") { // rest成功
                    	    if(!data) {
                    	        data = true;
                    	    }
                    	} else {
                    		if(data.indexOf('{"wrong":"no data"}') > -1 || data === '' || data.toLowerCase() == 'ok') {
                        		data = [];
                        	} else {
                                data = {error: callmethod + ' ' + _u.i18n("comm_error_return") 
                                        + ' ' + err.message, error_code:500};
                                textStatus = 'error';
                        	}
                    	}
                    }
            	}
                var error_code = null;

                if(data) {
                	error_code = data.error_code || data.code;
                    var error = data.error || data.error_msg;
                    if(data.ret && data.ret !== 0) { //腾讯
                        if(data.msg === 'have no tweet'){
                            data.data = {info:[]};
                        } else if(data.ret === 4 && data.errcode === 0) { 
                            error = null;
                            data = {};
                        } else {
                            error = data.msg;
                            error_code = data.ret;
                        }
                    } else {
                        // 腾讯正确的结果
                        if(data.ret !== undefined && (data.msg === 'have no tweet' || data.msg === 'have no user')) {
                            data.data = {info:[]};
                        }
                    }
                    if(!error && data.errors) {
                        if(typeof(data.errors)==='string') {
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
                    if(error || error_code) {
                    	data.error = error;
                    	textStatus = this.format_error(data.error || data.wrong || data.message || data.error_msg, error_code, data);
                    	var error_msg = callmethod + ' error: ' + textStatus;
                    	if(!textStatus && error_code){ // 错误为空，才显示错误代码
                    		error_msg += ', error_code: ' + error_code;
                    	}
                        error_code = error_code || 'unknow';
                        showMsg(error_msg, false);
                    } else {
                        //成功再去格式化结果
                    	data = this.format_result(data, play_load, args);
                    }
                } else {
                	error_code = 999;
                }
                callbackFn.call(context, data, textStatus, error_code);
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
                            	if(typeof(r.error) === 'object') {
									r = r.error;
                            	}
                            	var error_code = r.error_code || r.code || r.type;
                            	r.error = this.format_error(r.error || r.wrong || r.message || r.error_text, error_code, r);
		                    	var error_msg = callmethod + ' error: ' + r.error;
		                    	if(!r.error && error_code){ // 错误为空，才显示错误代码
		                    		error_msg += ', error_code: ' + error_code;
		                    	}
		                    	showMsg(error_msg, false);
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
                    showMsg(r.error, false);
                }
                callbackFn.call(context, r||{}, 'error', status); //不管什么状态，都返回 error
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

// 腾讯微博api
var TQQAPI = Object.inherits({}, sinaApi, {
	config: Object.inherits({}, sinaApi.config, {
		host: 'http://open.t.qq.com/api',
		user_home_url: 'http://t.qq.com/',
        search_url: 'http://t.qq.com/k/',
        result_format: '',
		source: 'b6d893a83bd54e598b5a7c359599190a', 
	    oauth_key: 'b6d893a83bd54e598b5a7c359599190a',
	    oauth_secret: '34ad78be42426de26e5c4b445843bb78',
	    oauth_host: 'https://open.t.qq.com',
		oauth_authorize: 	  '/cgi-bin/authorize',
        oauth_request_token:  '/cgi-bin/request_token',
        oauth_access_token:   '/cgi-bin/access_token',
        // 竟然是通过get传递
        oauth_params_by_get: true,
        support_comment: false, // 不支持评论列表，不支持转发 ＋ 评论
        support_do_comment: true,
        support_repost_timeline: true, // 支持查看转发列表
        support_favorites_max_id: true,
        reply_dont_need_at_screen_name: true, // @回复某条微博 无需填充@screen_name 
        rt_at_name: true, // RT的@name而不是@screen_name
        repost_delimiter: ' || ', //转发时的分隔符
        support_counts: false, // 只有rt_count这个，不过貌似有问题，总是404。暂时隐藏
        max_image_size: 2 * 1024 * 1024,
        latitude_field: 'wei', // 纬度参数名
        longitude_field: 'jing', // 经度参数名
        friends_timeline: '/statuses/home_timeline',
        repost_timeline: 	  '/t/re_list_repost',
        user_timeline_need_friendship: false, // show_user信息中已经包含
        user_timeline_need_user: true, 
        
        mentions:             '/statuses/mentions_timeline',
        followers:            '/friends/user_fanslist',
        friends:              '/friends/user_idollist',
        favorites:            '/fav/list_t',
        favorites_create:     '/fav/addt',
        favorites_destroy:    '/fav/delt',
        counts:               '/t/re_count', //仅仅是转播数
        status_show:          '/t/show',
        update:               '/t/add',
        upload:               '/t/add_pic',
        repost:               '/t/re_add',
        comment:              '/t/comment',
        comments:             '/t/re_list',
        destroy:              '/t/del',
        destroy_msg:          '/private/del',
        direct_messages:      '/private/recv',
        sent_direct_messages: '/private/send',
        new_message:          '/private/add',
        rate_limit_status:    '/account/rate_limit_status',
        friendships_create:   '/friends/add',
        friendships_destroy:  '/friends/del',
        friendships_show:     '/friends/check',
        reset_count:          '/statuses/reset_count',
        user_show:            '/user/other_info',
        
        // 用户标签
        tags: 				  '/tags',
        create_tag: 	      '/tags/create',
        destroy_tag:          '/tags/destroy',
        tags_suggestions:	  '/tags/suggestions',
        
        // 搜索
        search:               '/search/t',
        user_search:	      '/search/user',
        verify_credentials: '/user/info',
        
        gender_map: {0:'n', 1:'m', 2:'f'}
	}),
	
	// http://code.google.com/p/falang/issues/detail?id=224
	RET_ERRORS: {
	    0: '成功返回',
	    1: '参数错误',
	    2: '频率受限',
	    3: '鉴权失败',
	    4: '服务器内部错误'
	},
	// RET=4,二级错误字段【发表接口】errcode 说明：
	RET4_ERRCODES: {
//	    0: '表示成功',
	    4: '表示有过多脏话',
	    5: '禁止访问',
	    6: '该记录不存在',
	    8: '内容超过最大长度：420字节 （以进行短url处理后的长度计）',
	    9: '包含垃圾信息：广告，恶意链接、黑名单号码等',
	    10: '发表太快，被频率限制',
	    11: '源微博已删除',
	    12: '源微博审核中',
	    13: '重复发表'
	},
	// Ret=3,二级错误字段【验签失败】errcode 说明：
	RET3_ERRCODES: {
	    1: '无效TOKEN,被吊销',
	    2: '请求重放',
	    3: 'access_token不存在',
	    4: 'access_token超时',
	    5: 'oauth 版本不对',
	    6: 'oauth 签名方法不对',
	    7: '参数错',
	    8: '处理失败',
	    9: '验证签名失败',
	    10: '网络错误',
	    11: '参数长度不对',
	    12: '处理失败12',
	    13: '处理失败13',
	    14: '处理失败14',
	    15: '处理失败15'
    },
	
	format_error: function(error_msg, error_code, err) {
	    // err.ret => err.errcode
	    var message = null;
	    if(err) {
	        if(err.ret === 3) {
	            message = this.RET3_ERRCODES[err.errcode];
	        } else if(err.ret === 4) {
	            message = this.RET4_ERRCODES[err.errcode];
	        }
	        if(!message) {
	            message = this.RET_ERRORS[err.ret];
	            if(message) {
	                message += ': ' + error_msg;
	            }
	        }
	    }
	    return message || error_msg;
	},
	
	processMsg: function(status, notEncode) {
		if(status.video && status.video.picurl && status.text) {
		    status.text = status.text.replace(status.video.shorturl, '!!!{{status.video.shorturl}}!!!');
		    var s = this.super_.processMsg.call(this, status, notEncode);
		    var video_html = '<a href="' + status.video.realurl + '" title="' + status.video.title + '" target="_blank" class="link">' + status.video.shorturl + '</a>';
			s = s.replace('!!!{{status.video.shorturl}}!!!', video_html);
		    s += '<br/><img class="video_image" title="' + status.video.title + '" src="' + status.video.picurl + '" />';
		    return s;
		} else {
		    return this.super_.processMsg.call(this, status, notEncode);
		}
//		if(str_or_status.music && str_or_status.music.url) {
//			status += '<br/><audio controls="controls" title="' + str_or_status.music.title + '" src="' + str_or_status.music.url + '"></audio>';
//		}
	},
	
	//page.js里面调用的时候没有加载表情字典,所以需要判断
	_emotion_rex: window.TQQ_EMOTIONS ? new RegExp('\/(' + Object.keys(window.TQQ_EMOTIONS).join('|') + ')', 'g') : null,
	processEmotional: function(str) {
        return str.replace(this._emotion_rex, function(m, g1){
	        if(window.TQQ_EMOTIONS && g1) {
	        	var emotion = window.TQQ_EMOTIONS[g1];
	            if(emotion) {
	                var tpl = '<img title="{{title}}" src="' + TQQ_EMOTIONS_URL_PRE + '{{emotion}}" />';
	                return tpl.format({title: g1, emotion: emotion});
	            }
	        }
	        return m;
	    });
    },
    
    AT_USER_RE: /([^#])?@([\w\-\_]+)/g,
    ONLY_AT_USER_RE: /@([\w\-\_]+)/g,
    
    processAt: function (str, status) { //@***
    	var tpl = '{{m1}}<a target="_blank" href="javascript:getUserTimeline(\'{{m2}}\');" rhref="'
    		+ this.config.user_home_url +'{{m2}}" title="' 
    		+ _u.i18n("btn_show_user_title") + '">{{username}}</a>';
    	return str.replace(this.AT_USER_RE, function(match, $1, $2) {
        	var users = status.users || {};
        	var username = users[$2];
        	if(username) {
        		username += '(@' + $2 + ')';
        	} else {
        		username = '@' + $2;
        	}
        	var data = {
        		m1: $1 || '',
        		m2: $2,
        		username: username
        	};
        	return tpl.format(data);
        });
    },

	// urlencode，子类覆盖是否需要urlencode处理
	url_encode: function(text) {
		return text;
	},
	
	rate_limit_status: function(data, callback, context) {
        callback.call(context, {error: _u.i18n("comm_no_api")});
    },

    //TODO: 腾讯是有提供重置未读数的接口的，后面加
    reset_count: function(data, callback, context) {
		callback.call(context);
	},
	
	format_upload_params: function(user, data, pic) {
    	if(data.status){
            data.content = data.status;
            delete data.status;
        }
    },
    
    upload: function(user, data, pic, before_request, onprogress, callback, context) {
        this.super_.upload.call(this, user, data, pic, before_request, onprogress, function(result, text_status, error_code) {
            if(result && result.data) {
                result = result.data;
            }
            if(text_status != 'error' && result && !result.error && result.id) {
                // 获取微博的内容，以便拿到图片url
                this.status_show({user: user, id: result.id}, callback, context);
            } else {
                callback.apply(context, arguments);
            }
        }, this);
    },
    
    _get_friendships: function(user, followers_args, callback, context) {
        var ids = [];
        var result = followers_args[0];
        if(result && result.items) {
            for(var i = 0, len = result.items.length; i < len; i++) {
                ids.push(String(result.items[i].id));
            }
        }
        if(ids.length > 0) {
            this.friendships_show({user: user, target_ids: ids.join(',')}, function() {
                var infos = arguments[0];
                if(infos) {
                    for(var i = 0, len = result.items.length; i < len; i++) {
                        var user = result.items[i];
                        var info = infos[user.id];
                        if(info) {
                            for(var k in info) {
                                user[k] = info[k];
                            }
                        }
                    }
                }
                callback.apply(context, followers_args);
            });
        } else {
            callback.apply(context, followers_args);
        }
    },
    
    user_search: function(data, callback, context) {
        var user = data.user;
        this.super_.user_search.call(this, data, function() {
            this._get_friendships(user, arguments, callback, context);
        }, this);
    },
    
    followers: function(data, callback, context) {
        var user = data.user;
        this.super_.followers.call(this, data, function() {
            this._get_friendships(user, arguments, callback, context);
        }, this);
    },

    friends: function(data, callback, context) {
        var user = data.user;
        this.super_.friends.call(this, data, function() {
            this._get_friendships(user, arguments, callback, context);
        }, this);
    },
	
	before_sendRequest: function(args, user) {
		if(args.play_load == 'string') {
			// oauth
			return;
		}
		args.data.format = 'json';
		if(args.data.count) {
			args.data.reqnum = args.data.count;
			delete args.data.count;
		}
        if(args.data.since_id) {
			args.data.pagetime = args.data.since_id;
            args.data.pageflag = args.data.pageflag === undefined ? 2 : args.data.pageflag;
			delete args.data.since_id;
		}
        if(args.data.max_id) {
			args.data.pagetime = args.data.max_id;
            args.data.pageflag = 1;
			delete args.data.max_id;
		}
        if(args.data.status || args.data.text || args.data.comment){
            args.data.content = args.data.status || args.data.text || args.data.comment;
            delete args.data.status;
            delete args.data.text;
            delete args.data.comment;
        }
        
        switch(args.url){
            case this.config.new_message:
            case this.config.user_timeline:
            	if(args.data.id) {
            		args.data.name = args.data.id;
			    	delete args.data.id;
            	} else if(args.data.screen_name) {
            		args.data.name = args.data.screen_name;
			    	delete args.data.screen_name;
            	}
                break;
            case this.config.comments:
            	// flag:标识0 转播列表，1点评列表 2 点评与转播列表
            	args.data.flag = 1;
                args.data.rootid = args.data.id;
			    delete args.data.id;
                break;
            case this.config.repost_timeline:
            	args.url = args.url.replace('_repost', '');
            	args.data.flag = 0;
                args.data.rootid = args.data.id;
			    delete args.data.id;
                break;
            case this.config.reply:
            	// 使用 回复@xxx:abc 点评实现 reply
            	args.url = this.config.comment;
            	args.data.content = '回复@' + args.data.reply_user_id + ':' + args.data.content;
                args.data.reid = args.data.id;
			    delete args.data.id;
			    delete args.data.reply_user_id;
			    delete args.data.cid;
                break;
            case this.config.comment:
                args.data.reid = args.data.id;
			    delete args.data.id;
                break;
            case this.config.counts:
//                args.data.flag = 2;
                break;
            case this.config.repost:
                args.data.reid = args.data.id;
			    delete args.data.id;
                break;
            case this.config.friendships_destroy:
            case this.config.friendships_create:
            case this.config.user_show:
            	args.data.name = args.data.id || args.data.screen_name;
            	delete args.data.id;
            	break;
           	case this.config.followers:
           	case this.config.friends:
           		args.data.startindex = args.data.cursor;
           		args.data.name = args.data.user_id;
           		if(String(args.data.startindex) == '-1') {
           			args.data.startindex = '0';
           		}
           		if(args.data.reqnum > 30) {
           			// 最大只能获取30，否则就会抛错 {"data":null,"msg":"server error","ret":4}
           			args.data.reqnum = 30;
           		}
           		delete args.data.cursor;
           		delete args.data.user_id;
           		break;
           	case this.config.search:
           	case this.config.user_search:
	            args.data.keyword = args.data.q;
	            args.data.pagesize = args.data.reqnum;
	            delete args.data.reqnum;
	            delete args.data.q;
		        break;
            case this.config.update:
            	// 判断是否@回复
	            if(args.data.sina_id) {
		        	args.data.reid = args.data.sina_id;
		        	delete args.data.sina_id;
		        	args.url = '/t/reply';
		        }
		        break;
            case this.config.friendships_show:
                // Names: 其他人的帐户名列表（最多30个）
                // Flag: 0 检测听众，1检测收听的人 2 两种关系都检测
                args.data.flag = 2;
                // 批量获取
                args.data.names = args.data.target_ids || args.data.target_id;
                delete args.data.target_screen_name;
                delete args.data.target_id;
                delete args.data.target_ids;
                break;
        }
        if(args.url === this.config.update) {
        	// 判断是否有视频链接
        	if(args.data.content) {
        		var urls = UrlUtil.findUrls(args.data.content) || [];
        		for(var i = 0, len = urls.length; i < len; i++) {
        			var url = urls[i];
        			if(VideoService.is_qq_support(url)) {
        				args.url = '/t/add_video';
        				args.data.url = url;
        				break;
        			}
        		}
        	}
        }
	},
	
	format_result: function(data, play_load, args) {
		if(play_load == 'string') {
			return data;
		}
		if(args.url == this.config.friendships_create || args.url == this.config.friendships_destroy) {
			return true;
		}
		data = data.data;
        if(!data){ return data; }
		var items = data.info || data;
		delete data.info;
		var users = data.user || {};
		if(!$.isArray(items)) {
			items = data.results || data.users;
		}
		if($.isArray(items)) {
	    	for(var i=0; i<items.length; i++) {
	    		items[i] = this.format_result_item(items[i], play_load, args, users);
	    	}
	    	data.items = items;
            if(data.user && !data.user.id){
                delete data.user;
            }
	    	if(args.url == this.config.followers || args.url == this.config.friends) {
	    		if(data.items.length >= parseInt(args.data.reqnum)) {
	    			var start_index = parseInt(args.data.startindex || '0');
		    		if(start_index == -1) {
		    			start_index = 0;
		    		}
		    		data.next_cursor = start_index + data.items.length;
	    		} else {
	    			data.next_cursor = '0'; // 无分页了
	    		}
	    	}
	    } else {
	    	data = this.format_result_item(data, play_load, args, users);
	    }
		if(args.url === this.config.friendships_show) {
		    /** 
		     * {"data":{"debehe":{"isfans":true,"isidol":false}},"errcode":0,"msg":"ok","ret":0}
		     * =>
		     * {
                 "id":debehe      
                 ,"name":"debehe"
                 ,"following":true
                 ,"followed_by":false
               }
             *
		     */
		    if(data) {
		        for(var key in data) {
		            var item = data[key];
		            item.following = !!item.isfans;
		            item.followed_by = !!item.isidol;
		            item.blacked_by = !!item.ismyblack;
		            item.name = item.id = key;
		        }
		        var keys = Object.keys(data);
		        if(keys.length === 1) {
		            // 单个获取只返回第一个
		            data = data[keys[0]];
		        }
		    }
		}
		return data;
	},

	format_result_item: function(data, play_load, args, users, need_user) {
		if(play_load == 'user' && data && data.name) {
			var user = {};
			user.t_url = 'http://t.qq.com/' + data.name;
			user.screen_name = data.nick;
			user.id = data.name;
			user.name = data.name;
			user.province = data.province_code;
			user.city = data.city_code;
			user.verified = data.isvip;
			user.gender = this.config.gender_map[data.sex||0];
			if(data.head) {
				user.profile_image_url = data.head + '/50'; // 竟然直接获取的地址无法拿到头像
			} else {
				user.profile_image_url = 'http://mat1.gtimg.com/www/mb/images/head_50.jpg';
			}
			user.followers_count = data.fansnum;
			user.friends_count = data.idolnum;
			user.statuses_count = data.tweetnum;
			user.description = data.introduction;
			if(data.tag) {
				user.tags = data.tag;
				for(var i = 0, len = user.tags.length; i < len; i++) {
				    var tag = user.tags[i];
				    tag.url = 'http://t.qq.com/search/tag.php?k=#' + tag.name;
				}
			}
			// Ismyidol: 是否为accesstoken用户的收听的人
			// Ismyfans: 是否为accesstoken 用户的听众
			// Ismyblack: 是否在 accesstoken 用户的黑名单内
			user.following = !!data.Ismyfans;
			user.followed_by = !!data.Ismyidol;
			user.blacked_by = !!data.Ismyblack;
			if(data.tweet && data.tweet.length > 0) {
			    data.tweet[0].origtext = data.tweet[0].origtext || data.tweet[0].text;
			    user.tweet = this.format_result_item(data.tweet[0], 'status', args, users, false);
			}
			data = user;
		} else if(play_load == 'status' || play_load == 'comment' || play_load == 'message') {
			// type:微博类型 1-原创发表、2-转载、3-私信 4-回复 5-空回 6-提及 7: 点评
			var status = {};
//			status.status_type = data.type;
			if(data.type == 7) {
				// 腾讯的点评会今日hometimeline，很不给力
				status.status_type = 'comments_timeline';
			}
			status.t_url = 'http://t.qq.com/p/t/' + data.id;
			status.id = data.id;
			status.text = data.origtext; //data.text;
            status.created_at = new Date(data.timestamp * 1000);
            status.timestamp = data.timestamp;
            status.video = data.video;
            status.music = data.music;
            if(data.image){
                status.thumbnail_pic = data.image[0] + '/160';
                status.bmiddle_pic = data.image[0] + '/460';
                status.original_pic = data.image[0] + '/2000';
            }
			if(data.source) {
				if(data.type == 4) { 
					// 回复
					status.text = '@' + data.source.name + ' ' + status.text;
					status.related_dialogue_url = 'http://t.qq.com/p/r/' + status.id;
					status.in_reply_to_status_id = data.source.id;
					status.in_reply_to_screen_name = data.source.nick;
				} else {
					status.retweeted_status = 
						this.format_result_item(data.source, 'status', args, users);
					// 评论
					if(play_load == 'comment') {
						status.status = status.retweeted_status;
						delete status.retweeted_status;
					}
				}
			}
			status.repost_count = data.count || 0;
			status.comments_count = data.mcount || 0; // 评论数
			status.source = data.from;
			if(need_user !== false) {
			    status.user = this.format_result_item(data, 'user', args, users);
			}
			// 收件人
//			tohead: ""
//			toisvip: 0
//			toname: "macgirl"
//			tonick: "美仪"
			if(data.toname) {
				status.recipient = {
					name: data.toname,
					nick: data.tonick,
					isvip: data.toisvip,
					head: data.tohead
				};
				status.recipient = this.format_result_item(status.recipient, 'user', args, users);
			}
			
			// 如果有text属性，则替换其中的@xxx 为 中文名(@xxx)
    		if(status && status.text) {
    			var matchs = status.text.match(this.ONLY_AT_USER_RE);
    			if(matchs) {

    				status.users = {};
    				for(var j=0; j<matchs.length; j++) {
    					var name = $.trim(matchs[j]).substring(1);
    					status.users[name] = users[name];
    				}
    			}
    		}
    		if(!status.text && data.status === 3) {
    		    // 对不起，原文已经被作者删除。 http://t.qq.com/p/t/39599091698961
    		    status.text = '对不起，原文已经被作者删除。';
    		}
    		data = status;
		} 
		return data;
	}
});

// 搜狐微博api
var TSohuAPI = Object.inherits({}, sinaApi, {
	// 覆盖不同的参数
	config: Object.inherits({}, sinaApi.config, {
		host: 'http://api.t.sohu.com',
        user_home_url: 'http://t.sohu.com/n/',
        search_url: 'http://t.sohu.com/k/',
		source: '5vi74qXPB5J97GNzsevN', // 取得appkey的第三方进行分级处理，分为500，800和1500三个等级。
		
	    oauth_key: '5vi74qXPB5J97GNzsevN',
        oauth_secret: 'fxZbb-07bCvv-BCA1Qci2lO^7wnl0%pRE$mvG1K#',
        support_max_id: true,
        support_search_max_id: false,
        support_comment: true,
        support_repost_comment: false,
        support_repost_comment_to_root: false,
        support_repost_timeline: false,
//        support_cursor_only: true,
        
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
	
	processEmotional: function(str){
	    return str.replace(/\[([\u4e00-\u9fff,\uff1f,\w]{1,10})\]/g, this.replaceEmotional);
	},
	replaceEmotional: function(m, g1){
	    var tpl = '<img title="{{title}}" src="{{src}}" />';
	    if(g1) {
	        var face = TSOHU_EMOTIONS[g1];
	        if(face) {
	            return tpl.format({title: m, src: TSOHU_EMOTIONS_URL_PRE + face});
	        }
	    }
	    return m;
	},
	
	reset_count: function(data, callback, context) {
		callback.call(context);
	},
	
	before_sendRequest: function(args) {
		if(args.url == this.config.new_message) {
			// id => user
			args.data.user = args.data.id;
			delete args.data.id;
		} else if(args.url == this.config.destroy) { 
			// method => delete
			args.type = 'delete';
		} else if(args.url == this.config.search) {
			args.data.rpp = args.data.count;
			delete args.data.count;
		} else if(args.url == this.config.user_timeline) {
			if(!args.data.id) {
				args.data.id = args.data.screen_name;
			}
		}
	},
	
    format_result: function(data, play_load, args) {
    	var items = data;
    	if(data.statuses || data.comments) {
    		items = data.statuses || data.comments;
    		data.items = items;
    		delete data.statuses;
    		delete data.comments;
    	} else if(data.users) {
    		items = data.users;
    	}
		if($.isArray(items)) {
	    	for(var i in items) {
	    		items[i] = this.format_result_item(items[i], play_load, args);
	    	}
	    	if(items.length == 0) {
		    	// 没数据，需要填充next_cursor = '0';
	    		data.next_cursor = '0';
		    }
	    } else {
	    	data = this.format_result_item(data, play_load, args);
	    }
	    if(data.cursor_id) {
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
		if(data && data.cursor_id) {
			data.next_cursor = data.cursor_id;
		}
		return data;
	}
});

//嘀咕api
var DiguAPI = Object.inherits({}, sinaApi, {
	
	// 覆盖不同的参数
	config: Object.inherits({}, sinaApi.config, {
		host: 'http://api.minicloud.com.cn',
        user_home_url: 'http://digu.com/',
        search_url: 'http://digu.com/search/',
		source: 'fawave', 
	    support_comment: false,
	    support_do_comment: false,
	    support_double_char: false,
	    support_repost: false,
	    support_repost_timeline: false,
	    support_max_id: false,
	    support_sent_direct_messages: false,
	    support_auto_shorten_url: false,
	    repost_pre: '转载:',
	    support_search_max_id: false,
	    user_timeline_need_friendship: false,
	    
	    verify_credentials:   '/account/verify',
	    
	    mentions:             '/statuses/replies',
	    
	    destroy_msg:          '/messages/handle/destroy/{{id}}',
        direct_messages:      '/messages/100', // message ：0 表示悄悄话，1 表示戳一下，2 表示升级通知，3 表示代发通知，4 表示系统消息。100表示不分类，都查询。其余参数跟
        new_message:          '/messages/handle/new',
        upload: 			  '/statuses/update',
        repost:               '/statuses/update',
        comment:              '/statuses/update',
        reply:                '/statuses/update',
//        friends_timeline:     '/1.1/statuses/friends_timeline',
//        user_timeline:     '/1.1/statuses/user_timeline',
        search: '/search_statuses',
        user_search: '/search_user',
        
        gender_map: {0:'n', 1:'m', 2:'f'},

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

    processAt: function(str) { //@***
        str = str.replace(/^@([\w\-\u4e00-\u9fa5|\_]+)/g, '<a target="_blank" href="http://digu.com/search/friend/' +'$1" title="点击打开用户主页">@$1</a>');
        str = str.replace(/([^\w#])@([\w\-\u4e00-\u9fa5|\_]+)/g, '$1<a target="_blank" href="http://digu.com/search/friend/' +'$2" title="点击打开用户主页">@$2</a>');
        
        return str;
    },
    searchMatchReg: /(^|[^a-zA-Z0-9\/])(#)([\w\u4e00-\u9fa5|\_]+)/g,
    processSearch: function(str) {
        return str.replace(this.searchMatchReg, '$1<a title="Search $2$3" href="' 
            + this.config.search_url + '%23$3" target="_blank">$2$3</a>');
    },
    // return [[hash1, hash_value], ..., [#xxx#, xxx]]
    findSearchText: function(str) {
    	var matchs = str.match(this.searchMatchReg);
    	var result = [];
    	if(matchs) {
    		for(var i = 0, len = matchs.length; i < len; i++) {
    			var s = matchs[i].trim();
    			result.push([s, s.substring(1)]);
    		}
    	}
    	return result;
    },
    formatSearchText: function(str) { // 格式化主题
    	return '#' + str.trim();
    },
    processEmotional: function(str) {
        return str.replace(/\[:(\d{2})\]|\{([\u4e00-\u9fa5,\uff1f]{2,})\}/g, this._replaceEmotional);
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

    rate_limit_status: function(data, callback, context) {
        callback.call(context, {error: _u.i18n("comm_no_api")});
    },
    
    reset_count: function(data, callback, context) {
		callback.call(context);
	},
	
	counts: function(data, callback, context) {
		callback.call(context);
	},
	
	comments_timeline: function(data, callback, context) {
		callback.call(context);
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
				//args.data.friendUserId = args.data.user_id;
				args.data.friendUserIdOrName = args.data.user_id;
			}
//			if(args.data.screen_name){
//				//args.data.friendUsername = args.data.screen_name;
//				args.data.friendUserIdOrName = args.data.screen_name;
//			}
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
			// method change to get
			args.type = 'get';
			delete args.data.source;
			delete args.data.id;
		} else if(args.url == this.config.user_timeline) {
			if(args.data.id) {
				// args.data.userIdOrName = args.data.id;
				// id is name
				args.data.name = args.data.id;
				delete args.data.id;
			} 
//			else if(args.data.screen_name){
//				args.data.userIdOrName = args.data.screen_name;
//				delete args.data.screen_name;
//			}
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
		if(args.url == this.config.friendships_create) {
			// new api: http://code.google.com/p/digu-api/wiki/User
			// result : 操作结果 返回结果为11时表示用户不存存 
			// 当type=1时，返回结果为：
			//	0表示你申请者被该用户屏蔽，不能与他成为好友关系；
			//  -1表示 跟随失败；-2表示跟随的人数超过了1000，系统不允许再跟随其他人；
			//  -3表示被跟随的人设置了隐私保护，
			//  提交申请失败；
			//	  1表示跟随成功；
			//	  2表示已经跟随；
			//	  3表示被跟随的用户设置了隐私保护，已经提交了跟随申请。
			// 当type=2、3、4、5、6时，返回结果为0表示操作失败，1表示操作成功。
			if(data.result == 0) {
				data.message = '你被该用户屏蔽，不能与他成为好友关系';
				data.success = true;
			} else if(data.result == 1) {
				data = true;
			} else if(data.result == 2) {
				data.message = '已经跟随';
				data.success = true;
			} else if(data.result == 3) {
				data.message = '用户设置了隐私保护，已经提交了跟随申请';
				data.success = true;
			} else if(data.result == -1) {
				data.success = false;
			} else if(data.result == -2) {
				data.message = '你跟随的人数超过了1000';
				data.success = false;
			} else if(data.result == -3) {
				data.message = '他设置了隐私保护，无法跟随';
				data.success = false;
			}
			return data;
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
				data.next_cursor = '0';
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
//				data.retweeted_status = {
//					id: data.in_reply_to_status_id,
//					user: {
//						id: data.in_reply_to_user_id,
//						screen_name: data.in_reply_to_screen_name,
//						name: data.in_reply_to_user_name
//					}
//				};
				//data.retweeted_status.t_url = tpl + data.in_reply_to_status_id;
				// 查看相关对话的url
				data.related_dialogue_url = 'http://digu.com/relatedDialogue/' + data.id;
			}
			data.t_url = tpl + data.id;
			this.format_result_item(data.user, 'user', args);
		} else if(play_load == 'user' && data && data.id) {
			data.id = data.name || data.id;
			data.t_url = data.url || ('http://digu.com/' + (data.name || data.id));
            data.gender = this.config.gender_map[data.gender];
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
var ZuosaAPI = Object.inherits({}, sinaApi, {
	
	// 覆盖不同的参数
	config: Object.inherits({}, sinaApi.config, {
		host: 'http://api.zuosa.com',
        user_home_url: 'http://zuosa.com/',
		source: 'fawave', 
		repost_pre: 'ZT',
		support_double_char: false,
	    support_comment: false,
	    support_do_comment: false,
	    support_repost: false,
	    support_repost_timeline: false,
	    support_sent_direct_messages: false,
	    support_max_id: false,
	    support_search_max_id: false,
	    support_auto_shorten_url: false,
	    user_timeline_need_friendship: false,
	    
	    upload: '/statuses/update',
	    repost: '/statuses/update',
	    search: '/search' // 为何搜人的结果和搜索的一样？！
	}),
	
	// 无需urlencode
	url_encode: function(text) {
		return text;
	},
	
	comments_timeline: function(data, callback, context) {
		callback.call(context);
	},
	
	reset_count: function(data, callback, context) {
		callback.call(context);
	},
	
	counts: function(data, callback, context) {
		callback.call(context);
	},
	
	// {"authorized":True}，需要再调用 users/show获取用户信息
	verify_credentials: function(user, callback, data, context){
        var params = {
            url: this.config.verify_credentials,
            type: 'get',
            user: user,
            play_load: 'user',
            data: data
        };
        this._sendRequest(params, function(data, textStatus, error_code) {
	    	if(!error_code && data && data.authorized) { // 继续获取用户信息
	    		this.user_show({user: user, id: user.userName}, callback, context);
	    	} else {
	    	    callback.call(context, 'error', 401);
	    	}
	    }, this);
	},
	
	before_sendRequest: function(args) {
		if(args.data.source) {
			args.headers.source= args.data.source;
			delete args.data.source;
		}
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
		} else if(args.url == this.config.search || args.url == this.config.user_search) {
			args.data.ec = 'utf-8';
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
//				data.retweeted_status = {
//					id: data.in_reply_to_status_id,
//					user: {
//						id: data.in_reply_to_user_id,
//						screen_name: data.in_reply_to_screen_name,
//						name: data.in_reply_to_screen_name
//					}
//				};
				// 查看相关对话的url
				data.related_dialogue_url = 'http://zuosa.com/reply?eid=' + data.in_reply_to_status_id;
//				this.format_result_item(data.retweeted_status.user, 'user', args);
//				data.retweeted_status.t_url = tpl + data.retweeted_status.id;
			}
			data.t_url = tpl + data.id;
			this.format_result_item(data.user, 'user', args);
		} else if(play_load == 'user' && data && data.id) {
			if(data.user && data.user.id) {
//				var status = data;
//				delete status.user;
				data = data.user;
			}
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
var LeiHouAPI = Object.inherits({}, sinaApi, {
	
	// 覆盖不同的参数
	config: Object.inherits({}, sinaApi.config, {
		host: 'http://leihou.com',
        user_home_url: 'http://leihou.com/',
		source: 'fawave', //貌似fawave被雷猴封了？加入source=fawave就好返回404
		repost_pre: 'RT',
		support_double_char: false,
	    support_comment: false,
	    support_do_comment: false,
	    support_repost: false,
	    support_repost_timeline: false,
	    support_sent_direct_messages: false,
		support_favorites: false,
		support_do_favorite: false,
		support_destroy_msg: false,
		support_user_search: false,
		support_auto_shorten_url: false,
		user_timeline_need_friendship: false,
	
	    upload: '/statuses/update',
	    repost: '/statuses/update',
	    comment: '/statuses/update',
	    search: '/search'
	}),
	
	// 无需urlencode
	url_encode: function(text) {
		return text;
	},

    rate_limit_status: function(data, callback, context) {
        callback.call(context, {error: _u.i18n("comm_no_api")});
    },
	
	comments_timeline: function(data, callback, context) {
		callback.call(context);
	},
	
	reset_count: function(data, callback, context) {
		callback.call(context);
	},
	
	counts: function(data, callback, context) {
		callback.call(context);
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
	    		data[i] = this.format_result_item(data[i], play_load, args);
	    	}
	    } else {
	    	data = this.format_result_item(data, play_load, args);
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
			if(data.user) {
				data = data.user;
			}
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
var Follow5API = Object.inherits({}, sinaApi, {
	
	// 覆盖不同的参数
	config: Object.inherits({}, sinaApi.config, {
		host: 'http://api.follow5.com/api',
        user_home_url: 'http://follow5.com',
		source: '34140E56A31887F770053C2AF6D7B2AC', // 需要申请
		repost_pre: '转发:',
		support_double_char: false,
	    support_search: false,
	    support_max_id: false,
	    support_comment: false,
	    support_do_comment: false,
	    support_repost: false,
	    support_repost_timeline: false,
	    support_upload: false,
	    support_sent_direct_messages: false,
	    support_favorites: false, // 判断是否支持收藏列表
		support_do_favorite: false, // 判断是否支持收藏功能
		support_auto_shorten_url: false,
		user_timeline_need_friendship: false,

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

    rate_limit_status: function(data, callback, context) {
        callback.call(context, {error: _u.i18n("comm_no_api")});
    },
	
	reset_count: function(data, callback, context) {
		callback.call(context);
	},
	
	counts: function(data, callback, context) {
		callback.call(context);
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
		} else if(args.url == this.config.new_message) {
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
		} else if(args.url == this.config.direct_messages || args.url == this.config.mentions) {
			if(args.data.since_id) {
				delete args.data.since_id;
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
	    		data[i] = this.format_result_item(data[i], play_load, args);
	    	}
	    } else {
	    	data = this.format_result_item(data, play_load, args);
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
			delete data.password;
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
			this.format_result_item(data.recipient, 'user', args);
		}
		return data;
	}
});

//twitter api
var TwitterAPI = Object.inherits({}, sinaApi, {
	
	// 覆盖不同的参数
	config: Object.inherits({}, sinaApi.config, {
		host: 'https://api.twitter.com',
        user_home_url: 'https://twitter.com/',
        search_url: 'https://twitter.com/search?q=',
		source: 'fawave', 
        oauth_key: 'i1aAkHo2GkZRWbUOQe8zA',
        oauth_secret: 'MCskw4dW5dhWAYKGl3laRVTLzT8jTonOIOpmzEY',
        repost_pre: 'RT',
	    support_comment: false,
	    support_do_comment: false,
	    support_repost: false,
	    support_repost_timeline: false,
	    support_sent_direct_messages: false,
	    support_auto_shorten_url: false,
	    support_search_max_id: false,
	    support_upload: false,
	    support_double_char: false,
	    rt_need_source: false,
	    user_timeline_need_friendship: false,
	    oauth_callback: 'oob',
	    upload: '/statuses/update_with_media', // https://upload.twitter.com/1/statuses/update_with_media.json
	    search: '/search_statuses',
	    repost: '/statuses/update',
        retweet: '/statuses/retweet/{{id}}',
        favorites_create: '/favorites/create/{{id}}',
        friends_timeline: '/statuses/home_timeline',
        search: '/search'
	}),
    
	// 已经支持中文
	searchMatchReg: /(#([\w\-\_\u2E80-\u3000\u303F-\u9FFF]+))/g,
	processSearch: function (str) {
        str = str.replace(this.searchMatchReg,
        	'<a class="tag" title="$2" href="https://twitter.com/search?q=%23$2" target="_blank">$1</a>');
        return str;
    },
    
    // return [[hash1, hash_value], ..., [#xxx#, xxx]]
    findSearchText: function(str) {
    	var matchs = str.match(this.searchMatchReg);
    	var result = [];
    	if(matchs) {
    		for(var i = 0, len = matchs.length; i < len; i++) {
    			var s = matchs[i].trim();
    			result.push([s, s.substring(1)]);
    		}
    	}
    	return result;
    },
    formatSearchText: function(str) { // 格式化主题
    	return '#' + str.trim();
    },
    
    processEmotional: function(str){
        return str;
    },
	
	// 无需urlencode
	url_encode: function(text) {
		return text;
	},
	
	comments_timeline: function(data, callback, context) {
		callback.call(context);
	},
	
	reset_count: function(data, callback, context) {
		callback.call(context);
	},
	
	counts: function(data, callback, context) {
		callback.call(context);
	},

    retweet: function(data, callback, context) {
        var params = {
            url: this.config.retweet,
            type: 'post',
            play_load: 'status',
            data: data
        };
        this._sendRequest(params, callback, context);
	},
    
	/**
	 * Endpoint: https://upload.twitter.com/1/statuses/update_with_media.json 
		Parameters: 
		     * media (the image, I guess), 
		     * status (the text which you will also want), 
		     * probably all other ones which currently work with update.json 
		(lat, lon, etc). 
	 */
	format_upload_params: function(user, data, pic) {
    	pic.keyname = 'media';
    },
	
	before_sendRequest: function(args) {
		args.data.include_entities = 'true';
		args.data.contributor_details = 'true';
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
		} else if(args.url == this.config.search) {
			args.data.rpp = args.data.count;
			args.data.show_user = 'true';
			delete args.data.source;
			delete args.data.count;
		} else if(args.url === this.config.user_search) {
			args.data.per_page = args.data.count;
			delete args.data.count;
		}
		if(this.config.host === 'https://api.twitter.com' && args.url.indexOf('/oauth') < 0) {
		    args.url = '/1' + args.url;
		}
    },

    format_result_item: function(data, play_load, args) {
		if(play_load == 'status' && data.id) {
            data.id = data.id_str || data.id;
            data.in_reply_to_status_id = data.in_reply_to_status_id_str || data.in_reply_to_status_id;
            // check media
            if(data.entities && data.entities.media && data.entities.media.length > 0) {
            	var entities = data.entities;
            	if(entities.media && entities.media.length > 0) {
	            	for(var i = 0, len = entities.media.length; i < len; i++) {
	            		var media = entities.media[i];
	            		if(media.type === 'photo') {
	            			data.thumbnail_pic = media.media_url;
	        				data.bmiddle_pic = data.thumbnail_pic;
	        				data.original_pic = data.thumbnail_pic;
	        				data.text = data.text.replace(media.url, ''); // 去除图片链接尾巴
	            			break;
	            		}
	            	}
            	}
            	delete data.entities;
            }
			var tpl = this.config.user_home_url + '{{user.screen_name}}/status/{{id}}';
			if(data.retweeted_status) {
                data.retweeted_status.id = data.retweeted_status.id_str || data.retweeted_status.id;
				data.retweeted_status.t_url = tpl.format(data.retweeted_status);
				this.format_result_item(data.retweeted_status.user, 'user', args);
			}
			// search
			if(data.from_user && !data.user) {
				data.user = {
					id: data.from_user_id_str || data.from_user_id,
					profile_image_url: data.profile_image_url,
					screen_name: data.from_user
				};
				delete data.from_user_id_str;
				delete data.profile_image_url;
				delete data.from_user;
				data.source = htmldecode(data.source);
			}
			data.t_url = tpl.format(data);
			this.format_result_item(data.user, 'user', args);
		} else if(play_load == 'user' && data && data.id) {
			data.t_url = this.config.user_home_url + (data.screen_name || data.id);
		}
		return data;
	}
});

//identi.ca
var StatusNetAPI = Object.inherits({}, TwitterAPI, {
	
	// 覆盖不同的参数
	config: Object.inherits({}, sinaApi.config, {
		host: 'http://identi.ca/api',
        user_home_url: 'http://identi.ca/',
        search_url: 'http://identi.ca/tag/',
		source: 'FaWave', //Basic Auth 会显示这个，不过显示不了链接
        oauth_key: 'c71100649f6c6cfb4eebbacca18de8f6',
        oauth_secret: 'f3ef411594e624f7eda7e1c0ae6b9029',
        repost_pre: 'RT',
        support_double_char: false,
	    support_comment: false,
	    support_do_comment: false,
	    support_repost: false,
	    support_upload: false,
	    support_repost_timeline: false,
	    support_sent_direct_messages: false,
	    support_auto_shorten_url: false,
	    support_user_search: false, //暂时屏蔽
	    user_timeline_need_friendship: false,
	    oauth_callback: 'oob',
	    search: '/search_statuses',
	    repost: '/statuses/update',
        retweet: '/statuses/retweet/{{id}}',
        favorites_create: '/favorites/create/{{id}}',
        friends_timeline: '/statuses/home_timeline',
        search: '/search.json?q='
	}),
    
    format_result_item: function(data, play_load, args) {
		if(play_load == 'user' && data && data.id) {
			//data.t_url = ;
		} else if(play_load === 'status') {
			if(!data.user) { // search data
				data.user = {
					screen_name: data.from_user,
					profile_image_url: data.profile_image_url,
					id: data.from_user_id
				};
				delete data.profile_image_url;
				delete data.from_user;
				delete data.from_user_id;
			}
			if(data.attachments) {
                for(var i = 0, l = data.attachments.length; i < l; i++) {
                    var attachment = data.attachments[i];
                    if(attachment.mimetype && attachment.mimetype.indexOf('image') >= 0) {
                        data.thumbnail_pic = attachment.url;
                        data.bmiddle_pic = data.thumbnail_pic;
                        data.original_pic = data.thumbnail_pic;
                    }
                }
            }
		}

		return this.super_.format_result_item.apply(this, [data, play_load, args]);
	}
});

// t.taobao.org
var TaobaoStatusNetAPI = Object.inherits({}, StatusNetAPI, {
    
    // 覆盖不同的参数
    config: Object.inherits({}, StatusNetAPI.config, {
        host: 'http://t.taobao.org/api',
        user_home_url: 'http://t.taobao.org/',
        search_url: 'http://t.taobao.org/tag/',
        source: 'FaWave', // Basic Auth 会显示这个，不过显示不了链接
//        oauth_key: 'c71100649f6c6cfb4eebbacca18de8f6',
//        oauth_secret: 'f3ef411594e624f7eda7e1c0ae6b9029',
        repost_pre: 'RT',
        support_double_char: false,
        support_comment: true,
        support_do_comment: true,
        support_repost: true,
        support_upload: true,
        support_repost_timeline: true,
        support_sent_direct_messages: true,
        support_auto_shorten_url: true,
        support_user_search: false, //暂时屏蔽
        user_timeline_need_friendship: false,
        search: '/search_statuses',
        repost: '/statuses/update',
        retweet: '/statuses/retweet/{{id}}',
        favorites_create: '/favorites/create/{{id}}',
        friends_timeline: '/statuses/home_timeline',
        upload: '/statuses/update',
        search: '/search.json?q='
    })
});


var FanfouAPI = Object.inherits({}, sinaApi, {
	
	// 覆盖不同的参数
	config: Object.inherits({}, sinaApi.config, {
		host: 'http://api2.fanfou.com',
        user_home_url: 'http://fanfou.com/',
        search_url: 'http://fanfou.com/q/',
		source: 'fawave',
		repost_pre: '转',
	    support_comment: false,
	    support_do_comment: false,
	    support_repost: false,
	    support_repost_timeline: false,
	    support_sent_direct_messages: false,
	    support_auto_shorten_url: false,
	    support_double_char: false,
	    upload: '/photos/upload',
	    search: '/search/public_timeline',
	    favorites_create: '/favorites/create/{{id}}',
	    support_user_search: false,
	    user_timeline_need_friendship: false,

        gender_map:{"男":'m', '女':'f'}
	}),
	
	// 无需urlencode
	url_encode: function(text) {
		return text;
	},
    
    processAt: function (str) { //@*** ,饭否的用户名支持“.”
        str = str.replace(/^@([\w\-\u4e00-\u9fa5|\_\.]+)/g, ' <a target="_blank" href="javascript:getUserTimeline(\'$1\');" rhref="'+ this.config.user_home_url +'$1" title="'+ _u.i18n("btn_show_user_title") +'">@$1</a>');
        str = str.replace(/([^\w#])@([\w\-\u4e00-\u9fa5|\_\.]+)/g, '$1<a target="_blank" href="javascript:getUserTimeline(\'$2\');" rhref="'+ this.config.user_home_url +'$2" title="'+ _u.i18n("btn_show_user_title") +'">@$2</a>');
        
        return str;
    },
	
	reset_count: function(data, callback, context) {
		callback.call(context);
	},
	
	counts: function(data, callback, context) {
		callback.call(context);
	},
	
	format_geo_arguments: function(data, geo) {
		data.location = geo.latitude + ',' + geo.longitude;
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
		} else if(args.url == this.config.friends || args.url == this.config.followers) {
			// cursor. 选填参数. 单页只能包含100个粉丝列表，为了获取更多则cursor默认从-1开始，
			// 通过增加或减少cursor来获取更多的，如果没有下一页，则next_cursor返回0
			args.data.page = args.data.cursor == '-1' ? 1 : args.data.cursor;
			if(!args.data.page) {
				args.data.page = 1;
			}
			if(args.data.user_id) {
				args.data.id = args.data.user_id;
			}
			delete args.data.cursor;
			delete args.data.user_id;
			delete args.data.screen_name;
		}
    },
	
	/* photo（必须）- 照片文件。和<input type="file" name="photo" />效果一样
	 * */
	format_upload_params: function(user, data, pic) {
    	pic.keyname = 'photo';
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
			data = {users: data, next_cursor: Number(args.data.page) + 1, previous_cursor: args.data.page};
			if(data.users.length == 0) {
				data.next_cursor = '0';
			}
		}
		return data;
	},
	_FANFOU_IMAGEURL_RE: /http:\/\/fanfou\.com\/photo\/[\w\-]+$/i,
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
				// 删除图片 http://fanfou.com/photo/b0QRkVL6-2Y
				data.text = data.text.replace(this._FANFOU_IMAGEURL_RE, '');
   			}
   			if(data.in_reply_to_status_id){
   				data.related_dialogue_url = 'http://fanfou.com/statuses/' + data.in_reply_to_status_id + '?fr=viewreply';
   			}
		} else if(play_load == 'user' && data && data.id) {
			data.t_url = 'http://fanfou.com/' + (data.id || data.screen_name);
            data.gender = this.config.gender_map[data.gender];
		}
		return data;
	}
});

var T163API = Object.inherits({}, sinaApi, {
	
	// 覆盖不同的参数
	config: Object.inherits({}, sinaApi.config, {
		host: 'http://api.t.163.com',
		user_home_url: 'http://t.163.com/n/',
		search_url: 'http://t.163.com/tag/',
		source: 'cXU8SDfNTtF0esHy', // 需要申请
		oauth_key: 'cXU8SDfNTtF0esHy',
        oauth_secret: 'KDKVAlZYlx4Yvzwx9BQEbTAVhkdjXQ8I',
        oauth_authorize: '/oauth/authenticate',
        oauth_callback: FAWAVE_OAUTH_CALLBACK_URL,
        support_counts: false,
        support_double_char: false,
        support_comment: true,
        support_repost_timeline: true,
        support_repost_comment: true,
        support_repost_comment_to_root: true,
        support_search_max_id: false,
        support_favorites_max_id: true,
        user_timeline_need_friendship: false,
        user_timeline_need_user: true,
        max_text_length: 163,
        repost_pre: 'RT', // 转发前缀
        repost_delimiter: '||',
        favorites: '/favorites/{{id}}',
        favorites_create: '/favorites/create/{{id}}',
        search: '/search',
        user_show: '/users/show',
        repost: '/statuses/retweet/{{id}}',
        comments: '/statuses/comments/{{id}}',
        friends_timeline: '/statuses/home_timeline',
        comments_timeline: '/statuses/comments_to_me',
        repost_timeline: '/statuses/retweets/{{id}}',
        
        gender_map: {0:'n', 1:'m', 2:'f'}
	}),
	
	_replaceEmotional: function(m, g1){
	    if(window.T163_EMOTIONS && g1) {
	        var face = T163_EMOTIONS[g1];
	        if(face) {
                var tpl = '<img title="{{title}}" src="{{src}}" />';
	            return tpl.format({title: m, src: T163_EMOTIONS_URL_PRE + face});
	        }
	    }
	    return m;
	},
	
	url_encode: function(text) {
		return text;
	},
    
    reset_count: function(data, callback, context) {
		callback.call(context);
	},
	
	counts: function(data, callback, context) {
		callback.call(context);
	},

    rate_limit_status: function(data, callback, context) {
        callback.call(context, {error: _u.i18n("comm_no_api")});
    },
	
	format_upload_params: function(user, data, pic) {
    	delete data.source;
    	// 不支持地理坐标
    	delete data.lat;
    	delete data.long;
    },
	
	upload: function(user, params, pic, before_request, onprogress, callback, context) {
		this.super_.upload.call(this, user, {}, pic, before_request, onprogress, function(data) {
			if(data && data.upload_image_url) {
				params.user = user;
				params.status += ' ' + data.upload_image_url;
				this.update(params, callback, context);
			} else {
				callback.apply(context, arguments);
			}
		}, this);
	},
	
	// 提供图片上传服务
	upload_image: function(user, pic, before_request, onprogress, callback, context) {
		if(!before_request) {
			before_request = function() {};
		}
		if(!onprogress) {
			onprogress = function() {};
		}
		this.super_.upload.call(this, user, {}, pic, before_request, onprogress, function(data, text_status, code) {
			if(data && data.upload_image_url) {
				data = data.upload_image_url;
			}
			callback.call(context, data, text_status, code);
		});
	},
	
	before_sendRequest: function(args, user) {
		delete args.data.source;
		if(args.data.since_id) {
			args.data.max_id = args.data.since_id;
			delete args.data.since_id;
		} else if(args.data.max_id) {
			args.data.since_id = args.data.max_id;
			delete args.data.max_id;
		}
		if(args.url == this.config.user_timeline) {
			if(args.data.id) {
				// id => user_id
				args.data.user_id = args.data.id;
				delete args.data.id;
				delete args.data.screen_name;
			} else {
				args.data.name = args.data.screen_name;
				delete args.data.screen_name;
			}
		} else if(args.url == this.config.comment || args.url == this.config.reply) {
			// 请求参数
			// id：必选参数，值为被评论微博的ID。如果回复某条评论，则此值为该评论的id。
			// status ：必选参数，评论内容。
			// is_retweet：可选参数，是否转发 默认不转发 1为转发
			// is_comment_to_root：是否评论给原微博 默认不评论 1为评论
			//args.data.id = args.data.cid || args.data.id;
			args.data.status = args.data.comment;
			args.url = this.config.reply;
			// args.is_comment = true;
			// args.data.dispatch_to_followers = '0';
			delete args.data.comment;
			delete args.data.cid;
			delete args.data.reply_user_id;
		} else if(args.url == this.config.repost) {
			if(args.data.sina_id) { // @回复
				//args.data.in_reply_to_status_id = args.data.sina_id;
				delete args.data.sina_id;
			}
		} else if(args.url == this.config.new_message) {
			args.data.user = args.data.id;
			delete args.data.id;
		} else if(args.url == this.config.favorites) {
			args.data.id = user.name;
		} else if(args.url == this.config.friendships_destroy || args.url == this.config.friendships_create) {
			args.data.user_id = args.data.id;
			delete args.data.id;
		} else if(args.url == this.config.comments_timeline) {
			args.data.trim_user = false;
		}
    },
    
    format_result: function(data, play_load, args) {
    	data = this.super_.format_result.call(this, data, play_load, args);
    	if(String(data.next_cursor) == '-1') {
    		data.next_cursor = '0';
    	}
    	return data;
    },
    
    format_result_item: function(data, play_load, args) {
		if(play_load == 'user' && data && data.id) {
			data.t_url = 'http://t.163.com/' + data.screen_name;
            //163的screen_name是个性网址
            var temp_name = data.screen_name;
            data.screen_name = data.name || data.screen_name;
            data.name = temp_name;
            data.gender = this.config.gender_map[data.gender];
            if(data.sysTag) {
                data.tags = [];
                for(var i = 0, len = data.sysTag.length; i < len; i++) {
                    var tag = data.sysTag[i];
                    data.tags.push({name: tag, url: 'http://t.163.com/search/itag/' + tag, itag: true});
                }
                delete data.sysTag;
            }
            if(data.userTag) {
                data.tags = data.tags || [];
                for(var i = 0, len = data.userTag.length; i < len; i++) {
                    var tag = data.userTag[i];
                    data.tags.push({name: tag, url: 'http://t.163.com/search/tag/' + tag});
                }
                delete data.userTag;
            }
		} else if(play_load == 'status') {
			// search
			if(!data.user) {
				data.user = {
					id: data.from_user_id,
					screen_name: data.from_user,
					name: data.from_user_name,
					profile_image_url: data.profile_image_url
				};
				if(data.to_status_id && data.to_user_id) {
					data.in_reply_to_status_id = data.to_status_id;
					data.in_reply_to_user_id = data.to_user_id;
					data.in_reply_to_screen_name = data.to_user;
					data.in_reply_to_user_name = data.to_user_name;
					data.in_reply_to_status_text = data.to_status_text;
				}
				delete data.from_user_id;
				delete data.from_user;
				delete data.from_user_name;
				delete data.profile_image_url;
				delete data.to_status_id;
				delete data.to_user_id;
				delete data.to_user;
				delete data.to_user_name;
				delete data.to_status_text;
			}
			// 获取缩略图
			// http://oimagec6.ydstatic.com/image?w=120&h=120&url=http://126.fm/cwqG0
			// http://oimagec6.ydstatic.com/image?w=460&url=http://126.fm/qMYPA
			var url_re = /\s?(http:\/\/126.fm\/\w+)/i;
			var results = url_re.exec(data.text);
			if(results) {
				data.original_pic = results[1];
				data.thumbnail_pic = 
					'http://oimagec6.ydstatic.com/image?w=120&h=120&url=' 
					+ data.original_pic;
				data.bmiddle_pic = 
					'http://oimagec6.ydstatic.com/image?w=460&url=' 
					+ data.original_pic;
				data.text = data.text.replace(results[0], '');
			}
			data.user = this.format_result_item(data.user, 'user', args);
			var tpl = '{{user.t_url}}/status/{{id}}';
			if(data.retweeted_status) {
				data.retweeted_status = 
					this.format_result_item(data.retweeted_status, 'status', args);
			}
			data.repost_count = data.retweet_count;
			if(data.is_retweet_by_user 
					&& (args.data.user_id === undefined 
						|| args.user.id == args.data.user_id)) { 
				// 只有是当前登录用户，才显示已转发
				data.retweet_me = args.user; // 当前用户转发
				if(String(data.retweet_user_id) == String(args.user.id)) {
					data.retweet_user_id = null;
				}
				data.is_retweet_by_user = false;
			}
			if(data.retweet_user_id) {
				data.retweet_user = {
					id: data.retweet_user_id,
					screen_name: data.retweet_user_screen_name,
					name: data.retweet_user_name
				};
				data.retweet_user = 
					this.format_result_item(data.retweet_user, 'user', args);
			}
//			// 设置status的t_url
			data.t_url = tpl.format(data);
			// retweeted_status
			if(data.in_reply_to_status_id && data.in_reply_to_status_text) {
				data.retweeted_status = {
					id: data.in_reply_to_status_id,
					text: data.in_reply_to_status_text,
//					comments_count: data.comments_count,
					user: {
						id: data.in_reply_to_user_id,
						screen_name: data.in_reply_to_user_name,
						name: data.in_reply_to_screen_name,
						profile_image_url: 'http://mimg.126.net/p/butter/1008031648/img/face_big.gif'
					}
				};
				data.retweeted_status.user = this.format_result_item(data.retweeted_status.user, 'user', args);
				data.retweeted_status = this.format_result_item(data.retweeted_status, 'status', args);
				
				if(data.root_in_reply_to_status_id 
						&& data.root_in_reply_to_status_id != data.in_reply_to_status_id 
						&& data.root_in_reply_to_status_text) {
					data.retweeted_status.retweeted_status = {
						id: data.root_in_reply_to_status_id,
						text: data.root_in_reply_to_status_text,
//						comments_count: data.retweeted_status.comments_count,
						user: {
							id: data.root_in_reply_to_user_id,
							screen_name: data.root_in_reply_to_user_name,
							name: data.root_in_reply_to_screen_name,
							profile_image_url: 'http://mimg.126.net/p/butter/1008031648/img/face_big.gif'
						}
					};
					delete data.root_in_reply_to_status_id;
					delete data.root_in_reply_to_status_text;
					delete data.root_in_reply_to_user_id;
					delete data.root_in_reply_to_screen_name;
					delete data.root_in_reply_to_user_name;
					data.retweeted_status.retweeted_status.user = 
						this.format_result_item(data.retweeted_status.retweeted_status.user, 'user', args);
					data.retweeted_status.retweeted_status = 
						this.format_result_item(data.retweeted_status.retweeted_status, 'status', args);
				}
				delete data.in_reply_to_status_id;
				delete data.in_reply_to_status_text;
				delete data.in_reply_to_user_id;
				delete data.in_reply_to_screen_name;
				delete data.in_reply_to_user_name;
			}
		} else if(play_load == 'message') {
			data.sender = this.format_result_item(data.sender, 'user', args);
			data.recipient = this.format_result_item(data.recipient, 'user', args);
		} else if(play_load == 'comment') {
			data.user = this.format_result_item(data.user, 'user', args);
			data.status = {
				id: data.in_reply_to_status_id,
				text: data.in_reply_to_status_text,
				comments_count: data.comments_count,
				user: {
					id: data.in_reply_to_user_id,
					screen_name: data.in_reply_to_user_name,
					name: data.in_reply_to_screen_name,
					profile_image_url: 'http://mimg.126.net/p/butter/1008031648/img/face_big.gif'
				}
			};
			data.status.user = this.format_result_item(data.status.user, 'user', args);
			if(!data.user) { // 评论竟然没有用户？！
				data.user = data.status.user;
			}
			data.status = this.format_result_item(data.status, 'status', args);
			
			if(data.root_in_reply_to_status_id 
					&& data.root_in_reply_to_status_id != data.in_reply_to_status_id 
					&& data.root_in_reply_to_status_text) {
				data.status.retweeted_status = {
					id: data.root_in_reply_to_status_id,
					text: data.root_in_reply_to_status_text,
					comments_count: data.status.comments_count,
					user: {
						id: data.root_in_reply_to_user_id,
						screen_name: data.root_in_reply_to_user_name,
						name: data.root_in_reply_to_screen_name,
						profile_image_url: 'http://mimg.126.net/p/butter/1008031648/img/face_big.gif'
					}
				};
				delete data.root_in_reply_to_status_id;
				delete data.root_in_reply_to_status_text;
				delete data.root_in_reply_to_user_id;
				delete data.root_in_reply_to_screen_name;
				delete data.root_in_reply_to_user_name;
				data.status.retweeted_status.user = this.format_result_item(data.status.retweeted_status.user, 'user', args);
				data.status.retweeted_status = this.format_result_item(data.status.retweeted_status, 'status', args);
			}
			delete data.in_reply_to_status_id;
			delete data.in_reply_to_status_text;
			delete data.in_reply_to_user_id;
			delete data.in_reply_to_screen_name;
			delete data.in_reply_to_user_name;
		}
		return data;
	}
	
});

// 人间
var RenjianAPI = Object.inherits({}, sinaApi, {
	
	// 覆盖不同的参数
	config: Object.inherits({}, sinaApi.config, {
		host: 'http://api.renjian.com/v2',
		source: 'FaWave', 
		support_comment: false,
		support_do_comment: false,
		support_repost: true,
		support_repost_timeline: false,
		support_sent_direct_messages: false,
	    support_search: false,
	    support_double_char: false,
	    support_user_search: false,
	    support_auto_shorten_url: false,
		favorites: '/statuses/likes',
        favorites_create: '/statuses/like/{{id}}',
        favorites_destroy: '/statuses/unlike/{{id}}',
	    upload: '/statuses/create',
	    repost: '/statuses/forward',
	    friends_timeline: '/statuses/friends_timeline',
	    friends: '/statuses/followings/{{user_id}}',
	    followers: '/statuses/followers/{{user_id}}',
	    direct_messages: '/direct_messages/receive',
	    user_timeline_need_friendship: false,
        
        gender_map: {0:'n', 1:'m', 2:'f'}
	}),
	
	// 无需urlencode
	url_encode: function(text) {
		return text;
	},

    processEmotional: function(str){
        return str.replace(/\[\/\/(\w+)\]/g, this._replaceEmotional);
    },
    _replaceEmotional: function(m, g){
        if(g && window.RENJIAN_EMOTIONS && RENJIAN_EMOTIONS[g]){
            return '<span class="renjian_emot" style="background-position: ' 
                + RENJIAN_EMOTIONS[g][1] + ';" title="' + RENJIAN_EMOTIONS[g][0] 
                + '"></span>';
        }else{
            return m;
        }
    },
	
	comments_timeline: function(data, callback, context) {
		callback.call(context);
	},
	
	rate_limit_status: function(data, callback, context) {
        callback.call(context, {error: _u.i18n("comm_no_api")});
    },
	
	reset_count: function(data, callback, context) {
	    callback.call(context);
	},
	
	counts: function(data, callback, context) {
	    callback.call(context);
	},
	
	verify_credentials: function(user, callback, data, context){
        //this.user_show({id: user.userName}, callbackFn);
        var params = {
            url: this.config.verify_credentials,
            type: 'post',
            user: user,
            play_load: 'user',
            data: data
        };
        this._sendRequest(params, callback, context);
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
            if(args.data.in_reply_to_status_id){
				args.data.reply_to = args.data.in_reply_to_status_id;
			}
		} else if(args.url == this.config.friends_timeline){
			args.data.id = user.id;
		} else if(args.url == this.config.new_message){
			args.data.user = args.data.id;
            delete args.data.id;
		} else if(args.url == this.config.repost){
			args.data.text = args.data.status;
            delete args.data.status;
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
            //转发
            if(data.forwarded_status) {
				data.retweeted_status = data.forwarded_status;
				delete data.forwarded_status;
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
            data.gender = this.config.gender_map[data.gender];
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

var BuzzAPI = Object.inherits({}, sinaApi, {
	config: Object.inherits({}, sinaApi.config, {
		host: 'https://www.googleapis.com/buzz/v1',
		source: 'AIzaSyAu4vq6sYO3WuKxP2G64fYg6T1LdIDu3pk', // https://code.google.com/apis/console/#project:828316891836:apis_keys
		oauth_key: 'net4team.net',
		oauth_secret: 'y+6SWcLVshQvogadDzXtSra+',
        result_format: '', // 由alt参数确定返回值格式
        userinfo_has_counts: false, //用户信息中是否包含粉丝数、微博数等信息
        support_counts: false,
        support_repost: true,
        support_repost_timeline: false, // 支持查看转发列表
		support_upload: false, // 是否支持上传图片
		support_cursor_only: true,  // 只支持游标方式翻页
		support_mentions: false,
		support_direct_messages: false,
		support_sent_direct_messages: false,
		support_auto_shorten_url: false,
		support_upload: false,
		need_processMsg: false,
		support_geo: false,
		repost_pre: 'RT ',
		comment_need_user_id: true,
		user_timeline_need_friendship: false,
		
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
        comments: '/activities/{{user_id}}/@self/{{id}}/@comments',
        comment: '/activities/{{user_id}}/@self/{{id}}/@comments?key={{key}}&alt={{alt}}',
        reply: '/activities/{{user_id}}/@self/{{id}}/@comments?key={{key}}&alt={{alt}}',
        search: '/activities/search',
        user_search: '/activities/search/@people',
		verify_credentials: '/people/@me/@self'
	}),
	
	url_encode: function(text) {
		return text;
	},
	
	reset_count: function(data, callback, context) {
		callback.call(context);
	},

    rate_limit_status: function(data, callback, context){
        callback.call(context, {error: _u.i18n("comm_no_api")});
    },
	
	counts: function(data, callback, context) {
		callback.call(context);
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
		} else if(args.url == this.config.comment) {
			args.content = JSON.stringify({
				data: {
					content: args.data.comment
				}
			});
			args.contentType = 'application/json';
			delete args.data.comment;
			delete args.data.reply_user_id;
			delete args.data.cid;
		} 
//		else if(args.url == this.config.friends) {
//			// itemsPerPage: 5 kind: "buzz#peopleFeed" startIndex: 0 totalResults: 28
//			args.data.startIndex = args.data.c;
//			if(String(args.data.startIndex) == '-1') {
//				args.data.startIndex = '0';
//			}
//			delete args.data.c;
//		}
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
	    	if(args.url == this.config.friends){
	    		var cursor = parseInt(args.data.c);
	    		if(cursor == -1){
	    			cursor = 0;
	    		}
				var next_cursor = cursor + items.length;
				if(next_cursor >= data.totalResults) {
					next_cursor = '0'; 
				}
				data.next_cursor = next_cursor;
			}
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
				if(data.crosspostSource) {
					data.crosspostSource = data.crosspostSource.substring(data.crosspostSource.indexOf('http://'));
//					data.text += ' <a href="' + url + '">' + url + '</a>';
				}
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
			var link = data.links.alternate || data.links.self;
			data.t_url = link[0].href;
			if(data.links.replies) {
				data.comments_count = data.links.replies[0].count;
			}
			data.user = this.format_result_item(data.actor, 'user', args);
			if(args.url == this.config.favorites) {
				data.favorited = true;
			}
			delete data.annotation;
			delete data.object;
			delete data.title;
			delete data.links;
			delete data.actor;
		} else if(play_load == 'comment') {
			data.user = this.format_result_item(data.actor, 'user', args);
			data.text = data.content;
			delete data.actor;
			delete data.links;
			delete data.content;
		}
		if(data && data.published) {
			data.created_at = data.published;
			delete data.published;
		}
		return data;
	}

});

// 豆瓣
/*
 * 豆瓣 API 通过HTTP Status Code来说明 API 请求是否成功 下面的表格中展示了可能的HTTP Status Code以及其含义

状态码 含义
200 OK  请求成功
201 CREATED 创建成功
202 ACCEPTED    更新成功
400 BAD REQUEST 请求的地址不存在或者包含不支持的参数
401 UNAUTHORIZED    未授权
403 FORBIDDEN   被禁止访问
404 NOT FOUND   请求的资源不存在
500 INTERNAL SERVER ERROR   内部错误

 */
var DoubanAPI = Object.inherits({}, sinaApi, {
	config: Object.inherits({}, sinaApi.config, {
		host: 'http://api.douban.com',
		source: '05e787211a7ff69311b695634f7fe3b9', 
		oauth_key: '05e787211a7ff69311b695634f7fe3b9',
        oauth_secret: 'a29252a52eaa835d',
        result_format: '', // 豆瓣由alt参数确定返回值格式
        
		userinfo_has_counts: false, // 用户信息中是否包含粉丝数、微博数等信息
        support_comment: false,
		support_repost: false,
		support_repost_timeline: false,
		support_max_id: false,
		support_favorites: false,
		support_do_favorite: false,
		support_mentions: false,
		support_upload: false,
		need_processMsg: false,
		support_cursor_only: true,
		support_search: false,
		support_auto_shorten_url: false,
		user_timeline_need_friendship: false,
		user_timeline_need_user: true,
		// support_sent_direct_messages: false,
//		oauth_callback: null,
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
        sent_direct_messages: '/doumail/outbox',
        friends: '/people/{{user_id}}/contacts',
        followers: '/people/{{user_id}}/friends',
        new_message: '/doumails',
        destroy_msg: '/doumail/{{id}}',
        comment: '/miniblog/{{id}}/comments_post',
        reply: '/miniblog/{{id}}/comments_post',
        comments: '/miniblog/{{id}}/comments',
        user_search: '/people',
        user_show: '/people/{{id}}',
		verify_credentials: '/people/%40me'
	}),
	
	counts: function(data, callback, context) {
		callback.call(context);
	},

    rate_limit_status: function(data, callback, context){
        callback.call(context, {error: _u.i18n("comm_no_api")});
    },
	
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
				args.content = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns:ns0="http://www.w3.org/2005/Atom" xmlns:db="http://www.douban.com/xmlns/"><content>{{status}}</content></entry>'.format(args.data);
				args.contentType = 'application/atom+xml; charset=utf-8';
				args.data = {};
			} else if(args.url == this.config.destroy || args.url == this.config.destroy_msg) {
				delete args.data.apikey;
				delete args.data.alt;
				args.type = 'DELETE';
			} else if(args.url == this.config.friends_timeline || args.url == this.config.user_timeline) {
				args.data.type = 'all';
			} else if(args.url == this.config.new_message) {
			    args.content = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns="http://www.w3.org/2005/Atom" xmlns:db="http://www.douban.com/xmlns/" xmlns:gd="http://schemas.google.com/g/2005" xmlns:opensearch="http://a9.com/-/spec/opensearchrss/1.0/"><db:entity name="receiver"><uri>http://api.douban.com/people/{{id}}</uri></db:entity><content>{{text}}</content><title>{{text}}</title></entry>'.format(args.data);
				args.contentType = 'application/atom+xml; charset=utf-8';
				args.data = {};
			} else if(args.url == this.config.comment) {
				args.content = '<?xml version="1.0" encoding="UTF-8"?><entry><content>{{comment}}</content></entry>'.format(args.data);
				args.contentType = 'application/atom+xml; charset=utf-8';
				args.data = {id: args.data.id};
				args.url = args.url.replace('_post', '');
				args.is_comment_post = true;
			} else if(args.url == this.config.comments) {
				// 记录下评论id填充
				args.miniblog_id = args.data.id;
			}
		}
	},
	
	format_result: function(data, play_load, args) {
		if(args.url == this.config.update || args.url == this.config.destroy 
				|| args.url == this.config.destroy_msg || args.url == this.config.new_message 
				|| args.is_comment_post) {
			return true;
		}
		var items = data.entry || data;
		if($.isArray(items)) {
			if(data.author) {
				data.user = this.format_result_item(data.author, 'user', args);
			}
	    	for(var i in items) {
	    		if(!items[i].author && data.user) {
	    			items[i].user = data.user;
	    		}
	    		items[i] = this.format_result_item(items[i], play_load, args);
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
		} else if(play_load == 'status' || play_load == 'comment') {
			if(data.author) {
				data.user = this.format_result_item(data.author, 'user', args);
			}
			if(data['db:uid']) {
				data.id = data['db:uid']['$t'];
			} else {
				data.id = data.id['$t'];
				if(play_load == 'comment') {
					data.id = data.id.substring(data.id.lastIndexOf('/comment/') + 9, data.id.length);
				} else {
					data.id = data.id.substring(data.id.lastIndexOf('/miniblog/') + 10, data.id.length);
				}
			}
			data.text = data.content['$t'];
			// saying 和 推荐 才支持评论
			if(data.category) {
				var term = data.category['@term'], can_comment = false, add_comment_to_text = false;
				if(term.endswith('#miniblog.recommendation')) {
				    add_comment_to_text = true;
				    // 推荐<a href="#">《一生所爱》 - 卢冠廷</a>
				    // => http://music.douban.com/subject_search?search_text=《一生所爱》 - 卢冠廷
				    var $a = $(data.text);
				    if($a.length === 1) {
				        var href = $a.attr('href');
				        if(!href ||href.length < 10) {
				            var word = $a.html();
				            data.text = '推荐<a href="http://music.douban.com/subject_search?search_text=' + word + '">' + word + '</a>';
				        }
				    }
				} else if(term.endswith('#miniblog.saying')) {
				    can_comment = true;
				}
			    if((can_comment || add_comment_to_text) && data['db:attribute']) {
					// comments_count
					$.each(data['db:attribute'], function(index, item){
						if(can_comment && item['@name'] === 'comments_count') {
							data[item['@name']] = item['$t'];
						} else if(add_comment_to_text && item['@name'] === 'comment') {
						    add_comment_to_text = false;
						    if(item['$t']) {
						        data.text += ' : ' + item['$t'];
						    }
						}
					});
					delete data['db:attribute'];
				}
			}
			if(data.comments_count === undefined) {
				// 没有评论数，就是代表不可以评论的，隐藏
				data.hide_comments = true;
			}
			// id方式访问是不准确的
//			data.t_url = 'http://www.douban.com/people/{{user.id}}/miniblog/{{id}}/'.format(data);
			delete data.author;
			delete data.content;
		} else if(play_load == 'message') {
			data.sender = data.user = this.format_result_item(data.author, 'user', args);
			if(data['db:entity'] && data['db:entity']['@name'] == "receiver") {
			    data.recipient = this.format_result_item(data['db:entity'], 'user', args);
			    delete data['db:entity'];
			}
			data.text = data.title['$t'];
			data.id = data.id['$t'];
			data.id = data.id.substring(data.id.lastIndexOf('/doumail/') + 9, data.id.length);
			data.t_url = data.link[1]['@href'];
			data.text += (' <a href="{{t_url}}">'+ _u.i18n("comm_view") +'</a>').format(data);
			delete data.title;
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

var TianyaAPI = Object.inherits({}, sinaApi, {
	config: Object.inherits({}, sinaApi.config, {
		host: 'http://open.tianya.cn/api',
		source: '12d4d19aee679b8713297c2583fe21b204dd9ca0a', 
		oauth_key: '12d4d19aee679b8713297c2583fe21b204dd9ca0a',
        oauth_secret: '0b3b77ad0586343a18670a18e44d7457',
        result_format: '', // 豆瓣由alt参数确定返回值格式
        oauth_callback: FAWAVE_OAUTH_CALLBACK_URL,
		userinfo_has_counts: false, // 用户信息中是否包含粉丝数、微博数等信息
        support_comment: false,
		support_repost: false,
		support_repost_timeline: false,
		support_max_id: false,
		support_favorites: false,
		support_do_favorite: false,
		support_mentions: false,
		support_upload: false,
		need_processMsg: false,
		support_auto_shorten_url: false,
		user_timeline_need_friendship: false,
		//support_cursor_only: true,
		support_search: false,
		support_sent_direct_messages: false,
		oauth_host: 'http://open.tianya.cn',
		oauth_authorize: 	  '/oauth/authorize.php',
        oauth_request_token:  '/oauth/request_token.php',
        oauth_access_token:   '/oauth/access_token.php',
        update: '/yabo/add.php',
		verify_credentials: '/user/info.php'
	}),
	
	apply_auth: function(url, args, user) {
		if(url && url.indexOf('access_token.php') < 0 && user.oauth_token_secret) {
			// oauth_token
			// oauth_token_secret
			args.data.oauth_token = user.oauth_token_key;
			args.data.oauth_token_secret = user.oauth_token_secret;
		} else {
			this.super_.apply_auth.call(this, url, args, user);
		}
	},
	counts: function(data, callback, context) {
		callback.call(context);
	},

    rate_limit_status: function(data, callback, context) {
        callback.call(context, {error: _u.i18n("comm_no_api")});
    },
	
	before_sendRequest: function(args, user) {
		args.data.outformat = 'json';
		if(args.url === this.config.update) {
			args.type = 'get';
			args.data.word = args.data.status;
			delete args.data.status;
		}
	},
	// urlencode，子类覆盖是否需要urlencode处理
	url_encode: function(text) {
		return text;
	},
	format_result_item: function(data, play_load, args) {
		if(play_load === 'user') {
			data = data.user;
			data.id = data.user_id;
			data.screen_name = data.user_name;
			data.created_at = new Date(data.register_date);
			data.birthday = new Date(data.birthday);
			data.profile_image_url = data.head;
		}
		return data;
	}
});

// facebook: http://developers.facebook.com/docs/api
var FacebookAPI = Object.inherits({}, sinaApi, {
	config: Object.inherits({}, sinaApi.config, {
		host: 'https://graph.facebook.com',
        user_home_url: 'http://www.facebook.com/',
		source: '121425774590172', 
		oauth_key: '121425774590172',
        oauth_secret: 'ab7ffce878acf3c7e870c0e7f0a1b29a',
        result_format: '',
        userinfo_has_counts: false,
        support_counts: false,
        support_cursor_only: true,  // 只支持游标方式翻页
        support_friends_only: true, // 只支持friends
        support_repost: false,
        support_repost_timeline: false,
        support_sent_direct_messages: false,
        support_comment: false,
        support_do_comment: true,
        support_mentions: false,
        support_favorites: false,
        support_auto_shorten_url: false,
        user_timeline_need_friendship: false,
        
        
        direct_messages: '/me/inbox',
        verify_credentials: '/me',
        friends_timeline: '/me/home',
        destroy: '/{{id}}_delete',
        user_timeline: '/{{id}}/feed',
        update: '/me/feed_update',
        upload: '/me/photos',
        friends: '/{{user_id}}/friends',
        followers: '/{{user_id}}/friends',
        comment: '/{{id}}/comments',
        favorites_create: '/{{id}}/likes',
        favorites_destroy: '/{{id}}/likes',
        new_message: '/{{id}}/notes',
        
        oauth_authorize: 	  '/oauth/authorize',
        oauth_request_token:  '/oauth/request_token',
        oauth_callback: FAWAVE_OAUTH_CALLBACK_URL,
        oauth_access_token:   '/oauth/access_token',
        oauth_scope: [
        	'offline_access', 
        	'publish_stream',
        	
        	'read_insights', 'read_mailbox', 'read_requests',
        	'read_stream',
        	
        	'user_activities', 'friends_activities',
        	'user_birthday', 'friends_birthday',
        	'user_about_me', 'friends_about_me',
        	'user_photos', 'friends_photos',
        	'user_relationships', 'friends_relationships',
        	'user_status', 'friends_status',
        	'user_interests', 'friends_interests',
        	'user_likes', 'friends_likes',
        	'user_online_presence', 'friends_online_presence',
        	'user_website', 'friends_website',
        	'user_videos', 'friends_videos',
        	'read_friendlists', 'manage_friendlists',
        	'user_checkins', 'friends_checkins',
        	'user_hometown', 'friends_hometown',
        	'user_location', 'friends_location',
        	'user_religion_politics', 'friends_religion_politics'
        ].join(',')
	}),
	
	url_encode: function(text) {
		return text;
	},
	
	apply_auth: function(url, args, user) {
		
	},
	
	get_access_token: function(user, callback, context) {
    	var params = {
            url: this.config.oauth_access_token,
            type: 'get',
            user: user,
            play_load: 'string',
            apiHost: this.config.oauth_host,
            data: {
				client_id: this.config.oauth_key, 
	    		redirect_uri: this.config.oauth_callback,
	    		client_secret: this.config.oauth_secret,
	    		code: user.oauth_pin
			},
            need_source: false
        };
		this._sendRequest(params, function(token_str, text_status, error_code) {
			var token = null;
			if(text_status != 'error') {
				// access_token=121425774590172|3362948c9a062a22ef18c6d5-1013655641|zUXlPP0oIA44zqAfAyndxhKZUp4
				token = decodeForm(token_str);
				if(!token.access_token) {
					token = null;
					error_code = token_str;
					text_status = 'error';
				} else {
					user.oauth_token_key = token.access_token;
				}
			}
			callback.call(context, token ? user : null, text_status, error_code);
		});
    },
    
	// 获取认证url
    get_authorization_url: function(user, callback, context) {
    	var params = {
    		client_id: this.config.oauth_key, 
    		redirect_uri: this.config.oauth_callback,
    		scope: this.config.oauth_scope
    	};
    	var login_url = this.format_authorization_url(params);
    	callback.call(context, login_url, 'success', 200);
    },
    
    format_upload_params: function(user, data, pic) {
    	data.message = data.status;
    	delete data.status;
    	if(user.oauth_token_key) {
			data.access_token = user.oauth_token_key;
		}
		pic.keyname = 'source';
    },
    
    before_sendRequest: function(args, user) {
		delete args.data.source;
		delete args.data.since_id;
		if(args.play_load == 'string') {
			return;
		}
		if(user.oauth_token_key) {
			args.data.access_token = user.oauth_token_key;
		}
		if(args.data.count) {
			args.data.limit = args.data.count;
			delete args.data.count;
		}
		if(args.data.cursor) {
			if(String(args.data.cursor) != '-1') {
				if(args.url == this.config.friends) {
					args.data.offset = args.data.cursor;
				} else {
					args.data.until = args.data.cursor;
				}
			}
			delete args.data.cursor;
		}
		if(args.url == this.config.update) {
			args.url = args.url.replace('_update', '');
			args.data.message = args.data.status;
			delete args.data.status;
		}
        else if(args.url == this.config.comment) {
			args.data.message = args.data.comment;
			delete args.data.comment;
		}
		else if(args.url == this.config.destroy) {
			args.url = args.url.replace('_delete', '');
			args.type = 'DELETE';
		}
        else if(args.url == this.config.favorites_destroy) {
			args.type = 'DELETE';
		}
        else if(args.url == this.config.new_message) {
			args.data.message = args.data.text;
            args.data.subject = args.data.text.slice(0, 80);
			delete args.data.text;
		} else if(args.url == this.config.user_search) {
			// https://graph.facebook.com/search?q=mark&type=user
			args.url = '/search';
			args.data.type = 'user';
		} else if(args.url == this.config.search) {
			args.url = '/search';
			args.data.type = 'post';
		}
	},
	
	format_result: function(data, play_load, args) {
    	var items = data;
    	if(!$.isArray(data) && data.data) {
    		items = data.items = data.data;
    		delete data.data;
    	}
		if($.isArray(items)) {
	    	for(var i in items) {
	    		items[i] = this.format_result_item(items[i], play_load, args);
	    	}
	    } else {
	    	data = this.format_result_item(data, play_load, args);
	    }
	    if(data.paging) { // cursor 分页
	    	if(data.paging.next) {
	    		var params = decodeForm(data.paging.next);
	    		data.next_cursor = String(params.until || params.offset);
	    	} else {
	    		data.next_cursor = '0'; // 到底了
	    	}
	    }
		return data;
	},
	
	format_result_item: function(data, play_load, args) {
		if(play_load == 'user' && data && data.id) {
			data.t_url = data.link || 'http://www.facebook.com/profile.php?id=' + data.id;
			data.profile_image_url = this.config.host + '/' + data.id + '/picture';
			data.screen_name = data.name;
			data.description = data.about;
//			gender_map: {0:'n', 1:'m', 2:'f'},
			if(data.gender) {
				data.gender = data.gender == 'male' ? 'm' : 'f';
			} else {
				data.gender = 'n';
			}
			// "location": {"id": "106262882745698",  "name": "Guangzhou, China"}
			if(data.location && data.location.name) {
				data.province = data.location.name;
			}
			if(data.hometown && data.hometown.name) {
				data.city = data.hometown.name;
			}
			delete data.location;
			delete data.hometown;
			delete data.about;
		} else if(play_load == 'status' || play_load == 'message') {
			data.text = data.message || '';
			if(!data.text) {
				if(data.name) {
					data.text += ' ' + data.name;
				}
				if(data.link) {
					data.text += ' ' + data.link;
				}
			}
			delete data.message;
			data.t_url = data.link;
			delete data.link;
			if(data.picture) {
				if(data.picture.indexOf('/safe_image.php?') > 0) {
					data.thumbnail_pic = data.picture;
					var params = decodeForm(data.picture);
					data.bmiddle_pic = params.url;
					data.original_pic = data.bmiddle_pic;
				} else {
					data.thumbnail_pic = data.picture;
					data.bmiddle_pic = data.picture.replace('_s.', '_n.');
					data.original_pic = data.bmiddle_pic;
				}
				delete data.picture;
			}
			if(data.application) {
				data.source = '<a href="http://www.facebook.com/apps/application.php?id={{id}}" target="_blank">{{name}}</a>'.format(data.application);
				delete data.application;
			}
			data.user = this.format_result_item(data.from, 'user', args);
			data.created_at = data.created_time || data.updated_time;
			delete data.from;
		} else if(play_load == 'comment') {
		} 
		return data;
	}
});

// http://wiki.dev.renren.com/wiki/API
var RenrenAPI = Object.inherits({}, sinaApi, {
	config: Object.inherits({}, sinaApi.config, {
		host: 'http://api.renren.com/restserver.do',
		oauth_host: 'https://graph.renren.com',
        user_home_url: 'http://www.renren.com/',
		source: '4f3e0d2c2ccc4ccf8c30767b08da9253', 
		oauth_key: '4f3e0d2c2ccc4ccf8c30767b08da9253',
        oauth_secret: 'be199423964443a583780ec10b8381fb',
        call_id: 0,
        result_format: '',
        //userinfo_has_counts: false,
        support_counts: false,
        support_cursor_only: false,  // 只支持游标方式翻页
        support_friends_only: true, // 只支持friends
        support_repost: true,
        support_repost_timeline: false,
        support_direct_messages: false,
        support_sent_direct_messages: false,
        support_comment: false,
        support_do_comment: true,
        support_mentions: false,
        support_favorites: false,
        support_auto_shorten_url: false,
        support_max_id: false, // page 翻页
        user_timeline_need_friendship: false,
        use_method_param: true, // only one api path
        
        direct_messages: '/me/inbox',
        verify_credentials: 'users.getLoggedInUser', //'users.getLoggedInUser => uid => users.getProfileInfo',
        user_profile: 'users.getProfileInfo',
        user_profile_fields: ['base_info', 'status', 'visitors_count', 'blogs_count', 'albums_count',
                              'friends_count', 'guestbook_count', 'status_count'].join(','),
        friends_timeline: 'feed.get',
        // http://wiki.dev.renren.com/wiki/Type%E5%88%97%E8%A1%A8
        friends_timeline_type: '10,20,21,30,32,50,51,52',
        destroy: '/{{id}}_delete',
        user_timeline: 'feed.get',//'status.gets',
        comments: 'status.getComment',
        comments_need_status: true, // 评论列表需要结合status才能获取
        update: 'status.set',
        upload: 'photos.upload',
        friends: 'friends.getFriends',
        followers: 'friends.getFriends',
        users: 'users.getInfo',
        photos: 'photos.get',
        comment: 'status.addComment',
        reply: 'status.addComment',
        repost: 'status.set_repost', // 
        repost_need_status: true,
        favorites_create: '/{{id}}/likes',
        favorites_destroy: '/{{id}}/likes',
        new_message: '/{{id}}/notes',
        
        oauth_authorize: 	  '/oauth/authorize',
        oauth_callback: FAWAVE_OAUTH_CALLBACK_URL,
        oauth_access_token:   '/oauth/token',
        oauth_scope: [
        	'read_user_feed', 
        	'read_user_message',
        	'read_user_photo', 'read_user_status', 'read_user_comment',
        	'read_user_share',
        	'publish_feed', 'publish_share',
        	'send_request',
        	'send_message', 'photo_upload',
        	'status_update', 'publish_comment',
        	'operate_like'
        ].join(' ')
	}),
	
	url_encode: function(text) {
		return text;
	},
	
	apply_auth: function(url, args, user) {
		
	},
	
	get_access_token: function(user, callback, context) {
    	var params = {
            url: this.config.oauth_access_token,
            type: 'get',
            user: user,
            play_load: 'string',
            apiHost: this.config.oauth_host,
            data: {
				client_id: this.config.oauth_key, 
	    		redirect_uri: this.config.oauth_callback,
	    		client_secret: this.config.oauth_secret,
	    		code: user.oauth_pin,
	    		grant_type: 'authorization_code'
			},
            need_source: false
        };
		this._sendRequest(params, function(token_str, text_status, error_code) {
			var token = null;
			if(text_status != 'error') {
				token = JSON.parse(token_str);
				if(!token.access_token) {
					token = null;
					error_code = token_str;
					text_status = 'error';
				} else {
					user.oauth_token_key = token.access_token;
					user.oauth_expires_in = token.expires_in;
					user.oauth_scope = token.scope;
				}
			}
			callback.call(context, token ? user : null, text_status, error_code);
		});
    },
    
	// 获取认证url
    get_authorization_url: function(user, callback, context) {
    	var params = {
    		client_id: this.config.oauth_key, 
    		redirect_uri: this.config.oauth_callback,
    		scope: this.config.oauth_scope,
    		response_type: 'code'
    	};
    	var login_url = this.format_authorization_url(params);
    	callback.call(context, login_url, 'success', 200);
    },
    
    // http://wiki.dev.renren.com/wiki/Calculate_signature
    signature: function(params, user) {
    	params.access_token = user.oauth_token_key;
    	params.api_key = this.config.oauth_key;
    	params.v = '1.0';
//    	params.call_id = ++this.config.call_id;
    	var kvs = [];
    	for(var k in params) {
    		kvs.push([k, params[k]]);
    	}
    	kvs.sort(function(a,b) {
            if (a[0] < b[0]) return -1;
            if (a[0] > b[0]) return 1;
            if (a[1] < b[1]) return  -1;
            if (a[1] > b[1]) return 1;
            return 0;
        });
    	var sig = "";
        for (var p = 0; p < kvs.length; ++p) {
            var value = kvs[p][1];
            if (value == null) continue;
            sig += kvs[p][0] + '=' + value;
        }
    	sig = hex_md5(sig + this.config.oauth_secret);
    	params.sig = sig;
    },
    
    before_sendRequest: function(args, user) {
		delete args.data.source;
		delete args.data.since_id;
		if(args.play_load == 'string') {
			return;
		}
		args.data.method = args.url;
		var status_type = 'status';
		if(args.data.status && args.data.status.id) {
		    status_type = args.data.status.status_type;
		    if(status_type === 'status') {
                args.data.status_id = args.data.id;
                args.data.owner_id = args.data.status.user.id;
            } else if(status_type === 'photo') { // photo
                args.data.pid = args.data.id;
                args.data.uid = args.data.status.user.id;
            } else if(status_type === 'share') {
                args.data.share_id = args.data.id;
                args.data.user_id = args.data.status.user.id;
            }
		    delete args.data.id;
		    delete args.data.status;
		}
		if(args.url === this.config.user_timeline) {
			args.data.uid = args.data.id;
			delete args.data.id;
			delete args.data.screen_name;
			args.data.type = this.config.friends_timeline_type;
		} else if(args.url === this.config.friends_timeline) {
			args.data.type = this.config.friends_timeline_type;
		} else if(args.url === this.config.comments) {
		    if(status_type === 'photo') {
                args.data.method = 'photos.getComments'; 
		    } else if(status_type === 'share') {
		        args.data.method = 'share.getComments'; 
		    }
            args.data.order = 1; // 获取留言的排序规则，0表示升序(最旧到新)，1表示降序(最新到旧)，默认为0
		} else if(args.url === this.config.comment) {
		    if(args.data.reply_user_id) {
		        args.data.rid = args.data.reply_user_id;
		        delete args.data.reply_user_id;
		        delete args.data.cid;
		    }
		    args.data.content = args.data.comment;
		    if(status_type === 'photo') {
                args.data.method = 'photos.addComment'; 
            }  else if(status_type === 'share') {
                args.data.method = 'share.addComment'; 
                if(args.data.rid) {
                    args.data.to_user_id = args.data.rid;
                    delete args.data.rid;
                }
            }
		    if(status_type !== 'share') {
		        delete args.data.user_id;
		    }
		    delete args.data.comment;
		} else if(args.url === this.config.friends) {
		    delete args.data.user_id;
		    delete args.data.screen_name;
		    var cursor = parseInt(args.data.cursor);
		    delete args.data.cursor;
		    if(cursor > 0) {
		        args.data.page = cursor;
		    }
		} else if(args.url === this.config.repost) {
		    if(args.data.retweeted_status.status_type === 'status') {
		        args.data.forward_id = args.data.id;
		        delete args.data.id;
		        args.data.forward_owner = args.data.retweeted_status.uid;
		        args.data.method = args.data.method.replace('_repost', '');
		    } else { 
		        // 分享图片 http://wiki.dev.renren.com/wiki/Share.publish
		        args.data.method = 'share.publish';
		        args.data.type = 2;
		        args.data.uid = args.data.retweeted_status.user.id;
		        args.data.comment = args.data.status;
		        delete args.data.status;
		    }
		    delete args.data.retweeted_status;
		}
		args.type = 'post';
		args.data.format = 'json';
		args.url = '';
		var old_status = args.data.status;
		if(args.data.status) {
			// 必须先将字符串变成utf8编码进行签名计算, sb人人
			args.data.status = Base64._utf8_encode(args.data.status);
		}
		var old_content = args.data.content;
        if(args.data.content) {
            // 必须先将字符串变成utf8编码进行签名计算, sb人人
            args.data.content = Base64._utf8_encode(args.data.content);
        }
        var old_comment = args.data.comment;
        if(args.data.comment) {
            // 必须先将字符串变成utf8编码进行签名计算, sb人人
            args.data.comment = Base64._utf8_encode(args.data.comment);
        }
		this.signature(args.data, user);
		if(old_status) {
			// 将之前编码的字符串还原回来, fxxx
			args.data.status = old_status;
		}
		if(old_content) {
            // 将之前编码的字符串还原回来, fxxx
            args.data.content = old_content;
        }
		if(old_comment) {
            // 将之前编码的字符串还原回来, fxxx
            args.data.comment = old_comment;
        }
	},
	
	format_upload_params: function(user, data, pic) {
		delete data.source;
		data.method = this.config.upload;
		data.caption = data.status;
		delete data.status;
		data.format = 'json';
		var old_caption = data.caption;
		if(data.caption) {
			// 必须先将字符串变成utf8编码进行签名计算, sb人人
			data.caption = Base64._utf8_encode(data.caption);
		}
		this.signature(data, user);
		if(old_caption) {
			// 将之前编码的字符串还原回来, fxxx
			data.caption = old_caption;
		}
		pic.keyname = 'upload';
    },

    format_result: function(data, play_load, args) {
        if(data && data.result === 1) {
            return true;
        }
        if(args.data.method === 'share.getComments' && data && data.comments) {
            data = data.comments;
        }
        return this.super_.format_result.call(this, data, play_load, args);
    },
    
	format_result_item: function(data, play_load, args) {
		if(play_load == 'user' && data && (data.uid || data.id)) {
			// http://www.renren.com/profile.do?id=263668818
			data.id = data.uid || data.id;
			delete data.uid;
			data.t_url = 'http://www.renren.com/profile.do?id=' + data.id;
			data.profile_image_url = data.tinyurl || data.headurl;
			delete data.tinyurl;
			delete data.headurl;
			data.screen_name = data.name;
			data.description = data.network_name;
			data.gender = 'n';
			if(data.sex !== undefined) {
				data.gender = data.sex === 1 ? 'm' : 'f';
			}
			if(data.base_info) {
				data.gender = data.base_info.gender == '1' ? 'm' : 'f';
				if(data.base_info.hometown) {
					data.province = data.base_info.hometown.province;
					data.city = data.base_info.hometown.city;
				}
			}
			delete data.base_info;
			if(data.hometown_location) {
				data.province = data.hometown_location.province;
				data.city = data.hometown_location.city;
			}
			delete data.hometown_location;
			data.followers_count = data.visitors_count;
			data.friends_count = data.friends_count;
			data.statuses_count = data.status_count;
		} else if(play_load === 'status' || play_load === 'message') {
			// http://wiki.dev.renren.com/wiki/Feed.get
			data.id = data.status_id || data.source_id; // source_id 表示新鲜事内容主体的id，例如日志id、相册id和分享id等等
			delete data.post_id;
			delete data.status_id;
			if(data.message) {
				data.text = data.message;
			} else {
				var title = data.title || '';
				if(title) {
					title += ' ';
				}
				data.text = title + (data.description || '');
			}
			delete data.message;
			data.uid = data.actor_id || data.uid;
			data.t_url = data.href;
			data.status_type = 'status';
			if(data.feed_type === 30) {
			    data.status_type = 'photo';
			} else if(data.feed_type === 32) {
			    data.status_type = 'share';
			}
			if(data.comments) {
			    data.comments_count = data.comments.count || 0;
			}
			if(data.attachment && data.attachment.length > 0 && data.attachment[0].media_type === 'photo') {
			    var attachment = data.attachment[0];
			    var pic_owner_id = attachment.owner_id;
			    if(data.uid === pic_owner_id && data.prefix !== '分享了照片') {
			        data.bmiddle_pic = data.bmiddle_pic = data.thumbnail_pic = attachment.src;
	                data.pic_id = attachment.media_id;
	                data.pic_owner_id = pic_owner_id;
	                data.t_url = attachment.href;
			    } else {
			        data.retweeted_status = {
		                id: attachment.media_id,
		                pic_id: attachment.media_id,
		                pic_owner_id: pic_owner_id,
		                thumbnail_pic: attachment.src,
		                uid: pic_owner_id,
		                t_url: attachment.href
			        };
			        data.text = data.prefix;
			    }
				delete data.attachment;
			}
			if(data.source_name) {
			    if(data.source_url) {
			        data.source = '<a href="{{source_url}}" target="_blank">{{source_name}}</a>'.format(data);
			    } else {
			        data.source = data.source_name;
			    }
				delete data.source_name;
				delete data.source_url;
			}
			
			data.created_at = data.update_time || data.time;
			delete data.update_time;
			delete data.time;
		} else if(play_load === 'comment') {
		    data.id = data.comment_id;
		    data.created_at = data.update_time || data.time;
		    if(!data.text) {
		        data.text = data.content;
		    }
            delete data.update_time;
            delete data.time;
		    data.user = this.format_result_item(data, 'user', args);
		}
		return data;
	},
	
	// user, callback, data, context
	verify_credentials: function(user, callback, data, context) {
		this.super_.verify_credentials.call(this, user, function(result, code_text, code) {
			var params = {
				url: this.config.user_profile,
				play_load: 'user',
				data: {user: user, uid: result.id, fields: this.config.user_profile_fields}
			};
			this._sendRequest(params, callback, context);
		}, data, this);
	},
	
	_fill_pics: function(user, items, callback, context) {
		var items_map = {}, user_id_pic_map = {};
		items = items || [];
		for(var i = 0, len = items.length; i < len; i++) {
		    var item = items[i];
			var pid = item.pic_id;
			if(pid) {
				var list = items_map[pid] || [];
				list.push(item);
				items_map[pid] = list;
				var pids = user_id_pic_map[item.pic_owner_id] || [];
				pids.push(pid);
				user_id_pic_map[item.pic_owner_id] = pids;
			}
			if(item.retweeted_status && item.retweeted_status.pic_id) {
			    item = item.retweeted_status;
			    pid = item.pic_id;
			    var list = items_map[pid] || [];
                list.push(item);
                items_map[pid] = list;
                var pids = user_id_pic_map[item.pic_owner_id] || [];
                pids.push(pid);
                user_id_pic_map[item.pic_owner_id] = pids;
			}
		}
		if(Object.keys(items_map).length === 0) {
			return callback.call(context, items);
		}
		var count = Object.keys(user_id_pic_map).length;
		for(var user_id in user_id_pic_map) {
		    var pids = user_id_pic_map[user_id];
		    var params = {
	            url: this.config.photos,
	            play_load: 'photo',
	            data: {
	                user: user, 
	                uid: user_id,
	                pids: pids.join(',')
	            }
	        };
	        this._sendRequest(params, function(photos) {
	            if(photos) {
	                for(var i = 0, len = photos.length; i < len; i++) {
	                    var photo = photos[i];
	                    var list = items_map[photo.pid];
	                    for(var j = 0, jlen = list.length; j < jlen; j++) {
	                        var status = list[j];
	                        status.id = photo.pid;
	                        status.bmiddle_pic = photo.url_large;
	                        status.original_pic = photo.url_large;
	                        if(photo.caption) {
	                            status.text = photo.caption;
	                        }
	                        status.created_at = photo.update_time || photo.time;
	                        // http://photo.renren.com/photo/385478335/photo-4746901797
	                        status.t_url = 'http://photo.renren.com/photo/' + photo.uid + '/photo-' + photo.pid;
	                    }
	                }
	            }
	            count--;
	            if(count === 0) {
	                callback.call(context, items);
	            }
	        }, this);
		}
	},
	
	_fill_users: function(user, items, callback, context) {
		// 批量获取用户信息
		if(items && items.length > 0 && items[0].uid) {
			var items_map = {};
			for(var i = 0, len = items.length; i < len; i++) {
			    var item = items[i];
				var uid = item.uid;
				var list = items_map[uid] || [];
				list.push(item);
				items_map[uid] = list;
				if(item.retweeted_status) {
				    item = item.retweeted_status;
	                uid = item.uid;
	                list = items_map[uid] || [];
	                list.push(item);
	                items_map[uid] = list;
				}
			}
			var params = {
				url: this.config.users,
				play_load: 'user',
				data: {
					user: user, 
					uids: Object.keys(items_map).join(','),
					fields: 'uid,name,sex,star,zidou,vip,birthday,email_hash,tinyurl,headurl,mainurl,hometown_location,work_history,university_history'
				}
			};
			this._sendRequest(params, function(users) {
				if(users) {
					for(var i = 0, len = users.length; i < len; i++) {
						var user = users[i];
						var list = items_map[user.id];
						for(var j = 0, jlen = list.length; j < jlen; j++) {
							list[j].user = user;
						}
					}
				}
				callback.call(context, items);
			}, this);
		} else {
			callback.call(context, items);
		}
	},
	
	_fill_datas: function(user, items, code_text, code, callback, context) {
	    var both = this.combo(function(users_args, pics_args) {
            callback.call(context, items, code_text, code);
        });
        var users_callback = both.add(), pics_callback = both.add();
        this._fill_users(user, items, users_callback);
        this._fill_pics(user, items, pics_callback);
	},
	
	user_timeline: function(data, callback, context) {
		var user = data.user;
		delete data.uid;
		this.super_.user_timeline.call(this, data, function(items, code_text, code) {
		    this._fill_datas(user, items, code_text, code, callback, context);
		}, this);
	},
	
	friends_timeline: function(data, callback, context) {
		var user = data.user;
		this.super_.friends_timeline.call(this, data, function(items, code_text, code) {
		    this._fill_datas(user, items, code_text, code, callback, context);
		}, this);
	}
});

// plurk: http://www.plurk.com/API/issueKey
var PlurkAPI = Object.inherits({}, sinaApi, {
	config: Object.inherits({}, sinaApi.config, {
		host: 'http://www.plurk.com/API',
		source: '4e4QGBY94z6v3zvb2rvDqH8yzSccvk2D', 
        result_format: '',
        support_counts: false,
        support_comment: false,
        support_double_char: false,
        support_direct_messages: false,
        support_repost: false,
        support_repost_timeline: false,
        support_mentions: false,
//        support_user_search: false, // 暂时屏蔽
        support_cursor_only: true,  // 只支持游标方式翻页
        support_auto_shorten_url: false,
        user_timeline_need_friendship: false,
        repost_pre: 'RT', // 转发前缀
        verify_credentials: '/Users/login',
        update: '/Timeline/plurkAdd',
        upload: '/Timeline/uploadPicture',
        destroy: '/Timeline/plurkDelete',
        favorites: '/Timeline/getPlurks?filter=only_favorite',
        favorites_create: '/Timeline/favoritePlurks',
        favorites_destroy: '/Timeline/unfavoritePlurks',
        friends_timeline: '/Polling/getPlurks',
        followers: '/FriendsFans/getFansByOffset',
        friends: '/FriendsFans/getFollowingByOffset',
        friendships_create: '/FriendsFans/setFollowing?user_id={{id}}&follow=true',
        friendships_destroy: '/FriendsFans/setFollowing?user_id={{id}}&follow=false',
        comment: '/Responses/responseAdd',
        comment_destroy: '/Responses/responseDelete',
        comments: '/Responses/get',
        search: '/PlurkSearch/search',
        user_search: '/UserSearch/search',
        user_timeline: '/Timeline/getPlurks' // filter: Can be only_user
	}),
	
	url_encode: function(text) {
		return text;
	},
	
	format_upload_params: function(user, data, pic) {
		data.api_key = data.source;
		delete data.source;
    	delete data.lat;
    	delete data.long;
    	pic.keyname = 'image';
    },
	
	upload: function(user, params, pic, before_request, onprogress, callback, context) {
		this.super_.upload.call(this, user, {}, pic, before_request, onprogress, function(data) {
			if(data && data.full) {
				params.user = user;
				params.status += ' ' + data.full;
				this.update(params, callback, context);
			} else {
				callback.call(context, 'error');
			}
		}, this);
	},
	
	before_sendRequest: function(args) {
		// args.data.source => args.data.app_key
		args.data.api_key = args.data.source;
		delete args.data.source;
		if(args.data.count) {
			args.data.limit = args.data.count;
			delete args.data.count;
		}
		if(args.url == this.config.update) {
			args.data.content = args.data.status;
			delete args.data.status;
			args.data.qualifier = ':';
		}
		if(args.url == this.config.destroy) {
			args.data.plurk_id = args.data.id;
			delete args.data.id;
		}
		if(args.url == this.config.favorites_create || args.url == this.config.favorites_destroy) {
			args.data.ids = '[' + args.data.id + ']';
			delete args.data.id;
		}
		if(args.url == this.config.friends_timeline) {
			if(!args.data.since_id) {
				args.url = this.config.user_timeline;
			} else {
				args.data.offset = args.data.since_id;
				delete args.data.since_id;
			}
			args.is_friends_timeline = true;
		}
		if(args.data.cursor) {
			args.data.offset = args.data.cursor;
			// 如果是friends_timeline，获取旧数据需要user_timeline接口
			if(args.is_friends_timeline) {
				args.url = this.config.user_timeline;
			}
			delete args.data.cursor;
		}
		if(args.url == this.config.user_timeline) {
//			args.data.filter = 'only_user';
			delete args.data.screen_name;
			delete args.data.id;
		}
		if(args.url == this.config.followers || args.url == this.config.friends) {
			delete args.data.screen_name;
			delete args.data.limit;
			if(args.data.offset && String(args.data.offset) == '-1') {
				args.data.offset = 0;
			}
		}
		if(args.url == this.config.comments) {
			args.data.plurk_id = args.data.id;
			delete args.data.id;
		}
		if(args.url == this.config.comment) {
			args.data.plurk_id = args.data.id;
			args.data.content = args.data.comment;
			args.data.qualifier = ':';
			delete args.data.comment;
			delete args.data.id;
		}
		if(args.url == this.config.search || args.url == this.config.user_search) {
			args.data.query = args.data.q;
			delete args.data.q;
		}
	},
	
	apply_auth: function(url, args, user) {
		// 登录的时候才需要认证数据
		if(args.url == this.config.verify_credentials && user.authType == 'baseauth') {
			args.data.username = user.userName;
			args.data.password = user.password;
		}
	},
	
	format_result: function(data, play_load, args) {
		if(data.success_text == 'ok') {
			return true;
		}
    	var items = data;
    	if(args.url == this.config.user_search) {
    		items = data.users;
    	}
    	var status_users = data.plurk_users || data.plurks_users || data.friends || data.users;
    	delete data.plurk_users;
    	delete data.plurks_users;
    	delete data.friends;
    	delete data.users;
    	if(args.url != this.config.verify_credentials && data && (data.plurks || data.responses)) {
    		items = data.plurks || data.responses;
    		data.items = items;
    		delete data.plurks;
    		delete data.responses;
    	}
		if($.isArray(items)) {
	    	for(var i in items) {
	    		if(play_load == 'status' || play_load == 'comment') {
	    			items[i].user = this.format_result_item(status_users[String(items[i].owner_id || items[i].user_id)], 'user', args);
	    		}
	    		items[i] = this.format_result_item(items[i], play_load, args);
	    	}
	    	// 设置cursor
    		if(items.length > 0) {
    			if(args.url == this.config.followers 
    					|| args.url == this.config.friends
    					|| args.url == this.config.user_search) {
    				data = {items: items};
    				var last_offset = Number(args.data.offset || 0);
    				data.next_cursor = last_offset + items.length;
    			} else {
    				// 需要去掉GMT才可以正确分页，奇怪
    				if(items[items.length-1].created_at) {
    					data.next_cursor = new Date(items[items.length-1].created_at.replace(' GMT', '')).format("yyyy-M-dThh:mm:ss"); // 2009-6-20T21:55:34
    				}
	    			if(args.is_friends_timeline) {
	    				// 设置cursor_id
	    				items[0].cursor_id = new Date(items[0].created_at.replace(' GMT', '')).format("yyyy-M-dThh:mm:ss");
	    			}
	    			if(args.url == this.config.comments) {
	    				data.has_next = false;
	    				data.comment_count = data.response_count;
	    			}
    			}
    		} else {
    			if(args.url == this.config.followers 
    					|| args.url == this.config.friends
    					|| args.url == this.config.user_search) {
    				// 没有数据了
    				data = {items: [], next_cursor: '0'};
    			}
    		}
	    } else {
	    	data = this.format_result_item(data, play_load, args);
	    }
		return data;
	},
	
	STATUS_IMAGE_RE: /\[img\|\|([^\|]+)\|\|([^\|]+)\|\|[^\]]+\]/i,
	// http://images.plurk.com/7599513_960138cc109c460ada4fc26195dcf79f.jpg
	STATUS_IMAGE_RE2: /http:\/\/images\.plurk\.com\/([\w\_\-]+)\.\w+/i,
	
	format_result_item: function(data, play_load, args) {
		if(play_load == 'user' && data) {
//			data.friends_count = data.fans_count;
			data.followers_count = data.fans_count;
			var user_info = data.user_info || data;
			data.screen_name = user_info.display_name || user_info.nick_name;
			data.user_name = user_info.nick_name;
			data.id = user_info.id;
			data.gender = user_info.gender == 1 ? 'm' : (user_info.gender == 2 ? 'f' : 'n');
			if(user_info.has_profile_image) {
				if(user_info.avatar) {
					data.profile_image_url = 'http://avatars.plurk.com/{{id}}-medium{{avatar}}.gif'.format(user_info);
				} else {
					data.profile_image_url = 'http://avatars.plurk.com/{{id}}-medium.gif'.format(user_info);
				}
			} else {
				data.profile_image_url = 'http://www.plurk.com/static/default_medium.gif';
			}
//			data.statuses_count = '';
		} else if(play_load == 'status') {
			data.text = data.content_raw; // + '<hr />' + data.content;
			// [img||http://images.plurk.com/tn_bce71a811306b51d7c6a4d09c824716d.gif||http://icanhascheezburger.files.wordpress.com/2011/01/8d541dd8-5efd-48be-b72a-cc777e57ded6.jpg||http://feedproxy.google.com/~r/ICanHasCheezburger/~3/43qwiPfzKOY/||comic]
			var m = this.STATUS_IMAGE_RE.exec(data.text);
			if(m) {
				data.original_pic = m[2];
				data.thumbnail_pic = m[1];
				data.bmiddle_pic = m[2];
				data.text = data.text.replace(m[0], '');
			} else {
				m = this.STATUS_IMAGE_RE2.exec(data.text);
				if(m) {
					data.original_pic = m[0];
					data.thumbnail_pic = 'http://images.plurk.com/tn_' + m[1] + '.gif';
					data.bmiddle_pic = m[0];
					data.text = data.text.replace(m[0], '');
				}
			}
			data.id = data.plurk_id;
			data.created_at = data.posted;
			delete data.posted;
			delete data.plurk_id;
			delete data.content;
			delete data.content_raw;
		} else if(play_load == 'comment') {
			data.text = data.content_raw;
			data.created_at = data.posted;
			delete data.content;
			delete data.content_raw;
		}
		return data;
	}
});

var TumblrAPI = Object.inherits({}, sinaApi, {
	config: Object.inherits({}, sinaApi.config, {
		host: 'http://www.tumblr.com/api',
		source: '',
		result_format: '',
        userinfo_has_counts: false, //用户信息中是否包含粉丝数、微博数等信息
        support_counts: false,
        support_repost: true,
        support_repost_timeline: false, // 支持查看转发列表
		support_cursor_only: true,  // 只支持游标方式翻页
		support_mentions: false,
		support_direct_messages: false,
		support_auto_shorten_url: false,
		need_processMsg: false,
		user_timeline_need_friendship: false,
		
		verify_credentials: '/authenticate'
	}),
	
	apply_auth: function(url, args, user) {
		args.data.email = user.userName;
		args.data.password = user.password;
		args.type = 'post';
	}
});

var TSinaAPI = WeiboAPI = sinaApi;

var T_APIS = {
	'tsina': TSinaAPI,
	'tqq': TQQAPI,
	'tsohu': TSohuAPI,
	'digu': DiguAPI,
	'zuosa': ZuosaAPI,
	'leihou': LeiHouAPI,
	'follow5': Follow5API,
	't163': T163API,
	'fanfou': FanfouAPI,
	'renjian': RenjianAPI,
	'douban': DoubanAPI,
	'renren': RenrenAPI,
	'buzz': BuzzAPI,
	'facebook': FacebookAPI,
	'plurk': PlurkAPI,
    'identi_ca': StatusNetAPI,
    'tumblr': TumblrAPI,
    'tianya': TianyaAPI,
    't_taobao': TaobaoStatusNetAPI,
	'twitter': TwitterAPI // fxxx gxfxw first.
};


// 封装兼容所有微博的api，自动判断微博类型
var tapi = {

    // 自动判断当前用户所使用的api, 根据user.blogType判断
    api_dispatch: function(data) {
		return T_APIS[(data.user ? data.user.blogType : data.blogType) || 'tsina'];
	},
	
	search: function(data, callback, context) {
		return tapi.api_dispatch(data).search(data, callback, context);
	},
	
	user_search: function(data, callback, context) {
		return tapi.api_dispatch(data).user_search(data, callback, context);
	},
	
	translate: function(user, text, target, callback, context) {
		return tapi.api_dispatch(user).translate(text, target, callback, context);
	},
	
	processMsg: function(user, str_or_status, not_encode) {
		return tapi.api_dispatch(user).processMsg(str_or_status, not_encode);
	},

    get_config: function(user) {
		return this.api_dispatch(user).config;
	},
	
	get_authorization_url: function(user, callback, context) {
		return this.api_dispatch(user).get_authorization_url(user, callback, context);
	},
	
	get_access_token: function(user, callback, context) {
		return this.api_dispatch(user).get_access_token(user, callback, context);
	},
	
	verify_credentials: function(user, callback, data, context) {
	    return this.api_dispatch(user).verify_credentials(user, callback, data, context);
	},
        
    rate_limit_status: function(data, callback, context){
	    return this.api_dispatch(data).rate_limit_status(data, callback, context);
	},

	// since_id, max_id, count, page 
	friends_timeline: function(data, callback, context){
		return this.api_dispatch(data).friends_timeline(data, callback, context);
	},
	
	// id, user_id, screen_name, since_id, max_id, count, page 
	user_timeline: function(data, callback, context){
		return this.api_dispatch(data).user_timeline(data, callback, context);
	},
	
	// id, count, page
	comments_timeline: function(data, callback, context){
		return this.api_dispatch(data).comments_timeline(data, callback, context);
	},
	
	// id, count, page, since_id, max_id
    repost_timeline: function(data, callback, context){
		return this.api_dispatch(data).repost_timeline(data, callback, context);
	},
	
	// since_id, max_id, count, page 
	mentions: function(data, callback, context){
		return this.api_dispatch(data).mentions(data, callback, context);
	},
	
	// id, user_id, screen_name, cursor, count
	followers: function(data, callback, context){
		return this.api_dispatch(data).followers(data, callback, context);
	},
	
	// id, user_id, screen_name, cursor, count
	/**
	 * 获取关注人列表
	 * 
	 * cursor: 用于分页请求，请求第1页cursor传-1，
	 *  在返回的结果中会得到next_cursor字段，
	 *  表示下一页的cursor。next_cursor为0表示已经到记录末尾。
	 * 返回值格式 data = {users: [], next_cursor: xx}
	 */
	friends: function(data, callback, context){
		return this.api_dispatch(data).friends(data, callback, context);
	},
	
	// page
	favorites: function(data, callback, context){
		return this.api_dispatch(data).favorites(data, callback, context);
	},
	
	// id
	favorites_create: function(data, callback, context){
		return this.api_dispatch(data).favorites_create(data, callback, context);
	},
	
	// id
	favorites_destroy: function(data, callback, context){
		return this.api_dispatch(data).favorites_destroy(data, callback, context);
	},
	
	// ids
	counts: function(data, callback, context){
		return this.api_dispatch(data).counts(data, callback, context);
	},
	
	// id
	user_show: function(data, callback, context){
		return this.api_dispatch(data).user_show(data, callback, context);
	},
	
	// since_id, max_id, count
	direct_messages: function(data, callback, context){
		return this.api_dispatch(data).direct_messages(data, callback, context);
	},
	
	// since_id, max_id, count
	sent_direct_messages: function(data, callback, context){
		return this.api_dispatch(data).sent_direct_messages(data, callback, context);
	},
	
	// id
	destroy_msg: function(data, callback, context){
		return this.api_dispatch(data).destroy_msg(data, callback, context);
	},
	
	new_message: function(data, callback, context){
		return this.api_dispatch(data).new_message(data, callback, context);
	},
	
	update: function(data, callback, context){
		return this.api_dispatch(data).update(data, callback, context);
	},
	
	upload: function(user, data, pic, before_request, 
			onprogress, callback, context){
		return this.api_dispatch(user).upload(user, data, pic, 
				before_request, onprogress, callback, context);
	},
	
	repost: function(data, callback, context){
		return this.api_dispatch(data).repost(data, callback, context);
	},
	
	comment: function(data, callback, context){
		return this.api_dispatch(data).comment(data, callback, context);
	},
	
	reply: function(data, callback, context){
		return this.api_dispatch(data).reply(data, callback, context);
	},
	
	comments: function(data, callback, context){
		return this.api_dispatch(data).comments(data, callback, context);
	},
	
	// id
	comment_destroy: function(data, callback, context){
		return this.api_dispatch(data).comment_destroy(data, callback, context);
	},
	
	friendships_create: function(data, callback, context){
		return this.api_dispatch(data).friendships_create(data, callback, context);
	},
	
	// id
	friendships_destroy: function(data, callback, context){
		return this.api_dispatch(data).friendships_destroy(data, callback, context);
	},
	
	friendships_show: function(data, callback, context){
		return this.api_dispatch(data).friendships_show(data, callback, context);
	},
	
	// type
	reset_count: function(data, callback, context){
		return this.api_dispatch(data).reset_count(data, callback, context);
	},
    
    // id
	retweet: function(data, callback, context){
		return this.api_dispatch(data).retweet(data, callback, context);
	},
	
	// id
	destroy: function(data, callback, context){
		return this.api_dispatch(data).destroy(data, callback, context);
	},
	
	// user_id, count, page
    tags: function(data, callback, context) {
    	return this.api_dispatch(data).tags(data, callback, context);
    },
    
    // count, page
    tags_suggestions: function(data, callback, context) {
    	return this.api_dispatch(data).tags_suggestions(data, callback, context);
    },
    
    // tags
    create_tag: function(data, callback, context) {
    	return this.api_dispatch(data).create_tag(data, callback, context);
    },
    
    // tag_id
    destroy_tag: function(data, callback, context) {
    	return this.api_dispatch(data).destroy_tag(data, callback, context);
    },
    
    // id
    status_show: function(data, callback, context) {
    	return this.api_dispatch(data).status_show(data, callback, context);
    },
    
    // str
    findSearchText: function(user, str) {
    	return this.api_dispatch(user).findSearchText(str);
    },
    
    // str
    formatSearchText: function(user, str) {
    	return this.api_dispatch(user).formatSearchText(str);
    }
};

// 微盘api, http://vdisk.me/api/doc
var VDiskAPI = {
//	appkey: '306790',
//	app_secret: 'c26f2cc9138bb726bfcac1311cbd39bb',
	appkey: '243370',
    app_secret: 'ead5d2e0987e60ef43b2c9d80a893326',
	URL_GET_TOKEN: 'http://openapi.vdisk.me/?m=auth&a=get_token',
	URL_KEEP_TOKEN: 'http://openapi.vdisk.me/?m=user&a=keep_token',
	URL_UPLOAD_FILE: 'http://openapi.vdisk.me/?m=file&a=upload_file',
	URL_UPLOAD_SHARE_FILE: 'http://openapi.vdisk.me/?m=file&a=upload_share_file',
	
	_sha256: function(basestring) {
	 	return HMAC_SHA256_MAC(this.app_secret, basestring);
	},
	
	/* http://openapi.vdisk.me/?m=auth&a=get_token
	 * POST
	 * 
	 * account: 帐号
	 * password: 密码
	 * appkey: 您的appkey
	 * time: 当前的时间戳, time((time_t*)NULL) 
	 * signature: 动态签名, hmac_sha256("account=相应的值&appkey=相应的值&password=相应的值&time=相应的值", app_secret)
	 * 		PHP实例: $signature = hash_hmac('sha256', "account={$account}&appkey={$appkey}&password={$password}&time={$time}", $app_secret, false);
	 * 可选:
	 * app_type: 登录类型, 如: app_type=sinat (注意: 目前支持微博帐号)
	 */
	
	get_token: function(user, callback, context) {
		//user = {username: 'fengmk2@gmail.com', password: '112358', app_type: 'sinat'};
		var params = {
			account: user.username,
			password: user.password,
			appkey: this.appkey,
			app_type: user.app_type,
			time: new Date().getTime().toString().substring(0, 10) //10位
		};
		//params.time = Math.floor(new Date().getTime() / 1000);
		var basestring = 'account={{account}}&appkey={{appkey}}&password={{password}}&time={{time}}'.format(params);
		params.signature = this._sha256(basestring);
        $.ajax({
            url: this.URL_GET_TOKEN,
            type: 'post',
            dataType: 'json',
            data: params,
            success : function(data) {
                var error = null, result = null;
                if(data.err_code === 0) {
                    result = data.data;
                } else {
                    error = new Error(data.err_msg);
                }
                callback.call(context, error, result);
            },
            error: function(xhr, text_status, err) {
                callback.call(context, err);
            }
        });
    },
    upload: function(user, fileobj, callback, onprogress, context) {
        this.get_token(user, function(err, result){
            if(err) {
                return callback.call(context, err);
            }
            this._upload({token: result.token}, fileobj, callback, onprogress, context);
        }, this);
    },
    _upload: function(data, fileobj, callback, onprogress, context) {
        data.dir_id = '0';
        data.cover = 'yes';
        var blobbuilder = build_upload_params(data, fileobj);
        $.ajax({
            url: this.URL_UPLOAD_SHARE_FILE,
            data: blobbuilder.getBlob(),
            type: 'post',
            dataType: 'json',
            contentType: blobbuilder.contentType,
            processData: false,
            beforeSend: function(req) {
                if(onprogress) {
                    if(req.upload){
                        req.upload.onprogress = function(ev){
                            onprogress(ev);
                        };
                    }
                }
            },
            success: function(data) {
                // download_page: "http://vdisk.me/?m=share&a=download&ss=1d80JHmqxQlFxKbVpbeiKU4keIqEXUeIiT8OTwIC8NPZJY4RJq5dIcihXenhO7WkmfgHaMkVY3Zm5p5L5w"
                var error = null, result = null;
                if(data.err_code === 0) {
                    result = data.data;
                } else {
                    error = new Error(data.err_msg);
                }
                callback.call(context, error, result);
            },
            error: function(xhr, status, err) {
                callback.call(context, err);
            }
        });
    }
};

/**
 * http://www.instapaper.com/api/simple
 * 
 * @type Object
 */
var Instapaper = {
	
	request: function(user, url, data, callback, context){
		var headers = {};
		if(user) {
			headers = {Authorization: make_base_auth_header(user.username, user.password)};
		}
		$.ajax({
			url: url,
			data: data,
			timeout: 60000,
			type: 'post',
			beforeSend: function(req) {
		    	for(var k in headers) {
		    		req.setRequestHeader(k, headers[k]);
	    		}
	        },
			success: function(data, text_status, xhr){
	        	callback.call(context, text_status == 'success', text_status, xhr);
			},
			error: function(xhr, text_status, err){
				callback.call(context, false, text_status, xhr);
			}
		});
	},
	
	authenticate: function(user, callback, context) {
		var api = 'https://www.instapaper.com/api/authenticate';
		this.request(user, api, {}, callback, context);
	},
	
	add: function(user, data, callback, context){
		var api = 'https://www.instapaper.com/api/add';
		this.request(user, api, data, callback, context);
	}
};

/**
 * Read It Later: http://readitlaterlist.com/api/docs/
 */
var ReadItLater = {
	apikey: '5bOAabomd1c6eRl363pQy55JaNTMBf20',
	request: Instapaper.request,
	// https://readitlaterlist.com/v2/auth?username=name&password=123&apikey=yourapikey
	authenticate: function(user, callback, context) {
		var api = 'https://readitlaterlist.com/v2/auth';
		user.apikey = this.apikey;
		this.request(null, api, user, callback, context);
	},
	// https://readitlaterlist.com/v2/add?username=name&password=123&apikey=yourapikey&url=http://google.com&title=Google
	add: function(user, data, callback, context){
		var api = 'https://readitlaterlist.com/v2/add';
		data.username = user.username;
		data.password = user.password;
		data.apikey = this.apikey;
		this.request(null, api, data, callback, context);
	}
};


/**
 * 新浪微博mid与url互转实用工具
 * 作者: XiNGRZ (http://weibo.com/xingrz)
 */

var WeiboUtil = {
    // 62进制字典
    str62keys: [
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
        "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
        "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
    ],
};

/**
 * 62进制值转换为10进制
 * @param {String} str62 62进制值
 * @return {String} 10进制值
 */
WeiboUtil.str62to10 = function(str62) {
	var i10 = 0;
	for (var i = 0; i < str62.length; i++)
	{
		var n = str62.length - i - 1;
		var s = str62[i];
		i10 += this.str62keys.indexOf(s) * Math.pow(62, n);
	}
	return i10;
};

/**
 * 10进制值转换为62进制
 * @param {String} int10 10进制值
 * @return {String} 62进制值
 */
WeiboUtil.int10to62 = function(int10) {
	var s62 = '';
	var r = 0;
	while (int10 != 0 && s62.length < 100) {
		r = int10 % 62;
		s62 = this.str62keys[r] + s62;
		int10 = Math.floor(int10 / 62);
	}
	return s62;
};

/**
 * URL字符转换为mid
 * @param {String} url 微博URL字符，如 "wr4mOFqpbO"
 * @return {String} 微博mid，如 "201110410216293360"
 */
WeiboUtil.url2mid = function(url) {
	var mid = '';
	
	for (var i = url.length - 4; i > -4; i = i - 4)	//从最后往前以4字节为一组读取URL字符
	{
		var offset1 = i < 0 ? 0 : i;
		var offset2 = i + 4;
		var str = url.substring(offset1, offset2);
		
		str = this.str62to10(str);
		if (offset1 > 0)	//若不是第一组，则不足7位补0
		{
			while (str.length < 7)
			{
				str = '0' + str;
			}
		}
		
		mid = str + mid;
	}
	
	return mid;
};

/**
 * mid转换为URL字符
 * @param {String} mid 微博mid，如 "201110410216293360"
 * @return {String} 微博URL字符，如 "wr4mOFqpbO"
 */
WeiboUtil.mid2url = function(mid) {
    if(!mid) {
        return mid;
    }
    mid = String(mid); //mid数值较大，必须为字符串！
	if(!/^\d+$/.test(mid)){ return mid; }
	var url = '';
	
	for (var i = mid.length - 7; i > -7; i = i - 7)	//从最后往前以7字节为一组读取mid
	{
		var offset1 = i < 0 ? 0 : i;
		var offset2 = i + 7;
		var num = mid.substring(offset1, offset2);
		
		num = this.int10to62(num);
		url = num + url;
	}
	
	return url;
};