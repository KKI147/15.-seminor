/**
 * @file timings_class.js
 * @author leer83@naver.com
 * @since 2020.05.28
 * @brief 수학적 진행상태를 계산. dictionary 보유
 * @modified
 * 2020-05-28 10:07:00  v3 정리
 */

'use strict';

(function () {

    /**
     *
     * @param {*} nMili 변환할 숫자값(milisecond)
     * @use  msToTime(2000) -> 00:00:02.000
     */
    function msToTime(nMili) {
        // Pad to 2 or 3 digits, default is 2
        function pad(n, z) {
            z = z || 2;
            return ('00' + n).slice(-z);
        }
        var ms = nMili % 1000;
        nMili = (nMili - ms) / 1000;
        var secs = nMili % 60;
        nMili = (nMili - secs) / 60;
        var mins = nMili % 60;
        var hrs = (nMili - mins) / 60;

        return pad(hrs) + ':' + pad(mins) + ':' + pad(secs) + '.' + pad(ms, 3);
    }

    var timings = {

        isInit: false,
        timeStampInMs: 0,
        aniKeys: {},            // dictionary

        init: function () {
            var self = this;
            self.initAniFrame();
            self.initEaseOut();
            self.initEaseInOut();
            self.isInit = true;
        },
        initAniFrame: function () {
            // requestAnimationFrame vendor free
            window.requestAnimationFrame = (function () {
                //return function (callback) { window.setTimeout(callback, 1000 / 60); };
                return window.requestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.oRequestAnimationFrame ||
                    window.msRequestAnimationFrame ||
                    function (callback) { window.setTimeout(callback, 1000 / 60); };
            })();
            //cancelAnimationFrame vendor free
            window.cancelAnimationFrame = (function (id) {
                //return function (id) { window.clearTimeout(id); };
                return window.cancelAnimationFrame ||
                    window.webkitCancelAnimationFrame ||
                    window.mozCancelAnimationFrame ||
                    window.oCancelAnimationFrame ||
                    window.msCancelAnimationFrame ||
                    function (id) { window.clearTimeout(id); };
            })();
        },
        initEaseOut: function () {
            var self = this;
            self.easingFn.easeOutQuad = self.easingFn.makeEaseOut(self.easingFn.easeInQuad);
            self.easingFn.easeOutCubic = self.easingFn.makeEaseOut(self.easingFn.easeInCubic);
            self.easingFn.easeOutOct = self.easingFn.makeEaseOut(self.easingFn.easeInOct);
            self.easingFn.easeOutQuint = self.easingFn.makeEaseOut(self.easingFn.easeInQuint);
            self.easingFn.easeOutCirc = self.easingFn.makeEaseOut(self.easingFn.easeInCirc);
            self.easingFn.easeOutBack = self.easingFn.makeEaseOut(self.easingFn.easeInBack);
            self.easingFn.easeOutElastic = self.easingFn.makeEaseOut(self.easingFn.easeInElastic);
            self.easingFn.easeOutBounce = self.easingFn.makeEaseOut(self.easingFn.easeInBounce);
        },
        initEaseInOut: function () {
            var self = this;
            self.easingFn.easeInOutQuad = self.easingFn.makeEaseInOut(self.easingFn.easeInQuad);
            self.easingFn.easeInOutCubic = self.easingFn.makeEaseInOut(self.easingFn.easeInCubic);
            self.easingFn.easeInOutOct = self.easingFn.makeEaseInOut(self.easingFn.easeInOct);
            self.easingFn.easeInOutQuint = self.easingFn.makeEaseInOut(self.easingFn.easeInQuint);
            self.easingFn.easeInOutCirc = self.easingFn.makeEaseInOut(self.easingFn.easeInCirc);
            self.easingFn.easeInOutBack = self.easingFn.makeEaseInOut(self.easingFn.easeInBack);
            self.easingFn.easeInOutElastic = self.easingFn.makeEaseInOut(self.easingFn.easeInElastic);
            self.easingFn.easeInOutBounce = self.easingFn.makeEaseInOut(self.easingFn.easeInBounce);
        },
        //Timing functions
        easingFn: {
            // no easing, no acceleration
            linear: function(timeFraction) { return timeFraction; },
            // accelerating from zero velocity
            easeInQuad: function(timeFraction) { return Math.pow(timeFraction, 2); },
            easeInCubic: function(timeFraction) { return Math.pow(timeFraction, 3); },
            easeInOct: function(timeFraction) { return Math.pow(timeFraction, 4); },
            easeInQuint: function(timeFraction) { return Math.pow(timeFraction, 5); },
            easeInCirc: function(timeFraction) { return 1 - Math.sin(Math.acos(timeFraction)); },
            easeInBack: function(timeFraction) { var x = 1.5; return Math.pow(timeFraction, 2) * ((x + 1) * timeFraction - x); }, //back.bind(null, 1.5)
            easeInElastic: function(timeFraction) { return Math.pow(2,10 * (timeFraction - 1)) * Math.cos(20 * Math.PI * 1.5 / 3 * timeFraction); },
            easeInBounce: function(timeFraction) {
                for (var a = 0, b = 1, result; 1; a += b, b /= 2) {
                    if (timeFraction >= (7 - 4 * a) / 11) {
                        return -Math.pow((11 - 6 * a - 11 * timeFraction) / 4, 2) + Math.pow(b, 2);
                    }
                }
            },
            //accepts a timing function, returns the Reverse functions, easeIn -> easeOut
            makeEaseOut: function(timing){
                return function(timeFraction) {
                    return 1 - timing(1 - timeFraction);
                };
            },
            //In-Out functions( until halfway In, then Out )
            makeEaseInOut: function(timing) {
                return function (timeFraction) {
                    if (timeFraction < 0.5)
                        return timing(2 * timeFraction) / 2;
                    else
                        return (2 - timing(2 * (1 - timeFraction))) / 2;
                };
            }
        },
        //---------------------------------------------------
        //
        //
        //
        //---------------------------------------------------
        /**
         * 현재 시간 얻는 방법
         * @see
         * https://jieun0113.tistory.com/m/70?category=670249
         * @see {Navigation Timing으로 페이지 로딩 속도 측정하기} https://www.html5rocks.com/ko/tutorials/webperformance/basics/
         * @see {reference} https://developer.mozilla.org/ko/docs/Navigation_timing
         */
        getTimeStampInMs: function(){
            return window.performance && window.performance.now && window.performance.timing && window.performance.timing.navigationStart ? window.performance.now() + window.performance.timing.navigationStart : Date.now(); //1970년 1월 1일 00:00:00(UTC)을 기점으로 현재 시간까지 경과한 밀리초를 숫자로 반환한다.
        },
        getInfo: function (aniKey) {
            var self = this;
            if (!self.aniKeys[aniKey]) {
                console.log('[error]: ', '"' + aniKey + '"', 'is nothing !!!');
                return undefined;
            }
            return self.aniKeys[aniKey];
        },
        setInfo: function (aniKey, duration, timing, maxLoopCnt, isStopGoFirst, drawCallback) {
            var self = this;
            if (self.hasInfo(aniKey)) {
                console.log('[error]: ', '"' + aniKey + '"', 'is conflict aniId !!!');
                return false;
            }

            timing = timing || self.easingFn.linear;

            self.aniKeys[aniKey] = {
                aniKey: aniKey,                 // animation이름
                aniId: -1,                      // requestAnimationFrame 시간변수
                continueAnimating: false,       // Animation을 계속 진행할지 여부
                duration: duration,             // 1번 재생하는 총 시간
                timing: timing,                 // easing timing 메서드
                drawCallback: drawCallback,     // 매 timing마다 실행할 콜백 함수

                callbackEnabled: true,

                state: 'stop',                  // 현재 animation 상태(stop, stop_end, pause)
                isPaused: false,                // 이전상태가 paused였는지 여부
                isStopGoFirst: isStopGoFirst || false,           // 재생이 중지되면 맨 처음으로 돌아갈 것인지 여부
                isReverse: false,               // 역방향재생 여부

                start: 0,                       // 재생이 시작된 시간 timestamp
                pTime: 0,                       // 일시정지가 되었을때시간 - 재생이 시작된 시간 timestamp
                progress: 0,                    // easing이 적용된 timing progress
                loopCnt: 0,                     // 현재 반복 횟수
                maxLoopCnt: maxLoopCnt || -1    // 최대 반복 회수(-1 : 무한반복)
            };
        },
        hasInfo: function (aniKey) {
            var self = this;
            if (self.aniKeys[aniKey]) {
                return true;
            } else {
                return false;
            }
        },
        removeInfo: function (aniKey) {
            var self = this;
            var koInfo = self.getInfo(aniKey);
            if (!koInfo) {
                return undefined;
            }
            self.aniKeys[aniKey].continueAnimating = false;
            self.aniKeys[aniKey].timing = undefined;
            self.aniKeys[aniKey].callbackEnabled = false;
            self.aniKeys[aniKey].drawCallback = undefined;
            self.aniKeys[aniKey] = undefined;
        },
        setLoop: function (aniKey, pnLoopCount) {
            var self = this;
            var koInfo = self.getInfo(aniKey);

            koInfo.loopCnt = 0;
            koInfo.maxLoopCnt = pnLoopCount;

            //console.log('pnLoopCount: ', pnLoopCount);
        },
        getCallbackEnabled: function (aniKey) {
            var self = this;
            var koInfo = self.getInfo(aniKey);

            return koInfo.callbackEnabled;
        },
        setCallbackEnabled: function (aniKey, pbIsEnabled) {
            var self = this;
            var koInfo = self.getInfo(aniKey);

            koInfo.callbackEnabled = pbIsEnabled;
        },
        setReverse: function (aniKey, pbIsReverse) {
            var self = this;
            var koInfo = self.getInfo(aniKey);
            koInfo.isReverse = pbIsReverse;

            //if (koInfo.isReverse === true) {
            // reverse재생처리
            if (koInfo.state === 'play') {
                self.pause(aniKey);

                //var knTimeFraction = 1 - ((new Date().getTime() - koInfo.start) / koInfo.duration);
                var knTimeFraction = 1 - koInfo.progress;
                var knSeekTime = knTimeFraction * koInfo.duration;
                koInfo.progress = koInfo.timing(knTimeFraction);
                koInfo.pTime = knSeekTime;
                self.play(aniKey);

            } else if (koInfo.state == 'pause') {

                //self.pause(aniKey, true);

                var knTimeFraction = 1 - koInfo.progress;
                var knSeekTime = knTimeFraction * koInfo.duration;
                koInfo.progress = koInfo.timing(knTimeFraction);
                koInfo.pTime = knSeekTime;

                //self.play(aniKey);
            }
           // }
        },
        //---------------------------------------------------
        //
        //
        //
        //---------------------------------------------------
        animate: function (aniKey, duration, timing, maxLoopCnt, isStopGoFirst, drawCallback) {
            var self = this;
            if (!self.isInit) {
                self.init();
            }
            self.setInfo(aniKey, duration, timing, maxLoopCnt, isStopGoFirst, drawCallback);
        },
        play: function (aniKey) {
            var self = this;
            var koInfo = self.getInfo(aniKey);
            if (!koInfo) return;
            if (koInfo.state === 'play') {
                return;
            }

            if (koInfo.state === 'stop_end' || koInfo.state === 'stop') {
                koInfo.start = new Date().getTime();
                koInfo.loopCnt = 0;
            }
            if (koInfo.state === 'pause') {
                //console.log('> 재생전 상태가 pause였음');
                koInfo.start = new Date().getTime() - koInfo.pTime; // 이전에 일시정지였으면, 현재시간 - (일시정지되었을 시간 - 이전 시작시간) 을 계산한것을 시작시간으로
            }
            koInfo.continueAnimating = true;
            koInfo.state = 'play';
            koInfo.aniId = requestAnimationFrame(function (timeStamp) {
                self.onFrame(timeStamp, aniKey);
            });
        },
        pause: function (aniKey, bIsForce) {
            var self = this;
            var koInfo = self.getInfo(aniKey);
            if (!koInfo) return;
            if (!bIsForce && koInfo.state === 'pause') {
                return;
            }

            koInfo.state = 'pause';
            koInfo.isPaused = true;

            koInfo.pTime = new Date().getTime() - koInfo.start; // 일시정지됐을 시간 - 시작시간 차이계산(ms)

            cancelAnimationFrame(koInfo.aniId);
        },
        stop: function (aniKey, bIsEnd) {
            var self = this;
            var koInfo = self.getInfo(aniKey);
            if (!koInfo) return;
            if (bIsEnd) {
                koInfo.state = 'stop_end';
                this.seek(aniKey, koInfo.duration);
            } else {
                koInfo.state = 'stop';
                this.seek(aniKey, 0);
            }
            cancelAnimationFrame(koInfo.aniId);
        },
        seek: function (aniKey, nMil, bIsIndex, bIsRunCallBack) {
            var self = this;
            var koInfo = self.getInfo(aniKey);
            if (!koInfo) return;
            cancelAnimationFrame(koInfo.aniId);

            if (bIsRunCallBack === false) {
            } else {
                bIsRunCallBack = true;
            }
            nMil = nMil || 0;

            var knSeekTime = nMil;
            var knTimeFraction = knSeekTime / koInfo.duration;
            knTimeFraction = Math.min(1, knTimeFraction);

            koInfo.progress = koInfo.timing(knTimeFraction);

            // 인덱스 이동시 강제로 linear로 맞춰서 변형
            if (bIsIndex) {
                koInfo.progress = timings.easingFn.linear(knTimeFraction);
                /* if (aniKey === 'mc_circle3') {
                    console.log(aniKey, ' : koInfo.progress', koInfo.progress);
                    console.log(aniKey, ' : nMil', nMil);
                    console.log(koInfo.aniId);
                } */
            }

            /*
            if (koInfo.isReverse) {
                knTimeFraction = 1 - koInfo.progress;
                knSeekTime = knTimeFraction * koInfo.duration;
                koInfo.progress = koInfo.timing(knTimeFraction);
                // 인덱스 이동시 강제로 linear로 맞춰서 변형
                if (bIsIndex) {
                    koInfo.progress = timings.easingFn.linear(knTimeFraction);
                }
            }
            */


            if (bIsRunCallBack && koInfo.callbackEnabled && koInfo.drawCallback && koInfo.drawCallback(koInfo.progress, knTimeFraction, koInfo) == false) {
               //console.log('>> seek end');
            }
            //koInfo.state = 'pause';
            koInfo.pTime = knSeekTime;
        },
        seekIndex: function (aniKey, nIndex) {
            var self = this;
            var koInfo = self.getInfo(aniKey);
            if (!koInfo) return;
            cancelAnimationFrame(koInfo.aniId);
        },
        reset: function (aniKey, resetCallback) {
            var self = this;
            var koInfo = self.getInfo(aniKey);
            if (!koInfo) return;
            cancelAnimationFrame(koInfo.aniId);

            var knTimeFraction = 0;

            self.setLoop(aniKey, 1);
            self.stop(aniKey);
            resetCallback && resetCallback(koInfo);
        },
        remove: function (aniKey) {
            var self = this;
            var koInfo = self.getInfo(aniKey);

            self.removeInfo(aniKey);
        },
        draw: function (oInfo, timeFraction) {
            oInfo.callbackEnabled && oInfo.drawCallback && oInfo.drawCallback(oInfo.progress, timeFraction, oInfo);
        },
        //---------------------------------------------------
        //
        //
        //
        //---------------------------------------------------
        allStart: function () {
            var self = this;
            var koInfo;
            for (var ksAniKey in self.aniKeys) {
                self.play(ksAniKey);
            }
        },
        allPause: function () {
            var self = this;
            for (var ksAniKey in self.aniKeys) {
                self.pause(ksAniKey);
            }
        },
        allStop: function () {
            var self = this;
            for (var ksAniKey in self.aniKeys) {
                self.stop(ksAniKey);
            }
        },
        allReset: function () {
            var self = this;
            for (var ksAniKey in self.aniKeys) {
                self.reset(ksAniKey);
            }
        },
        //---------------------------------------------------
        //
        //
        //
        //---------------------------------------------------
        onFrame: function (timeStamp, aniKey) {
            var self = this;
            var koInfo = self.getInfo(aniKey);

            // remove로 제거되었거나, 혹은 원래 없음
            if (!koInfo) {
                return false;
            }
            var knTimeElapsed = new Date().getTime() - koInfo.start;
            var knTimeFraction = Math.min((knTimeElapsed / koInfo.duration), 1);

            koInfo.progress = koInfo.timing(knTimeFraction);

            if (koInfo.state === 'stop_end') {
                koInfo.start = new Date().getTime();
                koInfo.progress = 1;
                self.draw(koInfo, knTimeFraction);
                return false;
            } else if (koInfo.state === 'stop') {
                koInfo.start = 0;
                koInfo.progress = 0;
                self.draw(koInfo, knTimeFraction);
                return false;
            } else if (koInfo.state === 'pause') {
                koInfo.pTime = new Date().getTime();
                self.draw(koInfo, knTimeFraction);
                return false;
            } else {
                if (koInfo.callbackEnabled && koInfo.drawCallback && koInfo.drawCallback(koInfo.progress, knTimeFraction, koInfo) == false) {
                    //self.stop(aniKey);
                }
            }

            if (knTimeFraction < 1) {
                if (koInfo.continueAnimating) {
                    koInfo.aniId = requestAnimationFrame(function (timeStamp) {
                        self.onFrame(timeStamp, aniKey);
                    });
                }
            // 끝 도달
            } else {
                koInfo.start = new Date().getTime();    // 처음부터 다시시작하기 위해 값 초기화
                koInfo.loopCnt++;

                // 무한 반복
                if (koInfo.maxLoopCnt === -1) {
                    if (koInfo.continueAnimating) {
                        koInfo.aniId = requestAnimationFrame(function (timeStamp) {
                            self.onFrame(timeStamp, aniKey);
                        });
                    }
                } else {
                    if (koInfo.loopCnt >= koInfo.maxLoopCnt) {
                        koInfo.continueAnimating = false;
                        if (koInfo.isStopGoFirst) {
                            self.stop(aniKey, false);
                        } else {
                            koInfo.state = 'stop_end';
                            self.draw(koInfo, knTimeFraction);
                        }
                        return false;
                    } else {
                        if (koInfo.continueAnimating) {
                            koInfo.aniId = requestAnimationFrame(function (timeStamp) {
                                self.onFrame(timeStamp, aniKey);
                            });
                        }
                    }
                }
            }
        },
        get timeNow(){
            return new Date().getTime();
        },
        get test() {
            return this.testVal;
        },
        set test(msg){
            this.testVal = msg;
        }
    };

    timings.init();

    // node.js 분기 처리
    if(typeof module != typeof undefined && typeof module.exports != typeof undefined) {
        module.exports = timings;
    } else {
        window.timings = timings;
    }

    /*
    module.exports = {
        ClassA: ClassA,
        ClassB: ClassB
    };

    [use]
    var dm = require("...");
    var myClassA = new dm.ClassA();
    var myClassB = new dm.ClassB();
    */

})();

