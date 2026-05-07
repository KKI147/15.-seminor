/* ───────────────────────────────────────────────────────┐
 * file name : common.js
 * description : 22개정 3,4학년 차시창 공용코드 모음(+ 과학특화)
 * create date : 2024-07-25 14:14:03
 * creator : JGY
 * modify: 2024-08-21 14:23:38 - 3,4학년 동일 사용
 * usage:
└────────────────────────────────────────────────────── */

// 개발버전
const VERSION = 'v1.0 - 2024-07-25 14:14:27';

// js common의 경로
const COMM_PATH = 'common/';
const COMM_IMG_PATH = 'common/images/';
const COMM_IMG_SCI_PATH = 'common/images/sci/';

const windowTop = $(window);
const docTop = $(document);
const bodyTop = $('body');
const containerTop = $('#container');
const containerTopId = containerTop.attr('id');
const wrapTop = $('#wrap');
const wrapTopId = wrapTop.attr('id');
const wrapW = wrapTop.width();
const wrapH = wrapTop.height();


let videoCon;

let rootTimer = -1;
let rootTimer0 = -1;

const sInputEvt = 'focusin propertychange change keyup paste input';

const colorList = [
    "#FDBB38",
    "#F8CADB",
    "#A9CE0D",
    "#5FCBD6",
    "#B6A3CE",
    "#A8A8A8",
];

/* ──────────────────────────────────────────────────────
* COMMON - Resize
/* ────────────────────────────────────────────────────── */

var ZOOMVALUE = 1;
//! 2024-08-28 18:41:12 - JGY : 비상에서 충돌 발생
/*
if (typeof (parent) !== 'undefined' && typeof (parent.ZOOMVALUE) !== 'undefined') {
    ZOOMVALUE = parent.ZOOMVALUE;
}
*/
var factor = 1;
var isMobile;
var outEvent;

var GameManager = {
    event: {
        isTouchDevice: 'ontouchstart' in windowTop[0] || windowTop[0].DocumentTouch && docTop[0] instanceof DocumentTouch,
        type: {
            down: 'eventDown',
            move: 'eventMove',
            up: 'eventUp',
            out: 'eventOut'
        },
        eventSelector: function (eventType) {
            var selectedEvent;
            switch (eventType) {
                case 'eventDown':
                    selectedEvent = this.isTouchDevice ? 'touchstart' : 'mousedown';
                    break;
                case 'eventMove':
                    selectedEvent = this.isTouchDevice ? 'touchmove' : 'mousemove';
                    break;
                case 'eventUp':
                    selectedEvent = this.isTouchDevice ? 'touchend' : 'mouseup';
                    break;
                case 'eventOut':
                    selectedEvent = this.isTouchDevice ? 'touchleave' : 'mouseout';
                    break;
            }
            return selectedEvent;
        },
        clientWidth: 0,
        clientHeight: 0,
        wrapWidth: 0,
        wrapHeight: 0,
        zoomVertical: 0,
        zoomHorizontal: 0,
        factor: 0,

        getPos: function (e, psName) {
            if (!e.originalEvent) {
                return this.isTouchDevice ? e.changedTouches[0][psName] : e[psName];
            } else {
                return this.isTouchDevice ? e.originalEvent.changedTouches[0][psName] : e[psName];
            }
        },

        getEvt: function (e) {
            if (!e.originalEvent) {
                return this.isTouchDevice ? e.changedTouches[0] : e;
            } else {
                return this.isTouchDevice ? e.originalEvent.changedTouches[0] : e;
            }
        },
    },
};


//* OLD
// function getScale() {

//     //* 2024-08-01 14:46:16 - JGY: iPadOS 13 userAgent 데스크탑 모드 인식 해결
//     const isIpadPro = function () {

//         // 방법1
//         //@see https://jekim1619.tistory.com/22
//         //@see https://dev.drawyourmind.com/posts/ios-ipad-detect-issue/
//         /* if (navigator.userAgent.indexOf('Safari') && navigator.maxTouchPoints > 0) {
//             return true;
//         } */

//         // 방법2
//         return GameManager.event.isTouchDevice;
//     };
//     //*--------------------------

//     if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || isIpadPro()) {
//         isMobile = true;

//         downEvent = "touchstart";
//         moveEvent = "touchmove";
//         upEvent = "touchend";
//         clickEvent = "tap";
//         leaveEvent = "touchleave";
//         overEvent = undefined;
//         wheelEvent = undefined;
//     }
//     else {
//         isMobile = false;

//         downEvent = "mousedown";
//         moveEvent = "mousemove";
//         upEvent = "mouseup";
//         clickEvent = "click";
//         leaveEvent = "mouseout";
//         overEvent = 'mouseover';
//         wheelEvent = 'mousewheel';
//     }
//     var wrap = document.querySelector('#wrap');

//     GameManager.event.clientWidth = document.body.clientWidth;
//     GameManager.event.clientHeight = document.body.clientHeight;

//     GameManager.event.wrapWidth = wrap.clientWidth;
//     GameManager.event.wrapHeight = wrap.clientHeight;

//     GameManager.event.zoomVertical = (GameManager.event.clientHeight / GameManager.event.wrapHeight) * 1.0;
//     GameManager.event.zoomHorizontal = (GameManager.event.clientWidth / GameManager.event.wrapWidth) * 1.0;

//     /*
//     if (parent.ZOOMVALUE == undefined) {
//         parent.ZOOMVALUE = 1;
//     }
//     if (GameManager.event.clientHeight < GameManager.event.clientWidth) {
//         factor = GameManager.event.zoomRate = parent.ZOOMVALUE;
//     }
//     else {
//         factor = GameManager.event.zoomRate = GameManager.event.zoomHorizontal;
//     }

//     factor = parent.ZOOMVALUE;
//     */

//     if (FORTEACHERCD) {
//         factor = FORTEACHERCD.responsive.baseContainerSize.zoom;
//         GameManager.factor = FORTEACHERCD.responsive.baseContainerSize.zoom;
//     }
//     return factor;
// }

/*
권장사항: Windows 10 이상, Android 10 이상, iOS 13 이상
'권장 사항' 에 맞게 chrome , 삼성 브라우저 모두 가능
*/
// function getScale() {

//     const getEvent = function () {
//         const isSamsungBrowser = function () {
//             return /SamsungBrowser/i.test(navigator.userAgent);
//         };

//         //* 2024-08-01 14:46:16 - JGY: iPadOS 13 userAgent 데스크탑 모드 인식 해결
//         const isIpadPro = function () {

//             // 방법1
//             //@see https://jekim1619.tistory.com/22
//             //@see https://dev.drawyourmind.com/posts/ios-ipad-detect-issue/
//             /* if (navigator.userAgent.indexOf('Safari') && navigator.maxTouchPoints > 0) {
//                 return true;
//             } */

//             // 방법2
//             return GameManager.event.isTouchDevice;
//         };

//         const supportsPointer = window.PointerEvent !== undefined;

//         // 1️⃣ 삼성 브라우저만 예외 처리 (문제 구간)
//         if (isSamsungBrowser()) {
//             isMobile = true;

//             downEvent = 'touchstart';
//             moveEvent = 'touchmove';
//             upEvent = 'touchend';
//             clickEvent = 'touchstart';
//             leaveEvent = 'touchleave';
//             overEvent = undefined;
//             wheelEvent = undefined;

//             return;
//         }

//         // 1️⃣ iPadOS 13만 예외 처리 (문제 구간)
//         if (isIpadPro()) {
//             isMobile = true;

//             downEvent = 'touchstart';
//             moveEvent = 'touchmove';
//             upEvent = 'touchend';
//             clickEvent = 'touchstart';
//             leaveEvent = 'touchleave';
//             overEvent = undefined;
//             wheelEvent = undefined;

//             return;
//         }

//         // 2️⃣ Pointer Events 지원 환경 (권장 구간)
//         if (supportsPointer) {
//             isMobile = true; // 터치/마우스 구분은 pointerType으로

//             downEvent = 'pointerdown';
//             moveEvent = 'pointermove';
//             upEvent = 'pointerup';
//             clickEvent = 'click';
//             leaveEvent = 'pointerleave';
//             overEvent = 'pointerover';
//             wheelEvent = undefined;

//             return;
//         }

//         // 3️⃣ 최후의 fallback (사실상 거의 안 탐)
//         isMobile = false;

//         downEvent = 'mousedown';
//         moveEvent = 'mousemove';
//         upEvent = 'mouseup';
//         clickEvent = 'click';
//         leaveEvent = 'mouseout';
//         overEvent = 'mouseover';
//         wheelEvent = 'mousewheel';
//     };

//     getEvent();

//     //*--------------------------------------------------

//     var wrap = document.querySelector(wrapTopId);

//     GameManager.event.clientWidth = document.body.clientWidth;
//     GameManager.event.clientHeight = document.body.clientHeight;

//     GameManager.event.wrapWidth = wrapTop.clientWidth;
//     GameManager.event.wrapHeight = wrapTop.clientHeight;

//     GameManager.event.zoomVertical = (GameManager.event.clientHeight / GameManager.event.wrapHeight) * 1.0;
//     GameManager.event.zoomHorizontal = (GameManager.event.clientWidth / GameManager.event.wrapWidth) * 1.0;

//     /*
//     if (parent.ZOOMVALUE == undefined) {
//         parent.ZOOMVALUE = 1;
//     }
//     if (GameManager.event.clientHeight < GameManager.event.clientWidth) {
//         factor = GameManager.event.zoomRate = parent.ZOOMVALUE;
//     } else {
//         factor = GameManager.event.zoomRate = GameManager.event.zoomHorizontal;
//     }
//     */

//     if (FORTEACHERCD) {
//         factor = FORTEACHERCD.responsive.baseContainerSize.zoom;
//     }
// }

function getXFromWrap(e) {
    // mobile
    if (typeof (e.pageX) === 'undefined') {
        return e.originalEvent.changedTouches[0].pageX - wrapTop.offset().left;
    }
    // other
    else {
        return e.pageX - $('#wrap').offset().left;
    }
}

function getYFromWrap(e) {
    return GameManager.event.isTouchDevice ? e.originalEvent.changedTouches[0].pageY - wrapTop.offset().top : e.pageY - wrapTop.offset().top;
}

/* ──────────────────────────────────────────────────────
* COMMON - 사용자환경
/* ────────────────────────────────────────────────────── */




window.DEBUG_ENV = true;

// 환경 변수 값
function getEnvInfo() {
    let data = [];
    data.push(['osName', `${GameManager.event.os}(${GameManager.event.osVersion})`]);
    data.push(['browserName', `${GameManager.event.browser}(${GameManager.event.browserVersion})`]);
    data.push(['user', user]);
    data.push(['browser', browser]);
    data.push(['isMobile', isMobile]);
    data.push(['version', VERSION]);
    data.push(['factor', factor]);

    data.push(['UA', navigator.userAgent]);
    data.push(['TouchPoints', navigator.maxTouchPoints]);
    data.push(['DPR', window.devicePixelRatio]);
    data.push(['Screen', GameManager.event.clientWidth + 'x' + GameManager.event.clientHeight]);
    data.push(['Wrap', GameManager.event.wrapWidth + 'x' + GameManager.event.wrapHeight]);

    return data;
}

// 환경 변수 출력
function logEnv() {
    if (window.DEBUG_ENV === true) {
        getScale();

        /* console.log(
            '[ENV]',
            'OS:', `${GameManager.event.os} (${GameManager.event.osVersion})`,
            '| Browser:', `${GameManager.event.browser} (${GameManager.event.browserVersion})`,
            '| UA:', navigator.userAgent,
            '| TouchPoints:', navigator.maxTouchPoints,
            '| DPR:', window.devicePixelRatio,
            '| Mobile:', isMobile,
            '| Screen:', GameManager.event.clientWidth + 'x' + GameManager.event.clientHeight,
            '| Wrap:', GameManager.event.wrapWidth + 'x' + GameManager.event.wrapHeight,
        ); */

        const envInfo = getEnvInfo();

        let css = 'background: #f22; color: #333;';
        console.group('%c[ENV]', css);
        envInfo.forEach(function (value, idx, self) {
            console.log(`${value[0]}: ${value[1]}`);
        });
        console.groupEnd();



        if ($('#logEnv').length > 0) {
            $('#logEnv').remove();
        }


        const $logEnv = $('<div id="logEnv"></div>');
        envInfo.forEach(function (value, idx, self) {
            const item = value;
            const name = value[0];
            const data = value[1];
            $logEnv.append(`<p class="item"><span class="name">${name}</span><span class="value">${data}</span></p>`);
        });
        $logEnv.appendTo(bodyTop);
    }
}




/* --------------------------------------------------
    OS / 브라우저 확인
-------------------------------------------------- */
function getOS() {

    const ua = navigator.userAgent;
    let match;

    /* ---------------------------------
        Windows
    --------------------------------- */
    match = ua.match(/Windows NT ([\d.]+)/);
    if (match) {
        const map = {
            '10.0': '10',
            '6.3': '8.1',
            '6.2': '8',
            '6.1': '7',
        };
        const version = map[match[1]] || match[1];

        return {
            name: 'Windows',
            version: version,
        };
    }

    /* ---------------------------------
        Android
    --------------------------------- */
    match = ua.match(/Android ([\d.]+)/);
    if (match) {
        return {
            name: 'Android',
            version: match[1]
        };
    }
    /*
    // Android (삼성 브라우저 등 버전 없는 UA 대응)
    if (/Android/i.test(ua) && /SamsungBrowser/i.test(ua)) {
        return {
            name: 'Android',
            version: ''
        };
    }
    */

    // Android (삼성 브라우저 / WebView / 인앱 등 버전 없는 UA 대응)
    if (/Android/i.test(ua)) {
        return {
            name: 'Android',
            version: ''
        };
    }

    // Samsung Browser 데스크탑 모드 (Android UA 숨김)
    if (/SamsungBrowser/i.test(ua)) {
        return {
            name: 'Android',
            version: ''
        };
    }

    /* ---------------------------------
        iOS (iPhone / iPad 12이하 / iPod)
    --------------------------------- */
    match = ua.match(/(iPhone|iPad|iPod).*OS ([\d_]+)/);
    if (match) {
        return {
            name: match[1],
            version: match[2].replace(/_/g, '.')
        };
    }

    /* ---------------------------------
        macOS / iPadOS (iPadOS 13+)
    --------------------------------- */
    if (/Macintosh/.test(ua)) {

        // Safari Version (iPadOS 버전 추정용)
        const safariMatch = ua.match(/Version\/([\d\.]+)/);
        const ipadVersion = safariMatch ? safariMatch[1] : '';

        // 실제 iPad
        if (navigator.maxTouchPoints > 1) {
            return {
                name: 'iPadOS',
                version: ipadVersion
            };
        }

        // DevTools iPad 에뮬레이션 보정
        if (
            navigator.maxTouchPoints <= 1 &&
            /Safari/.test(ua) &&
            !/Chrome|CriOS|FxiOS|EdgiOS/.test(ua)
        ) {
            return {
                name: 'iPadOS',
                version: ipadVersion
            };
        }

        // macOS
        match = ua.match(/Mac OS X ([\d_]+)/);
        if (match) {
            return {
                name: 'macOS',
                version: match[1].replace(/_/g, '.')
            };
        }

        return {
            name: 'macOS',
            version: ''
        };
    }

    return {
        name: 'Unknown',
        version: ''
    };
}

// version 2
/*
function getOS() {
    const ua = navigator.userAgent;

    let match;

    // Windows
    match = ua.match(/Windows NT ([\d.]+)/);
    if (match) {
        const map = {
            '10.0': '10',
            '6.3': '8.1',
            '6.2': '8',
            '6.1': '7',
        };
        const version = map[match[1]] || match[1];

        return {
            name: 'Windows',
            version: version,
        };
    }

    // Android
    match = ua.match(/Android ([\d.]+)/);
    if (match) {
        return {
            name: 'Android',
            version: match[1],
        };
    }

    // iPhone (iOS)
    match = ua.match(/iPhone OS ([\d_]+)/);
    if (match) {
        return {
            name: 'iOS',
            version: match[1].replace(/_/g, '.'),
        };
    }

    // iPadOS (iPadOS 13+ Safari는 macOS처럼 UA 표시)
    if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) {

        match = ua.match(/Mac OS X ([\d_]+)/);

        return {
            name: 'iPadOS',
            version: match ? match[1].replace(/_/g, '.') : '',
        };
    }

    // macOS
    match = ua.match(/Mac OS X ([\d_]+)/);
    if (match) {
        return {
            name: 'macOS',
            version: match[1].replace(/_/g, '.'),
        };
    }

    // iPad (구형 iPadOS 12 이하)
    if (/iPad/.test(ua)) {
        return {
            name: 'iPadOS',
            version: '',
        };
    }

    return {
        name: 'Unknown',
        version: '',
    };
}
*/

// version 1
/* function getOS() {
    const ua = navigator.userAgent;
    if (/Windows/i.test(ua)) return 'Windows';
    if (/Macintosh|Mac OS X/i.test(ua)) return 'macOS';
    if (/Android/i.test(ua)) return 'Android';
    if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
    return 'Unknown';
} */
// function getOS() {
//     const ua = navigator.userAgent;
//     // Windows
//     let match = ua.match(/Windows NT ([\d.]+)/);
//     if (match) {
//         const map = {
//             '10.0': '10',
//             6.3: '8.1',
//             6.2: '8',
//             6.1: '7',
//         };
//         const version = map[match[1]] || match[1];
//         return {
//             name: 'Windows',
//             version: version,
//         };
//     }

//     /* // macOS
//     match = ua.match(/Mac OS X ([\d_]+)/);
//     if (match) {
//         return {
//             name: 'macOS',
//             version: match[1].replace(/_/g, '.'),
//         };
//     } */
//     // macOS / iPadOS
//     match = ua.match(/Mac OS X ([\d_]+)/);
//     if (match) {

//         // iPadOS 판별 (Safari UA가 macOS처럼 나옴)
//         if (navigator.maxTouchPoints > 1) {
//             return {
//                 name: 'iPadOS',
//                 version: match[1].replace(/_/g, '.'),
//             };
//         }

//         return {
//             name: 'macOS',
//             version: match[1].replace(/_/g, '.'),
//         };
//     }

//     // Android
//     match = ua.match(/Android ([\d.]+)/);
//     if (match) {
//         return {
//             name: 'Android',
//             version: match[1],
//         };
//     }

//     // iOS
//     match = ua.match(/OS ([\d_]+) like Mac OS X/);
//     if (match) {
//         return {
//             name: 'iOS',
//             version: match[1].replace(/_/g, '.'),
//         };
//     }

//     return {
//         name: 'Unknown',
//         version: '',
//     };
// }

/* function getBrowser() {
    const ua = navigator.userAgent;
    if (/SamsungBrowser/i.test(ua)) return 'Samsung Browser';
    if (/Whale/i.test(ua)) return 'Naver Whale';
    if (/Edg/i.test(ua)) return 'Edge';
    if (/Chrome/i.test(ua)) return 'Chrome';
    if (/Safari/i.test(ua)) return 'Safari';
    return 'Unknown';
} */

/*
IE
Samsung Browser
Whale
KakaoTalk InApp
Naver InApp
Edge
Edge iOS
Firefox
Firefox iOS
Chrome
Chrome iOS
Safari
*/
function getBrowser() {

    const ua = navigator.userAgent;
    let match;

    // Internet Explorer (IE 10 이하)
    match = ua.match(/MSIE ([\d.]+)/);
    if (match) {
        return { name: 'Internet Explorer', version: match[1] };
    }

    // Internet Explorer 11
    match = ua.match(/Trident\/.*rv:([\d.]+)/);
    if (match) {
        return { name: 'Internet Explorer', version: match[1] };
    }

    // Samsung Browser
    match = ua.match(/SamsungBrowser\/([\d.]+)/);
    if (match) {
        return { name: 'Samsung Browser', version: match[1] };
    }

    // Naver Whale
    match = ua.match(/Whale\/([\d.]+)/);
    if (match) {
        return { name: 'Naver Whale', version: match[1] };
    }

    // KakaoTalk In-App Browser
    if (/KAKAOTALK/i.test(ua)) {
        return { name: 'KakaoTalk InApp', version: '' };
    }

    // Naver In-App Browser
    if (/NAVER/i.test(ua)) {
        return { name: 'Naver InApp', version: '' };
    }

    // Edge (Desktop + Android)
    match = ua.match(/Edg\/([\d.]+)/);
    if (match) {
        return { name: 'Edge', version: match[1] };
    }

    // Edge iOS
    match = ua.match(/EdgiOS\/([\d.]+)/);
    if (match) {
        return { name: 'Edge', version: match[1] };
    }

    // Firefox
    match = ua.match(/Firefox\/([\d.]+)/);
    if (match) {
        return { name: 'Firefox', version: match[1] };
    }

    // Firefox iOS
    match = ua.match(/FxiOS\/([\d.]+)/);
    if (match) {
        return { name: 'Firefox', version: match[1] };
    }

    // Chrome (Desktop + Android)
    match = ua.match(/Chrome\/([\d.]+)/);
    if (match) {
        return { name: 'Chrome', version: match[1] };
    }

    // Chrome iOS
    match = ua.match(/CriOS\/([\d.]+)/);
    if (match) {
        return { name: 'Chrome', version: match[1] };
    }

    // Safari
    match = ua.match(/Version\/([\d.]+).*Safari/);
    if (match) {
        return { name: 'Safari', version: match[1] };
    }

    return { name: 'Unknown', version: '' };
}

/*
실행 후 확인 가능한 값

예를 들어:

Windows + Chrome
GameManager.event.os = 'Windows'
GameManager.event.browser = 'Chrome'

MacBook + Safari
GameManager.event.os = 'macOS'
GameManager.event.browser = 'Safari'

Android + Samsung Browser
GameManager.event.os = 'Android'
GameManager.event.browser = 'Samsung Browser'

iPhone + Safari
GameManager.event.os = 'iOS'
GameManager.event.browser = 'Safari'
*/

/* --------------------------------------------------
    모바일 여부 판단 + 이벤트 타입 설정
-------------------------------------------------- */
function setupInputEvents() {
    if (
        typeof GameManager.event.os === 'undefined' &&
        typeof GameManager.event.browser === 'undefined'
    ) {
        const osInfo = getOS();

        GameManager.event.os = osInfo.name;
        GameManager.event.osVersion = osInfo.version;

        const browserInfo = getBrowser();

        GameManager.event.browser = browserInfo.name;
        GameManager.event.browserVersion = browserInfo.version;


        const mobileOS = ['Android', 'iOS', 'iPod', 'iPhone', 'iPad', 'iPadOS'];

        const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

        // 모바일 OS 기준 + 터치 보조 판단
        if (
            mobileOS.includes(GameManager.event.os) ||
            (isTouchDevice && GameManager.event.os === 'Unknown')
        ) {
            isMobile = true;

            downEvent = 'touchstart';
            moveEvent = 'touchmove';
            upEvent = 'touchend';
            clickEvent = 'touchstart';
            leaveEvent = 'touchleave';
            overEvent = undefined;
        }
        else {
            isMobile = false;

            downEvent = 'mousedown';
            moveEvent = 'mousemove';
            upEvent = 'mouseup';
            clickEvent = 'click';
            leaveEvent = 'mouseout';
            overEvent = 'mouseover';
        }
    }
}

function getScale() {

    setupInputEvents();

    /* --------------------------------------------------
        화면 사이즈 계산
    -------------------------------------------------- */

    const wrapTop = document.querySelector(`#${wrapTopId}`);

    GameManager.event.clientWidth = document.body.clientWidth;
    GameManager.event.clientHeight = document.body.clientHeight;

    if (wrapTop) {
        GameManager.event.wrapWidth = wrapTop.clientWidth;
        GameManager.event.wrapHeight = wrapTop.clientHeight;
    }
    else {
        GameManager.event.wrapWidth = 0;
        GameManager.event.wrapHeight = 0;
        console.warn(`[🚨🐛🚨] #${wrapTopId}인 태그가 없음`);
    }

    GameManager.event.zoomVertical = (GameManager.event.clientHeight / GameManager.event.wrapHeight) * 1.0;
    GameManager.event.zoomHorizontal = (GameManager.event.clientWidth / GameManager.event.wrapWidth) * 1.0;

    /*
    if (parent.ZOOMVALUE == undefined) {
        parent.ZOOMVALUE = 1;
    }
    if (GameManager.event.clientHeight < GameManager.event.clientWidth) {
        factor = GameManager.event.zoomRate = parent.ZOOMVALUE;
    } else {
        factor = GameManager.event.zoomRate = GameManager.event.zoomHorizontal;
    }
    */


    /* --------------------------------------------------
        줌 처리
    -------------------------------------------------- */

    if (FORTEACHERCD) {
        factor = FORTEACHERCD.responsive.baseContainerSize.zoom;
    }

}



// function getScale() {
//     /* 2026-02-06 11:22:51 - JGY : 안드로이드 삼성 브라우저 추가 */
//     // old
//     /* if (/Android|webOS|iPhone|iPad|Mac|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
//         isMobile = true;

//         downEvent = "touchstart";
//         moveEvent = "touchmove";
//         upEvent = "touchend";
//         clickEvent = "touchstart";
//         leaveEvent = "touchleave";
//         overEvent = undefined;

//     } else {
//         isMobile = false;

//         downEvent = "mousedown";
//         moveEvent = "mousemove";
//         upEvent = "mouseup";
//         clickEvent = "click";
//         leaveEvent = "mouseout";
//         overEvent = 'mouseover';
//     } */
//     function isSamsungBrowser() {
//         return /SamsungBrowser/i.test(navigator.userAgent);
//     }

//     // 안드로이드 - 삼성브라우저
//     if (isSamsungBrowser()) {
//         isMobile = true;

//         downEvent = "touchstart";
//         moveEvent = "touchmove";
//         upEvent = "touchend";
//         clickEvent = "touchstart";
//         leaveEvent = "touchleave";
//         overEvent = undefined;
//     }
//     // 그 외
//     else {
//         if (/Android|webOS|iPhone|iPad|Mac|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
//             isMobile = true;

//             downEvent = "touchstart";
//             moveEvent = "touchmove";
//             upEvent = "touchend";
//             clickEvent = "touchstart";
//             leaveEvent = "touchleave";
//             overEvent = undefined;

//         } else {
//             isMobile = false;

//             downEvent = "mousedown";
//             moveEvent = "mousemove";
//             upEvent = "mouseup";
//             clickEvent = "click";
//             leaveEvent = "mouseout";
//             overEvent = 'mouseover';
//         }
//     }

//     var wrap = document.querySelector(wrapTopId);

//     GameManager.event.clientWidth = document.body.clientWidth;
//     GameManager.event.clientHeight = document.body.clientHeight;

//     GameManager.event.wrapWidth = wrapTop.clientWidth;
//     GameManager.event.wrapHeight = wrapTop.clientHeight;

//     GameManager.event.zoomVertical = (GameManager.event.clientHeight / GameManager.event.wrapHeight) * 1.0;
//     GameManager.event.zoomHorizontal = (GameManager.event.clientWidth / GameManager.event.wrapWidth) * 1.0;

//     /*
//     if (parent.ZOOMVALUE == undefined) {
//         parent.ZOOMVALUE = 1;
//     }
//     if (GameManager.event.clientHeight < GameManager.event.clientWidth) {
//         factor = GameManager.event.zoomRate = parent.ZOOMVALUE;
//     } else {
//         factor = GameManager.event.zoomRate = GameManager.event.zoomHorizontal;
//     }
//     */

//     if (FORTEACHERCD) {
//         factor = FORTEACHERCD.responsive.baseContainerSize.zoom;
//     }
// }

/*
권장사항: Windows 10 이상, Android 10 이상, iOS 13 이상
'권장 사항' 에 맞게 chrome , 삼성 브라우저 모두 가능
*/
// function getScale() {

//     const getEvent = function () {
//         const isSamsungBrowser = function () {
//             return /SamsungBrowser/i.test(navigator.userAgent);
//         };

//         const supportsPointer = window.PointerEvent !== undefined;

//         // 1️⃣ 삼성 브라우저만 예외 처리 (문제 구간)
//         if (isSamsungBrowser()) {
//             isMobile = true;

//             downEvent = 'touchstart';
//             moveEvent = 'touchmove';
//             upEvent = 'touchend';
//             clickEvent = 'touchstart';
//             leaveEvent = 'touchleave';
//             overEvent = undefined;

//             return;
//         }

//         // 2️⃣ Pointer Events 지원 환경 (권장 구간)
//         if (supportsPointer) {
//             isMobile = true; // 터치/마우스 구분은 pointerType으로

//             downEvent = 'pointerdown';
//             moveEvent = 'pointermove';
//             upEvent = 'pointerup';
//             clickEvent = 'click';
//             leaveEvent = 'pointerleave';
//             overEvent = 'pointerover';

//             return;
//         }

//         // 3️⃣ 최후의 fallback (사실상 거의 안 탐)
//         isMobile = false;

