
var TSohuAPI = $.extend({}, sinaApi, {
	config: {
		host: 'http://api.t.sohu.com',
		result_format: '.json',
		source: 'WbbRPziVG6', // 搜狐不是按key来限制的
	    source2: 'WbbRPziVG6', // other key
	    
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
	    user_show:            '/users/show/{{id}}'
	}
});

//TSohuAPI.verify_credentials({userName: 'fengmk2@gmail.com', 'password': '112358'}, 
//function(data) {
//	console.dir(data);
//});