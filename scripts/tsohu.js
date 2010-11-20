
var TSohuAPI = $.extend({}, sinaApi, {
	// 覆盖不同的参数
	config: $.extend(sinaApi.config, {
		host: 'http://api.t.sohu.com',
		source: 'WbbRPziVG6', // 搜狐不是按key来限制的
	    source2: 'WbbRPziVG6'
	})
});

//TSohuAPI.verify_credentials({userName: 'fengmk2@gmail.com', 'password': '112358'}, 
//function(data) {
//	console.dir(data);
//});