//         downEvent = 'mousedown';
//         moveEvent = 'mousemove';
//         upEvent = 'mouseup';
//         clickEvent = 'click';
//         leaveEvent = 'mouseout';
//         overEvent = 'mouseover';
//     };

//     getEvent();

//     //*--------------------------------------------------

//     var wrap = document.querySelector(wrapTopId);

//     GameManager.event.clientWidth = document.body.clientWidth;
//     GameManager.event.clientHeight = document.body.clientHeight;

//     GameManager.event.wrapWidth = wrapTop.clientWidth;
//     GameManager.event.wrapHeight = wrapTop.clientHeight;

//     GameManager.event.zoomVertical = (GameManager.event.clientHeight / GameManager.event.wrapHeight) * 1.0;
//     GameManager.event.zoomHorizontal = (GameManager.event.clientWidth / GameManager.event.wrapWidth) * 1.0;

//     /*
//     if (parent.ZOOMVALUE == undefined) {
//         parent.ZOOMVALUE = 1;
//     }
//     if (GameManager.event.clientHeight < GameManager.event.clientWidth) {
//         factor = GameManager.event.zoomRate = parent.ZOOMVALUE;
//     } else {
//         factor = GameManager.event.zoomRate = GameManager.event.zoomHorizontal;
//     }
//     */

//     if (FORTEACHERCD) {
//         factor = FORTEACHERCD.responsive.baseContainerSize.zoom;
//     }
// }


var user;       // 사용자 환경
var browser;    // 사용 browser
let clkEvt = '';

//! 여기 수정해야함!

(function () {

    const osInfo = getOS();
    const browserInfo = getBrowser();

    switch (osInfo.name) {
        case 'Windows':
        case 'macOS':
            user = 'pc';
            const ua = navigator.userAgent.toLowerCase();
            if (ua.indexOf('Windows 7') > -1 || ua.indexOf('Windows NT 6.1') > -1) {
                wrapTop.addClass('win7');
            }
            break;
        case 'Android':
            user = 'android';
            break;
        case 'iOS':
        case 'iPod':
        case 'iPhone':
        case 'iPad':
        case 'iPadOS':
            user = 'ios';
            break;
        case 'Unknown':
            user = 'unknown';
            break;
    }


    switch (browserInfo.name) {
        case 'Internet Explorer':
            browser = 'ie';
            break;
        case 'Samsung Browser':
            browser = 'samsung';
            break;
        case 'Naver Whale':
            browser = 'whale';
            break;
        case 'KakaoTalk InApp':
            browser = 'KakaoTalk InApp';
            break;
        case 'Naver InApp':
            browser = 'Naver InApp';
        case 'Edge':
            browser = 'edge';
            break;
        case 'Firefox':
            browser = 'firefox';
            break;
        case 'Chrome':
            browser = 'chrome';
            break;
        case 'Safari':
            browser = 'safari';
            break;
        case 'Unknown':
            browser = 'unknown';
            break;
    }

    setupInputEvents();


    /* function isSamsungBrowser() {
        return /SamsungBrowser/i.test(navigator.userAgent);
    }

    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf('iphone') > 0 || ua.indexOf('android') > 0 && ua.indexOf('mobile') > 0) {

        if (ua.indexOf('iphone') > 0) user = 'ios';
        if (ua.indexOf('android') > 0) user = 'android';

    } else if (ua.indexOf('ipad') > 0 || ua.indexOf('mac') > 0 || ua.indexOf('android') > 0) {

        if (ua.indexOf('ipad') > 0 || ua.indexOf('mac') > 0) user = 'ios';
        if (ua.indexOf('android') > 0) user = 'android';

    } else if (isSamsungBrowser()) {

        user = 'android';

    } else {

        if (ua.indexOf('edge') > -1) {
            browser = 'edge';
        } else if (ua.indexOf('whale') > -1) {
            browser = 'whale';
        } else if (ua.indexOf('chrome') > -1) {
            browser = 'chrome';
        } else if (ua.indexOf('firefox') > -1) {
            browser = 'firefox';
        } else {
            browser = 'ie';
        }
        user = 'pc';
        if (ua.indexOf('Windows 7') > -1 || ua.indexOf('Windows NT 6.1') > -1) {
            wrapTop.addClass('win7');
        }
    } */

    //! 2024-08-28 14:02:01 - JGY : 비상 실행서버에서, iframe의 mp3를 download 처리하는 문제가 있어서 주석처리
    // if (browser == 'chrome') wrapTop.append(`<iframe src="${COMM_PATH}media/mp3/empty.mp3" autoplay style="display:none"></iframe>`);

    // isAndroid ? clkEvt = 'touchend' : clkEvt = 'mouseup';
    user === 'android' ? clkEvt = 'touchend' : clkEvt = 'click';

    // audio play interaction at ios
    if (user === 'ios') {
        (function () {
            function onAutoRun() {
                docTop.unbind('touchstart', onAutoRun);
                effectAdo('empty');
                delete onAutoRun;
            }
            docTop.one('touchstart', onAutoRun);
        })();
    }

    wrapTop.addClass(user + ' ' + browser);

    // Tab 막기
    /* wrap.find('.keyfocus').on('keydown', function (e) {
        var keyCode = e.keyCode || e.which;
        var focusD = $(this).parents('.quizWrap').find('*[tabindex="1"]');
        if (keyCode == 9) {
            e.preventDefault();
            focusD.focus();
        }
    }); */

    // 라인, 펜 드래그 막기
    /* $('.dot').mousedown(function () {
        $('body').attr('ondragstart', 'return false');
        $('body').attr('onselectstart', 'return false');
    });
    $('canvas').mousedown(function () {
        $('body').attr('ondragstart', 'return false');
        $('body').attr('onselectstart', 'return false');
    }); */
    /* $('body').mouseup(function () {
        if ($('body').attr('ondragstart') === 'return false') {
            $('body').removeAttr('ondragstart');
            $('body').removeAttr('onselectstart');
        }
    }); */

    // --  { passive: false } 추가
    /* if (wrap.find('.pop').length > 0) {
        wrap.find('.pop').each(function () {
            $(this)[0].addEventListener('touchmove', function (event) {
                event.preventDefault();
                event.stopPropagation();
            }, { passive: false });

            $(this).find('textarea').on('touchmove', function (event) {
                event.stopPropagation();
            }, { passive: false });
        })
    } */

})();








/* =========================================================================================
 * 기본
 * ====================================================================================== */

// 기본, 과목 공통 기능, 과목 개별 기능, 기타

/* ---------------------------------------
 * 재정의
 * --------------------------------------- */
// requestAnimationFrame 재정의
windowTop[0].requestAnimationFrame = function () {
    return windowTop[0].requestAnimationFrame ||
        windowTop[0].webkitRequestAnimationFrame ||
        windowTop[0].mozRequestAnimationFrame ||
        windowTop[0].oRequestAnimationFrame ||
        windowTop[0].msRequestAnimationFrame ||

        function (callback) {
            windowTop[0].setTimeout(callback, 1000 / 60);
        };
}();
// cancelAnimationFrame 재정의
windowTop[0].cancelAnimationFrame = (function () {
    return windowTop[0].cancelAnimationFrame ||
        windowTop[0].webkitCancelAnimationFrame ||
        windowTop[0].mozCancelAnimationFrame ||
        windowTop[0].oCancelAnimationFrame ||
        windowTop[0].msCancelAnimationFrame ||
        function (id) {
            windowTop[0].clearTimeout(id);
        };
})();

// transition & animation
var sTransitionStart = 'transitionstart webkitTransitionStart oTransitiStart otransitionstart';
var sTransitionCancel = 'transitioncancel webkitTransitionCancel oTransitionCancel otransitioncancel';
var sTransitionEnd = 'transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd';

var sAnimationStart = 'webkitAnimationStart mozAnimationStart MSAnimationStart onanimationstart animationstart';
var sAnimationCancel = 'webkitAnimationCancel mozAnimationCancel MSAnimationCancel onanimationcancel animationcancel';
var sAnimationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd onanimationend animationend';

/* ---------------------------------------
 * 설정
 * --------------------------------------- */

//* 2023-12-15 16:31:12 - JGY : jQuery 3.x mobile에서 실행순서가 뒤죽박죽됨
// $(function () { });

// javascript로 처리. 모든 환경에서 가장 먼저 실행됨
docTop[0].addEventListener('DOMContentLoaded', initDomReady, false);
/* async */ function initDomReady() {
    docTop[0].removeEventListener('DOMContentLoaded', initDomReady);

    // Font Preloading
    wrapTop.prepend(`
        <div id="cFontPreload">
            <i class="mg dump">a</i>
            <i class="mgl dump">b</i>
            <i class="mgr dump">c</i>
            <i class="mgb dump">d</i>
            <i class="bt dump">e</i>
            <i class="go dump">f</i>
        </div>
    `);

    // 배경 이미지 프리로드
    if (wrapTop.find('#cimgPreload').length < 1) {
        wrapTop.prepend('<div id="cimgPreload"></div>');
    }
    wrapTop.find('#cimgPreload').css({
        'opacity': 0.01,
        'width': '100%',
        'height': '100%',
        'position': 'absolute',
        'z-index': -999,
        'transform': 'scale(0.01)'
    });

    let bgImgNone = [];

    wrapTop.find('.contents').each(function (i) {
        var b = $(this).css('background-image');
        if (b === 'none') {
            bgImgNone.push($(this).getSelector()[0]);
        }
        if (b === 'none') {
            return true;
        }
        b = b.split('/');
        var imgSrc = 'inc/images/' + b[b.length - 2] + '/' + b[b.length - 1].split('.')[0] + '.png';
        wrapTop.find('#cimgPreload').append('<div style=background-image:url(' + imgSrc + ')>');
    });

    wrapTop.find('.pageWrap .page').each(function (i) {
        var b = $(this).css('background-image');
        if (b === 'none') {
            bgImgNone.push($(this).getSelector()[0]);
        }
        b = b.split('/');
        var imgSrc = 'inc/images/' + b[b.length - 2] + '/' + b[b.length - 1].split('.')[0] + '.png';
        wrapTop.find('#cimgPreload').append('<div style=background-image:url(' + imgSrc + ')>');
    });

    wrapTop.find('.tabWrap .tab').each(function (i) {
        var b = $(this).css('background-image');
        if (b === 'none') {
            bgImgNone.push($(this).getSelector()[0]);
        }
        b = b.split('/');
        var imgSrc = 'inc/images/' + b[b.length - 2] + '/' + b[b.length - 1].split('.')[0] + '.png';
        wrapTop.find('#cimgPreload').append('<div style=background-image:url(' + imgSrc + ')>');
    });

    /* wrapTop.find('.popup').each(function (i) {
        var b = $(this).css('background-image');
        if (b === 'none') {
            bgImgNone.push($(this).getSelector()[0]);
        }
        b = b.split('/');
        var imgSrc = 'inc/images/' + b[b.length - 2] + '/' + b[b.length - 1].split('.')[0] + '.png';
        wrapTop.find('#cimgPreload').append('<div style=background-image:url(' + imgSrc + ')>');
    }); */

    wrapTop.find('#cimgPreload div').css({
        'width': '100%',
        'height': '100%'
    });

    // missing background-image 출력
    if (bgImgNone.length > 0) {
        console.group('[ background-image missing ]');
        let bgImgNoneStr = '';
        bgImgNone.forEach(function (value, idx, self) {
            if (idx < bgImgNone.length - 1) {
                bgImgNoneStr += `${value}\n\n`;
            }
            else {
                bgImgNoneStr += `${value}`;
            }
        });
        console.log(bgImgNoneStr);
        console.groupEnd();
    }
}




function resetContentsCom() {
    /*
    $('[data-pop]').removeClass('dis');
    $('.ing').removeClass('ing');
    */

    wrapTop.find('.full_pop_bg').hide();
    wrapTop.find('.pop, .popup').hide();

    ado_stop('#popAdo');
    ado_stop('#contentAdo');

    clearTimeout(rootTimer);
    clearTimeout(toReadTimer);
    clearTimeout(effectAdoTimer);
    clearTimeout(contentAdoTimer);
}


function resetPopCom() {
    wrapTop.find('.btnPop').removeClass('dis');
    wrapTop.find('.solpop').remove();
}


var contentsAll;    // .contentsWrap > .contents
var contentsIdx;    // 현재 보고 있는 .contents의 index값
var contents;       // 현재 보고 있는 .contents

windowTop[0].initContentsIn = undefined;        // 개별 페이지마다 딱 한번만 실행
windowTop[0].resetPopIn = undefined;            // 개별 페이지내 resetPop
windowTop[0].resetContentsIn = undefined;       // 개별 페이지내 resetContent

/**
 * .contents 리셋
 */
function resetContents() {
    resetPopAll();
    ado_stop();

    // 7종 게임 - bgm처리
    if (docTop.find('.bgmAdo').length > 0) {
        docTop.find('.bgmAdo').each(function () {
            adoReset($(this));
        });
    }
}

function onPageTouchMove(e) {
    e.preventDefault();
    // e.stopPropagation();
}

// 사용 환경 설정
windowTop.on('load', function () {

    getScale();

    // mobile browser 기본 이벤트 막기
    if (isMobile) {
        docTop[0].removeEventListener('touchmove', onPageTouchMove);
        docTop[0].addEventListener('touchmove', onPageTouchMove, { passive: false });

        //! 2024-08-22 18:21:49 - JGY mCustomScrollbar에서 에러 발생!
        // jQuery passive모드 보정
        // @see https://stackoverflow.com/questions/60357083/does-not-use-passive-listeners-to-improve-scrolling-performance-lighthouse-repo
        /*
        (function () {
            jQuery.event.special.touchstart = {
                setup: function (_, ns, handle) {
                    this.addEventListener("touchstart", handle, { passive: !ns.includes("noPreventDefault") });
                }
            };
            jQuery.event.special.touchmove = {
                setup: function (_, ns, handle) {
                    this.addEventListener("touchmove", handle, { passive: !ns.includes("noPreventDefault") });
                }
            };
            jQuery.event.special.wheel = {
                setup: function (_, ns, handle) {
                    this.addEventListener("wheel", handle, { passive: true });
                }
            };
            jQuery.event.special.mousewheel = {
                setup: function (_, ns, handle) {
                    this.addEventListener("mousewheel", handle, { passive: true });
                }
            };
        })();
        */
    }

    // 기본 정보값 출력
    rootTimer0 = setTimeout(function () {
        clearTimeout(rootTimer0);

        getScale();

        const envInfo = getEnvInfo();

        let css = 'background: #f22; color: #333;';
        console.group('%c[environment]', css);
        envInfo.forEach(function (value, idx, self) {
            if (idx <= 6) {
                console.log(`${value[0]}: ${value[1]}`);
            }
        });
        console.groupEnd();

    }, 500);

    if (wrapTop.find('#contentAdo').length === 0) {
        wrapTop.append(`<audio id="contentAdo" src="" type="audio/mp3"></audio>`);
    }
    $contentAdo = wrapTop.find('#contentAdo');

    if (wrapTop.find('.audiobox').length <= 0) {
        wrapTop.append('<div class="audiobox"></div>');
    }

    contentsAll = wrapTop.find('.contentsWrap').find('>.contents');
    contentsIdx = 0;
    contents = contentsAll.eq(contentsIdx);

    // 팝업
    initPop();

    contentsAll.eq(0).show();

    if (typeof (initContentsIn) !== 'undefined') {
        initContentsIn();
    }

    if (typeof contentScript !== 'undefined') {
        contentScript(0, contentsAll.eq(0));
    }

    // 최상단 탭
    let html = '';
    for (let i = 0; i < contentsAll.length; ++i) {
        html += `<li>${i + 1}</li>`;
    }
    wrapTop.find('.setContent').append(html);

    wrapTop.find('.setContent').attr({
        'data-page': 1,
        'data-total': contentsAll.length,
    });
    wrapTop.find('.setContent li').removeClass('on act');
    wrapTop.find('.setContent li').eq(0).addClass('on act');

    wrapTop.find('.setContent li').on('click', function (e) {

        $(this).siblings().removeClass('on act');
        $(this).addClass('on act');

        var idx = $(this).index();
        var content = contentsAll.eq(idx);

        if (content.is(':visible')) { return false; }
        // if (contentsIdx === idx) { return; }

        $(this).closest('.setContent').attr('data-page', idx + 1);
        $(this).siblings().removeClass('on act');
        $(this).addClass('on act');

        // resetPopCom();
        // resetContentsCom();
        resetContents();

        //* 2025-05-14 13:15:54 - JGY : 사용자의 직접 클릭에 의해서만 동작가능
        // effectAdo('click');
        if (isHuman(e) === true) {
            // effectAdo('click', false);
            effectAdo('click');
        }
        //*--------------------------------------------

        contentsIdx = idx;
        contents = wrapTop.find('.contents').eq(contentsIdx);

        contentsAll.hide();
        contents.show();

        contentScript(idx, contents);
    });

    // 과목별 처리
    subjectFunction();

    // 우클릭 방지
    bodyTop.on('contextmenu', function () {
        return false;
    });

    // <img/> 드래그 방지
    wrapTop.find('img').each(function () {
        $(this).attr('ondragstart', 'return false'); //마우스 이벤트 삭제.
    });

    // pop & popup 닫기버튼 처리
    /*
    wrapTop.find('.closeBtn').on('click', function () {
        var pop = $(this).parent();
        if (pop.hasClass('popup')) {
            effectAdo('click', false);
            pop.hide();
            //$('.full_pop_bg').hide();
            removeMask();
        }
        else if (pop.hasClass('pop')) {
            effectAdo('click', false);
            pop.hide();
        }
    });
    */
});


/* ──────────────────────────────────────────────────────
* 이벤트 위임(event delegation) 관련
/* ────────────────────────────────────────────────────── */

// popup안에 video가 있을때,
/*
docTop.on('click', '.popup.video .btnClose', function () {

});
*/



// $(window).on('load', function () {
//     // 최상단 탭
//     for (var i = 0; i < $('.contentsWrap').find('.contents').length; i++) {
//         $('.setContent').append('<li></li>');
//     }

//     $('.setContent li').eq(0).addClass('on');

//     $('.setContent li').on('click', function () {
//         $(this).siblings().removeClass('on');
//         $(this).addClass('on');

//         var idx = $(this).index();
//         var content = $('.contents').eq(idx);
//         if (content.is(':visible')) { return false; }

//         $('.contents').hide();
//         content.show();

//         resetContents();
//         effectAdo('click');
//     });

//     // 팝업
//     initPop();

//     // index.js에 있던 코드 동일 적용
//     $('.contents').eq(0).show();

//     if (typeof contentScript !== 'undefined') {
//         contentScript(0, $('.contents').eq(0));
//     }

//     $('.setContent li').on('click', function () {
//         var idx = $(this).index();
//         var contents = $('.contents').eq(idx);
//         if (contentsIdx !== idx) {
//             contentScript(idx, contents);
//         }
//     });

//     // 우클릭 방지
//     $('body').on('contextmenu', function () {
//         return false;
//     });

//     // 이미지 드래그 방지
//     $('img').each(function () {
//         $(this).attr('ondragstart', 'return false'); //마우스 이벤트 삭제.
//     });
// });




/**
 * _this를 몇회|무한 깜빡거리는 효과
 * @param {*} _this
 * @param {*} _cnt 횟수
 * @param {*} _type 깜빡이는 회수 지났을 때 처리
 * @see file:///Z:/WEP/타회사_2016_제안샘플/visang_gum3/society/s/06/01/08_09/soc61_108_09_09.html
 */
function flickItems(_this, _cnt, _type) {
    var aniCnt = 1;
    var $this = _this;

    $this.stop();
    roopfunction();
    function roopfunction() {
        $this.delay(500).animate({ opacity: '0' }, 100).delay(500).animate({ opacity: '1' }, 100, function () {
            if (_cnt == 0) {
                roopfunction();
            } else if (aniCnt < _cnt) {
                roopfunction();
                aniCnt++;
            } else {
                if (_type == "hide") {
                    $this.delay(500).animate({ opacity: '0' }, 100);
                }
            }
        });
    }
}

// transition & animation 설정
//<![CDATA[
$.fn.extend({
    //** 공통 :  transitionCss transition (모션)
    /*
    use)
    $('.box1').transitionCss('tran', function () {
        console.log('end: transition');
    });
    */
    transitionCss: function (transitionName, end_func) {
        var transitionEnd = 'webkitTransitionEnd mozTransitionEnd msTransitionEnd oTransitionEnd ontransitionend transitionend';
        var _cb = end_func;
        this.addClass('transitional ' + transitionName).one(transitionEnd, function (e) {
            $(this).removeClass('transitional ' + transitionName);
            if (_cb) { _cb(e); }
        });
        return this;
    },
    //** 공통 :  animateCss 이미지 (모션)
    /*
    use)
    $('.box1').animateCss('ani', function(){
        console.log('end: animation');
    });
    */
    animateCss: function (animationName, end_func) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd onanimationend animationend';
        var _cb = end_func;
        this.addClass('animated ' + animationName).one(animationEnd, function (e) {
            $(this).removeClass('animated ' + animationName);
            if (_cb) { _cb(e); }
        });
        return this;
    }
});
//]]>

// jQuery.getSelector
// https://stackoverflow.com/questions/2420970/how-can-i-get-selector-from-jquery-object
// use) $('#main').getSelector();
!(function ($, undefined) {
    /// adapted http://jsfiddle.net/drzaus/Hgjfh/5/

    var get_selector = function (element) {
        var pieces = [];

        for (; element && element.tagName !== undefined; element = element.parentNode) {
            if (element.className) {
                var classes = element.className.split(' ');
                for (var i in classes) {
                    if (classes.hasOwnProperty(i) && classes[i]) {
                        pieces.unshift(classes[i]);
                        pieces.unshift('.');
                    }
                }
            }
            if (element.id && !/\s/.test(element.id)) {
                pieces.unshift(element.id);
                pieces.unshift('#');
            }
            pieces.unshift(element.tagName);
            pieces.unshift(' > ');
        }

        return pieces.slice(1).join('');
    };

    $.fn.getSelector = function (only_one) {
        if (true === only_one) {
            return get_selector(this[0]);
        } else {
            return $.map(this, function (el) {
                return get_selector(el);
            });
        }
    };

})(window.jQuery);


/* ---------------------------------------
 * 프리로드
 * --------------------------------------- */
// 배경 이미지 프리로드
/* $(function () {
    if ($('#wrap #cimgPreload').length === 0) {
        $('#wrap').prepend('<div id="cimgPreload"></div>');
    }
    $('#cimgPreload').css({
        'opacity': 0.01,
        'width': '100%',
        'height': '100%',
        'position': 'absolute',
        'z-index': -999,
        'transform': 'scale(0.01)'
    });

    $('.contents').each(function (i) {
        var b = $(this).css('background-image');
        if (b === 'none') {
            return true;
        }
        b = b.split('/');
        var imgSrc = 'inc/images/' + b[b.length - 2] + '/' + b[b.length - 1].split('.')[0] + '.png';
        $('#cimgPreload').append('<div style=background-image:url(' + imgSrc + ')>');
    });

    $('.pageWrap .page').each(function (i) {
        var b = $(this).css('background-image');
        b = b.split('/');
        var imgSrc = 'inc/images/' + b[b.length - 2] + '/' + b[b.length - 1].split('.')[0] + '.png';
        $('#cimgPreload').append('<div style=background-image:url(' + imgSrc + ')>');
    });

    $('.tabWrap .tab').each(function (i) {
        var b = $(this).css('background-image');
        b = b.split('/');
        var imgSrc = 'inc/images/' + b[b.length - 2] + '/' + b[b.length - 1].split('.')[0] + '.png';
        $('#cimgPreload').append('<div style=background-image:url(' + imgSrc + ')>');
    });

    $('#cimgPreload div').css({
        'width': '100%',
        'height': '100%'
    });
}); */

/**
 * 깜빡거림 방지용 프리로더
 * @param {Array} paSelector image파일 경로 배열
 * @param {Boolean} pbDirect 경로 조합을 하지 않을지 여부
 * @returns null
 * @use imgPreLoad(['','','',], {pbDirect})
 */
function imgPreLoad(paSelector, pbDirect) {
    if (!paSelector || paSelector.length === 0) {
        return false;
    }
    $(function () {

        // pc + mobile
        if (wrapTop.find('#cimgPreload2').length === 0) {
            wrapTop.prepend('<div id="cimgPreload2"></div>');
            wrapTop.find('#cimgPreload2').css({
                'position': 'absolute',
                'left': '-99999px'
            });
        }

        var ksPageNo, ksImgSrc, i, b;

        ksPageNo = getFileName().split('.')[0].slice(-2);

        ksImgSrc = '';
        for (i = 0; i < paSelector.length; ++i) {
            if (paSelector[i].indexOf('.') < 0) {
                paSelector[i] = paSelector[i] + '.png';
            }
            if (pbDirect) {
                ksImgSrc = paSelector[i];
            }
            else if (
                paSelector[i].indexOf('.png') > -1 ||
                paSelector[i].indexOf('.gif') > -1 ||
                paSelector[i].indexOf('.jpg') > -1
            ) {
                ksImgSrc = 'inc/images/' + ksPageNo + '/' + paSelector[i];
            }
            else {
                b = $(paSelector[i]).css('background-image');
                b = b.split('/');
                ksImgSrc = 'inc/images/' + b[b.length - 2] + '/' + b[b.length - 1].split('.')[0] + '.png';
            }
            wrapTop.find('#cimgPreload2').append('<img src="' + ksImgSrc + '" alt="" title="" />');
        }
        wrapTop.find('#cimgPreload2 img').css({
            'position': 'absolute',
            'left': '0px',
            'top': '0px'
        });

        // PC일때
        if (user === 'pc') {
            if (wrapTop.find('#cimgPreload').length === 0) {
                wrapTop.prepend('<div id="cimgPreload"></div>');
                wrapTop.find('#cimgPreload').css({
                    'opacity': 0.01,
                    'width': '100%',
                    'height': '100%',
                    'position': 'absolute',
                    'z-index': -999,
                    'transform': 'scale(0.01)',
                    // 'pointer-events': 'none'
                });
            }
            ksPageNo = getFileName().split('.')[0].slice(-2);

            ksImgSrc = '';
            for (i = 0; i < paSelector.length; ++i) {
                if (paSelector[i].indexOf('.') < 0) {
                    paSelector[i] = paSelector[i] + '.png';
                }
                if (pbDirect) {
                    ksImgSrc = paSelector[i];
                }
                else if (
                    paSelector[i].indexOf('.png') > -1 ||
                    paSelector[i].indexOf('.gif') > -1 ||
                    paSelector[i].indexOf('.jpg') > -1
                ) {
                    ksImgSrc = 'inc/images/' + ksPageNo + '/' + paSelector[i];
                }
                else {
                    b = $(paSelector[i]).css('background-image');
                    b = b.split('/');
                    ksImgSrc = 'inc/images/' + b[b.length - 2] + '/' + b[b.length - 1].split('.')[0] + '.png';
                }
                wrapTop.find('#cimgPreload').append(`<div style="background-image:url('${ksImgSrc}')">`);
                // wrapTop.find('#cimgPreload').append('<div style=background-image:url(' + "'" + ksImgSrc + "'" + ')>');
                //$('#cimgPreload').append('<div style="width: 100%; height: 100%; position:absolute; background-image: url(' + ksImgSrc + ');"></div>');
            }
            wrapTop.find('#cimgPreload div').css({
                'width': '100%',
                'height': '100%',
                'position': 'absolute'
            });
        }
    });
}


