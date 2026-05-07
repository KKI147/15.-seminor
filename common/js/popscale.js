
'use strict';

function loadScriptFile(scriptSrc, callBack) {
    var script = document.createElement('script');
    script.src = scriptSrc;
    if (callBack) {
        script.onload = function () {
            callBack();
        };
    }
    document.head.appendChild(script);
}

function run(callBack) {
    if (window.document) {
        if (window.document.readyState === "complete") {
            setTimeout(run);
        } else {
            window.addEventListener("load", completed, false);
        }
    }
    function completed() {
        window.removeEventListener("load", completed, false);
        callBack();
    }
}


loadScriptFile('common/js/responsive.js', function () { });

run(function () {
    var isAndroid = (/(android|webos|palm\sos|qnx|bada|rim\stablet\sos|meego|contiki|iphone|ipad|ipod|blackBerry|iemobile)[\/\s-]?([\w\.]+)*/i).test(navigator.userAgent);
    var wrap = document.querySelector('#wrap');
    var container = document.querySelector('#container');

    setTimeout(function () {
        FORTEACHERCD.responsive.currentContainerSize.containerWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        FORTEACHERCD.responsive.currentContainerSize.containerHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        FORTEACHERCD.responsive.setScaleElement(wrap);
        wrap.style.visibility = 'visible';
        container.style.visibility = 'visible';
    }, (isAndroid ? 500 : 0));

    window.addEventListener('resize', function () {
        setTimeout(function () {
            FORTEACHERCD.responsive.currentContainerSize.containerWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            FORTEACHERCD.responsive.currentContainerSize.containerHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            FORTEACHERCD.responsive.setScaleElement(wrap);
            wrap.style.visibility = 'visible';
            container.style.visibility = 'visible';
        }, (isAndroid ? 500 : 0));
    }, false);
});



// debug
var isResizeDebug = false;

function resizeDebugStart() {
    isResizeDebug = true;

    resizeDebug();
}
function resizeDebugStop() {
    isResizeDebug = false;

    var body = document.getElementsByTagName('body')[0];
    var debugDiv = document.getElementById('debug-resize');
    if (debugDiv !== undefined && debugDiv !== null) {
        body.parentNode.removeChild(debugDiv);
    }
}
function resizeDebug() {
    var body = document.getElementsByTagName('body')[0];
    var debugDiv = document.getElementById('debug-resize');

    if (debugDiv === undefined || debugDiv === null) {
        var debugNode = document.createElement('div');
        debugNode.id = 'debug-resize';
        var debugCSS = 'display: inline-block; position: absolute; left: 10px; top: 10px; padding: 5px; border: 1px solid red; font-size: 13px;';
        debugNode.style.cssText = debugCSS;
        body.parentNode.appendChild(debugNode);
        debugDiv = document.getElementById('debug-resize');
    }
    debugDiv.innerHTML = 'Resizing detected, current zoom is ' + FORTEACHERCD.responsive.baseContainerSize.zoom;
}
