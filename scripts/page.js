//alert('hi');
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if(request.msgs && request.msgs.length>0){
        var msg_wrap = $("#fa_wave_msg_wrap");
        if(msg_wrap.length < 1){
            msg_wrap = $('<div id="fa_wave_msg_wrap"><a href="javascript:void(0)" class="close_fawave_remind">关闭</a><div class="fa_wave_list"></div></div>').appendTo('body');
            msg_wrap.find('.close_fawave_remind').click(function(){ close_fawave_remind(); });
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
    }
});

function builFawaveTip(msg){
    var user = msg.user || msg.sender;
    var tp = '<div class="msgRemind"><span class="username">'
            + user.screen_name + ': </span><span class="msg">'
            + msg.text + '</span></div>';
    return tp;
};

function close_fawave_remind(){
    $("#fa_wave_msg_wrap .fa_wave_list").html('');
    $("#fa_wave_msg_wrap").hide();
};