// 공통이미지들 깜빡임 방지
/*
imgPreLoad([
    `${COMM_PATH}images/clickitem/ansbtn.png`,    // 확인하기
    `${COMM_PATH}images/clickitem/ansbtn2.png`,   // 확인하기2
    `${COMM_PATH}images/clickitem/solBtn.png`,    // 정답풀이
    `${COMM_PATH}images/clickitem/rebtn.png`,     // 다시하기
    `${COMM_PATH}images/clickitem/clickitem.png`, // 쿨음표

    `${COMM_IMG_SCI_PATH}aniitem/btn_play.png`,
    `${COMM_IMG_SCI_PATH}aniitem/btn_play_after.png`,
    `${COMM_IMG_SCI_PATH}aniitem/btn_stop.png`,

    `${COMM_IMG_SCI_PATH}clickitem/ansbtn.png`,
    `${COMM_IMG_SCI_PATH}clickitem/rebtn.png`,
    `${COMM_IMG_SCI_PATH}clickitem/replaybtn.png`,
    `${COMM_IMG_SCI_PATH}clickitem/showallbtn.png`,
    `${COMM_IMG_SCI_PATH}clickitem/showcmntbtn.png`,
    `${COMM_IMG_SCI_PATH}clickitem/soundbtn.png`,
    `${COMM_IMG_SCI_PATH}clickitem/clickitem.png`,
    `${COMM_IMG_SCI_PATH}clickitem/clickitem_tp1.png`,
    `${COMM_IMG_SCI_PATH}clickitem/clickitem_tp2.png`,
    `${COMM_IMG_SCI_PATH}clickitem/clickitem_tp3.png`,

    `${COMM_IMG_SCI_PATH}end_solve/check.png`,
    `${COMM_IMG_SCI_PATH}end_solve/check_off.png`,
    `${COMM_IMG_SCI_PATH}end_solve/solve_sticker.png`,

    `${COMM_IMG_SCI_PATH}naviitem/btn_next.png`,
    `${COMM_IMG_SCI_PATH}naviitem/btn_next_dis.png`,
    `${COMM_IMG_SCI_PATH}naviitem/btn_prev.png`,
    `${COMM_IMG_SCI_PATH}naviitem/btn_prev_dis.png`,
    `${COMM_IMG_SCI_PATH}naviitem/dot.png`,
    `${COMM_IMG_SCI_PATH}naviitem/dot_on.png`,
    `${COMM_IMG_SCI_PATH}naviitem/navi.png`,

    `${COMM_IMG_SCI_PATH}pop/btn_link_intl.png`,
    `${COMM_IMG_SCI_PATH}pop/btn_link_real.png`,
    `${COMM_IMG_SCI_PATH}pop/btn_pop_digital.png`,
    `${COMM_IMG_SCI_PATH}pop/btn_pop_think.png`,
    `${COMM_IMG_SCI_PATH}pop/btn_pop_tip.png`,
    `${COMM_IMG_SCI_PATH}pop/btn_pop_tip_dis.png`,
    `${COMM_IMG_SCI_PATH}pop/btn_popup_quiz_card.png`,
    `${COMM_IMG_SCI_PATH}pop/btn_popup_quiz_surprise.png`,
    `${COMM_IMG_SCI_PATH}pop/btn_popup_virtual.png`,

    `${COMM_IMG_SCI_PATH}research/btnTab1.png`,
    `${COMM_IMG_SCI_PATH}research/btnTab1_on.png`,
    `${COMM_IMG_SCI_PATH}research/btnTab2.png`,
    `${COMM_IMG_SCI_PATH}research/btnTab2_on.png`,
    `${COMM_IMG_SCI_PATH}research/btnTab3.png`,
    `${COMM_IMG_SCI_PATH}research/btnTab3_on.png`,
    `${COMM_IMG_SCI_PATH}research/check.png`,
    `${COMM_IMG_SCI_PATH}research/check_off.png`,
    `${COMM_IMG_SCI_PATH}research/slidebtn_arrow.png`,
], true);
*/

// 2024-07-25 14:46:07 - JGY : 가이드용 밑그림 자동
// <div id="wrap"/> 밑에 <div class="tt blk"/>가 있을 경우 테스터 동작
(function () {
    $(function () {
        const tt = wrapTop.find('.tt');
        if (tt.length === 0) {
            return;
        }
        var ksPageNo = getFileName().split('.')[0].slice(-2);
        tt.css('background', 'url(inc/images/' + ksPageNo + '/tt/tt' + '1' + '.png)');
        wrapTop.find('.setContent li').on('click', function () {
            try {
                tt.css('background', 'url(inc/images/' + ksPageNo + '/tt/tt' + ($(this).index() + 1) + '.png)');
            }
            catch (error) {
            }
        });
    });
})();

/**
 * 음성 프리로더
 * @param {Array} paSnd mp3 파일 경로 배열
 * @param {Boolean} pfComp 로드완료시 호출될 콜백함수
 * @use audioPreLoad([,,], pfComp)
 */
/*
function audioPreLoad(paSnd, pfComp) {

    // if (Array.isArray(paSnd) === false) {
    //     return false;
    // }

    if ($('#wrap .audiobox').length <= 0) {
        $('#wrap').append('<div class="audiobox"></div>');
    }

    // 개별 음원 미리 생성
    var html;
    paSnd.forEach(function (value, idx, self) {
        html = '<audio id="' + value + '" src="inc/media/mp3/' + value + '.mp3" type="audio/mp3"></audio>';
        $('#wrap .audiobox').append(html);
    });
    var knLoadCnt = 0;
    var knErrorCnt = 0;

    function onHandler(e) {
        //$(this).off(e.type, onHandler);
        $(this).off('error canplaythrough', onHandler);
        if (e.type === 'error') {
            knErrorCnt++;
        } else if (e.type === 'canplaythrough') {
            if ($(this)[0].readyState > 3) {
                knLoadCnt++;
            }
        }
        if ((knErrorCnt + knLoadCnt) === $('#wrap .audiobox audio').length) {
            //console.log('++ mp3LoadComplete');
            if (pfComp) {
                pfComp({
                    'load': knLoadCnt,
                    'error': knErrorCnt
                });
            }
        }
    }
    $('#wrap .audiobox audio').each(function (index) {
        $(this).off('error canplaythrough').on('error canplaythrough', onHandler);
        $(this)[0].load();
    });
}
*/
// 2024-07-04 09:57:57 - JGY: 음성 프리로드
// use) audioPreLoad([mp3파일경로], 로드완료시 호출될 콜백함수, 수동경로 사용여부
function audioPreLoad(paSnd, pfComp, pbIsDirect) {

    // 수동 경로 사용 여부
    if (typeof (pbIsDirect) !== 'undefined' && pbIsDirect === true) {
        pbIsDirect = true;
    }
    else {
        pbIsDirect = false;
    }

    /* if (Array.isArray(paSnd) === false) {
        return false;
    } */

    if (wrapTop.find('.audiobox').length <= 0) {
        wrapTop.append('<div class="audiobox"></div>');
    }

    // 개별 음원 미리 생성
    var html;
    paSnd.forEach(function (value, idx, self) {

        if (pbIsDirect) {
            value = value + '.mp3';
        }
        else {
            value = 'inc/media/mp3/' + value + '.mp3';
        }

        html = '<audio id="' + value + '" src="' + value + '" type="audio/mp3"></audio>';
        wrapTop.find('.audiobox').append(html);
    });
    var knLoadCnt = 0;
    var knErrorCnt = 0;

    function onHandler(e) {
        //$(this).unbind(e.type, onHandler);
        $(this).unbind('error canplaythrough', onHandler);
        if (e.type === 'error') {
            knErrorCnt++;
        } else if (e.type === 'canplaythrough') {
            if ($(this)[0].readyState > 3) {
                knLoadCnt++;
            }
        }
        if ((knErrorCnt + knLoadCnt) === wrapTop.find('.audiobox audio').length) {
            //console.log('++ mp3LoadComplete');
            if (pfComp) {
                pfComp({
                    'load': knLoadCnt,
                    'error': knErrorCnt
                });
            }
        }
    }
    wrapTop.find('.audiobox audio').each(function (index) {
        $(this).unbind('error canplaythrough').on('error canplaythrough', onHandler);
        $(this)[0].load();
    });
}

/* ---------------------------------------
 * 음성
 * --------------------------------------- */
/**
 * 음성 재생
 * @param {string} effect 음성 종류
 * @param {boolean} bStopOther 다름 음성에 기여 여부
 * @param {string} psParentPath 음성 파일 경로
 * @param {boolean} cookie 음성 제어(on, off)
 */
function effectAdo(effect, bStopOther, psParentPath, cookie) {
    // console.log('-------------', effect);
    //* 2024-08-19 15:15:30 - JGY : 클릭 효과음 제거
    /* if (effect === 'click') {
        if (bStopOther !== undefined && bStopOther === false) {
            bStopOther = false;
        } else {
            bStopOther = true;
        }
        // console.log('bStopOther:', bStopOther);

        //! 클릭에 ado_stop을 붙이면, click효과음 붙어있는곳이 많아서, 찾기 어려운 오류가 발생함
        if (bStopOther) {
            ado_stop();
        }
    } */
    if (effect === 'click') {
        return;
    }
    //*---------------------------------------------

    psParentPath = psParentPath || 'common/media/mp3/';

    //* 효과음 cookie 처리
    var cookie = cookie;
    if (!cookie) cookie = false;
    if (getCookie('effMode') == 'true' && !cookie && effect == 'click') {
        if (effect == 'click') {
            return false;
        }
        // return false;
    }
    //*----------

    if (effect == 'anschk_x') {
        var n = Math.floor(Math.random() * 6 + 1);
        effect = 'wrong' + n;
    }
    if (effect == 'anschk_x2') {
        effect = 'anschk_x';
    }
    if (effect == "sppl_o" || effect == "sppl_x") {
        var n = Math.floor(Math.random() * 3 + 1);
        effect = effect + n;
    }

    var ado = '#' + effect;
    if ($(ado).length == 0) {
        var html = '<audio id="' + effect + '" src="' + psParentPath + '' + effect + '.mp3" type="audio/mp3"></audio>';
        wrapTop.append(html);
    }

    if (bStopOther !== undefined && bStopOther === false) {
        bStopOther = false;
    } else {
        bStopOther = true;
    }

    if (bStopOther) {
        ado_stop();
    }

    if ($(ado)[0].currentTime > 0) {
        $(ado)[0].currentTime = 0;
    }
    $(ado)[0].play();

    // $(ado).off('ended').on('ended', function () {
    //     $('.ansX').removeClass('ansX');
    // });
}

/**
 * 선택 음성 정지
 * @param {string} effect 음성 종류
 */
function effectAdo_stop(effect) {
    if (effect.length < 1) {
        return false;
    }
    effect[0].pause();
    if (effect[0].currentTime > 0) {
        effect[0].currentTime = 0;
    }
}

/**
 * 모든 음성 일시정지
 */
function ado_pause() {
    $("audio").each(function () {
        var indp = $(this).attr('data-indp');

        if (indp == undefined && indp == false) {
            $(this)[0].pause();
        }
    });
}




//* 2024-07-25 15:15:40 - JGY : <audio/> 정지. excptAdo로 전달된 jQuery audio 객체는 정지 시키지 않음
// old
/**
 * 모든 음성 정지
 */
/* function ado_stop() {
    $('audio').each(function () {
        $(this)[0].pause();
        if ($(this)[0].currentTime > 0) {
            $(this)[0].currentTime = 0;
        }
    });
} */
function ado_stop(excptAdo) {
    // console.log('ado_stop - excptAdo', excptAdo);
    docTop.find('audio').each(function () {
        /* if (typeof (chaAdoCon) !== 'undefined') {
            if (this === chaAdoCon.audio[0]) return true;
        } */
        if (typeof (excptAdo) !== 'undefined' && this === excptAdo[0]) return true;

        // console.log($(this)[0].currentTime, $(this).is('#bgmAdo'));

        // #bgmAdo , .bgmAdo 예외처리
        if ($(this).is('#bgmAdo') || $(this).hasClass('bgmAdo')) {
        }
        else {
            $(this)[0].pause();

            if ($(this)[0].currentTime > 0) {
                // $(this)[0].pause();
                $(this)[0].currentTime = 0;
            }
        }
    });
}








// 2024-10-28 10:58:31 - JGY : 음성 처음부터 재생
function adoStart(sound) {
    adoReset(sound);
    sound[0].play();
}

// 2024-07-25 15:08:37 - JGY : 음성 재생
function adoPlay(sound) {
    sound[0].play();
}

// 2024-10-28 10:57:26 - JGY : 음성 일시정지
function adoPause(sound) {
    if (sound.length < 1) {
        return;
    }

    sound[0].pause();
}


// 2024-07-25 15:08:37 - JGY : 음성 정지(초기화)
function adoReset(sound) {
    if (sound.length < 1) {
        return;
    }

    sound[0].pause();
    if (sound[0].currentTime > 0) {
        sound[0].currentTime = 0;
    }
}

// 2021-03-26 16:48:12 - JGY
// 모든 음성 초기화
function adoResetAll() {
    docTop.find('audio').each(function () {
        $(this)[0].pause();
        if ($(this)[0].currentTime > 0) {
            $(this)[0].currentTime = 0;
        }
    });
}


// 개별 음원 재생
/*
    bStopOther = false 라는 값이 전달될 때에만, 다른것들에 영향 안줌
    sParentPath media/effect가 아닌 다른 효과음 경로값이 필요할때
    setTime: setTimeout 함수 호출 필요시 지연 시간

    ex) contentAdo('click', '', false, 100);
*/
// 개별 음원 재생
/*
    bStopOther = false 라는 값이 전달될 때에만, 다른것들에 영향 안줌
    sParentPath media/effect가 아닌 다른 효과음 경로값이 필요할때
    setTime: setTimeout 함수 호출 필요시 지연 시간

    ex) contentAdo('click', '', false, 100);
*/

let toReadTimer = -1;
let effectAdoTimer = -1;
let contentAdoTimer = -1;
let onAdoEnded = undefined; // 음원 종료

let $contentAdo = wrapTop.find('#contentAdo');

function contentAdo(effect, psPath, bStopOther, setTime) {
    let cnt = 0;

    const stop = typeof bStopOther !== 'undefined' && bStopOther === false;
    stop ? bStopOther = false : bStopOther = true;
    if (bStopOther) ado_stop();

    let adoURL = psPath ? psPath : './inc/media/mp3';

    // 다중 음원
    if (effect.indexOf('|') > -1) {
        const adoList = effect.split('|');
        $contentAdo.attr('class', adoList[cnt]);
        $contentAdo.attr('src', `${adoURL}/${adoList[cnt]}.mp3`);

        if (setTime) {
            let ksUrl = $contentAdo.attr('src');
            clearTimeout(contentAdoTimer);
            contentAdoTimer = setTimeout(function () {
                $contentAdo[0].play();
            }, setTime);
        }
        else {
            $contentAdo[0].play();
        }

        $contentAdo.off('ended').on('ended', function () {
            // if(onAdoEnded !== undefined) onAdoEnded($(this).attr('class'));

            if (adoList.length === cnt + 1) {
                $contentAdo[0].pause();
                $contentAdo[0].currentTime = 0;
            }
            else {
                cnt++;
                $contentAdo.attr('class', adoList[cnt]);
                $contentAdo.attr('src', `${adoURL}/${adoList[cnt]}.mp3`);
                // $contentAdo[0].play();

                if (setTime) {
                    clearTimeout(contentAdoTimer);
                    contentAdoTimer = setTimeout(() => {
                        $contentAdo[0].play();
                    }, setTime);
                }
                else {
                    $contentAdo[0].play();
                }
            }
        });

    }
    // 단일 음원
    else {
        $contentAdo.attr('class', effect);
        $contentAdo.attr('src', `${adoURL}/${effect}.mp3`);

        if (setTime) {
            setTimeout(() => {
                $contentAdo[0].play();
            }, setTime);
        }
        else {
            $contentAdo[0].play();
        }

        $contentAdo.off('ended').on('ended', function () {
            if (!$(`[data-ado="${effect}"]`).hasClass('clk')) {
                $(`[data-ado="${effect}"]`).removeClass('on');
            }
            if (onAdoEnded !== undefined) onAdoEnded($(this).attr('class'));
        });
    }
}


// 정답 효과음
function correctAudio() {
    effectAdo('correct_b');
}

// 오답 효과음
function wrongAudio() {
    effectAdo('wrong_b');
}

// 클릭 효과음
function clickAudio() {
    effectAdo('click');
}

function toggleAdo(effect) {
    var ado = '#' + effect;
    if ($(ado).length == 0) {
        var html = '<audio id="' + effect + '" src="inc/media/mp3/' + effect + '.mp3" type="audio/mp3"></audio>';
        wrapTop.append(html);
    }

    ado_stop();
    if ($(ado)[0].ended) {
        $(ado)[0].currentTime = 0;
    }

    if ($(ado)[0].currentTime > 0) {
        $(ado)[0].pause();
        $(ado)[0].currentTime = 0;
    }
    else {
        $(ado)[0].play();
    }
}






// 공통 audio preload
audioPreLoad(
    [
        `${COMM_PATH}media/mp3/anschk_o`,
        `${COMM_PATH}media/mp3/anschk_x`,
        `${COMM_PATH}media/mp3/click`,
        `${COMM_PATH}media/mp3/empty`,
    ],

    function () {
    },

    true,
);

/**
 * 단순 오디오 플레이어
 * @param {jQuery} wrap 컨트롤러가 생길 div wrapper
 * @param {String} src *.mp3 파일명
 * @param {String} psType 컨트롤러 디자인 타입
 * @see file:///Z:/WEP/타회사_2016_제안샘플/visang_2021/int/01_w/01/07_08/intd12_107_08_04.html
 */
// 재생, 일시정지, 정지만 있음
var AudioSimpleContents = function AudioSimpleContents(wrap, src, psType) {

    var self = this;

    this.wrap = wrap;
    this.wrapCtrl = '';
    this.src = src;
    this.loop = false;

    this.init = function () {
        psType = psType || '';
        if (psType) {
            wrap.addClass(psType);
        }

        this.makeWrap();
        this.makeBtn();
        this.addEvent();

        this.wrap.find('.btn').removeClass('on');
        this.wrap.find('.play').show();
        this.wrap.find('.pause').hide();
    };
    this.makeWrap = function () {
        var html = '<div class="ctrlWrap"></div>';
        this.wrap.append(html);
        this.wrapCtrl = this.wrap.find('.ctrlWrap');
    };
    this.makeBtn = function () {
        var html = '<div class="bg"></div>';
        html += '<div class="btn play"></div>';
        html += '<div class="btn pause"></div>';
        html += '<div class="btn stop"></div>';
        this.wrapCtrl.append(html);
    };
    this.addEvent = function () {
        this.wrap.find('.play').unbind('click').on('click', function () {
            self.play();
        });
        this.wrap.find('.pause').unbind('click').on('click', function () {
            self.pause();
        });
        this.wrap.find('.stop').unbind('click').on('click', function () {
            self.stop();
        });
    };

    this.play = function () {
        this.wrap.find('.btn').removeClass('on');
        this.wrap.find('.play').addClass('on');

        this.wrap.find('.pause').show();
        this.wrap.find('.play').hide();

        contentAdo(this.src, false);

        $('#' + this.src).unbind('ended').on('ended', function () {
            self.stop();

            // 무한 루프 처리
            if (self.loop === true) {
                self.play();
            }
        });
    };

    this.pause = function () {
        this.wrap.find('.btn').removeClass('on');
        this.wrap.find('.pause').addClass('on');

        this.wrap.find('.play').show();
        this.wrap.find('.pause').hide();

        if ($('#' + this.src).length > 0) {
            $('#' + this.src)[0].pause();
        }
    };

    this.stop = function () {
        this.pause();
        this.wrap.find('.btn').removeClass('on');
        $('#' + this.src).unbind('ended');

        if ($('#' + this.src).length > 0) {
            if ($('#' + this.src)[0].currentTime > 0) {
                $('#' + this.src)[0].currentTime = 0;
            }
        }
    };
};










/* =========================================================================================
 * 과목 공통 기능
 * ====================================================================================== */
/* ---------------------------------------
 * 세팅
 * --------------------------------------- */
// loadScriptFile('common/js/jquery.ui.drag.js', function (){});
// loadScriptFile('common/js/jquery.ui.touch-punch.min.js', function (){});
// loadScriptFile('common/js/jquery.mCustomScrollbar.js', function (){});
loadScriptFile('common/js/dragContents.js', function () { });
loadScriptFile('common/js/scrollContents.js', function () { });
loadScriptFile('common/js/lineContents.js', function () { });
/**
 * 컨텐츠 관련
 * @param {*} wrap 컨텐츠가 만들어질 요소
 * @param {boolean} bStopOther 다른 음성요소 정지 시킬지 여부
 */
var contentsSet = function contentsSet(wrap, bStopOther) {
    var self = this;
    this.wrap = wrap;
    this.root = undefined;

    this.bStopOther = (bStopOther === false) ? false : true;

    var setT;

    // callback
    this.onClick = null;        // 클릭 시
    this.onWrite = null;        // 텍스트 입력 시
    this.onDrag = null;         // 드래그 시작
    this.endDrag = null;        // 드래그 끝
    this.onDrop = null;         // 드롭 시
    this.onConnect = null;      // 선 연결시
    this.onCorrect = null;      // 정답
    this.onWrong = null;        // 오답
    this.onShowAns = null;      // 정답보기
    this.onReset = null;        // 다시하기

    var effect = 'click';

    self.wrap.find('.btnPop[data-type="solution"]').removeClass('on').hide();

    /**
     * 클릭 컨텐츠 세팅
     * @param {Number} set clickItem의 총 개수
     * @param {String} type clickContents의 클릭 타입('checkbox', 'sequence', 'OX','cho', 'ox_direct')
     * @param {Number} ansIdx OX 정답 index
     */
    this.clickCon = function (set, type, ansIdx) {
        self.clickCon = new clickContents(set, self.wrap, type, ansIdx);
        self.clickCon.init();


        self.clickCon.onClick = function (pbIsOpen, pnIdx, pbIsSetRe) {
            // console.log('클릭');
            effect = 'click';

            if (pbIsSetRe) {
                self.wrap.find('.btnPop[data-type="solution"]').show();
            }
            else {
                self.wrap.find('.btnPop[data-type="solution"]').removeClass('on').hide();
                self.wrap.find('.pop[data-type="solution"]').hide().remove();
            }

            if (wrapTop.hasClass('checkQuiz')) {
                if (pbIsSetRe) {
                    if ($('.setContent > li:last-child').hasClass('on')) {
                        $('.finish_btn').addClass('on');
                    }
                    effect = 'anschk_o';
                }
                else {
                    $('.finish_btn').removeClass('on');
                }
            }

            if (self.clickCon.type == 'ox' || self.clickCon.type == 'OX') {
                if (!pbIsOpen && self.clickCon.items.eq(pnIdx - 1).hasClass('on')) {
                    effect = 'anschk_x';
                }
            }

            /* if (self.clickCon.type.toLowerCase() === 'ox_direct') {

                // 정답
                // if (pbIsOpen && self.clickCon.items.filter(`[data-idx="${pnIdx}"]`).attr('data-ans') === 'true') {
                // }
                effect = 'empty';
            } */

            effectAdo(effect, self.bStopOther);
            if (self.onClick) { self.onClick(pbIsOpen, pnIdx, pbIsSetRe); }
        };
        self.clickCon.onReset = function () {
            // console.log('다시하기');
            effect = 'click';
            effectAdo(effect, self.bStopOther);

            self.wrap.find('.btnPop[data-type="solution"]').removeClass('on').hide();
            self.wrap.find('.pop[data-type="solution"]').hide().remove();
            if (self.onReset) { self.onReset(); }
        };
        self.clickCon.onShowAns = function (pbIsOpen) {
            // console.log('확인하기');
            self.wrap.find('.btnPop[data-type="solution"]').show();
            if (self.clickCon.type == 'ox' || self.clickCon.type == 'OX') {
                if (pbIsOpen) {
                    return;
                }
            }
            effect = 'click';

            if (wrapTop.hasClass('checkQuiz')) {
                effect = 'anschk_o';
            }

            /* if (self.clickCon.type.toLowerCase() === 'ox_direct') {
                let isCorrect = pbIsOpen;

                console.log(isCorrect);
                effect = 'empty';
                // 정오답 판별 안됨.
            } */

            effectAdo(effect, self.bStopOther);
            if (self.onShowAns) { self.onShowAns(pbIsOpen); }
        };
        self.clickCon.onCorrect = function () {
            // console.log('정답');
            effect = 'anschk_o';
            if (wrapTop.hasClass('checkQuiz')) {
                if (self.clickCon.type == 'ox' || self.clickCon.type == 'OX') {
                    if (self.clickCon.clickItemWrap.find('[data-ans="true"]').length == self.clickCon.clickItemWrap.find('.on[data-ans="true"]').length) {
                        effect = 'anschk_o';
                    }
                    else {
                        effect = 'click';
                    }
                }
            }


            effectAdo(effect, self.bStopOther);
            if (self.onCorrect) { self.onCorrect(); }
        };
        self.clickCon.onWrong = function () {
            // console.log('오답');
            effect = 'anschk_x';
            effectAdo(effect, self.bStopOther);
            if (self.onWrong) { self.onWrong(); }
        };
        self.clickCon.onShowCho = function () {
            // console.log('초성보기');
            effect = 'click';
            effectAdo(effect, self.bStopOther);
            if (self.onShowCho) { self.onShowCho(); }
        };
    };

    /**
     * .clickItem과 연결된 요소 생성
     */
    this.clickConn = function (cnt) {
        if (!self.clickCon) {
            console.log('w(ﾟДﾟ)w clickContents is noting...');
            return;
        }

        let html = `<div class="connItemGroup">`;
        for (let i = 0; i < self.clickCon.clickItems; ++i) {
            html += `<div class="connItem connItem${i + 1}" data-idx="${i + 1}"></div>`;
        }
        html += '</div>';

        self.clickCon.itemwrap.append(html);
        self.clickCon.connItemWrap = self.clickCon.itemwrap.find('.connItemGroup');
        self.clickCon.connItem = self.clickCon.connItemWrap.find('.connItem');
        self.clickCon.connItem.hide();

        // self.clickCon.onClick = function (pbIsOpen, pnIdx, pbIsSetRe) {
        //     const $ts = self.clickCon.items.eq(pnIdx - 1);
        //     const idx = parseInt($ts.attr('data-idx'), 10);

        //     const connItem = self.clickCon.connItem.filter(`[data-idx="${idx}"]`);

        //     // show
        //     if ($(this).hasClass('on')) {
        //         connItem.show().addClass('active');
        //     }
        //     // hide
        //     else {
        //         connItem.hide().removeClass('active');
        //     }
        // };

        self.clickCon.items.on('click', function () {
            const $ts = $(this);
            const idx = parseInt($ts.attr('data-idx'), 10);

            const connItem = self.clickCon.connItem.filter(`[data-idx="${idx}"]`);

            // show
            if ($(this).hasClass('on')) {
                connItem.show().addClass('active');
            }
            // hide
            else {
                connItem.hide().removeClass('active');
            }
        });

        self.clickCon.ansBtn.on('click', function () {
            const $ts = $(this);
            // 확인하기
            if ($ts.hasClass('re')) {
                if (self.clickCon.connItemWrap) {
                    self.clickCon.connItem.show().addClass('active');
                }
            }
            // 다시하기
            else {
                self.clickCon.connItem.hide().removeClass('active');
            }
        });
    };

    /**
     * 드래그 컨텐츠 세팅
     * @param {Array} set drag, drop 생성 정보값
     */
    this.dragCon = function (set) {
        console.log('dragCon: ', set);
        self.dragCon = new dragContents(self.wrap, set);
        self.dragCon.init();
        self.dragCon.onDrag = function (pjRec, e, obj) {
            // console.log('드래그 시작');
            if (self.onDrag) { self.onDrag(pjRec, e, obj); }
        };
        self.dragCon.endDrag = function (pjRec, e, obj) {
            // console.log('드래그 완료');
            if (self.endDrag) { self.endDrag(pjRec, e, obj); }
        };
        self.dragCon.onDrop = function (pnDragIdx, pnDropIdx, pbAns, pbComplete, pjRec, e, obj) {
            // console.log('드롭 완료');
            effect = 'click';

            if (wrapTop.hasClass('checkQuiz')) {
                if (pbComplete) {
                    if ($('.setContent > li:last-child').hasClass('on')) {
                        $('.finish_btn').addClass('on');
                    }
                    effect = 'anschk_o';
                }
                else {
                    $('.finish_btn').removeClass('on');
                }
            }
            effectAdo(effect, self.bStopOther);
            if (self.onDrop) { self.onDrop(pnDragIdx, pnDropIdx, pbAns, pbComplete, pjRec, e, obj); }
        };
        self.dragCon.onShowAns = function (dragIdxInfo, dropIdxInfo) {
            // console.log('정답보기');
            effect = 'click';
            if (wrapTop.hasClass('checkQuiz')) {
                effect = 'anschk_o';
            }
            effectAdo(effect, self.bStopOther);
            if (self.onShowAns) { self.onShowAns(dragIdxInfo, dropIdxInfo); }
        };
        self.dragCon.onReset = function () {
            // console.log('다시하기');
            effect = 'click';
            effectAdo(effect, self.bStopOther);

            if (self.onReset) { self.onReset(); }
        };
        self.dragCon.onCorrect = function () {
            // console.log('정답');
            effect = 'anschk_o';
            // if(wrapTop.hasClass('checkQuiz') && pbComplete){
            //     effect = 'anschk_o';
            // }
            effectAdo(effect, self.bStopOther);
            if (self.onCorrect) { self.onCorrect(); }
        };
        self.dragCon.onWrong = function () {
            // console.log('오답');
            effect = 'anschk_x';
            effectAdo(effect, self.bStopOther);
            if (self.onWrong) { self.onWrong(); }
        };
    };





    /**
     * 선긋기 HTML생성
     * @param {*} data
     */
    this.lineConHtml = function (data) {

        if (self.wrap.find('.lineWrap').length > 0) {
            self.wrap.find('.lineWrap').remove();
        }

        let html = `
            <div class="lineWrap">
                <div class="lineArea">
                    <div class="imgArea"></div>
                    <div class="leftLine">
                        <!--
                        <div class="leftItem clickArea" data-line-ans="0_1">
                            <div class="dot"></div>
                        </div>
                        <div class="leftItem clickArea" data-line-ans="1_0">
                            <div class="dot"></div>
                        </div>
                        <div class="leftItem clickArea" data-line-ans="2_2">
                            <div class="dot"></div>
                        </div>
                        -->
                    </div>
                    <div class="rightLine">
                        <!--
                        <div class="rightItem r_item">
                            <div class="dot"></div>
                        </div>
                        <div class="rightItem r_item">
                            <div class="dot"></div>
                        </div>
                        <div class="rightItem r_item">
                            <div class="dot"></div>
                        </div>
                        -->
                    </div>
                </div>
                <div class="btnWrap">
                    <div class="ansbtn"></div>
                </div>
            </div>
        `;
        self.wrap.append(html);

        html = ``;

        const leftLine = self.wrap.find('.leftLine');
        const rightLine = self.wrap.find('.rightLine');

        // left
        let i, j, k;
        for (i = 0; i < data.dots.left; ++i) {
            html += `
            <div class="leftItem clickArea" data-line-ans="${data.ans[i]}" data-cline="1" data-conn-line="1" data-idx="${i}">
                <div class="dot"></div>
            </div>`;
        }
        leftLine.empty().append(html);

        // right
        html = ``;
        for (i = 0; i < data.dots.right; ++i) {
            html += `
            <div class="rightItem r_item" data-cline="1" data-conn-line="1" data-idx="${i}">
                <div class="dot"></div>
            </div>`;
        }
        rightLine.empty().append(html);

        const leftItem = leftLine.find('.leftItem');
        const rightItem = rightLine.find('.rightItem');

        // group(conn-line)
        if (typeof (data.group) !== 'undefined') {
            let groupIdx = 0;
            let itemIdx;
            for (i = 0; i < data.group.length; ++i) {
                groupIdx++; // 1, 2, ...

                for (j = 0; j < data.group[i].left.length; ++j) {
                    itemIdx = data.group[i].left[j];
                    leftItem.filter(`[data-idx="${itemIdx}"]`).attr({
                        'data-cline': groupIdx,
                        'data-conn-line': groupIdx,
                    });
                }

                for (j = 0; j < data.group[i].right.length; ++j) {
                    itemIdx = data.group[i].right[j];
                    rightItem.filter(`[data-idx="${itemIdx}"]`).attr({
                        'data-cline': groupIdx,
                        'data-conn-line': groupIdx,
                    });
                }
            }
        }
    };

    /**
     * 선긋기 컨텐츠 세팅
     * @param {String} type 선긋기 타입('line', 'multiLine')
     * @param {Object} data 옵션
     */
    this.lineCon = function (type, data) {
        clearTimeout(setT);
        setT = setTimeout(function () {
            clearTimeout(setT);
            self.lineCon = new lineContents(self.wrap, type, data);
            self.lineCon.onConnect = function (curIndex, curDot, connDot, isConnAns, opt, setRe) {
                // console.log('연결');
                if (self.onConnect) { self.onConnect(curIndex, curDot, connDot, isConnAns, opt, setRe); }
            };
            self.lineCon.onCorrect = function (curIndex, curDot, connDot, isConnAns, opt, setRe) {
                // console.log('정답');
                effect = 'anschk_o';
                if (wrapTop.hasClass('checkQuiz')) {
                    if (setRe) {
                        if ($('.setContent > li:last-child').hasClass('on')) {
                            $('.finish_btn').addClass('on');
                        }
                        effect = 'anschk_o';
                    }
                    else {
                        $('.finish_btn').removeClass('on');
                    }
                }
                effectAdo(effect, self.bStopOther);
                if (self.onCorrect) { self.onCorrect(curIndex, curDot, connDot, isConnAns, opt); }
            };
            self.lineCon.onWrong = function () {
                // console.log('오답');
                effect = 'anschk_x';
                effectAdo(effect, self.bStopOther);
                if (self.onWrong) { self.onWrong(); }

                if (wrapTop.hasClass('checkQuiz')) {
                    $('.finish_btn').removeClass('on');
                }
            };
            self.lineCon.onShowAns = function () {
                // console.log('확인하기');
                effect = 'click';
                if (wrapTop.hasClass('checkQuiz')) {
                    effect = 'anschk_o';
                }
                effectAdo(effect, self.bStopOther);
                if (self.onShowAns) { self.onShowAns(); }
            };
            self.lineCon.onResetAns = function () {
                // console.log('다시하기');
                effect = 'click';
                effectAdo(effect, self.bStopOther);
                if (self.onReset) { self.onReset(); }
            };
            self.lineCon.init();

        }, 110 + 20);
    };

    /**
     * 글쓰기 컨텐츠 세팅
     * @param {String} totalT 생성할 <textarea>의 총 개수
     * @param {String} totalI 생성할 <input>의 총 개수
     */
    this.writeCon = function (totalT, totalI) {
        self.writeCon = new writeContents(self.wrap, totalT, totalI);
        self.writeCon.init();
        self.writeCon.onWrite = function (pjThis, e) {
            // console.log('입력중');
            if (self.onWrite) { self.onWrite(pjThis, e); }
        };
        self.writeCon.onShowAns = function () {
            // console.log('정답보기');
            effectAdo('click', self.bStopOther);
            if (self.onShowAns) { self.onShowAns(); }
        };
        self.writeCon.onReset = function () {
            // console.log('다시하기');
            effectAdo('click', self.bStopOther);
            if (self.onReset) { self.onReset(); }
        };
        self.writeCon.onClose = function () {
            // console.log('닫기');
            effectAdo('click', self.bStopOther);
            if (self.onClose) { self.onClose(); }
        };
    };
};

