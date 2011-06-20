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