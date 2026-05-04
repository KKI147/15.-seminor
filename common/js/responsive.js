
'use strict';

var FORTEACHERCD = FORTEACHERCD || {};

FORTEACHERCD.responsive = (function () {
	var responsive = {
		baseContainerSize : {
			width : 1920,
			height : 1080,
			zoom : 0
		},
		currentContainerSize : {
			containerWidth : window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
			containerHeight : window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
		},
		setScaleElement : function (targetElement, adjust) {
		    var bgContainer = document.querySelector('#container'),
		   		zoomVertical = this.currentContainerSize.containerHeight / targetElement.clientHeight,
				zoomHorizontal = this.currentContainerSize.containerWidth / targetElement.clientWidth;

			var	zoomVerticalBg = (this.currentContainerSize.containerHeight / bgContainer.clientHeight) * 1.0;
			var	zoomHorizontalBg = (this.currentContainerSize.containerWidth / bgContainer.clientWidth) * 1.0;

			if (targetElement.clientWidth * zoomVertical > this.currentContainerSize.containerWidth) {
				this.setTransformCSS(targetElement, zoomHorizontal);
				targetElement.style.top = ((this.currentContainerSize.containerHeight - (targetElement.clientHeight * zoomHorizontal)) / 2)  + 'px';
				this.baseContainerSize.zoom = zoomHorizontal;

				this.setTransformCSS(bgContainer, zoomHorizontalBg);
				bgContainer.style.top = ((this.currentContainerSize.containerHeight - (bgContainer.clientHeight * zoomHorizontalBg)) / 2)  + 'px';
				bgContainer.style.backgroundSize = "131.2% auto";

			} else {

				this.setTransformCSS(targetElement, zoomVertical);
				targetElement.style.left = ((this.currentContainerSize.containerWidth - (targetElement.clientWidth * zoomVertical)) / 2)  + 'px';
				this.baseContainerSize.zoom = zoomVertical;

				this.setTransformCSS(bgContainer, zoomVerticalBg);
				bgContainer.style.left = ((this.currentContainerSize.containerWidth - (bgContainer.clientWidth * zoomVerticalBg)) / 2)  + 'px';
				bgContainer.style.backgroundSize = "auto 151%";
			}
		},
		setTransformCSS : function (targetElement, zoomRate) {
			targetElement.style.transform = 'scale(' + zoomRate + ',' + zoomRate + ')';
			targetElement.style.transformOrigin = '0% 0%';
			targetElement.style.top = 0;
			targetElement.style.left = 0;
		}
	};

	return responsive;
})();

var isMobile,downEvent,moveEvent,upEvent,clickEvent;
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
	isMobile = true;

	downEvent = "touchstart";
	moveEvent = "touchmove";
	upEvent = "touchend";
	clickEvent = "tap";
} else {
	isMobile = false;

	downEvent = "mousedown";
	moveEvent = "mousemove";
	upEvent = "mouseup";
	clickEvent = "click"
}

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