/**
 * 스크롤 관련
 * @param {*} wrap 스크롤이 만들어질 요소
 */
var scrollSet = function scrollSet(wrap) {
    var self = this;
    this.wrap = wrap;

    this.onScroll = null;

    /**
     * 스크롤 세팅
     * @param {string} tmax_pos 스크롤바의 최대너비 또는 높이값
     * @param {string} idx 스크롤 index값
     * @param {string} axis 스크롤의 가로형(x), 세로형(y)
     * @param {string} maxDir 최대값의 방향(r, l, b, t)
     */
    this.dragScroll = function (tmax_pos, idx, axis, maxDir) {
        self.wrap.attr('data-type', 'dragScroll');
        self.dragScroll = new dragScrollContents(self.wrap, tmax_pos, idx, axis, maxDir);
        self.dragScroll.init();

        self.dragScroll.onScroll = function (pnValue, pnPos, pnMinPos, pnMaxPos, ui) {
            // console.log('스크롤');
            if (self.onScroll) { self.onScroll(pnValue, pnPos, pnMinPos, pnMaxPos, ui); }
        };
    };

    /**
     * 스크롤 세팅
     * @param {string} axis 스크롤의 가로형(x), 세로형(y)
     */
    this.customScroll = function (axis) {
        self.wrap.attr('data-type', 'customScroll');
        self.wrap.each(function () {
            var $this = $(this);
            var $scrollPage = $this.find('.scrollpage');
            var knLength;
            var knScrollLength;
            if (axis == 'y') {
                knLength = pxToInt($this.height());
                knScrollLength = pxToInt($scrollPage.outerHeight(true));
            } else {
                knLength = pxToInt($this.width());
                knScrollLength = pxToInt($scrollPage.outerWidth(true));
            }

            if (knScrollLength > knLength) {
                $this.mCustomScrollbar({
                    scrollInertia: 200,
                    theme: 'my-theme',
                    axis: axis,
                    advanced: { autoScrollOnFocus: false },
                    callbacks: {
                        onScroll: function () {
                            if (self.onScroll) { self.onScroll(); }
                        }
                    }
                });
            }
        });
    };
};

/* ---------------------------------------
 * 페이지 이동
 * --------------------------------------- */
/**
 * 페이징 컨텐츠
 * @param {*} wrap pageingContents가 만들어질 요소
 * @param {string} type pageingContents의 구동 방식
 * @param {boolean} bStopOther 다른 음성요소 정지 시킬지 여부
 */
var pageingContents = function pageingContents(wrap, type, bStopOther) {
    var self = this;
    this.wrap = wrap;                               // .pageWrap
    this.pages = wrap.children('.pages');           // .pageWrap .pages
    this.page = wrap.find('.page');                 // .pageWrap .page
    this.pageNum = self.page.length;                // .page length
    this.currentPage = 0;                           // 현재 페이지 index
    this.next, this.prev, this.navi, this.dot;      // navigation

    this.bStopOther = bStopOther || true;            // 다른 음성요소 정지 시킬지 여부
    this.effectSnd = 'click';                       // 클릭효과음 ID값

    this.movingType = type;                         // 페이지 넘김 방식(cut, x, y)

    this.onMoveEnd = undefined;                     // callback

    this.init = function () {
        self.pageGrasp();

        self.wrap.find(".navigation").remove();
        self.currentPage = 0;
        self.pages.attr('data-page', self.currentPage);
        self.page.last().addClass('last');

        if (self.wrap.hasClass('moving')) {
            self.pages.css({ left: 0, top: 0 });
            self.wrap.removeClass('moving x y');
        }

        self.makeNavi();
        self.page.hide();
        self.page.eq(0).show();

        self.next.off('click').on("click", function () {
            self.nextClick($(this));
        });

        self.prev.off('click').on("click", function () {
            self.prevClick($(this));
        });

        self.dot.each(function () {
            $(this).off('click').on("click", function () {
                if ($(this).hasClass("on")) return false;
                var p = $(this).index();
                self.currentPage = p;
                self.pageMove(self.currentPage);
            });
        });

        if (self.pageNum === 1) {
            self.navi.hide();
        }

        self.moving(self.movingType);
    };

    this.pageGrasp = function () {
        if (self.page.eq(0).closest('.pageWrap').find('.pageWrap').length > 0) {
            self.page = wrap.find('.page').not(self.page.eq(0).closest('.pageWrap').find('.pageWrap .page'));
            self.pageNum = self.page.length;
        }

        if (self.pages.length === 0) {
            self.page.eq(0).closest('.pageWrap').prepend('<div class="pages"></div>');
            self.pages = self.wrap.children('.pages');
            self.pages.append(self.page);
        }
    };

    this.makeNavi = function () {
        var html = '<div class="navigation"></div>';
        if (self.page.eq(0).closest('.pageWrap').find('.pageWrap').length > 0) {
            self.page.eq(0).closest('.pageWrap').append(html);
            self.navi = wrap.find('.navigation').not(self.page.eq(0).closest('.pageWrap').find('.pageWrap .navigation'));
        }
        else {
            self.wrap.append(html);
            self.navi = wrap.find('.navigation');
        }

        var prev = '<div class="prev dis"></div>';
        var next = '<div class="next"></div>';
        var pageing = '<div class="pageing"></div>';
        self.navi.append(prev + next + pageing);

        for (var i = 0; i < self.pageNum; i++) {
            self.navi.find(".pageing").append('<div class="dot"><span class="text">' + (i + 1) + '</span></div>');
        }

        self.next = self.navi.find(".next");
        self.prev = self.navi.find(".prev");
        self.dot = self.navi.find(".pageing .dot");

        self.dot.eq(0).addClass("on");
    };

    this.nextClick = function (el) {
        if (el.hasClass("dis")) { return false; }
        self.currentPage = self.currentPage + 1;
        self.pageMove(self.currentPage);
    };

    this.prevClick = function (el) {
        if (el.hasClass("dis")) { return false; }
        self.currentPage = self.currentPage - 1;
        self.pageMove(self.currentPage);
    };

    this.pageMove = function (page) {
        self.pages.off(sTransitionEnd).on(sTransitionEnd, function () {
            if (typeof (self.onMoveEnd) !== 'undefined') { self.onMoveEnd(); }
        });

        self.currentPage = page;

        effectAdo(self.effectSnd, self.bStopOther);

        self.dot.removeClass('on');
        self.dot.eq(self.currentPage).addClass('on');

        self.navi.find('.dis').removeClass('dis');

        if (self.currentPage == 0) {
            self.prev.addClass('dis');
        }
        else if (self.currentPage + 1 == self.pageNum) {
            self.next.addClass('dis');
        }

        self.pages.attr('data-page', self.currentPage);

        var myPos, myCnt;
        switch (self.movingType) {
            case 'cut':
            default:
                self.page.hide();
                self.page.eq(self.currentPage).show();
                break;
            case 'x':
                myCnt = parseInt(self.currentPage, 10) * pxToInt(self.wrap.width());
                myPos = '-' + myCnt + 'px';
                self.pages.css('left', myPos);
                break;
            case 'y':
                myCnt = parseInt(self.currentPage, 10) * pxToInt(self.wrap.height());
                myPos = '-' + myCnt + 'px';
                self.pages.css('top', myPos);
                break;
        }

        resetPopAll();
    };

    this.moving = function (psType) {
        switch (psType) {
            case 'cut':
            default:
                self.movingType = 'cut';
                self.wrap.removeClass('moving x y');
                self.wrap.addClass('cut');
                self.wrap.find('.page').css({
                    left: '0px',
                    top: '0px'
                });
                break;
            case 'x':
                self.movingType = 'x';
                self.wrap.removeClass('cut');
                self.wrap.addClass('moving x');
                self.wrap.find('.page').each(function (idx) {
                    $(this).css('left', pxToInt(self.wrap.width()) * idx);
                });
                break;
            case 'y':
                self.movingType = 'y';
                self.wrap.removeClass('cut');
                self.wrap.addClass('moving y');
                self.wrap.find('.page').each(function (idx) {
                    $(this).css('top', pxToInt(self.wrap.height()) * idx);
                });
                break;
        }
    };
};


// pageingContents상속. 효과음이 나도 다른 음성에 영향없게
// http://server.laypop.co.kr/visang_2021/int/01/01/07_08/intd12_102_07_08_04.html
var pageingContents2 = function pageingContents2(wrap) {
    pageingContents.call(this, wrap);

    var self = this;

    // var value;  // private
    // this.value;  // public

    this.pageMove = function (page) {
        self.wrap.find('.page').hide();
        self.wrap.find('.page').eq(self.currentPage).show();
        self.navi.find('.pageing .dot').removeClass('on');
        self.navi.find('.pageing .dot').eq(self.currentPage).addClass('on');

        // 효과음이 나도 다른 음성 영향 없게...
        effectAdo('click', false);
        /////

        $('.dis').removeClass('dis');
        if (self.currentPage == 0) {
            self.prev.addClass('dis');
        } else if (self.currentPage + 1 == self.pageNum) {
            self.next.addClass('dis');
        }
    };
};
pageingContents2.prototype = Object.create(pageingContents.prototype);
pageingContents2.prototype.constructor = pageingContents2;
/////

/**
 * 탭 컨텐츠
 * @param {*} wrap tabContents 만들어질 요소
 * @param {boolean} bStopOther 다른 음성요소 정지 시킬지 여부
 * 2024-08-20 14:57:25 - JGY : .navigation 추가
 */
var tabContents = function tabContents(wrap, bStopOther) {
    var self = this;
    this.wrap = wrap;                      // .tabWrap
    this.tabs = wrap.children('.tabs');    // .tabWrap .tabs
    this.tab = wrap.find('.tab');          // .tabWrap .tabs .tab
    this.tabNum = self.tab.length;         // .tab length
    this.currentTab = 0;                   // 현재 페이지 index
    this.btnWrap;                          // .btnTabWrap
    this.btn;                              // .btnTabWrap .btnTab
    this.navi = undefined;
    this.next = undefined;
    this.prev = undefined;
    this.dot = undefined;

    this.bStopOther = bStopOther || true;  // 다른 음성요소 정지 시킬지 여부
    this.effectSnd = 'click';              // 클릭효과음 ID값

    this.init = function () {
        self.tabGrasp();

        self.wrap.find(".navigation").remove();
        self.wrap.find(".btnTabWrap").remove();
        self.currentTab = 0;
        self.tabs.attr('data-tab', self.currentTab);

        self.makeBtnWrap();
        self.makeNavi();
        self.tab.hide();
        self.tab.eq(0).show();

        self.btn.each(function () {
            $(this).off('click').on("click", function () {
                if ($(this).hasClass("on")) return false;
                var p = $(this).index();
                self.currentTab = p;
                self.tabMove(self.currentTab);
            });
        });

        self.next.off('click').on("click", function () {
            self.nextClick($(this));
        });

        self.prev.off('click').on("click", function () {
            self.prevClick($(this));
        });

        self.dot.each(function () {
            $(this).off('click').on("click", function () {
                if ($(this).hasClass("on")) return false;
                var p = $(this).index();
                self.currentTab = p;
                self.tabMove(self.currentTab);
            });
        });

    };

    this.tabGrasp = function () {
        if (self.tab.eq(0).closest('.tabWrap').find('.tabWrap').length > 0) {
            self.tab = wrap.find('.tab').not(self.tab.eq(0).closest('.tabWrap').find('.tabWrap .tab'));
            self.tabNum = self.tab.length;
        }

        if (self.tabs.length === 0) {
            self.tab.eq(0).closest('.tabWrap').prepend('<div class="tabs"></div>');
            self.tabs = self.wrap.children('.tabs');
            self.tabs.append(self.tab);
        }
    };

    this.makeBtnWrap = function () {
        var html = '<div class="btnTabWrap"></div>';
        if (self.tab.eq(0).closest('.tabWrap').find('.tabWrap').length > 0) {
            self.tab.eq(0).closest('.tabWrap').append(html);
            self.btnWrap = wrap.find('.btnTabWrap').not(self.tab.eq(0).closest('.tabWrap').find('.tabWrap .btnTabWrap'));
        }
        else {
            self.wrap.append(html);
            self.btnWrap = wrap.find('.btnTabWrap');
        }

        for (var i = 0; i < self.tabNum; i++) {
            self.btnWrap.append('<div class="btnTab"><span class="text">' + (i + 1) + '</span></div>');
        }

        self.btn = self.btnWrap.find(".btnTab");

        self.btn.eq(0).addClass("on");
    };

    this.makeNavi = function () {
        var html = '<div class="navigation"></div>';

        if (self.tab.eq(0).closest('.tabWrap').find('.tabWrap').length > 0) {
            self.tab.eq(0).closest('.tabWrap').append(html);
            self.navi = wrap.find('.navigation').not(self.tab.eq(0).closest('.tabWrap').find('.tabWrap .navigation'));
        }
        else {
            self.wrap.append(html);
            self.navi = wrap.find('.navigation');
        }

        var prev = '<div class="prev dis"></div>';
        var next = '<div class="next"></div>';
        var pageing = '<div class="pageing"></div>';
        self.navi.append(prev + next + pageing);

        for (var i = 0; i < self.tabNum; i++) {
            self.navi.find(".pageing").append('<div class="dot"><span class="text">' + (i + 1) + '</span></div>');
        }

        self.next = self.navi.find(".next");
        self.prev = self.navi.find(".prev");
        self.dot = self.navi.find(".pageing .dot");

        self.dot.eq(0).addClass("on");
    };

    this.nextClick = function (el) {
        if (el.hasClass("dis")) { return false; }
        self.currentTab = self.currentTab + 1;
        self.tabMove(self.currentTab);
    };

    this.prevClick = function (el) {
        if (el.hasClass("dis")) { return false; }
        self.currentTab = self.currentTab - 1;
        self.tabMove(self.currentTab);
    };

    this.tabMove = function (tab) {
        self.currentTab = tab;

        effectAdo(self.effectSnd, self.bStopOther);
        self.dot.removeClass('on');
        self.dot.eq(self.currentTab).addClass('on');

        self.navi.find('.dis').removeClass('dis');

        if (self.currentTab == 0) {
            self.prev.addClass('dis');
        }
        else if (self.currentTab + 1 == self.tabNum) {
            self.next.addClass('dis');
        }

        self.btn.removeClass('on');
        self.btn.eq(self.currentTab).addClass('on');

        self.tabs.attr('data-tab', self.currentTab);

        self.tab.hide();
        self.tab.eq(self.currentTab).show();

        resetPopAll();
    };
};

/* ---------------------------------------
 * 팝업
 * --------------------------------------- */
/**
 * 팝업 통합
 * @param {*} pjWrap 팝업이 만들어질 요소
//  * @param {boolean} bHideOther 다른 팝업을 닫을지 여부        → attribute로 변경
//  * @param {boolean} bStopOther 다른 음성요소 정지 시킬지 여부 → attribute로 변경
 */

function initPop(pjWrap) {
    var wrap;
    var popType;

    docTop.find('.btnPop, .btnPopup').off('click').on('click', function () {
        var $ts = $(this);
        var idx = $ts.attr('data-idx');
        popType = $(this).attr('data-type');

        wrap = pjWrap || $ts.parent();

        // 2024-08-22 17:19:38 - JGY : 임의 선택자가 있다면,
        if ($ts.is('[data-wrap]')) {
            // wrap = $ts.closest($ts.attr('data-wrap'));
            wrap = wrapTop.find($ts.attr('data-wrap'));
        }

        // 기본
        var bStopOther = true;  // 다른 media요소 정지
        var bHideOther = true;  // 다른 popup요소 닫기
        var bMakeMask = false;  // 마스크 생성할지 여부

        if ($ts.attr('data-stop-other') === 'false') {
            bStopOther = false;
        }
        if ($ts.attr('data-hide-other') === 'false') {
            bHideOther = false;
        }
        if ($ts.attr('data-mask') === 'true') {
            bMakeMask = true;
        }

        // .btnPop, .btnPopup 구별
        let bPop = $ts.hasClass('btnPop') || false;

        // 열기
        if (!$ts.hasClass('on')) {

            if (bHideOther === true) {
                // resetPop();
                if (bPop) {
                    resetPop();
                }
                else {
                    resetPopup();
                }
                //*----------------

            }

            if (bStopOther === true) {
                ado_stop();
            }

            $ts.addClass('on');

            popType = popType || '';

            if ($ts.hasClass('auto')) {
                makePop(wrap, $ts, idx, popType);
            }


            if ($ts.hasClass('btnPop')) {
                if (popType !== '') { wrap.find('.pop[data-idx="' + idx + '"]').attr('data-type', popType); }
                wrap.find('.pop[data-idx="' + idx + '"]').show();
            }
            else if ($ts.hasClass('btnPopup')) {
                if (popType !== '') { wrap.find('.popup[data-idx="' + idx + '"]').attr('data-type', popType); }

                if (bMakeMask === true) {
                    makeMask();
                }
                wrap.find('.popup[data-idx="' + idx + '"]').show();
            }

            if (popType === 'dragPop') {
                wrap.find('.pop[data-type="' + popType + '"]').draggable({
                    cursor: "pointer",
                    revert: "false",
                    scroll: false,
                    containment: wrapTop,
                    start: function (e, obj) {
                        var factor = FORTEACHERCD.responsive.baseContainerSize.zoom;
                        obj.position.top = Math.round(obj.position.top / factor);
                        obj.position.left = Math.round(obj.position.left / factor);
                        isRec = $(this);
                    },
                    drag: function (e, obj) {
                        var factor = FORTEACHERCD.responsive.baseContainerSize.zoom;
                        obj.position.top = Math.round(obj.position.top / factor);
                        obj.position.left = Math.round(obj.position.left / factor);
                    },
                    stop: function (e, obj) { },
                });
                wrap.find('.pop[data-type="' + popType + '"]').removeAttr('style').show();
            }

            $ts.removeClass('stop');
            if ($ts.attr('data-type') === 'yellow' || $ts.attr('data-type') === 'green' || $ts.attr('data-type') === 'active') {
                $ts.addClass('stop act');
            }

            closePop(bStopOther);
        }
        // 닫기
        else {
            $ts.removeClass('on');

            if ($ts.hasClass('btnPop')) {
                wrap.find('.pop[data-idx="' + idx + '"]').hide();
                if ($ts.hasClass('auto')) {
                    wrap.find('.pop[data-idx="' + idx + '"]').remove();
                }
            }
            else if ($ts.hasClass('btnPopup')) {
                wrap.find('.popup[data-idx="' + idx + '"]').hide();
                if ($ts.hasClass('auto')) {
                    wrap.find('.popup[data-idx="' + idx + '"]').remove();
                }
            }

            if (popType == 'dragPop') {
                wrap.find('.pop[data-type="' + popType + '"]').draggable('destroy').removeAttr('style');
            }
        }

        effectAdo('click', bStopOther);
    });
}

/**
 * pop 생성
 * @param {*} wrap 팝업이 만들어질 요소
 * @param {*} pjThis 팝업버튼
 * @param {Number} idx 팝업의 인덱스
 * @param {string} type 팝업의 타입
 */
function makePop(wrap, pjThis, idx, type) {
    var popHtml = '';
    if (pjThis.hasClass('btnPop')) {
        popHtml += '<div class="pop auto" data-idx="' + idx + '" data-type="' + type + '">';
    }
    else if (pjThis.hasClass('btnPopup')) {
        popHtml += '<div class="popup auto" data-idx="' + idx + '" data-type="' + type + '">';
    }
    popHtml += '    <div class="close"></div>';
    popHtml += '</div>';

    const $pop = $(popHtml);
    if (type === '') {
        $pop.removeAttr('data-type');
    }

    wrap.append(popHtml);
}

/**
 * 팝업 닫기
 * @param {boolean} bStopOther 다른 음성요소 정지 시킬지 여부
 * @param {boolean} bRemoveMask 모달용 마스크 삭제할지 여부
 */
function closePop(bStopOther, bRemoveMask) {
    docTop.find('.pop, .popup').find('.close').off('click').on('click', function () {
        var $ts = $(this);
        var pop = $ts.parent();
        var idx = pop.attr('data-idx');
        var type = pop.attr('data-type');
        var wrap = pop.parent();

        if (pop.hasClass('pop')) {
            wrap.find(`.btnPop[data-idx="${idx}"]`).removeClass('on');

            if (type === 'yellow' || type === 'green') {
                wrap.find(`.btnPop[data-type="yellow"][data-idx="${idx}"]`).removeClass('stop');
                wrap.find(`.btnPop[data-type="green"][data-idx="${idx}"]`).removeClass('stop');
            }
        }
        else if (pop.hasClass('popup')) {
            wrap.find(`.btnPopup[data-idx="${idx}"]`).removeClass('on stop');

            pop.find(`.btnPop[data-type="yellow"]`).removeClass('on act stop dis');
            pop.find(`.btnPop[data-type="green"]`).removeClass('on act stop dis');
            pop.find(`.pop[data-type="yellow"]`).remove();
            pop.find(`.pop[data-type="green"]`).remove();

            if (pop.hasClass('dragPop')) {
                pop.removeAttr('style');
            }
        }

        if (bRemoveMask) {
            removeMask();
        }

        pop.hide();

        if (pop.hasClass('auto')) {
            pop.remove();
        }

        if (type == 'dragPop') {
            wrap.find(`.pop[data-type="${type}"]`).removeAttr('style');
        }

        effectAdo('click', bStopOther);
    });
}

/**
 * 팝업 리셋
 */
function resetPopAll() {
    $('.btnPop, .btnPopup').removeClass('on dis stop off act');
    $('.pop').not('.popup').hide();
    $('.pop.auto, .popup.auto').remove();
    if ($('.pop').attr('data-type') == 'dragPop') {
        $('.pop').removeAttr('style');
    }
}

/**
 * 팝업(.pop) 모두 리셋
 */
function resetPop() {
    $('.btnPop').removeClass('on dis stop off act');

    $('.pop').not('.popup').hide();
    $('.pop.auto').remove();

    //* 2024-08-20 16:16:46 - .pop[data-type="tip"] 에는 영향 없도록
    /* $('.pop').not('.popup, [data-type="tip"]').hide();
    $('.pop.auto').not('[data-type="tip"]').remove(); */
    //*---------

    $('.pop[data-type="dragPop"]').removeAttr('style');
}

/**
 * 팝업(.popup) 모두 리셋
 */
function resetPopup() {
    removeMask();

    $('.btnPopup').removeClass('on dis stop off act');
    $('.popup').not('.pop').hide();
    $('.popup.auto').remove();
    $('.popup.dragPop').removeAttr('style');
}

/* ---------------------------------------
 * 클릭
 * --------------------------------------- */
/**
 * 클릭 컨텐츠
 * @param {number} items clickItem의 총 개수
 * @param {*} wrap clickContents가 만들어질 요소
 * @param {string} type clickContents의 클릭 타입('checkbox', 'sequence', 'OX','cho', 'ox_direct')
 * @param {array} ansIdx OX 정답 index
 */
