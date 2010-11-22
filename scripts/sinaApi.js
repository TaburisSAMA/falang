/*
* @author qleelulu@gmail.com
*/

var result_format = '.json';

var domain_sina = 'http://t.sina.com.cn';

var api_domain_sina = 'http://api.t.sina.com.cn';

var sinaApi = {
	config: {
		host: 'http://api.t.sina.com.cn',
		result_format: '.json',
		source: '3538199806',
        source2: '2721776383', // other key
        
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
        friendships_create:   '/friendships/create',
        friendships_destroy:  '/friendships/destroy',
        friendships_show:     '/friendships/show',
        reset_count:          '/statuses/reset_count',
        user_show:            '/users/show/{{id}}',

        detailUrl:        domain_sina + '/jump?aid=detail&twId=',
        searchUrl:        domain_sina + '/search/'
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
	
	// since_id, max_id, count, page 
	friends_timeline: function(data, callbackFn){
		if(!callbackFn) return;
        var params = {
            url: this.config.friends_timeline,
            type: 'get',
            source: this.config.source2,
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
            source: this.config.source2,
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
            source: this.config.source2,
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
            source: this.config.source2,
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
            source: this.config.source2,
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
    
	// 格式上传参数，方便子类覆盖做特殊处理
    // 子类可以增加自己的参数
    format_update_params: function(data) {
    	
    },
    
    update: function(data, callbackFn){
        if(!callbackFn) return;
        this.format_update_params(data);
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
		    builder += encodeURIComponent(data[key]);
		    builder += crlf;
		    
		    /* Write boundary. */
		    builder += dashdash;
		    builder += boundary;
		    builder += crlf;
	    }
	    
	    /* Generate headers. [PIC] */            
	    builder += 'Content-Disposition: form-data; name="' + pic.keyname + '"';
	    if(pic.file.fileName) {
	      builder += '; filename="' + encodeURIComponent(pic.file.fileName) + '"';
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
		var url = this.config.host + this.config.upload + this.config.result_format;
	    $.ajax({
	        url: url,
	        username: user.userName,
	        password: user.password,
	        cache: false,
	        timeout: 5*60*1000, //5分钟超时
	        type : 'post',
	        data: bb.getBlob(),
	        dataType: 'text',
	        contentType: 'multipart/form-data; boundary=' + boundary,
	        processData: false,
	        beforeSend: function(req) {
	            req.setRequestHeader('Authorization', make_base_auth_header(user.userName, user.password));
	            if(onprogress) {
	            	if(req.upload){
		                req.upload.onprogress = function(ev){
		                    onprogress(ev);
		                };
		            }
	            }
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
    
    _sendRequest: function(params, callbackFn) {
    	var args = {type: 'get', play_load: 'status'};
    	
    	$.extend(args, params);
    	args.data = args.data || {};
    	args.data.source = args.data.source || this.config.source;
    	if(!args.url) {
    		showMsg('url未指定');
            callbackFn({}, 'error', '400');
            return;
    	}
    	var url = this.config.host + args.url.format(args.data) + this.config.result_format;
    	if(!callbackFn) return;
        var user = args.user || args.data.user || localStorage.getObject(CURRENT_USER_KEY);
        if(args.data && args.data.user) delete args.data.user;
        if(!user){
            showMsg('用户未指定');
            callbackFn({}, 'error', '400');
            return;
        }
        if(args.data.status){
        	args.data.status = encodeURIComponent(args.data.status);
        }
        if(args.data.comment){
        	args.data.comment = encodeURIComponent(args.data.comment);
        }
        var $this = this;
        var play_load = args.play_load; // 返回的是什么类型的数据格式
        delete args.play_load;
        $.ajax({
            url: url,
            username: user.userName,
            password: user.password,
//            cache: false, // chrome不会出现ie本地cache的问题, 若url参数带有_=xxxxx，digu无法获取完整的用户信息
            timeout: 60*1000, //一分钟超时
            type: args.type,
            data: args.data,
            dataType: 'text',
            beforeSend: function(req) {
                req.setRequestHeader('Authorization', make_base_auth_header(user.userName, user.password));
            },
            success: function (data, textStatus) {
                try{
                    data = JSON.parse(data);
                }
                catch(err){
                    data = {error:'服务器返回结果错误，本地解析错误。' + err, error_code:500};
                    textStatus = 'error';
                }
                var error_code = null;
                if(data){
                    if(data.error || data.error_code){
                        showMsg('error: ' + (data.error || data.wrong) + ', error_code: ' + data.error_code);
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
var TSohuAPI = $.extend({}, sinaApi);

$.extend(TSohuAPI, {
	// 覆盖不同的参数
	config: $.extend({}, sinaApi.config, {
		host: 'http://api.t.sohu.com',
		source: 'WbbRPziVG6', // 搜狐不是按key来限制的
	    source2: 'WbbRPziVG6',
	    
	    mentions: '/statuses/mentions_timeline'
	}),
	
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
	    
	    verify_credentials:   '/account/verify',
	    
	    mentions:             '/statuses/replies',
	    
	    destroy_msg:          '/messages/handle/destroy/{{id}}',
        direct_messages:      '/messages/100', // message ：0 表示悄悄话，1 表示戳一下，2 表示升级通知，3 表示代发通知，4 表示系统消息。100表示不分类，都查询。其余参数跟
        new_message:          '/messages/handle/new',
        upload: 			  '/statuses/update'
	}),
	
	counts: function(data, callback) {
	
	},
	
	verify_credentials: function(user, callbackFn, data){
		data = data || {};
		data.isAllInfo = true;
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
	
	/* content[可选]：更新的Digu消息内容， 请确定必要时需要进行UrlEncode编码，另外，不超过140个中文或者英文字。
	 */
	format_update_params: function(data) {
    	data.content = data.status;
    	delete data.status;
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
	
	friends: function(data, callbackFn) {
		this.followers_or_friends(this.config.friends, data, callbackFn);
	},
	
	// id, user_id, screen_name, cursor, count
    followers: function(data, callbackFn){
		this.followers_or_friends(this.config.followers, data, callbackFn);
	},
	
	followers_or_friends: function(url, data, callbackFn) {
		// cursor. 选填参数. 单页只能包含100个粉丝列表，为了获取更多则cursor默认从-1开始，
		// 通过增加或减少cursor来获取更多的，如果没有下一页，则next_cursor返回0
		data.page = data.cursor == -1 ? 1 : data.cursor;
		delete data.cursor;
		if(!data.page) {
			data.page = 1;
		}
		//data.count = data.count || 20;
		delete data.user_id;
		if(!callbackFn) return;
        var params = {
            url: url,
            type: 'get',
            play_load: 'user',
            data: data
        };
        this._sendRequest(params, callbackFn);
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
				this.format_result_item(data.retweeted_status.user, 'user', args);
			}
			this.format_result_item(data.user, 'user', args)
		} else if(play_load == 'user' && data && data.id) {
			data.t_url = data.url || ('http://digu.com/' + (data.name || data.id));
		} else if(play_load == 'comment') {
			this.format_result_item(data.user, 'user', args)
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
	    source2: 'fawave',
	    upload: '/statuses/update'
	}),
	
	counts: function(data, callback) {
	
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
	    		callbackFn(data, textStatus, error_code);
	    	}
	    });
	},
	
	friends: function(data, callbackFn) {
		this.followers_or_friends(this.config.friends, data, callbackFn);
	},
	
	// id, user_id, screen_name, cursor, count
    followers: function(data, callbackFn){
		this.followers_or_friends(this.config.followers, data, callbackFn);
	},
	
	followers_or_friends: function(url, data, callbackFn) {
		// cursor. 选填参数. 单页只能包含100个粉丝列表，为了获取更多则cursor默认从-1开始，
		// 通过增加或减少cursor来获取更多的，如果没有下一页，则next_cursor返回0
		data.page = data.cursor == -1 ? 1 : data.cursor;
		delete data.cursor;
		if(!data.page) {
			data.page = 1;
		}
		//data.count = data.count || 20;
		delete data.user_id;
		if(!callbackFn) return;
        var params = {
            url: url,
            type: 'get',
            play_load: 'user',
            data: data
        };
        this._sendRequest(params, callbackFn);
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
				this.format_result_item(data.retweeted_status.user, 'user', args);
			}
			this.format_result_item(data.user, 'user', args)
		} else if(play_load == 'user' && data && data.id) {
			data.t_url = 'http://zuosa.com/' + (data.screen_name || data.name);
		} 
		else if(play_load == 'comment') {
			this.format_result_item(data.user, 'user', args)
		} else if(play_load == 'message') {
			this.format_result_item(data.sender, 'user', args);
			this.format_result_item(data.recipient, 'user', args);
		}
		return data;
	}
});

var T_APIS = {
	'tsina': sinaApi,
	'tsohu': TSohuAPI,
	'digu': DiguAPI,
	'zuosa': ZuosaAPI
};


// 封装兼容所有微博的api，自动判断微博类型
var tapi = {
	// 自动判断当前用户所使用的api, 根据user.blogType判断
    // tapi.g('fridens_timeline')(data, function(){})
	g: function(data, method_name){
        return T_APIS[(data.user ? data.user.blogType : data.blogType) || 'tsina'][method_name];
    },
    // 自动判断当前用户所使用的api, 根据user.blogType判断
    api_dispatch: function(data) {
		return T_APIS[(data.user ? data.user.blogType : data.blogType) || 'tsina'];
	},
	
	verify_credentials: function(user, callbackFn, data){
	    return this.api_dispatch(user).verify_credentials(user, callbackFn, data);
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