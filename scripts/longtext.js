/**
 * @author qleelulu@gmail.com, fengmk2@gmail.com
 */ 

var LongTextPage = {
	init: function() {
		initOnLoad(); // upimage.js
		
		// 绑定longtext参数
		
		var $font_size = $('#font_size')
		  , $font_family = $('#font_family')
		  , $font_bold = $('#font_bold')
		  , $longtext = $('#longtext');
		$font_size.change(function() {
			$('#longtext').css('font-size', $(this).val() + 'px');
		});
		$font_family.change(function() {
			$('#longtext').css('font-family', $(this).val());
		});
		$font_bold.change(function() {
			$('#longtext').css('font-weight', $(this).attr('checked') ? 'bold' : 'normal');
		});
		
		// 设置基本参数
		var font_size = parseInt($('#longtext').css('font-size'))
		  , font_family = $('body').css('font-family');
		if(font_family[0] === "'") {
			// 去除 '宋体' 的单引号
			font_family = font_family.substring(1, font_family.length - 1);
		}
		$font_size.val(font_size);
		$font_family.val(font_family);
		$longtext.css('font-family', font_family);
		
		$('#btnPrevLongText').click(this._prev_button_click);
		$('#doing').click(this._share_current_page_click);
	}, 
	_prev_button_click: function() {
		var $longtext = $('#longtext')
		  , $longtextPreview = $('#longtextPreview')
		  , $btn = $(this);
		if($longtextPreview.is(':hidden')) {
			$longtextPreview.html($('<img />').attr('src', LongTextPage.get_data_url()));
			$btn.val($btn.attr('edit_text'));
		} else {
			$btn.val($btn.attr('prev_text'));
		}
		$longtextPreview.toggle();
		$longtext.toggle();
	},
	_share_current_page_click: function() {
		var params = decodeForm(window.location.search);
		if(params.windowId) {
			params.windowId = parseInt(params.windowId);
		}
		chrome.tabs.getSelected(params.windowId, function(tab){
            var loc_url = tab.url;
            if(loc_url){
            	var title = tab.title || '';
                var $txt = $("#txtContent");
                var settings = Settings.get();
                $txt.val(formatText(settings.lookingTemplate, {title: title, url: loc_url}));
                $txt.data('source_url', '').data('short_url', '');
                _shortenUrl(loc_url, settings, function(shorturl){
		            if(shorturl) {
		            	var $txt = $("#txtContent");
		                $txt.val($txt.val().replace(loc_url, shorturl));
		                // 记录下原始url
		                $txt.data('source_url', loc_url).data('short_url', shorturl);
		            }
		        });
            } else {
                showMsg(_u.i18n("msg_wrong_page_url"));
            }
        });
	},
	get_data_url: function() {
		var $longtext = $('#longtext');
		var options = {
			font_size: parseInt($longtext.css('font-size')),
			font_family: $longtext.css('font-family'),
			font_weight: $longtext.css('font-weight'),
			width: $longtext.width()
		};
		return TextImage.draw($longtext.val(), options);
	}
};