var clickContents = function clickContents(items, wrap, type, ansIdx) {
    var self = this;
    this.wrap = wrap;               // .clickContent parent
    this.itemWrap = '';             // .clickContent
    this.clickItems = items;        // .clickItem의 총 개수
    this.openItemNum = 0;           // 열려있는 .clickItem의 총 개수
    this.items = '';                // .clickContent .clickItem
    this.ansBtn = '';               // .clickContent .ansbtn
    this.choBtn = '';               // .clickContent .chobtn

    this.clickItemWrap = '';        // .clickContent .clickItemWrap

    this.type = type;               // 클릭 타입('checkbox', 'sequence', 'OX','cho')
    this.ansIdx = ansIdx;           // OX 정답(Array)

    // callback
    this.onClick = undefined;       // clickItem 클릭할 때
    this.onShowAns = undefined;     // 정답보기
    this.onReset = undefined;       // 다시하기
    this.onShowCho = undefined;     // 초성보기
    this.onCorrect = undefined;     // 정답
    this.onWrong = undefined;       // 오답

    var setT;

    var kbIsOpen = false;

    this.init = function () {
        self.openItemNum = 0;

        if (self.wrap.find('.clickItem').length > 0) {
            self.wrap.find('.clickContent').remove();
        }

        self.makeWrap();
        self.makeItem();
        self.makeBtn();

        self.items.off('click').on('click', function () {
            var $this = $(this);
            var knIdx = parseInt($this.attr('data-idx'), 10);
            kbIsOpen = false;
            if (!$this.hasClass('on')) {
                $this.addClass('on');
                self.openItemNum++;
                kbIsOpen = true;
                switch (self.type) {
                    case 'sequence':
                        var knIdxNext = knIdx + 1;
                        self.items.filter('[data-idx="' + knIdxNext + '"]').addClass('act');
                        break;
                    case 'OX':
                    case 'ox':
                        if (wrapTop.hasClass('checkQuiz')) {
                            if ($this.attr('data-ans') == 'true') {
                                if (typeof self.onCorrect !== 'undefined') { self.onCorrect(); }
                            }
                            else {
                                kbIsOpen = false;
                                if (typeof self.onWrong !== 'undefined') { self.onWrong(); }
                                self.items.addClass('dis');
                                clearTimeout(setT);
                                setT = setTimeout(function () {
                                    self.items.removeClass('dis');
                                    $this.removeClass('on');
                                }, 800);
                            }
                        }
                        if (self.items.length == 2) {
                            self.items.removeClass('on');
                            $this.addClass('on');
                        }
                        break;
                    case 'ox_direct':
                        if (self.items.length === 2) {
                            self.items.removeClass('on');
                            $this.addClass('on');
                        }
                        break;
                    case 'cho':
                        $this.removeClass('cho');
                        break;
                }
            }
            else {
                $this.removeClass('on');
                kbIsOpen = false;
                self.openItemNum--;
            }

            var kbIsSetRe = false;
            switch (self.type) {
                case 'OX':
                case 'ox':
                    if (wrapTop.hasClass('checkQuiz')) {
                        if (self.clickItemWrap.find('[data-ans="true"]').length == self.clickItemWrap.find('.on[data-ans="true"]').length) {
                            self.items.addClass('dis');
                            self.ansBtn.addClass('re');
                            kbIsSetRe = true;
                        } else {
                            kbIsSetRe = false;
                        }
                    }
                    break;
                case 'ox_direct':
                    self.showAll(); // 바로 정오답 판별
                    break;
                default:
                    if (self.openItemNum === self.clickItems) {
                        self.ansBtn.addClass('re');
                        self.choBtn.addClass('off dis');
                        self.itemwrap.addClass('showAll');
                        kbIsSetRe = true;
                    }
                    else {
                        self.ansBtn.removeClass('re');
                        self.choBtn.removeClass('off dis');
                        self.itemwrap.removeClass('showAll');
                        kbIsSetRe = false;
                    }
                    break;
            }
            if (typeof self.onClick !== 'undefined') { self.onClick(kbIsOpen, knIdx, kbIsSetRe); }
        });

        self.addEventAnsBtn();
        self.addEventChoBtn();
    };

    this.showItems = undefined;
    this.makeShowItem = function () {
        let html = ``;
        html += `<div class="showItemGroup">`;
        for (let i = 0; i < self.clickItems; ++i) {
            html += `<div class="showItem showItem${i + 1}" data-show-idx="${i + 1}"></div>`;
        }
        html += `</div>`;

        self.itemwrap.append(html);
        self.showItems = self.itemwrap.find('.showItem');
        // self.showItems.hide();
        self.items.on('click', function () {
            const $ts = $(this);
            const idx = parseInt($ts.attr('data-idx'), 10);

            const showItem = self.showItems.filter(`[data-show-idx="${idx}"]`);

            if ($ts.hasClass('on')) {
                showItem.addClass('on');
            }
            else {
                showItem.removeClass('on');
            }
        });
    };

    //* 2024-07-30 17:40:53 - JGY : 정답버튼 교체
    this.setAnsBtn = function (pjAnsBtn) {
        if (self.ansBtn && self.ansBtn.hasClass('re')) {
            pjAnsBtn.addClass('re');
        }
        self.ansBtn = pjAnsBtn;
        self.addEventAnsBtn();
    };
    //*----------

    this.addEventAnsBtn = function () {
        let type = self.type || '';
        switch (type.toLowerCase()) {
            case 'checkbox':
                break;
            case 'sequence':
                break;
            case 'ox':
                break;
            case 'cho':
                break;
            default:
                // if (self.clickItems < 2 && $('#wrap').hasClass('kor')) {
                //     self.ansBtn.hide();
                // }
                break;
        }

        self.ansBtn.off('click').on('click', function (e) {
            // 다시하기
            if ($(this).hasClass('re')) {
                self.reset();
            }
            // 모두보기
            else {
                self.showAll();
            }
        });
    };

    this.addEventChoBtn = function () {
        self.choBtn.off('click').on('click', function () {
            // 초성보기
            if ($(this).hasClass('off')) {
                $(this).removeClass('off');
                self.items.removeClass('cho');
            }
            else {
                $(this).addClass('off');
                self.items.addClass('cho');
            }

            if (typeof self.onShowCho !== 'undefined') { self.onShowCho(); }
        });
    };

    this.reset = function () {
        self.itemwrap.removeClass('showAll');
        self.items.removeClass('on dis ans');
        self.openItemNum = 0;
        self.ansBtn.removeClass('re');

        switch (self.type) {
            case 'sequence':
                self.items.removeClass('act');
                self.items.eq(0).addClass('act');
                break;
            case 'cho':
                self.items.removeClass('cho');
                self.choBtn.removeClass('off dis');
                break;
        }

        kbIsOpen = false;

        //* 2024-07-30 17:50:39 - JGY : 스크롤 박스가 있고, 스크롤바가 활성되었을 경우 스크롤 리셋
        if (
            self.itemwrap.closest('.scrollbox').length > 0 &&
            !self.itemwrap.closest('.scrollbox').hasClass('noScroll')
        ) {
            self.itemwrap.closest('.scrollbox').mCustomScrollbar('scrollTo', 0, { scrollInertia: 300 });
            //self.itemwrap.find('.scrollbox').mCustomScrollbar("scrollTo", '0px', 'y');
            //self.itemwrap.find('.mCSB_container').css('top','0px');
        }

        if (typeof (self.showItems) !== 'undefined') {
            self.showItems.removeClass('on');
        }

        if (typeof self.onReset !== 'undefined') { self.onReset(); }
    };

    this.showAll = function () {
        self.itemwrap.addClass('showAll');
        self.ansBtn.addClass('re');
        self.openItemNum = self.clickItems;

        let isCorrect = false;

        switch (self.type) {
            case 'sequence':
                self.items.removeClass('act');
                self.items.eq(0).addClass('act');
                self.items.addClass('on');
                break;
            case 'OX':
            case 'ox':
            case 'ox_direct':
                var ansCnt = 0;

                let selectIdx = [];
                for (let i = 0; i < self.items.length; i++) {
                    if (self.items.eq(i).hasClass('on') && self.items.eq(i).attr('data-ans') == 'true') {
                        ansCnt++;
                        selectIdx.push(parseInt(self.items.eq(i).attr('data-idx'), 10));
                    }
                }

                if (self.itemwrap.find('.on').length > 0) {

                    // 2024-11-18 09:39:14 - JGY: 정오답 판별에 정답을 선택한 개수 추가
                    // old) if (ansCnt == self.itemwrap.find('[data-ans="true"]').length) {
                    if (
                        ansCnt === self.itemwrap.find('[data-ans="true"]').length &&
                        self.items.filter('.on').length === ansIdx.length
                    ) {
                        //------------

                        isCorrect = true;
                        if (typeof self.onCorrect !== 'undefined') { self.onCorrect(); }
                    }
                    else {
                        isCorrect = false;
                        if (typeof self.onWrong !== 'undefined') { self.onWrong(); }
                    }
                }

                self.items.removeClass('on');
                self.itemwrap.find('[data-ans="true"]').addClass('on dis ans');
                self.openItemNum = self.itemwrap.find('[data-ans="true"]').length;
                self.items.addClass('dis');
                break;
            case 'cho':
                self.choBtn.addClass('off dis');
                self.items.addClass('on');
                break;
            default:
                self.items.addClass('on');
                break;
        }

        if (typeof (self.showItems) !== 'undefined') {
            self.showItems.addClass('on');
        }

        if (self.type === 'ox_direct') {
            if (typeof self.onShowAns !== 'undefined') { self.onShowAns(isCorrect); }
        }
        else {
            if (typeof self.onShowAns !== 'undefined') { self.onShowAns(kbIsOpen); }
        }
    };

    this.makeWrap = function () {
        var html = '<div class="clickContent"></div>';
        self.wrap.append(html);
        self.itemwrap = self.wrap.find('.clickContent');
    };

    this.makeItem = function () {
        if (self.itemwrap.find('.clickItemWrap').length === 0) {
            self.itemwrap.append('<div class="clickItemWrap"></div>');
        }
        self.clickItemWrap = self.itemwrap.find('.clickItemWrap');

        var html = '';
        for (var i = 0; i < self.clickItems; i++) {
            html += '<div class="clickItem clickItem' + (i + 1) + '" data-idx="' + (i + 1) + '"></div>';
        }
        self.itemwrap.find('.clickItemWrap').append(html);
        self.items = self.itemwrap.find('.clickItem');

        if (self.items.length == 1) self.items.addClass('ex');

        self.setType();
    };

    this.makeBtn = function () {
        switch (self.type) {
            case 'cho':
                var choHtml = '<div class="chobtn"></div>';
                self.itemwrap.append(choHtml);
                break;
        }

        var html = '<div class="ansbtn"></div>';
        self.itemwrap.append(html);

        self.ansBtn = self.itemwrap.find('.ansbtn');
        self.choBtn = self.itemwrap.find('.chobtn');
    };

    this.setType = function () {
        switch (self.type) {
            case 'click':
            default:
                break;
            case 'checkbox':
                self.itemwrap.addClass('checkbox');
                break;
            case 'sequence':
                self.itemwrap.addClass('sequence');
                self.items.eq(0).addClass('act');
                break;
            case 'OX':
            case 'ox':
            case 'ox_direct':
                self.itemwrap.addClass('ox');
                for (i = 0; i < self.ansIdx.length; i++) {
                    self.items.eq(self.ansIdx[i]).attr('data-ans', 'true');
                }
                break;
            case 'cho':
                self.itemwrap.addClass('cho');
                break;
        }
    };
};

// 2021-04-19 09:23:07 - JGY
// 클릭요소의 opacity를 조정하는 것이 아니라, on클래스를 toggle함
var clickContents2 = function clickContents2(items, wrap) {
    clickContents.call(this, items, wrap);

    var self = this;
    var value;  // private
    this.value;  // public

    this.init = function () {
        this.openItemNum = 0;

        if (this.wrap.find('.clickItem').length > 0) {
            this.wrap.find('.clickContent').remove();
        }

        if (self.clickItems > 0) {
            this.makeWrap();
            this.makeItem();
            this.makeBtn();

            this.items.on('click', function () {
                // 바뀐부분
                /* if ($(this).css('opacity') == '0') {
                    $(this).css('opacity', '1');
                    self.openItemNum++;
                } else {
                    $(this).css('opacity', '0');
                    self.openItemNum--;
                } */
                if ($(this).hasClass('on') === false) {
                    $(this).addClass('on');
                    self.openItemNum++;
                } else {
                    $(this).removeClass('on');
                    self.openItemNum--;
                }
                /////
                effectAdo(self.effectSnd, self.bStopOther);
                if (self.openItemNum == self.clickItems) {
                    self.ansbtn.addClass('re');
                } else {
                    self.ansbtn.removeClass('re');
                }
            });

            this.ansbtn.on('click', function () {

                effectAdo(self.effectSnd, self.bStopOther);
                // 바뀐 부분
                //다시하기
                if ($(this).hasClass('re')) {
                    //self.items.css('opacity', '0');
                    self.items.removeClass('on');
                    self.openItemNum = 0;
                    self.ansbtn.removeClass('re');
                    //모두보기
                } else {
                    //self.items.css('opacity', '1');
                    self.items.addClass('on');
                    self.openItemNum = self.clickItems;
                    self.ansbtn.addClass('re');
                }
                /////
            });
        } else {
            this.makeWrap();
            this.makeItem();

            this.items.on('click', function () {
                effectAdo(self.effectSnd, self.bStopOther);
                // 바뀐부분
                /* if ($(this).css('opacity') == '0') {
                    $(this).css('opacity', '1');
                } else {
                    $(this).css('opacity', '0');
                } */
                if ($(this).hasClass('on') === false) {
                    $(this).addClass('on');
                } else {
                    $(this).removeClass('on');
                }
            });
        }
    };
};
clickContents2.prototype = Object.create(clickContents.prototype);
clickContents2.prototype.constructor = clickContents2;

/* ---------------------------------------
 * 줌
 * --------------------------------------- */
/**
 * 확대/축소 컨텐츠
 * @param {*} wrap zoomContents가 생성될 요소
 */
var zoomContents = function zoomContents(wrap) {
    var self = this;
    this.wrap = wrap;

    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;

    this.max = 2.0;         // 최대확대값
    this.min = 0.2;         // 최소확대값
    this.chg = 0.2;         // 확대축소 변위값
    this.duration = 0.3;    // transition-duration

    this.factor = 1;

    this.zoomWrap, this.zoombtn, this.zoomImg, this.zoomImgbox;

    this.posX = 0;
    this.posY = 0;

    this.init = function () {
        if (self.wrap.find('.zoomWrap').length > 0) {
            self.wrap.find('.zoomWrap').remove();
        }

        self.makeHtml();

        self.zoomImgMove(self.zoomImg);

        self.zoomImg.css(self.wrap.css('background'));

        self.zoombtn.find('.text').html(`${self.scale * 100}%`);

        self.zoombtn.find('.plus').on('click', function () {
            self.scaleUp();
        });

        self.zoombtn.find('.minus').on('click', function () {
            self.scaleDown();
        });

        self.zoombtn.find('.text').on('click', function () {
            self.zommImg.css({
                'transform': 'scale(1)'
            });

            self.zoombtn.find('.text').html(100 + '%');
            self.scale = 1;
        });


        self.zoomImgbox.css({
            'width': `${self.zoomImg.width()}px`,
            'height': `${self.zoomImg.height()}px`
        });
    };

    this.makeHtml = function () {
        var html = '<div class="zoomWrap">';
        html += '<div class="zoombtn">';
        html += '<div class="btn plus"></div>';
        html += '<div class="text"></div>';
        html += '<div class="btn minus"></div>';
        html += '</div>';
        html += '<div class="zoombox">';
        html += '<div class="zoomImgbox">';
        html += '<div class="zoomImg"></div>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
        self.wrap.append(html);

        self.zoomWrap = self.wrap.find('.zoomWrap');
        self.zoombtn = self.wrap.find('.zoombtn');
        self.zoomImgbox = self.wrap.find('.zoomImgbox');
        self.zoomImg = self.wrap.find('.zoomImg');
    };

    this.scaleUp = function () {
        if (self.scale < self.max) {
            getScale();
            self.factor = FORTEACHERCD.responsive.baseContainerSize.zoom;
            effectAdo('click');
            self.scale += self.chg;
            self.scale = Number(Number(String(self.scale)).toFixed(1));
            var n = Math.round(self.scale * 100);
            self.zoombtn.find('.text').html(`${n}%`);

            self.translateX = 0;
            self.translateY = 0;

            self.zoomImg.css({
                'transform': `translate(${self.translateX}px, ${self.translateY}px) scale(${self.scale})`,
                'transition': `transform ${self.duration}s`
            });
        }

        if (self.scale > 1) {
            self.zoomImg.css('cursor', 'pointer');
            self.zoomWrap.addClass('map_draggable');
        }
        else {
            self.zoomImg.css('cursor', 'auto');
            self.zoomWrap.removeClass('map_draggable');
        }
    };

    this.scaleDown = function () {
        if (self.scale > self.min) {
            effectAdo('click');
            self.scale -= self.chg;
            self.scale = Number(Number(String(self.scale)).toFixed(1));
            self.zoomImg.css('transform', 'scale(' + self.scale + ')');
            var n = Math.round(self.scale * 100);
            self.zoombtn.find('.text').html(`${n}%`);

            self.translateX = 0;
            self.translateY = 0;

            self.zoomImg.css({
                'transform': `translate(${self.translateX}px, ${self.translateY}px) scale(${self.scale})`,
                'transition': `transform ${self.duration}s`
            });
        }

        if (self.scale > 1) {
            self.zoomImg.css('cursor', 'pointer');
            self.zoomWrap.addClass('map_draggable');
        }
        else {
            self.zoomImg.css('cursor', 'auto');
            self.zoomWrap.removeClass('map_draggable');
        }
    };

    this.zoomImgMove = function (el) {
        var moving = false;
        var oX, oY, zoomX, zoomY;
        var mx, my;

        el.on('mousedown', function (e) {
            if (self.scale > 1) {
                moving = true;
                mx = e.pageX;
                my = e.pageY;
                oX = mx - el.position().left;
                oY = my - el.position().top;
            }
        });

        el.on('mousemove', function (e) {
            if (moving) {
                var factor = FORTEACHERCD.responsive.baseContainerSize.zoom;

                mx = e.pageX;
                my = e.pageY;
                zoomX = ((mx - oX) / factor) + (((self.scale - 1) * el.width()) / 2);
                zoomY = ((my - oY) / factor) + (((self.scale - 1) * el.height()) / 2);

                self.translateX = zoomX;
                self.translateY = zoomY;

                if (wrapTop.hasClass('math')) {
                    let leftLimit = (pxToInt(self.zoomImg.width() * self.scale) - pxToInt(self.zoomImgbox.width())) / 2;
                    let rightLimit = (pxToInt(self.zoomImg.height() * self.scale) - pxToInt(self.zoomImgbox.height())) / 2;

                    // if(Math.abs(zoomX) > leftLimit || Math.abs(zoomY) > rightLimit){
                    //    return;
                    // }

                    // 가로
                    if (zoomX < -leftLimit) {
                        zoomX = -leftLimit;
                    }
                    else if (zoomX > leftLimit) {
                        zoomX = leftLimit;
                    }

                    // 세로
                    if (zoomY < -rightLimit) {
                        zoomY = -rightLimit;
                    }
                    else if (zoomY > rightLimit) {
                        zoomY = rightLimit;
                    }
                }

                self.zoomImg.css({
                    'transform': `translate(${zoomX}px, ${zoomY}px) scale(${self.scale})`,
                    'transition': `transform ${0}s`
                });

                self.zoomImg.find('*').addClass('moveDis');
            }
        });


        el.on('mouseup', function (e) {
            if (moving) {
                moving = false;
                self.zoomImg.find('.moveDis').removeClass('moveDis');
            }
        });

        el.on('mouseleave', function (e) {
            if (moving) {
                moving = false;
                self.zoomImg.find('.moveDis').removeClass('moveDis');
            }
        });
    };

    this.reset = function () {
        self.scale = 1;
        self.zoombtn.find('.text').html(`${self.scale * 100}%`);

        self.translateX = 0;
        self.translateY = 0;

        self.zoomImg.css('cursor', 'auto');
        self.zoomImg.css({
            'transform': `translate(${self.translateX}px, ${self.translateY}px) scale(${self.scale})`,
            'transition': `transform ${0}s`
        });

        self.zoomImg.find('.moveDis').removeClass('moveDis');

        self.zoomwrap.removeClass('map_draggable');
    };
};

/* ---------------------------------------
 * 글쓰기
 * --------------------------------------- */
/**
 * @param {JQuery} wrap writeContents가 만들어질 요소
 * @param {Number} textItems 생성할 <textarea>의 총 개수
 * @param {Number} inputItems 성할 <input>의 총 개수
 */
var writeContents = function writeContents(wrap, textItems, inputItems) {
    var self = this;
    this.wrap = wrap;

    this.textItems = textItems || 0;        // 생성할 <textarea>의 총 개수
    this.inputItems = inputItems || 0;      // 생성할 <input>의 총 개수

    this.conWrap = '';                      // .textContent

    this.textWraps = '';                    // .textContent .textWrap
    this.inputWraps = '';                   // .textContent .inputWrap

    this.exWrapsT = '';                     // .textContent .textWrap .exWrap
    this.exWrapsI = '';                     // .textContent .inputWrap .exWrap

    this.textAreas = '';                    // .textContent textarea
    this.inputs = '';                       // .textContent input

    this.btnEx = '';                        // 예시보기 ↔ 다시하기

    // callback
    this.onWrite = undefined;               // 텍스트 입력할 때
    this.onShowAns = undefined;             // 예시보기
    this.onReset = undefined;               // 다시하기
    this.onClose = undefined;               // 닫기

    this.init = function () {
        if (self.wrap.find('.textContent').length > 0) {
            self.wrap.find('.textContent').remove();
        }

        self.makeCon();
        self.makeTextWrap();
        self.makeBtn();

        self.addEventWrite();
        self.addEventBtns();
    };

    this.reset = function () {
        self.textWraps.find('.placeholder').show();

        self.textAreas.val('').show().trigger('blur');
        self.inputs.val('').show().trigger('blur');

        self.exWrapsT.hide();
        self.exWrapsI.hide();

        self.btnEx.removeClass('re dis');
    };

    this.makeCon = function () {
        let html = `<div class="textContent"></div>`;
        self.wrap.append(html);
        self.conWrap = self.wrap.find('.textContent');
    };

    this.makeTextWrap = function () {
        let html = '';
        let i;
        for (i = 0; i < self.textItems; ++i) {
            // <textarea id="textbox${i + 1}" class="textbox" spellcheck="false" maxlength="1" restrict="number"></textarea>
            html += `
                <div class="wrapper textWrap textWrap${i + 1}">
                    <div class="bg"></div>
                    <textarea id="textbox${i + 1}" class="textbox" spellcheck="false"></textarea>
                    <div class="placeholder"><span class="tir off">입력해 주세요</span></div>
                    <div class="exWrap">
                        <div class="closeBtn"></div>
                    </div>
                </div>
            `;
        }
        for (i = 0; i < self.inputItems; ++i) {
            // <input type="text" id="inputbox${i + 1}" class="inputbox" spellcheck="false" maxlength="1" restrict="number">
            html += `
                <div class="wrapper inputWrap inputWrap${i + 1}">
                    <div class="bg"></div>
                    <input type="text" id="inputbox${i + 1}" class="inputbox" spellcheck="false">
                    <div class="placeholder"><span class="tir off">입력해 주세요</span></div>
                    <div class="exWrap">
                        <div class="closeBtn"></div>
                    </div>
                </div>
            `;
        }

        self.conWrap.append(html);

        self.textWraps = self.conWrap.find('.textWrap');
        self.textAreas = self.conWrap.find('textarea');

        self.inputWraps = self.conWrap.find('.inputWrap');
        self.inputs = self.conWrap.find('input');

        self.exWrapsT = self.textWraps.find('.exWrap');
        self.exWrapsI = self.inputWraps.find('.exWrap');
    };

    this.makeBtn = function () {
        let html = `<div class="exbtn"></div>`;
        self.conWrap.append(html);
        self.btnEx = self.conWrap.find('.exbtn');
    };

    // 입력제한모드 설정
    this.setRestrictT = function (pjTexAreas, psMode) {
        pjTexAreas = pjTexAreas || self.textAreas;
        pjTexAreas.attr('restrict', psMode);
    };
    this.setRestrictI = function (pjInputs, psMode) {
        pjInputs = pjInputs || self.inputs;
        pjInputs.attr('restrict', psMode);
    };

    // 입력가능 값 설정
    this.setMaxLengthT = function (pjTexAreas, pnMaxLength) {
        pjTexAreas = pjTexAreas || self.textAreas;
        pjTexAreas.attr('maxlength', pnMaxLength);
    };

    this.setMaxLengthI = function (pjInputs, pnMaxLength) {
        pjInputs = pjInputs || self.inputs;
        pjInputs.attr('maxlength', pnMaxLength);
    };

    this.addEventWrite = function () {
        self.textAreas.add(self.inputs).on('focusin propertychange change keyup paste input', function () {
            $(this).closest('.wrapper').find('.placeholder').hide();
        });

        self.textAreas.add(self.inputs).on('focusout blur', function () {
            var ksVal = $(this).val();
            if (ksVal.trim() === '') {
                $(this).closest('.wrapper').find('.placeholder').show();
            }
            else {
                $(this).closest('.wrapper').find('.placeholder').hide();
            }
        });

        self.textAreas.add(self.inputs).on('input', function (e) {
            if ($(this).is('[maxlength]')) {
                $(this).val($(this).val().substring(0, parseInt($(this).attr('maxlength'), 10)));
            }
            var ksMode = $(this).attr('restrict');
            switch (ksMode) {
                case 'korean':
                    onlyKorean(e);
                    break;
                case 'number':
                    onlyNumber(e);
                    break;
                default:
                    break;
            }

            if (typeof self.onWrite !== 'undefined') { self.onWrite($(this), e); }
        });
    };

    this.addEventBtns = function () {
        // 예시팝업 닫기버튼
        self.exWrapsT.add(self.exWrapsI).find('.closeBtn').on('click', function () {
            effectAdo('click', false);

            const $ts = $(this);
            const $wrapper = $ts.closest('.wrapper');

            $wrapper.find('.exWrap').hide();

            if ($wrapper.hasClass('textWrap')) {
                $wrapper.find('textarea').show().trigger('blur');
                if ($wrapper.find('textarea').val() === '') {
                    $wrapper.find('.placeholder').show();
                }
                else {
                    $wrapper.find('.placeholder').hide();
                }
            }
            else if ($wrapper.hasClass('inputWrap')) {
                $wrapper.find('input').show().trigger('blur');
                if ($wrapper.find('input').val() === '') {
                    $wrapper.find('.placeholder').show();
                }
                else {
                    $wrapper.find('.placeholder').hide();
                }
            }

            self.btnEx.removeClass('dis');

            if (typeof self.onClose !== 'undefined') { self.onClose(); }
        });

        // 예시보기
        self.btnEx.on('click', function () {
            effectAdo('click', false);

            var $ts = $(this);

            // 다시 하기
            if ($ts.hasClass('dis')) {
                self.textAreas.show();
                self.textAreas.trigger('focusIn');

                // 기존 내용 리셋
                self.textAreas.show();
                self.textAreas.val('');
                self.textAreas.trigger('blur');

                self.inputs.show();
                self.inputs.val('');
                self.inputs.trigger('blur');

                self.textWraps.find('.placeholder').show();
                self.inputWraps.find('.placeholder').show();
                // 기존 내용 유지
                /* let ksVal;
                if (self.textAreas.length > 0) {
                    self.textWraps.each(function () {
                        ksVal = $(this).find('textarea').val();
                        if (ksVal.trim() === '') {
                            $(this).find('.placeholder').show();
                        }
                        else {
                            $(this).find('.placeholder').hide();
                        }
                    });
                }

                if (self.inputs.length > 0) {
                    self.inputs.each(function () {
                        ksVal = $(this).find('input').val();
                        if (ksVal.trim() === '') {
                            $(this).find('.placeholder').show();
                        }
                        else {
                            $(this).find('.placeholder').hide();
                        }
                    });
                } */

                self.exWrapsT.hide();
                self.exWrapsI.hide();

                $ts.removeClass('dis');

                if (typeof self.onReset !== 'undefined') { self.onReset(); }
            }
            // 예시 보기
            else {
                self.textAreas.hide();
                self.textAreas.trigger('blur');

                self.inputs.hide();
                self.inputs.trigger('blur');

                self.textWraps.find('.placeholder').hide();
                self.inputWraps.find('.placeholder').hide();

                self.exWrapsT.show();
                self.exWrapsI.show();

                $ts.addClass('dis');

                if (typeof self.onShowAns !== 'undefined') { self.onShowAns(); }
            }

            // 다시 하기
            /* if ($this.hasClass('re')) {
                $this.removeClass('re');
                self.reset();
                return;
            }
            // 예시보기
            else {
                //self.textAreas.trigger('blur').val('');
                self.textAreas.hide();
                self.textAreas.trigger('blur');
                self.textWraps.find('.placeholder').hide();
                self.exWraps.show();
            }
            $this.addClass('re'); */
        });
    };
};

/* ---------------------------------------
 * 캐릭터 음원
 * --------------------------------------- */
