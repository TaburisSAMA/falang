
```
// 监控
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	if(tab.url.indexOf(OAUTH_CALLBACK_URL) == 0) {
		var d = decodeForm(tab.url);
		var pin = d.oauth_verifier || 'impin';
		$('#account-pin').val(pin);
		$('#save-account').click();
		chrome.windows.remove(tab.windowId);
	}
});
```