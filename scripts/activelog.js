// 活动记录
(function() {
	var ActiveLog = {
		api: 'http://s8.hk:4444/log',
		app: 'fawave',
		// chrome.extension.getURL('oauth_cb.html')
		// "chrome-extension://kdkhkblabbkmgfjfpbijlbijdemdodol/"
		uid: /\/\/(\w+)\//i.exec(chrome.extension.getURL(''))[1],
		log: function(active, params, cb) {
			params = params || {};
			params.active = active;
			params.app = this.app;
			params.uid = this.uid;
			$.get(this.api, params, cb || function() {});
		}
	};
	window.ActiveLog = ActiveLog;
})();