/**
 * 캐릭터 음원 컨텐츠
 * @param {*} wrap aniContents가 생성될 요소
 * @param {Array} set ado, img 생성 정보값
 * @param {String} adoPath 오디오 파일 경로
 * @param {String} imgPath 이미지 파일 경로
 * @param {String} type aniItem의 이미지 타입('gif', 'Gif')
 * @param {number} duration 총 시간
 * @param {boolean} bStopOther 다른 음성요소 정지 시킬지 여부
 */
var aniContents = function (wrap, set, adoPath, imgPath, type, duration, bStopOther) {
    var self = this;
    this.wrap = wrap;
    this.set = set;

    this.type = type;

    this.bStopOther = (bStopOther === false) ? false : true;

    this.adoItems = self.set.ado;
    this.imgItems = self.set.img;

    this.itemwrap = '';                         // .aniWrap
    this.items = '';                            // .aniWrap .aniItem

    this.soundBtn = '';                         // .aniWrap .soundBtn

    this.cnt = 0;
    this.allChk = false;

    this.onClick = undefined;
    this.onEnded = undefined;
    this.onPlayAll = undefined;
    this.onReset = undefined;

    let setT;

    this.duration = duration;

    this.init = function () {
        if (self.wrap.find('.aniWrap').length > 0) {
            self.wrap.find('.aniWrap').remove();
        }

        self.cnt = 0;
        self.allChk = false;

        self.makeWrap();
        self.makeItem();
        self.makeBtn();

        self.addEventItem();
        self.addEventBtn();
    };

    this.makeWrap = function () {
        var html = '<div class="aniWrap"></div>';
        self.wrap.append(html);
        self.itemwrap = self.wrap.find('.aniWrap');
    };

    this.makeItem = function () {
        var html = '';
        for (var i = 0; i < self.adoItems.length; i++) {
            html += '<div class="aniItem aniItem' + (i + 1) + '" data-ado="' + self.adoItems[i] + '"></div>';
        }
        self.itemwrap.append(html);
        self.items = self.itemwrap.find('.aniItem');

        self.items.html('');
        for (let j = 0; j < self.items.length; j++) {
            self.items.eq(j).append(`
                <div class="char"></div>
                <div class="item">
                    <div class="close"></div>
                </div>
            `);
        }

        if (type == 'gif' || type == 'Gif') {
            for (let k = 0; k < self.items.length; k++) {
                self.items.eq(k).append(`
                    <div class="motionWrap">
                        <div class="cover"></div>
                        <img class="motion" src="`+ imgPath + self.imgItems[k] + `.gif" title="" alt="">
                    </div>
                `);
            }
        }
    };

    this.makeBtn = function () {
        self.itemwrap.append('<div class="soundBtn"></div>');
        self.soundBtn = self.itemwrap.find('.soundBtn');
    };

    this.addEventItem = function () {
        self.items.off('click').on('click', function (e) {
            e.stopPropagation();
            ado_stop();

            self.allChk = false;

            var $this = $(this);
            var ado = $(this).attr('data-ado');

            if (ado !== undefined) {
                if ($this.hasClass('ing')) {
                    $this.removeClass('ing on');

                    if (type == 'gif' || type == 'Gif') {
                        self.stopMotion(self.items);
                    }
                }
                else {
                    self.items.removeClass('on');
                    $this.addClass('ing on');
                    effectAdo(ado, self.bStopOther, adoPath);

                    if (type == 'gif' || type == 'Gif') {
                        self.playMotion($this, true);
                    }
                }
            }

            self.items.length === self.itemwrap.find('.ing').length ? self.soundBtn.addClass('re') : self.soundBtn.removeClass('re');

            if (typeof (videoCon) != 'undefined') { videoCon.stop(); }

            if (typeof (self.duration) !== 'undefined') {
                clearTimeout(setT);
                setT = setTimeout(function () {
                    if (typeof (self.onEnded) !== 'undefined') { self.onEnded(false); }
                    $this.removeClass('on');
                    self.stopMotion(self.items);
                }, self.duration);
            }
            else {
                $(`#${ado}`).off('ended').on('ended', function () {
                    if (typeof (self.onEnded) !== 'undefined') { self.onEnded(false); }
                    $this.removeClass('on');
                    self.stopMotion(self.items);
                });
            }

            if (typeof (self.onClick) !== 'undefined') { self.onClick($(this)); }
        });
    };

    this.addEventBtn = function () {
        self.soundBtn.off('click').on('click', function (e) {
            e.stopPropagation();
            ado_stop();

            self.items.removeClass('ing on');

            if ($(this).hasClass('re')) {
                $(this).removeClass('re');
                self.allChk = false;
                self.stopMotion(self.items);
                if (typeof (self.onReset) !== 'undefined') { self.onReset(); }
            }
            else {
                $(this).addClass('re');
                self.allChk = true;
                self.cnt = 0;
                self.allSound('start');
                if (typeof (self.onPlayAll) !== 'undefined') { self.onPlayAll(); }
            }
        });

        self.items.find('.item .close').off('click').on('click', function (e) {
            e.stopPropagation();
            ado_stop();
            effectAdo('click');
            $(this).parent().hide();
            $(this).parent().parent().removeClass("ing");
        });
    };

    this.playMotion = function (pjThis, pbIsRefresh) {
        var wrap = pjThis.find('.motionWrap');
        var motion = pjThis.find('.motion');

        if (!motion.is('[data-url]')) {
            motion.attr('data-url', motion.attr('src'));
        }

        if (pbIsRefresh) {
            pjThis.siblings().find('.motionWrap').removeClass('on');
            pjThis.siblings().find('.motion').off('load');
            motion.attr('src', `${motion.attr('data-url')}?_r=${Date.now()}`);
            motion.off('load').on('load', function () {
                $(this).off('load');
                wrap.addClass('on');
            });
        }
        else {
            pjThis.siblings().find('.motionWrap').removeClass('on');
            wrap.addClass('on');
        }
    };

    this.stopMotion = function (pjItems) {
        pjItems.each(function () {
            var wrap = $(this).find('.motionWrap');
            wrap.removeClass('on');
            wrap.find('.motion').off('load');
        });
    };

    this.allSound = function (play) {
        if (self.allChk) {
            if (play === undefined) self.cnt++;
            var target = self.items.eq(self.cnt);
            var ado = target.attr('data-ado');
            effectAdo(ado, self.bStopOther, adoPath);
            self.items.removeClass('on');
            target.addClass('ing on');

            if (type == 'gif' || type == 'Gif') {
                self.playMotion(target, true);
            }

            $(`#${ado}`).off('ended').on('ended', function () {
                if (self.items.length - 1 > self.cnt) self.allSound();
                if (typeof (self.onEnded) !== 'undefined') { self.onEnded(true); }
                target.removeClass('on');
                self.stopMotion(target, true);
            });
        }
    };
};

/* ---------------------------------------
 * 스탬프 컨텐츠
 * --------------------------------------- */
/**
 * 스탬프 컨텐츠
 * @param {*} wrap stampContents가 만들어질 요소
 * @param {boolean} bStopOther 다른 음성요소 정지 시킬지 여부
 */
var stampContents = function stampContents(wrap, bStopOther) {
    var self = this;
    this.wrap = wrap;

    this.stamp, this.item;

    this.bStopOther = (bStopOther === false) ? false : true;

    var stampNum = 0;
    var soundNum = 0;
    var setT1;

    this.init = function () {
        self.makeHtml();

        self.stamp.off(sAnimationStart).on(sAnimationStart, function () {
            self.soundOn();
        });
    };

    this.makeHtml = function () {
        if (wrap.find('.stamp')) wrap.find('.stamp').remove();
        if (wrap.find('.item')) wrap.find('.item').remove();
        stampNum = Math.floor(random(8, 1));
        var html = '';
        html += '<div class="stamp"></div>';
        html += '<div class="item"></div>';
        self.wrap.append(html);

        self.stamp = self.wrap.find('.stamp');
        self.item = self.wrap.find('.item');
    };

    this.soundOn = function () {
        // effectAdo('stamp', self.bStopOther);
        clearTimeout(setT1);
        ado_stop();
        setT1 = setTimeout(function () {
            self.item.show().addClass('bounce2 st' + stampNum);

            // soundNum = stampNum % 4;
            // if (soundNum == 0) {
            //     soundNum = 4;
            // }
            effectAdo(("stamp" + (stampNum)), self.bStopOther);
        }, 1200);
    };
};

/* ---------------------------------------
 * 슬라이드 컨텐츠
 * --------------------------------------- */
/**
 * 슬라이드 컨텐츠
 * @param {*} wrap slidingContents가 만들어질 요소
 * @param {string} location slidingContents의 위치 ('top', 'bottom', 'left', 'right')
 * @param {string} type slidingContents의 구동 방식 ('1, '2')
 * @param {boolean} bStopOther 다른 음성요소 정지 시킬지 여부
 */

var slidingContents = function slidingContents(wrap, location, type, bStopOther) {
    var self = this;
    this.wrap = wrap;                            // .slideWrap

    this.slide = wrap.find('.slide');            // .slideWrap .slide
    this.slideBtn = wrap.find('.slideBtn');      // .slideWrap .slideBtn
    this.slideBtnArrow = undefined;              // .slideWrap + .slideBtnArrow(생성)

    this.bStopOther = (bStopOther === false) ? false : true;
    this.effectSnd = 'click';                    // 클릭효과음 ID값

    this.movingType = type || '1';               // 구동 방식 ('1, '2')
    this.location = location || 'left';          // 위치 ('top', 'bottom', 'left', 'right')

    this.slideL;                                 // .slideWrap .slide의 길이
    this.slideW = self.slide.css('width');       // .slideWrap .slide의 width
    this.slideH = self.slide.css('height');      // .slideWrap .slide의 height
    this.btnL;                                   // .slideWrap .slideBtn의 길이
    var btnLength = '120px';                     // .slideWrap .slideBtn의 width가 없을시
    var setp1 = 0.2;                             // setp1 time
    var setp2 = 0.3;                             // setpw time

    var setTimerId = -1;

    let checkTimerId = -1;

    this.init = function () {
        self.setting();
        self.slideBtn.off('click').on('click', function () {
            effectAdo(self.effectSnd, self.bStopOther);
            if (!self.wrap.hasClass('open')) {
                self.open();
            }
            else {
                self.close();
            }
        });
    };

    this.setting = function () {
        self.wrap.removeClass('open').addClass(self.location);

        self.slide.removeAttr('style');

        self.wrap.addClass('hidden');

        if (self.location == 'left' || self.location == 'right') {
            self.slideL = self.slideW;
            self.btnL = (self.slideBtn.css('width') == '0px') ? btnLength : self.slideBtn.css('width');
            self.slideBtn.css({
                width: self.btnL,
                height: '100%',
            });
        }
        else if (self.location == 'top' || self.location == 'bottom') {
            self.slideL = self.slideH;
            self.btnL = (self.slideBtn.css('height') == '0px') ? btnLength : self.slideBtn.css('height');
            self.slideBtn.css({
                width: '100%',
                height: self.btnL,
            });
        }

        self.slide.css(self.location, -(pxToInt(self.slideL) - pxToInt(self.btnL)) + 'px');

        self.wrap.css({
            width: self.slideW,
            height: self.slideH,
        });
        self.wrap.css(self.location, '0px');

        self.slide.addClass('direct');
        setTimerId = setTimeout(function () {
            clearTimeout(setTimerId);
            self.slide.removeClass('direct');
        });
    };

    this.open = function () {
        self.wrap.addClass('open');

        switch (self.movingType) {
            case '1':
            default:
                self.slide.css('transition', self.location + ' ' + setp2 + 's linear');
                self.slide.css(self.location, '0px');
                self.slide.off(sTransitionEnd).on(sTransitionEnd, function () {
                    self.wrap.removeClass('hidden');
                    self.slide.css('transition', '');
                });
                break;
            case '2':
                self.slide.css('transition', self.location + ' ' + setp1 + 's linear');
                self.slide.css(self.location, -pxToInt(self.slideL) + 'px');

                self.slide.off(sTransitionEnd).on(sTransitionEnd, function () {
                    self.wrap.removeClass('hidden');
                    self.slide.css('transition', '');
                    self.slide.css('transition', self.location + ' ' + setp2 + 's linear');
                    self.slide.css(self.location, '0px');
                });
                break;
        }
    };

    this.close = function () {
        self.wrap.removeClass('open');
        self.wrap.addClass('hidden');

        switch (self.movingType) {
            case '1':
            default:
                self.slide.css('transition', self.location + ' ' + setp2 + 's linear');
                self.slide.css(self.location, -(pxToInt(self.slideL) - pxToInt(self.btnL)) + 'px');

                self.slide.off(sTransitionEnd).on(sTransitionEnd, function () {
                    self.wrap.addClass('closeEnd');
                    self.slide.css('transition', '');
                });
                break;
            case '2':
                self.slide.css('transition', self.location + ' ' + setp2 + 's linear');
                self.slide.css(self.location, -pxToInt(self.slideL) + 'px');

                self.slide.off(sTransitionEnd).on(sTransitionEnd, function () {
                    self.wrap.addClass('closeEnd');
                    self.slide.css('transition', '');
                    self.slide.css('transition', self.location + ' ' + setp1 + 's linear');
                    self.slide.css(self.location, -(pxToInt(self.slideL) - pxToInt(self.btnL)) + 'px');
                });
                break;
        }
    };

    /* '과학' 추가 - 열기|닫기 화살표 생성 */
    this.makeArrowBtn = function () {
        // 기존에 .slideBtnArrow 가 있었다면 삭제
        if (self.wrap.next().hasClass('slideBtnArrow')) {
            self.wrap.next().remove();
        }
        let html = `<div class="slideBtnArrow"></div>`;
        self.wrap.after(html);

        self.slideBtnArrow = self.wrap.next();

        const sliderWrapL = pxToInt(self.wrap.css('left'));
        const sliderWrapT = pxToInt(self.wrap.css('top'));

        const slideW = pxToInt(self.slide.css('width'));
        const slideBtnW = pxToInt(self.slideBtn.css('width'));

        //* margin으로 임의값 처리
        self.slideBtnArrow.css('top', `${sliderWrapT}px`);
        self.slideBtnArrow.off().on('click', function () {
            self.slideBtn.trigger('click');
        });

        function slideBtnArrowPos() {
            const slideL = pxToInt(self.slide.css('left'));
            let diffX = (slideW + slideL) - slideBtnW;
            let knX = sliderWrapL + diffX;
            self.slideBtnArrow.css('left', `${knX}px`);
        }

        checkTimerId = setInterval(function () {
            slideBtnArrowPos();
        }, 1000 / 60);
    };
};

/* ---------------------------------------
 * 함께 읽기
 * --------------------------------------- */
/**
 * 함께 읽기
 * @param {*} wrap toReadContents가 만들어질 요소
 * @param {string} effect 버튼 클릭시 재생되는 음성
 * @param {boolean} bStopOther 다른 음성요소 정지 시킬지 여부
 */
var toReadContents = function toReadContents(wrap, effect, bStopOther) {
    var self = this;
    this.wrap = wrap;

    this.toRead, this.btn;

    effect = effect || 'count';
    this.effect = effect;
    this.bStopOther = (bStopOther === false) ? false : true;

    var toReadTimer;
    var time;

    this.init = function () {
        wrap.find('.toRead, .btnToRead').remove();
        self.makeArea();
        clearTimeout(toReadTimer);
        self.btn.removeClass('on');
        self.toRead.hide().removeClass('motion');

        self.btn.off('click').on('click', function () {
            var $this = $(this);
            self.btnEvent($this);
        });
    };

    this.makeArea = function () {
        var html = '';
        html += '<div class="toRead"></div>';
        html += '<div class="btnToRead"></div>';
        self.wrap.append(html);
        self.toRead = self.wrap.find('.toRead');
        self.btn = self.wrap.find('.btnToRead');
    };

    this.btnEvent = function (ts) {
        ts.addClass('on');
        self.toRead.show().addClass('motion');
        time = self.toRead.css('animation-duration');
        time = time.replace('s', '');
        time = Number(time) * 1000;
        effectAdo(self.effect, self.bStopOther);
        clearTimeout(toReadTimer);

        var delay = 2000;

        if (wrapTop.hasClass('math')) {
            delay = 1000;
        }

        toReadTimer = setTimeout(function () {
            ts.removeClass('on');
            self.toRead.hide().removeClass('motion');
        }, time + delay);
    };
};

/* ---------------------------------------
 * 링크 버튼
 * --------------------------------------- */
/**
 * 링크 버튼
 * @param {JQuery} wrap linkContents 가 만들어질 요소
 * @param {Number} items 링크 버튼의 총 개수
 * @param {Array} aLink 링크
 */
var linkContents = function linkContents(wrap, items, aLink) {
    var self = this;
    this.wrap = wrap;           // .linkContent parent

    this.itemwrap = '';         // .linkContent
    this.linkItems = items;     // .linkItem의 총 개수
    this.items = '';            // .linkContent .linkItem
    this.itemareas = '';        // .linkContent .linkItem .linkArea
    this.itembtns = '';         // .linkContent .linkItem .linkBtn

    this.linkItemWrap = '';    // .linkContent .linkItemWrap

    this.bStopOther = true;     // 다른 음성요소 정지 시킬지 여부
    this.effectSnd = 'click';   // 클릭효과음 ID값

    // callback
    this.onClick = undefined;

    this.init = function () {
        if (self.wrap.find('.linkItem').length > 0) {
            self.wrap.find('.linkContent').remove();
        }

        // 강제 클래스 부여
        var knWrapIdx = parseInt(self.wrap.attr('class').split(' ')[1].slice(-1), 10);
        self.wrap.addClass('link');
        //self.wrap.closest('.contents').find('.btnPopFull' + knWrapIdx).addClass('linkbtn');

        self.makeWrap();
        self.makeItem();

        var ksUrl = '';
        self.items.each(function (idx) {
            ksUrl = (aLink.length === 1) ? aLink[0] : aLink[idx];
            $(this).attr('data-url', ksUrl);
        });

        self.itemareas.add(self.itembtns).on('click', function () {
            var $ts = $(this);
            var ksUrl = '';
            ksUrl = $ts.closest('[data-url]').attr('data-url');
            windowTop[0].open(ksUrl, '_blank');
        });
    };

    this.makeWrap = function () {
        var html = '<div class="linkContent"></div>';
        self.wrap.append(html);
        self.itemwrap = self.wrap.find('.linkContent');
    };

    this.makeItem = function () {
        if (self.itemwrap.find('.linkItemWrap').length === 0) {
            self.itemwrap.append('<div class="linkItemWrap"></div>');
        }
        self.linkItemWrap = self.itemwrap.find('.linkItemWrap');

        var html = '';
        for (var i = 0; i < self.linkItems; i++) {
            html += '<div class="linkItem linkItem' + (i + 1) + '" data-idx="' + (i + 1) + '">';
            html += '    <div class="linkArea"></div>';
            html += '    <div class="linkBtn"></div>';
            html += '</div>';
        }
        self.itemwrap.find('.linkItemWrap').append(html);
        self.items = self.itemwrap.find('.linkItem');
        self.itemareas = self.itemwrap.find('.linkArea');
        self.itembtns = self.itemwrap.find('.linkBtn');
    };
};

/* =========================================================================================
 * 기타
 * ====================================================================================== */
/* ---------------------------------------
 * 배경
 * --------------------------------------- */
/**
 * #wrap의 배경색 변경
 * @param {string} color 배경색
 */
function bgColorChange(color) {
    containerTop.css('background-color', 'rgb(0, 0, 0)');
    wrapTop.css('background-color', color);
}

/* ---------------------------------------
 * 딤드
 * --------------------------------------- */
/**
 * 딤드 생성
 */
function makeMask() {
    containerTop.append('<div class="mask"></div>');
    containerTop.find('.mask').css({
        'width': '100%',
        'height': '100%',
        'background-color': 'rgba(0,0,0,0.5)',
    });
}

/**
 * 지정 컨텐츠 내에 딤드 생성
 * @param {*} pjContents 딤드가 만들어질 요소
 * @param {number} pnzIndex 딤드의 z_index
 */
function makeContentsMask(pjContents, pnzIndex) {
    pjContents.append('<div class="mask"></div>');
    pjContents.find('.mask').css({
        'width': '100%',
        'height': '100%',
        'background-color': 'rgba(0,0,0,0.5)'
    });
    if (pnzIndex) {
        pjContents.find('.mask').css({
            'position': 'absolute',
            'left': '0px',
            'top': '0px',
            'z-index': pnzIndex
        });
    }
}

/**
 * 딤드 제거
 */
function removeMask() {
    containerTop.find('.mask').remove();
}

/* ---------------------------------------
 * 랜덤 및 섞기
 * --------------------------------------- */
/**
 * pnMin초과 pnMax미만에서의 랜덤값
 * pnMin < result < pnMax
 * @param {number} pnMin 변환할 텍스트
 * @param {number} pnMax 변환할 텍스트
 */
function randomArbitrary(pnMin, pnMax) {
    return Math.random() * (pnMax - pnMin) + pnMin;
}

/**
 * pnMin이상 pnMax이하에서의 랜덤값
 * pnMin <= result <= pnMax integer
 * @param {number} pnMin 변환할 텍스트
 * @param {number} pnMax 변환할 텍스트
 */
function random(pnMin, pnMax) {
    return parseInt(Math.random() * ((pnMax + 1) - pnMin)) + pnMin;
}

/**
 * 배열 섞기(같을 수 있음)
 * @param {array} $arr 복제 대상 배열
 */
function shuffle($arr) {
    var kaTarget = $arr.concat();
    var j, koTemp;
    for (var i = kaTarget.length - 1; i > 0; --i) {
        j = Math.floor(Math.random() * (i + 1)); // 0<= j <= i 값
        koTemp = kaTarget[i];
        kaTarget[i] = kaTarget[j];
        kaTarget[j] = koTemp;
    }

    return kaTarget;
}


/**
 * 원본과 같지 않게 섞기
 * @param {array} $arr 복제 대상 배열
 */
function getNotDuplicateRanArray(paTarget) {
    // 섞기
    function shuffle(pArr) {
        var kaTarget = pArr.concat();
        var j, koTemp;
        for (var i = kaTarget.length - 1; i > 0; --i) {
            j = Math.floor(Math.random() * (i + 1));
            koTemp = kaTarget[i];
            kaTarget[i] = kaTarget[j];
            kaTarget[j] = koTemp;
        }
        return kaTarget;
    }
    // 같은지 검증
    function arrayEquals(a, b) {
        return Array.isArray(a) &&
            Array.isArray(b) &&
            a.length === b.length &&
            a.every(function (val, index) {
                return val === b[index];
            });
        //return JSON.stringify(arr1) === JSON.stringify(arr2);
    }

    var knCnt = 0; // while반복문 실행 횟수
    var kaShuffle; // 섞은 결과
    var kbEqual; // 같은지 검증 결과
    var kaProcess = []; // 각 단계 과정 복사

    if (paTarget.length <= 1) {
        return {
            array: paTarget.concat(),
            count: knCnt,
            process: kaProcess.concat()
        };
    }

    while (true) {
        knCnt++;

        kaShuffle = shuffle(paTarget);
        kbEqual = arrayEquals(paTarget, kaShuffle);
        kaProcess.push({
            count: knCnt,
            value: JSON.stringify(kaShuffle)
        });
        // 같지 않다면 return
        if (!kbEqual) {
            return kaShuffle;
            /* return {
                count: knCnt,
                original: paTarget.concat(),
                process: kaProcess.concat(),
                shuffle: kaShuffle
            }; */
        }
    }
}

/* ---------------------------------------
 * 변환 및 추출
 * --------------------------------------- */
/**
 * 지정 텍스트를 초성으로 변환
 * @param {string} str 변환할 텍스트
 */
function cho_hangul(str) {
    cho = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
    result = "";
    for (i = 0; i < str.length; i++) {
        code = str.charCodeAt(i) - 44032;
        if (code > -1 && code < 11172) result += cho[Math.floor(code / 588)];
        else result += str.charAt(i);
    }
    return result;
}

/**
 * 지정 객체를 px을 제외한 값으로 변환
 * 99px to 99
 * @param {*} psPx 변환할 객체
 */
function pxToInt(psPx) {
    //return parseFloat(strPx);
    //return parseFloat(psPx.split('px')[0]);
    return !isNaN(psPx) || psPx === 'auto' ? psPx : parseFloat(psPx.replace('px', ''));
}

/**
 * 숫자를 자릿수 만큼 0으로 채워서 추출
 * @param {number} pn 자릿수
 * @param {*} pnWidth 변환할 객체
 */
function digit(pn, pnWidth) {
    if (isNaN(pnWidth) || !pnWidth) {
        pnWidth = 2;
    }
    pn = pn + '';
    return (pn.length >= pnWidth) ? pn : new Array(pnWidth - pn.length + 1).join('0') + pn;
}

/**
 * 숫자를 자릿수 만큼 0으로 채워서 추출(10보다 작은 값에 한정)
 * @param {number} pn 자릿수
 */
function itostr(pn) {
    return (pn < 10) ? '0' + pn : '' + pn;
}

/**
 * 숫자를 고정 소수점 표기법으로 변환
 * @param {*} poValue 변환할 객체
 * @param {number} pn 고정 소수점 자리수
 */
/*
var a = 0.1;
var b = 0.2;
(a + b).toFixed(2); // 반올림'0.30'
0.00125.toPrecision(2); // '0.0013'
1.2356.toFixed(3); // '1.236'
1.2346.toPrecision(2); // '1.2'
*/
function toFixed(poValue, pn) {
    pn = pn === 0 ? 0 : pn || 1;
    return Number(Number(String(poValue)).toFixed(pn));
}


// 소수점 개수얻기
function countDecimals(value) {
    var text = value.toString();
    // 숫자 0.000005가 '5e-6'으로 표시되는지 확인
    if (text.indexOf('e-') > -1) {
        //var [base, trail] = text.split('e-');
        var base = text.split('e-')[0];
        var trail = text.split('e-')[1];
        var deg = parseInt(trail, 10);
        return deg;
    }
    // '0.123456'과 같은 표현의 숫자에 대한 십진수 카운팅
    if (Math.floor(value) !== value) {
        return value.toString().split(".")[1].length || 0;
    }
    return 0;
}

// 지정자리 반올림한 숫자 계산
// 값, 자리수
function toFixedTp2(poValue, pn) {
    pn = pn || countDecimals(poValue);
    return Number(Number(String(poValue)).toFixedTp2(pn));
}

// 지정자리 반올림
// 값, 자리수
function toRound(poValue, pnPos) {
    pnPos = pnPos || countDecimals(poValue);
    // 소수점 없음
    if (pnPos === 0) {
        return poValue;
    }
    var digits = Math.pow(10, pnPos);
    var sign = 1;
    if (poValue < 0) {
        sign = -1;
    }
    // 음수이면 양수처리후 반올림 한 후 다시 음수처리
    poValue = poValue * sign;
    var num = Math.round(poValue * digits) / digits;
    num = num * sign;
    return Number(num.toFixedTp2(pnPos));
}

// 지정자리 버림
// 값, 자리수
function toFloor(n, pos) {
    pos = pos || countDecimals(n);
    // 소수점 없음
    if (pos === 0) {
        return n;
    }
    var digits = Math.pow(10, pos);
    var num = Math.floor(n * digits) / digits;
    return Number(num.toFixedTp2(pos));
}

// 지정자리 올림
// 값, 자리수
function toCeil(n, pos) {
    pos = pos || countDecimals(n);
    // 소수점 없음
    if (pos === 0) {
        return n;
    }
    var digits = Math.pow(10, pos);
    var num = Math.ceil(n * digits) / digits;
    return Number(num.toFixedTp2(pos));
}

// 숫자값 소수점 3자리까지만 강제허용
function toChg(pnValue, pnDigit, pnType) {
    pnDigit = pnDigit || 3;
    pnType = pnType || 'round';

    if (pnType === 'floor') {
        return toFloor(pnValue, pnDigit);
    }
    else if (pnType === 'ceil') {
        return toCeil(pnValue, pnDigit);
    }
    else if (pnType === 'round') {
        return toRound(pnValue, pnDigit);
    }
}



/**
 * 확장자를 포함한 html파일명 추출
 */
