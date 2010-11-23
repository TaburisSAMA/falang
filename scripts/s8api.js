// @author qleelulu@gmail.com
//Need jQuery
//s8.hk's api see: http://code.google.com/p/s8hk-api/wiki/ApiDocumentation

var s8_host = 'http://s8.hk';

var SOURCE = 'i嘀';//URL来源

var s8Api = {};

//====缩短URL======
//=================
var shorten_default = { //缩短URL API的默认参数
    longUrl: '',
    source: SOURCE,
    format: 'json',
    heart: ''
};

s8Api.shorten = function(params, success_fn, error_fn){
    var opts = $.extend(shorten_default, params);
    if(!opts.longUrl){ return false; }

    var url = s8_host + '/api/shorten?longUrl=' + encodeURIComponent(opts.longUrl);
    if(opts.source){ url = url + '&source=' + encodeURIComponent(opts.source); }
    if(opts.format){ url = url + '&format=' + opts.format; }
    if(opts.heart){ url = url + '&heart=' + opts.heart; }

    getResult(url, success_fn, error_fn);
};

//====缩短多个URL======
//=================
var multshorten_default = { //缩短多个URL API的默认参数
    longurls: '',
    source: SOURCE,
    format: 'json'
};

s8Api.multshorten = function(params){
    var opts = $.extend(multshorten_default, params);
    if(!opts.longurls){ return false; }

    var url = s8_host + '/api/multshorten?longurls=' + encodeURIComponent(opts.longurls);
    if(opts.source){ url = url + '&source=' + encodeURIComponent(opts.source); }
    if(opts.format){ url = url + '&format=' + opts.format; }
};

//====还原URL======
//=================
var expand_default = { //还原URL API的默认参数
    shortUrl: '',
    format: 'json'
};

s8Api.expand = function(params){
    var opts = $.extend(expand_default, params);
    if(!opts.shortUrl){ return false; }

    var url = s8_host + '/api/expand?shortUrl=' + encodeURIComponent(opts.shortUrl);
    if(opts.format){ url = url + '&format=' + opts.format; }
};



function getResult(full_url, success_fn, error_fn){
    showLoading();
    $.ajax({
        url: full_url,
        type: 'get',
        dataType: 'json',
        timeout: 1000*5, //5秒
        success:function(data,textStatus){
            hideLoading();
            if(success_fn){
                success_fn(data,textStatus);
            }else{
                return data;
            }
        },
        error:function(xhr, textStatus, errorThrown){
            showMsg('eror');
            hideLoading();
            //if (textStatus == 'parsererror')
            if(error_fn){
                error_fn(xhr, textStatus, errorThrown);
            }
        }
    });
}