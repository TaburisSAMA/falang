// 活动记录
(function() {
	if(window.ActiveLog) {
		return;
	}
	var ActiveLog = {
		api: 'http://api.yongwo.de:9999/log',
		app: 'fawave',
		// chrome.extension.getURL('oauth_cb.html')
		// "chrome-extension://kdkhkblabbkmgfjfpbijlbijdemdodol/"
		uid: null,
		version: 'null',
		log: function(active, params, cb) {
			params = params || {};
			if(!this.uid) {
				var settings = Settings.get();
				if(settings && !settings.uid) {
					settings.uid = UUID.uuid4();
					Settings.save();
				}
				this.uid = settings.uid;
			}
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
	try {
		ActiveLog.version = chrome.app.getDetails().version;
	} catch(e) {
		$.get(chrome.extension.getURL('manifest.json'), function(info){
			ActiveLog.version = info.version;
		}, 'json');
	}
	window.ActiveLog = ActiveLog;
})();