function getFileName() {
    var ksUrl = windowTop[0].location.href;
    ksUrl = ksUrl.substring(ksUrl.lastIndexOf('/') + 1);
    return (ksUrl.match(/[^.]+(\.[^?#]+)?/) || [])[0].split('?')[0];
}

// name값의 url parameter값을 추출
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// name값의 url parameter값을 추출
$.urlParam = function (name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(location.search);
    if (results == null) {
        return null;
    }
    else {
        return results[1] || 0;
    }
};

/**
 * 태그명 추출
 */
function getTagName($el) {
    return $el.prop('tagName').toLowerCase();
}

/**
 * eval대체
 * @param {string} psName 실행 값
 */
function eval(psName) {
    return new Function('return ' + psName)();
}

/**
 * 특정 시작단어로 이뤄진 클래스들 가장 먼저 나오는 1개만 제거
 * @param {Array} pjTarget 대상 Element
 * @param {String} psStart class문자열중 시작값
 */
function removeStartWithClass(pjTarget, psStart) {
    pjTarget.removeClass(function (index, className) {
        return (className.match(new RegExp('\\b' + psStart + '\\S+', 'g')) || []).join(' ');
        //return (className.match(/(^|\s)add\S+/g) || []).join(' ');
    });
}


/**
 * 특정 시작단어로 이뤄진 클래스들 모두 제거
 * @param {Array} pjTarget 대상 Element
 * @param {String} psStart class문자열중 시작값
 */
function removeStartWithClassAll(pjTarget, psStart) {
    if (pjTarget.attr('class') === undefined) {
        return;
    }
    for (var i = pjTarget[0].classList.length - 1; i >= 0; i--) {
        var ksClassName = pjTarget[0].classList[i];
        if (ksClassName.indexOf(psStart) === 0) {
            pjTarget[0].classList.remove(ksClassName);
        }
    }
}
// https://code.tutsplus.com/ko/tutorials/the-30-css-selectors-you-must-memorize--net-16048
// $('.boxWrap [class^="box"]') : .boxWrap 자손들중에 class 속성값이 box로 시작하는 것들을 모두 모음

/* ---------------------------------------
 * 판단
 * --------------------------------------- */
/**
 *  value의 값이 비어있는지 아닌지 판단
 *  @param {*} value 판단이 필요한 객체
 */
function isNotNull(value) {
    if (value == '' || value == null || value == undefined || (value != null && typeof value == "object" && !Object.keys(value).length)) {
        return false;
    }
    else {
        return true;
    }
}

/**
 *  한글만 입력 가능
 *  @param {*} e 판단이 필요한 객체
 */
function onlyKorean(e) {
    var ksPrevValue = '';
    var ksValue = e.target.value;
    if (/^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]*$/.test(ksValue)) {
        ksPrevValue = ksValue;
        e.target.value = ksValue;
    } else {
        e.target.value = ksPrevValue;
    }
}

/**
 *  숫자만 입력 가능
 *  @param {*} e 판단이 필요한 객체
 */
function onlyNumber(e) {
    var ksPrevValue = '';
    var ksValue = e.target.value;
    if (/^[0-9]*$/.test(ksValue)) {
        ksPrevValue = ksValue;
        e.target.value = ksValue;
    } else {
        e.target.value = ksPrevValue;
    }
}

// 사용자에 의해 이벤트가 발생했는지 여부 판별
function isHuman(e) {
    var kbIsUser = false;

    // javascript event 객체
    if (e && !e.originalEvent && e.isTrusted === true) {
        kbIsUser = true;
    }
    // jquery event 객채
    if (e && e.originalEvent && e.originalEvent.isTrusted === true) {
        kbIsUser = true;
    }

    return kbIsUser;
}

// 사용자에 의해 이벤트가 발생했는지 여부 판별 //! 오류 있음
/* function isTrusted(e) {
    var kbIsUser = false;

    if (e.originalEvent) {
        kbIsUser = e.originalEvent.isTrusted;
    }
    else {
        kbIsUser = e.isTrusted;
    }

    return kbIsUser;
} */

/* ---------------------------------------
 * 쿠키
 * --------------------------------------- */
/**
 * 쿠키 세팅
 * @param {string} name 쿠키 명칭
 * @param {boolean} value
 * @param {number} exp
 */
var setCookie = function (name, value, exp) {
    var date = new Date();
    date.setTime(date.getTime() + exp * 24 * 60 * 60 * 1000);
    docTop[0].cookie = name + '=' + value + ';expires=' + date.toUTCString() + ';';
};

/**
 * 쿠키 가져오기
 * @param {string} name 쿠키 명칭
 */
var getCookie = function (name) {
    var value = docTop[0].cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return value ? value[2] : null;
};

/**
 * 쿠키 삭제
 * @param {string} name 쿠키 명칭
 */
var deleteCookie = function (name) {
    docTop[0].cookie = name + '=; expires=Thu, 01 Jan 1999 00:00:10 GMT;';
};

/* ──────────────────────────────────────────────────────
* Calculate
/* ────────────────────────────────────────────────────── */

/**
 * 두 점사이의 거리 계산
 * @param {Number} pnX1 x1위치
 * @param {Number} pnY1 y1위치
 * @param {Number} pnX2 x2위치
 * @param {Number} pnY2 y2위치
 */
function getDistance(pnX1, pnY1, pnX2, pnY2) {
    var knDiffX = pnX1 - pnX2;
    var knDiffY = pnY1 - pnY2;

    return Math.sqrt(Math.pow(knDiffX, 2) + Math.pow(knDiffY, 2));
}

//  x, y 좌표가 jQuery요소영역 안에 있는지 여부 확인
function hitTest(pjEl, pnPosX, pnPosY) {
    let koBoundRect = pjEl[0].getBoundingClientRect();
    return pnPosX >= koBoundRect.left && pnPosX <= koBoundRect.right && pnPosY <= koBoundRect.bottom && pnPosY >= koBoundRect.top;
}

/*
if (!e.originalEvent) {
    return this.isTouchDevice ? e.targetTouches[0][psName] : e[psName];
} else {
    return this.isTouchDevice ? e.originalEvent.targetTouches[0][psName] : e[psName];
}
*/

/* ---------------------------------------
 * 테스터
 * --------------------------------------- */

function runTest() {
    wrapTop.addClass('test2');
}

function exitTest() {
    wrapTop.removeClass('test2');
}

/**
 * scroll contents 최대 너비값 계산
 * @param {jQuery} pjScrollListWrap scroll contents
 */
function calculateScrollSize(pjScrollListWrap) {
    var kaWidth = [];
    kaWidth.push(pjScrollListWrap[0].scrollWidth);
    kaWidth.push(0);
    pjScrollListWrap.children().each(function (idx, value) {
        kaWidth[1] += $(this).outerWidth(true);
    });
    var knMaxWidth = Math.max(kaWidth[0], kaWidth[1]);
    return {
        array: kaWidth,
        max: knMaxWidth
    };
}

/**
 * 시간 변환
 * @param {number} paTime 바꿀 대상
 * @param {number} pnValue 바꿀 시간
 */
function chgTime(paTime, pnValue) {
    paTime.forEach(function (value, idx, self) {
        self[idx] = toFixed(value + pnValue);
    });
    console.log('time: ', paTime);
}

/**
 * 음성 배속 변경
 * @param {number} pnSpd 배속값
 */
function chgAdoSpd(pnSpd) {
    $('audio').each(function () {
        $(this)[0].playbackRate = pnSpd;
    });
    if (!$('audio').is('data-play-rate')) {
        $('audio').attr('data-play-rate', pnSpd);
        $('audio').on('play', function () {
            if (!$(this).is('data-play-rate')) {
                $(this)[0].playbackRate = Number($(this).attr('data-play-rate'));
            }
        });
    }

    // 전자저작물
    if (typeof (audioObj) !== 'undefined') {
        $(audioObj).each(function () {
            $(this)[0].playbackRate = pnSpd;
        });
        if (!$(audioObj).is('data-play-rate')) {
            $(audioObj).attr('data-play-rate', pnSpd);
            $(audioObj).on('play', function () {
                if (!$(this).is('data-play-rate')) {
                    $(this)[0].playbackRate = Number($(this).attr('data-play-rate'));
                }
            });
        }
    }
}

/**
 * 영상 배속 변경
 * @param {number} pnSpd 배속값
 */
function chgVdoSpd(pnSpd) {
    $('video').each(function () {
        $(this)[0].playbackRate = pnSpd;
    });
    if (!$('video').is('data-play-rate')) {
        $('video').attr('data-play-rate', pnSpd);
        $('video').on('play', function () {
            if (!$(this).is('data-play-rate')) {
                $(this)[0].playbackRate = Number($(this).attr('data-play-rate'));
            }
        });
    }
}

/**
 * 음성 현재 재생 시간 추출
 */
function getAdoTime() {
    var kaTime = [];
    $('audio').each(function () {
        kaTime.push(toFixed($(this)[0].currentTime));
    });
    console.log('audio: ', kaTime);
}

/**
 * 영상 현재 재생 시간 추출
 */
function getVdoTime() {
    var kaTime = [];
    $('video').each(function () {
        kaTime.push(toFixed($(this)[0].currentTime));
    });
    console.log('video: ', kaTime);
}

/**
 * 음성 전체 길이 추출
 */
function getAdoDuration() {
    var kaTime = [];
    $('audio').each(function () {
        kaTime.push(toFixed($(this)[0].duration));
    });
    console.log('audio: ', kaTime);
}

/**
 * 영상 전체 길이 추출
 */
function getVdoDuration() {
    var kaTime = [];
    $('video').each(function () {
        kaTime.push(toFixed($(this)[0].duration));
    });
    console.log('video: ', kaTime);
}

/**
 * pjTarget의 animation-duration 속성값에서 시간만 추출하여 ms로 변환(소수점 1자리만 허용)
 * @param {*} pjTarget 추출 대상
 */
function getAniDuration(pjTarget) {
    return Number(Number(pjTarget.css('animation-duration').slice(0, -1)).toFixed(1)) * 1000;
}

// 특정 요소의 transition-duration 속성값에서 시간만 추출하여 ms로 변환(소수점 1자리만 허용)
function getTranDuration(pjTarget) {
    return Number(Number(pjTarget.css('transition-duration').slice(0, -1)).toFixed(1)) * 1000;
}

/**
 * 배경에 스케일 적용
 * @param {*} pnScale 화면 지정 배율
 */
function chgBgSize(pnScale) {
    var tmpFactor = pnScale || 0.5;

    /* bodyTop.css({
        transform: 'scale(' + tmpFactor + ')',
        transformOrigin: '0px 0px'
    }); */

    wrapTop.css({
        'left': `0px`,
        'top': `0px`,
        transform: 'scale(' + tmpFactor + ')',
        transformOrigin: '0px 0px'
    });

    // getScale function redefine
    this.getScale = function () {
        factor = tmpFactor;
        FORTEACHERCD.responsive.baseContainerSize.zoom = factor;
    };
    this.getScale();
}


/**
 * paArea배열에서 pnValue의 구간
 * 결과값이 색인이 큰 쪽에 수렴
 * @param {*} paArea 시작값
 * @param {*} paArea 끝값
 */
/*
paArea [0, 100, 200] 일때,
pnValue
-1			-1
201			Number.MAX_VALUE;
0			0
1           1
99			1
100			2
101         2
199			2
200			2
*/
function findAreaIdx(pnValue, paArea) {
    var knIdx = -1;

    // 0 → length-1 까지 탐색
    // < [0]
    if (pnValue < paArea[0]) {
        knIdx = -1;
    }
    // [length - 1] <
    else if (pnValue > paArea[paArea.length - 1]) {
        knIdx = Number.MAX_VALUE;
    }
    // [0] ===
    else if (pnValue === paArea[0]) {
        knIdx = 0;
    }
    // find index
    else {
        for (var i = 0; i < paArea.length - 2; ++i) {
            if (paArea[i] < pnValue && pnValue <= paArea[i + 1]) {
                knIdx = i + 1;
            }
        }
        if (knIdx === -1 && paArea[paArea.length - 2] < pnValue) {
            knIdx = paArea.length - 1;
        }
    }
    return knIdx;
}

/**
 * paArea배열에서 pnValue의 구간
 * 결과값이 색인이 작은 쪽에 수렴
 * @param {*} paArea 시작값
 * @param {*} paArea 끝값
 */
/*
paArea [0, 100, 200] 일때,
pnValue
-1			-1
201			Number.MAX_VALUE;
0			0
1           0
99			0
100			1
101         1
199			1
200			1
*/
function findAreaIdx2(pnValue, paArea) {
    var knIdx = -1;

    // 0 → length-1 까지 탐색
    // < [0]
    if (pnValue < paArea[0]) {
        knIdx = -1;
    }
    // [length - 1] <
    else if (pnValue > paArea[paArea.length - 1]) {
        knIdx = Number.MAX_VALUE;
    }
    // [length - 1] ===
    else if (pnValue === paArea[paArea.length - 1]) {
        knIdx = paArea.length - 1;
    }
    // find index
    else {
        for (var i = 0; i < paArea.length - 1; ++i) {
            if (paArea[i] <= pnValue && pnValue <= paArea[i + 1]) {
                knIdx = i;
            }
        }
    }
    return knIdx;
}

/**
 * css overflow:hidden 요소들만 출력
 */
function getOFH() {
    $('*').each(function () {
        if ($(this).css('overflow') === 'hidden') {
            console.log($(this));
        }
    });
}

/**
 * 테스트 환경 조성
 */
function runTest() {
    wrapTop.addClass('test2');
}



/**
 * 모눈종이 배경 만들기
 * @param {*} $contents
 */
function makeGraphPaper($contents) {
    let target = wrapTop.find('.contents');
    if (typeof $contents !== 'undefined') {
        target = $contents;
    }
    if (target.find('.graph-paper').length > 0) {
        target.find('.graph-paper').remove();
    }

    let html = `<div class="graph-paper"></div>`;
    target.prepend(html);
}


/* =========================================================================================
 * 과목별 개별 기능
 * ====================================================================================== */

// $(window).on('load', function () {
function subjectFunction() {

    /* ───────────────────────────────────────────────────────┐
    * 과학
    └────────────────────────────────────────────────────── */
    // 효과음 버튼
    if (wrapTop.find('#effMode').length > 0) {
        setCookie('effMode', true, 1);
    }

    if (getCookie('effMode') == 'true') {
        wrapTop.find('#effMode').addClass('on');
    }

    wrapTop.find('#effMode').on('click', function () {
        effectAdo('click');
        deleteCookie('effMode');

        if ($(this).hasClass('on')) {
            $(this).removeClass('on');
        }
        else {
            $(this).addClass('on');
            setCookie('effMode', true, 1);
        }
    });
    /**
     * 국어
     */
    // 테마 색상 변경(인트로)
    // if ($('#wrap').hasClass('kor')) {
    //     var colorPick = 0; // 기본 컬러
    //     var cookie = 'colorPick'// 색 지정 쿠키

    //     bgColorChange(colorList[colorPick]);

    //     if ($('#wrap').hasClass('intro')) {
    //         var colorPickerHtml = `
    //             <div class="colorPicker">
    //                 <ul>
    //                     <li></li>
    //                     <li></li>
    //                     <li></li>
    //                     <li></li>
    //                     <li></li>
    //                     <li></li>
    //                 </ul>
    //             </div>
    //         `
    //         $('#wrap').find('.contents').append(colorPickerHtml);


    //         $('.colorPicker li').eq(colorPick).addClass('on');
    //         $('.sub').css('color', colorList[colorPick]);
    //         $('.sub').css('color', colorList[colorPick]);
    //         $.cookie(cookie, colorPick);

    //         $('.colorPicker li').on('click', function () {
    //             var idx = $(this).index();

    //             bgColorChange(colorList[idx]);
    //             $('.sub').css('color', colorList[idx]);
    //             $('.sub > span').css('background-color', colorList[idx]);
    //             $('.colorPicker li').removeClass('on');
    //             $(this).addClass('on');
    //             $.cookie(cookie, idx);
    //             effectAdo('click');
    //         });
    //     }
    // }

    /**
     * 수학
     */
    /*
    // 음원 버튼(인트로)
    if ($('#effMode').length > 0) {
        setCookie('effMode', true, 1);
    }

    if (getCookie('effMode') == 'true') {
        $('#effMode').addClass('on');
    }

    $('#effMode').on('click', function () {
        effectAdo('click');
        deleteCookie('effMode');

        if ($(this).hasClass('on')) {
            $(this).removeClass('on');
        }
        else {
            $(this).addClass('on');
            setCookie('effMode', true, 1);
        }
    });

    // 수익 버튼
    $('.math_t').on('click', function () {
        effectAdo('click');
        var src = $(this).attr('data-url');
        windowTop[0].open(src, 'menubar=no', false);
    });

    // 흥미 진진 활동
    $('.btnPopup[data-type="challenge"]').off('click').on('click', function () {
        var $this = $(this);

        $('.btnPopup[data-type="challenge"]').addClass('dis');
        $this.toggleClass('on');

        if ($this.hasClass('sol')) {
            effectAdo('sol');
        }
        else if ($this.hasClass('tog')) {
            effectAdo('tog');
        }

        $('#sol, #tog').off('ended').on('ended', function () {
            $this.removeClass('on');
            if ($this.hasClass('sol')) {
                $this.parent().find('.popup.sol').show();
            }
            else if ($this.hasClass('tog')) {
                $this.parent().find('.popup.tog').show();
            }

            $('.btnPopup[data-type="challenge"]').removeClass('dis');
        });
    });

    $('.popup[data-type="challenge"]').find('.close').off('click').on('click', function () {
        var $this = $(this);

        effectAdo('click');
        $this.parent('.popup').hide();
    });

    $('.popup[data-type="challenge"]').find('.hwalbtn').off('click').on('click', function () {
        var $this = $(this);
        var url = $this.attr('data-url');

        effectAdo('click');
        windowTop[0].open(url, '_blank');
    });

    // 확인 문제
    if (wrapTop.hasClass('checkQuiz')) {
        // 깜빡임 방지
        imgPreLoad([
            'common/images/quizitem/choice_bg.png',
            'common/images/quizitem/numberbox_easy.png',
            'common/images/quizitem/numberbox_hard.png',
            'common/images/quizitem/numberbox_normal.png',
            'common/images/quizitem/li_off.png',
            'common/images/quizitem/li_easy.png',
            'common/images/quizitem/li_normal.png',
            'common/images/quizitem/li_hard.png',
            'common/images/quizitem/return_easy.png',
            'common/images/quizitem/return_hard.png',
            'common/images/quizitem/tab_off.png',
            'common/images/quizitem/tab_easy.png',
            'common/images/quizitem/tab_hard.png',
        ], true);

        let wrap = wrapTop;
        let easyPage = wrap.find('.quizWrap[data-quiz="easy"]');
        let hardPage = wrap.find('.quizWrap[data-quiz="hard"]');

        // easyPage.hide();
        // hardPage.hide();

        // if($('#wrap').find('.choicePage').length > 0){
        //     $('#wrap').find('.choicePage').remove();
        // }

        let choiceHtml = `
            <div class="choicePage">
                <div class="choiceBtn" data-quiz="easy"></div>
                <div class="choiceBtn" data-quiz="hard"></div>
            </div>
        `
        easyPage.before(choiceHtml);

        let introHtml = `
            <div class="introPage">
                <!-- 난이도 하 문항 선택 -->
                <ul class="question easy">
                    <li>0</li>
                    <li>1</li>
                    <li>2</li>
                    <li class="act">3</li>
                </ul>
                <!-- 난이도 중 문항 선택 -->
                <ul class="question normal">
                    <li>0</li>
                    <li>1</li>
                    <li class="act">2</li>
                    <li>3</li>
                </ul>
                <!-- 난이도 상 문항 선택 -->
                <ul class="question hard">
                    <li>0</li>
                    <li class="act">1</li>
                    <li>2</li>
                    <li>3</li>
                </ul>
                <!-- 총 문항  -->
                <span class="sum">
                    6
                </span>

                <div class="startBtn"></div>

                <div class="return"></div>
            </div>
        `
        easyPage.before(introHtml);

        let hardPageFrame = `
            <div class="pageing">
                <div class="btn prev"></div>
                <div class="btn next"></div>
            </div>
            <div class="headerSec">
                <ul class="setContent"></ul>
                <div class="return"></div>
                <div class="numberbox easy on">1</div>
            </div>

            <!-- 완료 버튼 -->
            <div class="finish_btn"></div>
        `
        hardPage.append(hardPageFrame);

        let easyPageFrame = `
        <ul class="setContent"></ul>
        <div class="return"></div>
        `
        easyPage.append(easyPageFrame);

        for (i = 0; i < easyPage.find('.contents').length; i++) {
            easyPage.find('.setContent').append('<li></li>')
        }
        easyPage.find(`.setContent li`).each(function () {
            $(this).text($(this).index() + 1);
        });

        wrap.find('.quizWrap').hide();
        wrap.find('.introPage').hide();
        wrap.find('.choicePage').show();

        wrap.find('.choicePage .choiceBtn').on('click', function () {
            effectAdo('click');
            $('.choicePage').hide();

            let quiz = $(this).attr('data-quiz');
            if (quiz == 'easy') {
                easyPage.fadeIn();
                easyPage.find(`.setContent li`).eq(0).trigger('click');
            }
            else {
                wrap.find('.introPage').fadeIn();
            }
        });

        var easy = 3;
        var normal = 2;
        var hard = 1;

        wrap.find('.introPage .question li').on('click', function () {
            effectAdo('click');
            $(this).addClass('act');
            $(this).siblings().removeClass('act');

            if ($(this).parent().hasClass('easy')) {
                easy = $(this).index();
            } else if ($(this).parent().hasClass('normal')) {
                normal = $(this).index();
            } else {
                hard = $(this).index();
            }
            $('.sum').html(easy + normal + hard);
        });

        // 시작하기 버튼
        var totalNum;
        var easy_page = ['quizPage1', 'quizPage2', 'quizPage3'];
        var normal_page = ['quizPage4', 'quizPage5', 'quizPage6'];
        var hard_page = ['quizPage7', 'quizPage8', 'quizPage9'];
        var easy_show = [];
        var normal_show = [];
        var hard_show = [];
        var easy_rand = [];
        var noraml_rand = [];
        var hard_rand = [];
        var currentPage = 0;
        var cur = 0;

        wrap.find('.introPage .startBtn').off('click').on('click', function () {
            ado_stop();
            effectAdo('click');
            totalNum = easy + normal + hard;

            easy_rand = shuffleRandom(easy);
            normal_rand = shuffleRandom(normal);
            hard_rand = shuffleRandom(hard);

            easy_show = make_quiz(easy_page, easy_rand, easy);
            normal_show = make_quiz(normal_page, normal_rand, normal);
            hard_show = make_quiz(hard_page, hard_rand, hard);
            click_page = easy_show.concat(normal_show, hard_show);

            if (totalNum == 0) {
                alert('문제를 선택하세요.');
                return false;
            }
            if (totalNum == 1) {
                currentPage = 1;
            }

            hardPage.find('.setContent li').remove();

            wrap.find('.introPage').hide();
            hardPage.show();
            hardPage.find('.pageing').show();
            hardPage.find('.pageing').find('.prev').addClass('dis');

            for (var i = 0; i < totalNum; i++) {
                if (i < easy) {
                    hardPage.find('.setContent').append('<li class="easy">' + (i + 1) + '</li>');
                } else if (i < (easy + normal)) {
                    hardPage.find('.setContent').append('<li class="normal">' + (i + 1) + '</li>');
                } else if (i < (totalNum)) {
                    hardPage.find('.setContent').append('<li class="hard">' + (i + 1) + '</li>');
                }
            }

            hardPage.find('.setContent li').off('click').on('click', function () {
                var idx = $(this).index();
                currentPage = idx;
                var contents = hardPage.find('.quizPage').eq(idx);
                var pageIdx = $('.' + click_page[idx]).index();
                var difficulty = $(this).attr('class');

                resetContents();
                effectAdo('click');

                $(this).addClass('on').siblings().removeClass('on');

                hardPage.find('.quizPage').hide().eq(pageIdx).show();

                if (typeof contentScript_hard !== 'undefined') {
                    contentScript_hard(pageIdx, hardPage.find('.quizPage').eq(pageIdx));
                }

                $('.numberbox').text(idx + 1);

                switch (difficulty) {
                    case 'easy':
                        // $('.difficulty').css('background', 'url(common/images/quizitem/difficulty_easy.png)');
                        $('.numberbox').removeClass('easy normal hard').addClass('easy');
                        break;
                    case 'normal':
                        // $('.difficulty').css('background', 'url(common/images/quizitem/difficulty_normal.png)');
                        $('.numberbox').removeClass('easy normal hard').addClass('normal');
                        break;
                    case 'hard':
                        // $('.difficulty').css('background', 'url(common/images/quizitem/difficulty_hard.png)');
                        $('.numberbox').removeClass('easy normal hard').addClass('hard');
                        break;
                }

                hardPage.find('.pageing .btn').addClass('dis');

                cur = hardPage.find('.setContent li.on').index();
                var num = hardPage.find('.setContent li').length;
                if (cur !== 0) hardPage.find('.pageing .prev').removeClass('dis');
                if (cur !== (num - 1)) hardPage.find('.pageing .next').removeClass('dis');

                $('.finish_btn').removeClass('on');
                if (cur == num - 1) {
                    hardPage.find('.ansbtn').click(function () {
                        if ($(this).hasClass('re')) {
                            $('.finish_btn').addClass('on');
                        } else {
                            $('.finish_btn').removeClass('on');
                            $('.bounce2').remove();
                        }
                    });
                }
            });

            hardPage.find('.setContent li').eq(0).trigger('click');
            hardPage.find('.' + click_page[0]).show();
        });

        easyPage.find(`.setContent li`).off('click').on('click', function () {
            let idx = $(this).index();
            currentPage = idx;

            resetContents();
            effectAdo('click');

            $(this).addClass('on').siblings().removeClass('on');
            easyPage.find('.pageing').show();
            easyPage.find('.pageing').find('.prev').addClass('dis');

            easyPage.find('.quizPage').hide().eq(idx).show();

            cur = idx;
            var num = easyPage.find('.setContent li').length;
            easyPage.find('.pageing .btn').addClass('dis');
            if (cur !== 0) easyPage.find('.pageing .prev').removeClass('dis');
            if (cur !== (num - 1)) easyPage.find('.pageing .next').removeClass('dis');

            if (typeof contentScript_easy !== 'undefined') {
                contentScript_easy(idx, easyPage.find('.quizPage').eq(idx));
            }
        });

        wrap.find('.pageing .btn').off('click').on('click', function () {
            effectAdo('click');
            resetContents();

            let dataQuiz = $(this).closest('.quizWrap').attr('data-quiz');

            if ($(this).hasClass('next')) {
                cur += 1;
            } else {
                cur -= 1;
            }

            if (dataQuiz == 'easy') {
                easyPage.find('.setContent li').eq(cur).trigger('click');
            }
            else {
                hardPage.find('.setContent li').eq(cur).trigger('click');
            }

            wrap.find('.finish_btn').removeClass('on');
        });

        wrap.find('.return').off('click').on('click', function () {
            wrap.find('.quizWrap').hide();
            wrap.find('.quizPage').hide();
            wrap.find('.introPage').hide();
            wrap.find('.choicePage').fadeIn();
            wrap.find('.setContent > li').removeClass('on')
            effectAdo('click');

            easy_show = [];
            normal_show = [];
            hard_show = [];
            easy_rand = [];
            noraml_rand = [];
            hard_rand = [];
            currentPage = 0;
            cur = 0;

            easy = 3;
            normal = 2;
            hard = 1;
            wrap.find('.introPage .question.easy li').eq(easy).trigger('click');
            wrap.find('.introPage .question.normal li').eq(normal).trigger('click');
            wrap.find('.introPage .question.hard li').eq(hard).trigger('click');

            wrap.find('.finish_btn').removeClass('on');
        });

        wrap.find(".finish_btn").off('click').on("click", function () {
            effectAdo("click");
            $(this).removeClass("on");
        });


    }
    */
}

/**
 * 국어
 */
/**
 * 누적 체크리스트
 * @param {JQuery} wrap  startContents 가 만들어질 요소
 * @param {Number} group 별표 그룹의 총 개수
 * @param {Number|Array} star 별표 그룹내 별의 총 개수(모두 같으면 정수, 그룹별로 다르다면 array)
 */
var starContents = function starContents(wrap, group, star) {
    var self = this;
    this.wrap = wrap;

    this.groupTotal = group || 1;
    this.starTotal = star || 3;

    this.conWrap = '';          // .starContent
    this.starGroups = '';       // .starContent .starGroup
    this.stars = '';            // .starContent .starGroup .star

    this.init = function () {
        if (self.wrap.find('.starContent').length > 0) {
            self.wrap.find('.starContent').remove();
        }

        // 깜빡임 방지
        imgPreLoad([
            'common/images/clickitem/star1.png',
            'common/images/clickitem/star2.png',
            'common/images/clickitem/star3.png',
            'common/images/clickitem/star1_on.png',
            'common/images/clickitem/star2_on.png',
            'common/images/clickitem/star3_on.png',
            'common/images/clickitem/star1_on_aft.png',
            'common/images/clickitem/star2_on_aft.png',
            'common/images/clickitem/star3_on_aft.png',
        ], true);


        self.makeCon();
        self.makeStarGroup();
        self.makeStar();

        self.addEvent();
    };

    this.reset = function () {
        self.stars.removeClass('on');
    };

    this.makeCon = function () {
        var html = '';
        html += '<div class="starContent"></div>';
        self.wrap.append(html);
        self.conWrap = self.wrap.find('.starContent');
    };

    this.makeStarGroup = function () {
        var html = '';
        for (var i = 0; i < self.groupTotal; ++i) {
            html += '<div class="starGroup starGroup' + (i + 1) + '"></div>';
        }
        self.conWrap.append(html);
        self.starGroups = self.conWrap.find('.starGroup');
    };

    this.makeStar = function () {
        var html = '';
        var i, k;
        if (Array.isArray(self.starTotal)) {
            for (i = 0; i < self.starTotal.length; ++i) {
                html = '';
                for (k = 0; k < self.starTotal[i]; ++k) {
                    html += '<div class="star star' + (k + 1) + '"></div>';
                }
                self.starGroups.eq(i).append(html);
            }
        }
        else {
            self.starGroups.each(function () {
                html = '';
                for (k = 0; k < self.starTotal; ++k) {
                    html += '<div class="star star' + (k + 1) + '"></div>';
                }
                $(this).append(html);
            });
        }

        self.stars = self.conWrap.find('.star');
    };


    this.addEvent = function () {
        self.stars.on('click', function () {
            var $ts = $(this);
            var idx = $ts.index();
            var stars = $ts.closest('.starGroup').find('.star');

            if ($(this).hasClass('on') && !$(this).next().hasClass('on')) {
                $(this).removeClass('on');
                effectAdo('click', false);
                return false;
            }

            switch (idx) {
                case 0:
                    effectAdo('click', false);
                    break;
                case 1:
                    effectAdo('click', false);
                    break;
                case 2:
                    effectAdo('click', false);
                    break;
            }

            stars.removeClass('on');
            $ts.addClass('on');
            // idx += 1;

            // for(var i = 0; i < idx; i ++){
            //     stars.eq(i).addClass('on');
            // }
        });
    };
};

/**
 * 카드 섞기
 * @param {JQuery} time  전체 시간
*/
var cardp;
var cardp2;

var cardSwap1;
var cardSwap2;

function cardSet(time) {
    wrapTop.addClass('dis');
    $('.gamePageWrap').addClass('com');

    // 섞기 모션
    cardSwap1 = setTimeout(function () {
        $('.gamePageWrap').addClass('animate');
    }, 500);
    cardSwap2 = setTimeout(function () {
        $('.gamePageWrap').removeClass('animate');
    }, time);

    $('.gamePageWrap .cardGame').off(sAnimationStart).on(sAnimationStart, function () {
        effectAdo('shuffle');
    });

    // 펼치는 모션
    cardp = setTimeout(function () {
        $('.gamePageWrap').addClass('st');
        $('.gamePageWrap').removeClass('com');
        // 클릭가능
        cardp2 = setTimeout(function () {
            $('.gamePageWrap').addClass('ready');
            wrapTop.removeClass('dis');
        }, 1100);

    }, time + 200);
}


/**
 * 수학
 */
// 확인 문제용
// 랜덤 숫자 생성
function shuffleRandom(n) {
    var ar = new Array();
    var temp;
    var rnum;

    for (var i = 1; i <= n; i++) {
        ar.push(i);
    }

    for (var i = 0; i < ar.length; i++) {
        rnum = Math.floor(Math.random() * n);
        temp = ar[i];
        ar[i] = ar[rnum];
        ar[rnum] = temp;
    }

    return ar;
}

// 난이도에 따라 clickPage 생성
function make_quiz(diff_array, ar, n) {
    var array = [];

    for (var i = 0; i < n; i++) {
        array.push(diff_array[ar[i] - 1]);
    }

    return array;
}

/**
 * 꾸러미 드래그 컨텐츠
 * @param {*} wrap 컨텐츠가 생성될 요소
 * @param {*} items 드래그 생성 버튼의 개수
 */
var packDragContents = function packDragContents(wrap, items, limit) {
    var self = this;
    this.wrap = wrap;

    this.setDragWrap, this.setDrag;
    this.dragArea, this.dragItem, this.dragRec;
    this.exbtn, this.ansbtn, this.exWrap;

    var isRec;

    this.init = function () {
        if (wrap.hasClass('package')) {
            self.wrap.removeClass('package');
            self.wrap.find('.setDragWrap').remove();
            self.wrap.find('.dragArea').remove();
            self.wrap.find('.btnWrap').remove();
        }

        self.makeHtml();
        self.addEventDrag();
        self.addEventBtn();
    };

    this.makeHtml = function () {
        self.wrap.addClass('package');
        var html = `
            <div class="setDragWrap"></div>
            <div class="dragArea"></div>
            <div class="btnWrap">
                <div class="exbtn"></div>
                <div class="ansbtn re"></div>
            </div>
            <div class="exWrap">
                <div class="close"></div>
            </div>
        `;
        self.wrap.append(html);
        self.setDragWrap = wrap.find('.setDragWrap');
        self.dragArea = wrap.find('.dragArea');
        self.exbtn = wrap.find('.exbtn');
        self.ansbtn = wrap.find('.ansbtn');
        self.exWrap = wrap.find('.exWrap');

        for (i = 0; i < items; i++) {
            self.setDragWrap.append('<div class="dragItem drag' + i + '"></div>');
        }

        self.setDrag = self.setDragWrap.find('.dragItem');
    };

    this.addEventDrag = function () {
        self.setDrag.off('click').on('click', function () {
            var $this = $(this);
            var idx = $this.index();

            self.dragItem = $this.clone();

            self.dragItem.css({
                left: random(100, pxToInt(self.dragArea.css('width')) - 58 - 100) + "px",
                top: random(100, pxToInt(self.dragArea.css('height')) - 63 - 100) + "px",
            });

            if (limit) {
                if (self.dragArea.find(`.drag${idx}`).length >= (limit - 1)) {
                    $this.addClass('dis');
                }
                self.dragArea.append(self.dragItem);
            }
            else {
                self.dragArea.append(self.dragItem);
            }

            self.dragItem.draggable({
                cursor: "pointer",
                revert: 'invalid',
                start: function (e, obj) {
                    var factor = FORTEACHERCD.responsive.baseContainerSize.zoom;
                    obj.position.top = Math.round(obj.position.top / factor);
                    obj.position.left = Math.round(obj.position.left / factor);

                    isRec = $(this);

                    var startPos = obj.position;
                    obj.startPos = startPos;

                    obj.helper.attr({
                        'data-pos-x': obj.startPos.left,
                        'data-pos-y': obj.startPos.top
                    });
                    obj.helper.css({
                        'z-index': '999'
                    });

                },
                drag: function (e, obj) {
                    var factor = FORTEACHERCD.responsive.baseContainerSize.zoom;
                    obj.position.top = Math.round(obj.position.top / factor);
                    obj.position.left = Math.round(obj.position.left / factor);
                },
                stop: function (e, obj) {
                    if (pxToInt(obj.position.top) < 0 || pxToInt(obj.position.top) > (pxToInt(self.dragArea.css('height')) - pxToInt(isRec.css('height'))) || pxToInt(obj.position.left) < 0 || pxToInt(obj.position.left) > (pxToInt(self.dragArea.css('width')) - pxToInt(isRec.css('width')))) {
                        // console.log('벗어남');
                        // isRec.remove();
                        isRec.draggable('option', 'revert', 'invalid');
                    }
                    else {
                        sRec.draggable('option', 'revert', 'false');
                    }
                },
            });
        });
    };

    this.addEventBtn = function () {
        self.ansbtn.off('click').on('click', function () {
            self.dragArea.find('.dragItem').remove();
            self.setDrag.removeClass('dis');
            effectAdo('click');
        });

        self.exbtn.off('click').on('click', function () {
            self.exWrap.show();
            effectAdo('click');
        });

        self.exWrap.find('.close').off('click').on('click', function () {
            $(this).parent('.exWrap').hide();
            effectAdo('click');
        });
    };
};

var toolContents = function (wrap, triangle1, triangle2, angle, ja, cir) {
    var self = this;
    this.wrap = wrap;
    this.angleMove1 = false;
    this.angleMove2 = false;
    this.angleMove3 = false;
    this.angleMove3_r = false;
    this.angleMove4 = false;
    this.angleMove5 = false;
    this.factor = 1;
    this.ftangle = 0;
    this.tool,
        this.obj1,
        this.obj2,
        this.obj3,
        this.obj4,
        this.obj5,
        this.closebtn,
        this.triangle1,
        this.triangle2,
        this.angle,
        this.ja,
        this.cir,
        (this.makeHtml = function () {
            if (self.wrap.find(".triangletool").length > 0) {
                self.wrap.find(".triangletool").remove();
                self.wrap.find(".triangle1").remove();
                self.wrap.find(".triangle2").remove();
                self.wrap.find(".angle").remove();
                self.wrap.find(".ja").remove();
                self.wrap.find(".cir").remove();
            }
            var html =
                '<div class="triangletool tools">' +
                '<div class="close"></div>' +
                "</div>";
            self.wrap.append(html);
            this.tool = self.wrap.find(".triangletool");
            this.close = self.wrap.find(".triangletool .close");
            if (triangle1) {
                self.tool.append('<div class="triangle1"></div>');
                this.obj1 = self.wrap.find(".triangle1");
            }
            if (triangle2) {
                self.tool.append('<div class="triangle2"></div>');
                this.obj2 = self.wrap.find(".triangle2");
            }
            if (angle) {
                self.tool.append('<div class="angle"></div>');
                this.obj3 = self.wrap.find(".angle");
            }
            if (ja) {
                self.tool.append('<div class="ja"></div>');
                this.obj4 = self.wrap.find(".ja");
            }
            if (cir) {
                self.tool.append('<div class="cir"></div>');
                this.obj5 = self.wrap.find(".cir");
            }
        });

    this.init = function () {
        self.makeHtml();

        self.tool.on("click", function (e) {
            e.stopPropagation();
            effectAdo("click");
            if ($(this).hasClass("on")) {
                $(this).removeClass("on");
            } else {
                $(this).addClass("on");
            }
            // return false;
        });

        self.close.on("click", function (e) {
            e.stopPropagation();
            effectAdo("click");
            self.tool.removeClass("on");
        });

        if (triangle1) {
            self.setObjEvent1();
        }

        if (triangle2) {
            self.setObjEvent2();
        }

        if (angle) {
            self.setObjEvent3();
        }

        if (ja) {
            self.setObjEvent4();
        }
        if (cir) {
            self.setObjEvent5();
        }
    };

    this.setObjEvent1 = function () {
        self.obj1.on("click", function (e) {
            e.stopPropagation();
            self.turnangle = 0;
            effectAdo("click");
            // $(this).siblings().removeClass('on')
            // if (self.triangle2) {
            //  self.triangle2.remove()
            // }
            // if (self.angle) {
            //  self.angle.remove()
            // }
            // if (self.ja) {
            //  self.ja.remove()
            // }
            if ($(this).hasClass("on")) {
                // self.triangle1.remove();
                // $(this).removeClass('on')
                self.tool.removeClass("on");
                return false;
            }
            self.triangle1 = $(this).clone();
            self.triangle1.css({
                width: "400px",
                height: "400px",
                position: "absolute",
                top: "369px",
                left: "792px",
                "pointer-events": "none",
            });

            self.triangle1.append(
                '<div class="rotateBg"><div class="turn"></div><div class="close"></div></div>'
            );

            self.triangle1.find(".rotateBg").css({
                width: "400px",
                height: "400px",
                background: 'url("common/images/toolitem/ja1.png") 0px 0px no-repeat',
                "background-size": "100%",
                position: "absolute",
                top: "0",
                left: "0",
                "pointer-events": "all",
            });

            self.triangle1.find(".turn").css({
                width: "50px",
                height: "49px",
                background: 'url("common/images/toolitem/turnbtn.png") 0px 0px no-repeat',
                position: "absolute",
                bottom: "0",
                left: "-60px",
                cursor: "pointer",
            });

            self.triangle1.find(".close").css({
                width: "49px",
                height: "50px",
                background: 'url("common/images/toolitem/closebtn.png") 0px 0px no-repeat',
                position: "absolute",
                bottom: "55px",
                left: "-60px",
                cursor: "pointer",
            });

            self.wrap.append(self.triangle1);
            self.obj1.addClass("on");
            self.triangle1.draggable({
                cursor: "pointer",
                revert: "false",
                start: function (e, obj) {
                    var factor = FORTEACHERCD.responsive.baseContainerSize.zoom;

                    obj.position.top = Math.round(obj.position.top / factor);
                    obj.position.left = Math.round(obj.position.left / factor);
                    isRec = $(this);
                },
                drag: function (e, obj) {
                    var factor = FORTEACHERCD.responsive.baseContainerSize.zoom;
                    obj.position.top = Math.round(obj.position.top / factor);
                    obj.position.left = Math.round(obj.position.left / factor);
                },
                stop: function (e, obj) { },
            });

            self.triangle1.find(".turn").on("mousedown", function (e) {
                e.stopPropagation();
                self.angleMove1 = true;
            });

            self.triangle1.find(".close").on("click", function (e) {
                e.stopPropagation();
                effectAdo("click");
                self.triangle1.remove();
                self.obj1.removeClass("on");
            });
        });

        self.wrap.on("mousemove", function (e) {
            if (self.angleMove1) {
                self.moveAngle(
                    self.triangle1.find(".rotateBg"),
                    e.pageX - self.triangle1.offset().left,
                    e.pageY - self.triangle1.offset().top
                );
            }
        });

        self.wrap.on("mouseup mouseleave", function (e) {
            self.angleMove1 = false;
        });
    };

    this.setObjEvent2 = function () {
        self.obj2.on("click", function (e) {
            e.stopPropagation();
            effectAdo("click");
            self.turnangle = 0;
            // $(this).siblings().removeClass('on')
            // if (self.triangle1) {
            //  self.triangle1.remove()
            // }
            // if (self.angle) {
            //  self.angle.remove()
            // }
            // if (self.ja) {
            //  self.ja.remove()
            // }
            if ($(this).hasClass("on")) {
                // self.triangle2.remove();
                // $(this).removeClass('on')
                self.tool.removeClass("on");
                return false;
            }
            self.triangle2 = $(this).clone();
            self.triangle2.css({
                width: "690px",
                height: "400px",
                position: "absolute",
                top: "375px",
                left: "659px",
                "pointer-events": "none",
            });

            self.triangle2.append(
                '<div class="rotateBg"><div class="turn"></div><div class="close"></div></div>'
            );

            self.triangle2.find(".rotateBg").css({
                width: "690px",
                height: "400px",
                background: 'url("common/images/toolitem/ja2.png") 0px 0px no-repeat',
                "background-size": "100%",
                position: "absolute",
                top: "0",
                left: "0",
                "pointer-events": "all",
            });

            self.triangle2.find(".turn").css({
                width: "50px",
                height: "49px",
                background: 'url("common/images/toolitem/turnbtn.png") 0px 0px no-repeat',
                position: "absolute",
                bottom: "0",
                left: "-60px",
                cursor: "pointer",
            });

            self.triangle2.find(".close").css({
                width: "49px",
                height: "50px",
                background: 'url("common/images/toolitem/closebtn.png") 0px 0px no-repeat',
                position: "absolute",
                bottom: "55px",
                left: "-60px",
                cursor: "pointer",
            });

            self.obj2.addClass("on");
            self.wrap.append(self.triangle2);
            self.triangle2.draggable({
                cursor: "pointer",
                revert: "false",
                start: function (e, obj) {
                    var factor = FORTEACHERCD.responsive.baseContainerSize.zoom;

                    obj.position.top = Math.round(obj.position.top / factor);
                    obj.position.left = Math.round(obj.position.left / factor);
                    isRec = $(this);
                },
                drag: function (e, obj) {
                    var factor = FORTEACHERCD.responsive.baseContainerSize.zoom;
                    obj.position.top = Math.round(obj.position.top / factor);
                    obj.position.left = Math.round(obj.position.left / factor);
                },
                stop: function (e, obj) { },
            });

            self.triangle2.find(".turn").on("mousedown", function (e) {
                e.stopPropagation();
                self.angleMove2 = true;
            });

            self.triangle2.find(".close").on("click", function (e) {
                e.stopPropagation();
                effectAdo("click");
                self.triangle2.remove();
                self.obj2.removeClass("on");
            });
        });

        self.wrap.on("mousemove", function (e) {
            if (self.angleMove2) {
                self.moveAngle(
                    self.triangle2.find(".rotateBg"),
                    e.pageX - self.triangle2.offset().left,
                    e.pageY - self.triangle2.offset().top
                );
            }
        });

        self.wrap.on("mouseup mouseleave", function (e) {
            self.angleMove2 = false;
        });
    };

    this.setObjEvent3 = function () {
        self.obj3.on("click", function (e) {
            e.stopPropagation();
            effectAdo("click");
            self.turnangle = 0;
            // $(this).siblings().removeClass('on')
            // if (self.triangle1) {
            //  self.triangle1.remove()
            // }
            // if (self.triangle2) {
            //  self.triangle2.remove()
            // }
            // if (self.ja) {
            //  self.ja.remove()
            // }

            if ($(this).hasClass("on")) {
                // self.angle.remove();
                // $(this).removeClass('on')
                self.tool.removeClass("on");
                return false;
            }
            self.angle = $(this).clone();

            self.angle.css({
                width: "723px",
                height: "387px",
                position: "absolute",
                top: "396px",
                left: "586px",
                "z-index": "2",
                "pointer-events": "none",
            });

            self.angle.append(
                '<div class="rotateBg"><div class="turn"></div><div class="turn r"></div><div class="close"></div><div class="close r"></div></div>'
            );

            self.angle.find(".rotateBg").css({
                width: "723px",
                height: "387px",
                background: 'url("common/images/toolitem/angle.png") 0px 0px no-repeat',
                "background-size": "100%",
                position: "absolute",
                top: "0",
                left: "0",
                "border-top-left-radius": "357px",
                "border-top-right-radius": "357px",
                "pointer-events": "all",
            });

            self.angle.find(".turn").css({
                width: "50px",
                height: "49px",
                background: 'url("common/images/toolitem/turnbtn.png") 0px 0px no-repeat',
                position: "absolute",
                bottom: "0",
                left: "-60px",
                cursor: "pointer",
            });

            self.angle.find(".close").css({
                width: "49px",
                height: "50px",
                background: 'url("common/images/toolitem/closebtn.png") 0px 0px no-repeat',
                position: "absolute",
                bottom: "55px",
                left: "-60px",
                cursor: "pointer",
            });

            self.angle.find(".turn.r, .close.r").css({
                left: "740px",
            });

            self.obj3.addClass("on");
            self.wrap.append(self.angle);
            self.angle.draggable({
                cursor: "pointer",
                revert: "false",
                start: function (e, obj) {
                    var factor = FORTEACHERCD.responsive.baseContainerSize.zoom;
                    obj.position.top = Math.round(obj.position.top / factor);
                    obj.position.left = Math.round(obj.position.left / factor);
                    isRec = $(this);
                },
                drag: function (e, obj) {
                    var factor = FORTEACHERCD.responsive.baseContainerSize.zoom;
                    obj.position.top = Math.round(obj.position.top / factor);
                    obj.position.left = Math.round(obj.position.left / factor);
                },
                stop: function (e, obj) { },
            });

            self.angle.find(".turn").on("mousedown", function (e) {
                e.stopPropagation();
                if ($(this).hasClass("r")) {
                    self.angleMove3_r = true;
                } else {
                    self.angleMove3 = true;
                }
            });

            self.angle.find(".close").on("click", function (e) {
                e.stopPropagation();
                effectAdo("click");
                self.angle.remove();
                self.obj3.removeClass("on");
            });
        });

        self.wrap.on("mousemove", function (e) {
            e.preventDefault();
            if (self.angleMove3) {
                self.moveAngle(
                    self.angle.find(".rotateBg"),
                    e.pageX - self.angle.offset().left,
                    e.pageY - self.angle.offset().top
                );
            } else if (self.angleMove3_r) {
                self.moveAngle(
                    self.angle.find(".rotateBg"),
                    e.pageX - self.angle.offset().left,
                    e.pageY - self.angle.offset().top,
                    true
                );
            }
        });

        self.wrap.on("mouseup mouseleave", function (e) {
            e.preventDefault();
            self.angleMove3 = false;
            self.angleMove3_r = false;
        });
    };

    this.setObjEvent4 = function () {
        self.obj4.on("click", function (e) {
            e.stopPropagation();
            effectAdo("click");
            self.turnangle = 0;
            // $(this).siblings().removeClass('on')
            // if (self.triangle1) {
            //  self.triangle1.remove()
            // }
            // if (self.triangle2) {
            //  self.triangle2.remove()
            // }
            // if (self.angle) {
            //  self.angle.remove()
            // }
            if ($(this).hasClass("on")) {
                // self.ja.remove();
                // $(this).removeClass('on')
                self.tool.removeClass("on");
                return false;
            }
            self.ja = $(this).clone();
            self.ja.css({
                width: "875px",
                height: "160px",
                position: "absolute",
                top: "531px",
                left: "510px",
                "pointer-events": "none",
                "z-index": "3",
            });

            self.ja.append(
                '<div class="rotateBg"><div class="turn"></div><div class="close"></div></div>'
            );

            self.ja.find(".rotateBg").css({
                width: "875px",
                height: "160px",
                background: 'url("common/images/toolitem/ja5.png") 0px 0px no-repeat',
                "background-size": "100%",
                position: "absolute",
                top: "0",
                left: "0",
                "pointer-events": "all",
            });

            self.ja.find(".turn").css({
                width: "50px",
                height: "49px",
                background: 'url("common/images/toolitem/turnbtn.png") 0px 0px no-repeat',
                position: "absolute",
                bottom: "0",
                left: "-60px",
                cursor: "pointer",
            });

            self.ja.find(".close").css({
                width: "49px",
                height: "50px",
                background: 'url("common/images/toolitem/closebtn.png") 0px 0px no-repeat',
                position: "absolute",
                bottom: "55px",
                left: "-60px",
                cursor: "pointer",
            });

            self.obj4.addClass("on");
            self.wrap.append(self.ja);
            self.ja.draggable({
                cursor: "pointer",
                revert: "false",
                start: function (e, obj) {
                    var factor = FORTEACHERCD.responsive.baseContainerSize.zoom;

                    obj.position.top = Math.round(obj.position.top / factor);
                    obj.position.left = Math.round(obj.position.left / factor);
                    isRec = $(this);
                },
                drag: function (e, obj) {
                    var factor = FORTEACHERCD.responsive.baseContainerSize.zoom;
                    obj.position.top = Math.round(obj.position.top / factor);
                    obj.position.left = Math.round(obj.position.left / factor);
                },
                stop: function (e, obj) { },
            });

            self.ja.find(".turn").on("mousedown", function (e) {
                e.stopPropagation();
                self.angleMove4 = true;
            });

            self.ja.find(".close").on("click", function (e) {
                e.stopPropagation();
                effectAdo("click");
                self.ja.remove();
                self.obj4.removeClass("on");
            });
        });

        self.wrap.on("mousemove", function (e) {
            e.preventDefault();
            if (self.angleMove4) {
                self.moveAngle(
                    self.ja.find(".rotateBg"),
                    e.pageX - self.ja.offset().left,
                    e.pageY - self.ja.offset().top
                );
            }
        });

        self.wrap.on("mouseup mouseleave", function (e) {
            e.preventDefault();
            self.angleMove4 = false;
        });
    };

    this.setObjEvent5 = function () {
        var maxAppend = 1;
        self.obj5.on("click", function (e) {
            e.stopPropagation();
            effectAdo("click");
            self.turnangle = 0;
            // $(this).siblings().removeClass('on')
            // if (self.triangle1) {
            //  self.triangle1.remove()
            // }
            // if (self.triangle2) {
            //  self.triangle2.remove()
            // }
            // if (self.angle) {
            //  self.angle.remove()
            // }
            if ($(this).hasClass("on")) {
                // self.ja.remove();
                // $(this).removeClass('on')
                self.tool.removeClass("on");
                return false;
            }
            if (self.wrap.find("[data-cir]").length === 19) {
                $(".cir").addClass("on");
                // return false;
                //20개가 되면 안나오게 설정
            } else {
                $(".cir").removeClass("on");
            }
            if (self.wrap.find("[data-cir]").length === 20) {
                // $('.cir').addClass('on')
                return false;
                //20개가 되면 안나오게 설정
            }

            self.cir = $(this).clone();
            self.cir.attr("data-cir", maxAppend++);
            //cir의 attr ( data-cir , 1부터 증가)
            var random = function ($min, $max) {
                return parseInt(Math.random() * ($max + 1 - $min)) + $min;
            };

            /* if(maxAppend >= 6) return;
                  maxAppend++; */
            self.cir
                .css({
                    width: "58px",
                    height: "63px",
                    position: "absolute",
                    top: "531px",
                    left: "960px",
                    "pointer-events": "none",
                    "z-index": "3",
                })
                .css({
                    left: random(100, 1920 - 58 - 100) + "px",
                    //left 값 랜덤 값 (위치)
                    top: random(100, 1080 - 63 - 100) + "px",
                    //top 값 랜덤 값 (위치)
                }); /* .html(self.cir.attr('data-cir')) */

            self.cir.append(
                '<div class="rotateBg"><div class="turn"></div><div class="close"></div></div>'
            );

            self.cir.find(".rotateBg").css({
                width: "77px",
                height: "77px",
                background: 'url("common/images/toolitem/cirs.png") 0px 0px no-repeat',
                "background-size": "100%",
                position: "absolute",
                top: "0",
                left: "0",

                "pointer-events": "all",
            });

            // self.cir.find('.turn').css({
            //     'width': '50px',
            //     'height': '49px',
            //     'background': 'url("common/images/toolitem/turnbtn.png") 0px 0px no-repeat',
            //     'position': 'absolute',
            //     'bottom': '0',
            //     'left': '-60px',
            //     'cursor': 'pointer'
            // })

            self.cir.find(".close").css({
                width: "49px",
                height: "50px",
                background: 'url("common/images/toolitem/closebtn.png") 0px 0px no-repeat',
                position: "absolute",
                top: "-12px",
                right: "-60px",
                cursor: "pointer",
            });

            // self.obj4.addClass('on');
            self.wrap.append(self.cir);
            self.cir.draggable({
                cursor: "pointer",
                revert: "false",
                start: function (e, obj) {
                    var factor = FORTEACHERCD.responsive.baseContainerSize.zoom;

                    obj.position.top = Math.round(obj.position.top / factor);
                    obj.position.left = Math.round(obj.position.left / factor);
                    isRec = $(this);
                },
                drag: function (e, obj) {
                    var factor = FORTEACHERCD.responsive.baseContainerSize.zoom;
                    obj.position.top = Math.round(obj.position.top / factor);
                    obj.position.left = Math.round(obj.position.left / factor);
                },
                stop: function (e, obj) { },
            });

            self.cir.find(".turn").on("mousedown", function (e) {
                e.stopPropagation();
                self.angleMove5 = true;
            });

            self.cir.find(".close").on("click", function (e) {
                e.stopPropagation();
                effectAdo("click");
                //self.cir.remove();
                self.obj5.removeClass("on");
                $(this).parent().parent().remove();
                /* maxAppend--;
                        console.log(maxAppend); */
            });
        });

        self.wrap.on("mousemove", function (e) {
            e.preventDefault();
            if (self.angleMove5) {
                self.moveAngle(
                    self.cir.find(".rotateBg"),
                    e.pageX - self.cir.offset().left,
                    e.pageY - self.cir.offset().top
                );
            }
        });

        self.wrap.on("mouseup mouseleave", function (e) {
            e.preventDefault();
            self.angleMove5 = false;
        });
    };

    this.turnangle = 0;
    this.moveAngle = function (obj, cx, cy, angle_r) {
        var zoom = FORTEACHERCD.responsive.baseContainerSize.zoom;
        var ex = ex;
        var ey = ey;
        var angleCenter = 361;
        if (!ex) {
            ex = Number(obj.css("left").replace("px", "")) + obj.width() / 2;
        }
        if (!ey) {
            if (obj.parent().hasClass("angle"))
                ey = Number(obj.css("top").replace("px", "")) + angleCenter;
            else ey = Number(obj.css("top").replace("px", "")) + obj.height() / 2;
        }
        if (obj.parent().hasClass("angle")) {
            var dy = ey - cy / zoom;
        } else {
            var dy = ey - wrapTop.offset().top - cy / zoom;
        }
        var dx = ex - wrapTop.offset().left - cx / zoom;
        var theta = Math.atan2(dy, dx);
        theta = (theta * 180) / Math.PI;

        if (angle_r != undefined) {
            theta += 180;
        }

        if (self.turnangle == 0) {
            if (angle_r != undefined) self.turnangle = -theta;
            else self.turnangle = theta;
        }

        if (angle_r != undefined) theta = theta + self.turnangle;
        else theta = theta - self.turnangle;

        theta = Number(theta).toFixed(1);
        // console.log(obj.height());
        if (obj.parent().hasClass("angle")) {
            obj.css({
                transform: "rotate(" + theta + "deg)",
                "transform-origin": "center " + angleCenter + "px",
            });
        } else {
            obj.css({
                transform: "rotate(" + theta + "deg)",
                "transform-origin": "center center",
            });
        }

        if (self.wrap.find(".center").length == 0) {
            self.wrap.append('<div class="center"></div>');
            self.wrap.append('<div class="turno"></div>');
        }

        return theta;
    };
};