/*
// v1 - class
var animate = function (duration, timing, draw) {
    var self = this;

    this.duration = duration;
    this.timing = timing;
    this.draw = draw;

    this.start = 0;
    this.pTime = 0;
    this.aniId = 0;
    this.continueAnimating = true;

    this.loopCnt = 0;
    this.maxLoopCnt = 2;

    this.state = 'stop'; // play
    this.progress = 0;
    this.isPaused = false;

    this.play = function () {
        if (this.state == 'stop_end' || this.state == 'stop') {
            this.start = new Date().getTime();
        }

        //if (this.state == 'pause') {
        //    self.pTime = new Date() - self.start;
        //}
        if (this.state == 'pause') {
            console.log('이전상태가 pause');
            this.start = new Date().getTime() - this.pTime; // 이전에 일시정지였으면, 현재시간 - (일시정지되었을 시간 - 이전 시작시간)을 계산한것을 시작시간으로
            //console.log(this.start);
        }
        this.loopCnt = 0;
        this.continueAnimating = true;
        this.state = 'play';
        this.aniId = requestAnimationFrame(this.onLoop);
    };

    this.pause = function () {
        this.state = 'pause';
        this.isPaused = true;

        this.pTime = new Date().getTime() - this.start; // 일시정지됐을 시간 - 시작시간 차이계산(ms)
        //console.log(this.pTime);

        cancelAnimationFrame(this.aniId);
    };

    this.stop = function (END) {
        if (END) {
            this.state = 'stop_end';
        } else {
            this.state = 'stop';
        }
    };

    this.seek = function (goTime) {
        this.state = 'pause';
        this.isPaused = true;
        cancelAnimationFrame(this.aniId);

        goTime = goTime || 0;

        var seekTime = goTime;
        var timeFraction = (seekTime) / self.duration;
        if (timeFraction > 1) {
            timeFraction = 1;
        }

        this.progress = this.timing(timeFraction);

        if (this.draw && this.draw(this.progress, timeFraction) == false) {
            console.log('>>>>end!');
        }

        this.pTime = seekTime;
    };

    this.onLoop = function (timeStamp) {
        //if (!self.start) {
        //   self.start = timeStamp;
        //}

        var timeElapsed = (new Date().getTime() - self.start);
        var timeFraction = (timeElapsed) / self.duration;
        if (timeFraction > 1) {
            timeFraction = 1;
        }

        self.progress = self.timing(timeFraction);

        if (self.state == 'stop_end') {
            self.start = new Date().getTime();
            self.progress = 1;
            self.draw(self.progress, timeFraction);
            return false;
        } else if (self.state == 'stop') {
            self.start = 0;
            self.progress = 0;
            self.draw(self.progress, timeFraction);
            return false;
        } else if (self.state == 'pause') {
            self.pTime = new Date().getTime();
            console.log(self.pTime);
            self.draw(self.progress, timeFraction);
            return false;
        } else {
            self.draw && self.draw(self.progress, timeFraction);
        }


        if (timeFraction < 1) {
            if (self.continueAnimating) {
                self.aniId = requestAnimationFrame(self.onLoop);
            }
        // 끝 도달
        } else {

            self.start = new Date().getTime(); // 처음부터 다시시작하기 위해 값 초기화

            self.loopCnt++;

            // 무한 반복
            if (self.maxLoopCnt == -1) {
                if (self.continueAnimating) {
                    self.aniId = requestAnimationFrame(self.onLoop);
                }
            } else {
                if (self.loopCnt >= self.maxLoopCnt) {
                    self.continueAnimating = false;
                    self.state = 'stop_end';
                    return false;
                } else {
                    if (self.continueAnimating) {
                        self.aniId = requestAnimationFrame(self.onLoop);
                    }
                }
            }
        }
    };
}; */