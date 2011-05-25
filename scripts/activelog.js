// 活动记录
(function() {
	var ActiveLog = {
		api: 'http://api.yongwo.de:9999/log',
		app: 'fawave',
		// chrome.extension.getURL('oauth_cb.html')
		// "chrome-extension://kdkhkblabbkmgfjfpbijlbijdemdodol/"
		uid: /\/\/(\w+)\//i.exec(chrome.extension.getURL(''))[1],
		version: chrome.app.getDetails().version,
		log: function(active, params, cb) {
			params = params || {};
			params.at = active;
			params.app = this.app;
			params.uid = this.uid;
			params.v = this.version;
			cb = cb || function() {};
			$.ajax({
				url: this.api, 
				data: params, 
				type: 'get',
				success: cb,
				error: cb,
				timeout: 10000
			});
		}
	};
	window.ActiveLog = ActiveLog;
})();