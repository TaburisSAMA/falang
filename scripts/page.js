// @author qleelulu@gmail.com
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if(request.msgs && request.msgs.length>0){
        var msg_wrap = $("#fa_wave_msg_wrap");
        if(msg_wrap.length < 1){
            msg_wrap = $('<div id="fa_wave_msg_wrap"><a href="javascript:void(0)" class="close_fawave_remind">关闭</a><div class="fa_wave_list"></div></div>').appendTo('body');
            msg_wrap.find('.close_fawave_remind').click(function(){ close_fawave_remind(); });
            msg_wrap.hover(function(){
                $("#fa_wave_msg_wrap .fa_wave_list > div").stop(true).css('opacity', '1.0');
            }, function(){
                $("#fa_wave_msg_wrap .fa_wave_list > div")
                      .fadeOut('slow', function() {
                          $(this).remove();
                          if(!$("#fa_wave_msg_wrap .fa_wave_list").html()){
                              $("#fa_wave_msg_wrap").hide();
                          }
                      });
            });
        }
        var msg_list_wrap = msg_wrap.find('.fa_wave_list');
        var len = request.msgs.length>5 ? 5 : request.msgs.length;
        var showCount = 0;//已经提示的信息数
        var _msg_user = null;
        for(var i=0; i<request.msgs.length; i++){
            _msg_user = request.msgs[i].user || request.msgs[i].sender;
            if(_msg_user.id != request.userId){
                showCount += 1;
                if(showCount == 1){msg_wrap.show();}//有可显示的信息，就显示
                $(builFawaveTip(request.msgs[i]))
                    .appendTo(msg_list_wrap)
                    .fadeIn('slow')
                    .animate({opacity: 1.0}, 8000)
                    .fadeOut('slow', function() {
                      $(this).remove();
                      if(!msg_list_wrap.html()){
                          msg_wrap.hide();
                      }
                    });
                if(showCount >= 5){break;}
            }
        }
        if(!msg_list_wrap.html()){
            msg_wrap.hide();
        }
    }
});

function builFawaveTip(msg){
    var user = msg.user || msg.sender;
    var picHtml = '', rtHtml = '';
    if(msg.thumbnail_pic){
        picHtml = '<div> <img class="imgicon pic" src="' + msg.thumbnail_pic + '" /> </div>';
    }
    if(msg.retweeted_status){
        rtHtml =  '<div class="retweeted"><span class="username">' + msg.retweeted_status.user.screen_name + ': </span>'
                + msg.retweeted_status.text;
        if(msg.retweeted_status.thumbnail_pic){
            rtHtml += '<div> <img class="imgicon pic" src="' + msg.retweeted_status.thumbnail_pic + '" /> </div>';
        }
        rtHtml += '</div>';
    }
    var tp =  '<div class="msgRemind">'
            + '  <div class="usericon">'
            + '	   <img src="' + user.profile_image_url.replace('24x24', '48x48') + '" />'
            + '  </div>'
            + '  <div class="maincontent">'
            + '    <div class="msg">'
            + '       <span class="username">' + user.screen_name + ': </span>'
            +         msg.text + picHtml 
            + '    </div>'
            +      rtHtml
            + '  </div>'
            + '</div>';
    return tp;
};

function close_fawave_remind(){
    $("#fa_wave_msg_wrap .fa_wave_list").html('');
    $("#fa_wave_msg_wrap").hide();
};

/*
<li class="tweetItem showCounts_${status.id}" id="tweet${status.id}" did="${status.id}">
	<div class="usericon">
		<a target="_blank" href="" title="">
			<img src="${status.user.profile_image_url.replace('24x24', '48x48')}" />
		</a>
	</div>
	<div class="mainContent">
		<div class="userName">
			<a target="_blank" href="" title="">${status.user.screen_name}</a>
		</div>
		<div class="msg">
			<div class="tweet">${status.text}
				<?py if(status.thumbnail_pic): ?>
				<div>
					<a target="_blank" onclick="showFacebox(this);return false;" href="javascript:void(0);" bmiddle="#{status.bmiddle_pic}" >
						<img class="imgicon pic" src="#{status.thumbnail_pic}" />
					</a>
				</div>
				<?py #endif ?>
			</div>
		</div>
		<div class="retweet"></div>
		<div class="msgInfo">${status.created_at} 通过 #{status.source}</div>
	</div>
</li>
*/