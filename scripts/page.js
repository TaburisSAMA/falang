//alert('hi');
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if(request.msgs && request.msgs.length>0){
        var msg_wrap = $("#fa_wave_msg_wrap");
        if(msg_wrap.length < 1){
            msg_wrap = $('<div id="fa_wave_msg_wrap"><a href="javascript:void(0)" onclick="close_fawave_remind();" class="close">X</a><div class="fa_wave_list"></div></div>').appendTo('body');
        }
        msg_wrap.show();
        var msg_list_wrap = msg_wrap.find('.fa_wave_list');
        var len = request.msgs.length>5 ? 5 : request.msgs.length;
        for(var i=0; i<len; i++){
            //msg_wrap.append(builTip(request.msgs[i]));
            $(builTip(request.msgs[i]))
                .appendTo(msg_list_wrap)
                .fadeIn('slow')
                .animate({opacity: 1.0}, 4000)
                .fadeOut('slow', function() {
                  $(this).remove();
                  if(!msg_list_wrap.html()){
                      msg_wrap.hide();
                  }
                });
        }
    }
});

function builTip(msg){
    var user = msg.user || msg.sender;
    var tp = '<div class="msgRemind"><span class="username">'
            + user.screen_name + ': </span><span class="msg">'
            + msg.text + '</span></div>';
    return tp;
}