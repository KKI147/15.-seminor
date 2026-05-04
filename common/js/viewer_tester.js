// tester
var ua = navigator.userAgent;
const topWrapper = $('#wrap');

topWrapper.append('<div class="console"></div>');
topWrapper.find('.console').css({
    'left': '0',
    'top': '0',
    'position': 'absolute',
    'width': '100%',
    'padding': '20px',
    'z-index': '999',
    'background': 'rgba(0, 0, 0, 0.5)',
    'border': '2px solid #000',
    'font-size': '14px',
    'color': '#fff',
    'pointer-events': 'none',
});
topWrapper.append('<button class="consoleClear">CLEAR</button>');
topWrapper.find('.consoleClear').css({
    'background': 'rgba(200, 200, 200, 0.7)',
    'width': '50px',
    'height': '30px',
    'position': 'absolute',
    'left': 0,
    'top': 0,
    'display': 'flex',
    'justify-content': 'center',
    'align-items': 'center',
    'z-index': 9999,
    'cursor': 'pointer',
    'border-radius': '10px',
    'font-size': '13px',
    'line-height': '20px',
    'font-weight': 'bolder',
}).on('click', function () {
    topWrapper.find('.console').empty();
    loglog(ua);
});

function loglog(psMsg) {
    topWrapper.find('.console').append(psMsg + '<br/>');
}
function error(psMsg) {
    //topWrapper.find('.console').append(psMsg);
	topWrapper.find('.console').append('<span style="color: #ff0000; font-size: inherit;">' + psMsg + '</span>');
    // topWrapper.find('.console div').css('color', '#fff');
}
//https://javascript.info/onload-onerror
window.onerror = function (errorMsg, url, lineNumber) {
    var html = 'Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber + '';
    error(html);
};
loglog(ua);
/////

/*
var user = navigator.userAgent;
$('#wrap').append('<div class="console"></div>');
$('#wrap').find('.console').css({
    'left': '0',
    'top': '0',
    'position': 'absolute',
    'width': '100%',
    'padding': '20px',
    'z-index': '999',
    'background': 'rgba(0, 0, 0, 0.5)',
    'border': '2px solid #000',
    'font-size': '18px',
    'color': '#fff'
});
function log(psMsg) {
    $('#wrap').find('.console').append(psMsg + '<br/>');
}
function error(psMsg) {
    //topWrapper.find('.console').append(psMsg);
    $('#wrap').find('.console').append('<span style="color: #ff0000; font-size: inherit;">' + psMsg + '</span>');
    // topWrapper.find('.console div').css('color', '#fff');
}
//https://javascript.info/onload-onerror
window.onerror = function (errorMsg, url, lineNumber) {
    var html = '<div>Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber + '</div>';
    error(html);
};
log(user);
/////
*/
