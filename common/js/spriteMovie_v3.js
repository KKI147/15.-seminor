/**
 * @file spriteMovie.js
 * @author leer83@naver.com
 * @since 2020.05.28
 * @brief timings_class를 이용한 background-image로 적용된 sprite sheet image movie(=flash MovieClip Animation)을 처리
 * @modified
 * 2020-05-28 10:07:00 정리
 * 2021-01-22 18:28:25 canvas의 drawImage를 활용하여 개선. 클릭은 안되므로, svg hit영역 생성으로 해야할듯.
 * 2021-03-24 10:10:43 show, hide클래스 부여
 * 참고) D:\jgy\@My\90_My\00_b_요소들\00_hitTest고찰
 * pc에서는 canvas를 사용하는것이 더 부드럽다.
 * mobile에서는 background-image를 사용하는 것이 더 부드럽다.
 * (https://stackoverflow.com/questions/59056888/html5-canvas-large-sprite-sheet-image-animation-performance-optimization)
 * mobile에서 이미지가 너무 커서 그래픽카드 메모리에 저장할 수 없어서...
[use]
// 초기화
_oSSM_canvas_dice_a = new SpriteSheetMovie('#sprite_diceA', { col: 5, row: 6, width: 841, height: 477, total: 30 , src: 'images/sheet/sheet_dice_a_' + _num1 + '.png'}, { aniKey: '#sprite_diceA', duration: 800, easing: undefined, maxLoopCnt: 1 });
_oSSM_canvas_dice_a.init();


 * 2021-02-05 17:58:20 대상목록에서 특정요소만 보이도록 하는 기능 추가
[use]
    // 초기화
    var oSSM_test = new SpriteSheetMovie('.wrapSprite', {
        col: 33,
        row: 1,
        width: 220,
        height: 220,
        total: 33,
        list: $('.wrapSprite > img')
    }, {
        aniKey: '.wrapSprite',
        duration: 1300,
        easing: undefined,
        maxLoopCnt: 1
    });
    oSSM_test.init();
    // 재생
    oSSM_test.start();
    // 정지
    oSSM_test.stop();
    oSSM_test.seek(-1, true);
 */
/*
sprite sheet image의 preloader image가 있어야 한다.
ex)
<div class="preload">
    <img src= "~"> * 100 이라면...
</div>

css )
.preload {
    left: 0px;
    top: 0px;
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0.01;
    pointer-events: none;
}

.preload>img {
    position: absolute;
    width: 100%;
    height: auto;
}
*/


/**
 * Sprite Sheet Animation생성용 객체
 * @param {String} psContainer sprite sheet animation타겟 선택자
 * @param {Object} poSheetInfo sprite sheet image정보
 * {
 *  col: sprite sheet 가로 이미지 개수
 *  row: sprite sheet 세로 이미지 개수
 *  width: sprite sheet 내부 각 이미지의 가로너비
 *  height: sprite sheet 내부 각 이미지의 세로너비
 *  total: sprite sheet 내부 이미지의 총 개수
 *  src: [option] canvas.ctx.drawImage를 활용하는 동작인지 여부
 * }
 * @param {Object} poTimingsInfo timings 생성 값
 * {
 *  aniKey: animation 고유명,
 *  duration: 1번 재생하는데걸리는 총 소요시간,
 *  easing: easing timing 메서드(ex. timings.easingFn.linear),
 *  maxLoopCnt: 최대 반복 회수(-1 : 무한반복):
 *  draw: timings에서 매 timing마다 실행할 콜백 함수
 * @use
 * var oSSM = new SpriteSheetMovie('#mc_nextBtn', { col: 10, row: 1, width: 239, height: 39, total: 10 }, { aniKey: 'mc_nextBtn', duration: 200, easing: undefined, maxLoopCnt: 1 }); oSSM.init(); oSSM.start();
 * var oSSM = new SpriteSheetMovie('#mc_nextBtn', { col: 10, row: 1, width: 239, height: 39, total: 10, src: '경로' }, { aniKey: 'mc_nextBtn', duration: 200, easing: undefined, maxLoopCnt: 1 }); oSSM.init(); oSSM.start();
 */

function SpriteSheetMovie(psContainer, poSheetInfo, poTimingsInfo) {

    var self = this;

    var sheetInfo = poSheetInfo;
    var _timingsInfo = poTimingsInfo;
    var totalImg = poSheetInfo.total;

    var containerName = psContainer;    // <div> 또는 <canvas>
    var container = null;

    var col = 0;
    var row = 0;
    var width = 0;
    var height = 0;

    var bIsInit = false;

    var startIndex = 0;
    var endIndex = -1;
    var nowIndex = -1;

    var eImg;
    var oCtx;
    var bIsCanvasDraw = false;          // false: backgImage위치 변경, true: canvas drawImage

    var oList;                          // 어떠한 특정 순서 집합이 있을 경우
    var bIsList = false;


    //---------------------------------------------------
    //
    //---------------------------------------------------
    this.getReverse = function () {
        return timings.getInfo(_timingsInfo.aniKey).isReverse;
    };
    this.setReverse = function (pbIsReverse) {
        timings.setReverse(_timingsInfo.aniKey, pbIsReverse);
    };

    this.getCallbackEnabled = function () {
        return timings.getCallbackEnabled(_timingsInfo.aniKey);
    };
    this.setCallbackEnabled = function (pbIsEnabled) {
        timings.setCallbackEnabled(_timingsInfo.aniKey, pbIsEnabled);
    };

    this.aniKey = function () {
        return _timingsInfo.aniKey;
    };
    this.timingsInfo = function () {
        return _timingsInfo;
    };
    this.getMode = function () {
        return timings.getInfo(self.aniKey()).state;
    };
    //---------------------------------------------------
    //
    //---------------------------------------------------
    this.init = function () {
        if (timings.hasInfo(poTimingsInfo.aniKey)) {
            console.log('[error]: ', '"' + poTimingsInfo.aniKey + '"', 'is conflict aniKey !!!');
            return;
        }
        /*
        if (psContainer instanceof jQuery) {
            this.container = psContainer;
        } else {
            this.container = $(psContainer);
        }
        */

        container = $(psContainer).eq(0);
        containerName = psContainer;

        if (container.length < 1) {
            console.log('[error] container is nothing');
            return false;
        }

        col = poSheetInfo.col;
        row = poSheetInfo.row;
        width = poSheetInfo.width;
        height = poSheetInfo.height;

        var drawCallback = function (timingProgress, timeFraction, timingInfo) {
            //koInfo.drawCallback(arguments);
            //koInfo.drawCallback(timingProgress, timeFraction, timingInfo);

            var knTimingProgress = timingProgress;
            var knTimeFraction = timeFraction;

            if (timings.getInfo(_timingsInfo.aniKey).isReverse == false) {
            } else {
                knTimingProgress = 1 - timingProgress;
                knTimeFraction = 1 - timeFraction;
            }

            var knIdx;
            /* if (parseInt(self.totalImg * knTimingProgress) > self.totalImg - 1) {
                knIdx = (self.totalImg) - (parseInt(self.totalImg * knTimingProgress));
            } else {
                knIdx = Math.min(self.totalImg - 1, parseInt(self.totalImg * knTimingProgress));
            } */
            knIdx = Math.min(totalImg - 1, parseInt(totalImg * knTimingProgress));// 인덱스 기준

            knIdx += startIndex;

            if (knIdx !== nowIndex) {
                nowIndex = knIdx;
                self.drawImage(nowIndex);
            }

            self.getCallbackEnabled() && _timingsInfo.draw && _timingsInfo.draw(timingProgress, timeFraction, timingInfo);
        };

        var koInfo = _timingsInfo;
        timings.animate(koInfo.aniKey, koInfo.duration, koInfo.easing, koInfo.maxLoopCnt, koInfo.isStopGoFirst, drawCallback);

        // image load
        if (typeof poSheetInfo.src !== typeof undefined && container.prop('tagName').toLowerCase() === 'canvas') {
            oCtx = container[0].getContext('2d');
            bIsCanvasDraw = true;
            eImg = new Image();
            eImg.addEventListener('load', function () {
                self.drawImage(0);
                bIsInit = true;
            });
            eImg.src = poSheetInfo.src;
        // list형태로 받음
        } else if (typeof poSheetInfo.list !== typeof undefined) {
            oList = poSheetInfo.list;

            if (oList.length > 0) {
                // Array
                if (Array.isArray(oList) === true) {
                    oList.forEach(function (value, index) {
                        value.removeClass('show');
                        if (index === 0) {
                            value.addClass('show');
                            return;
                        }
                        value.addClass('hide');
                    });
                // jQuery List
                } else {
                    oList.removeClass('show');
                    oList.eq(0).addClass('show');
                    oList.not(oList.eq(0)).addClass('hide');
                }
            }

            bIsList = true;
            bIsInit = true;
        } else {
            bIsInit = true;
        }
    };
    this.drawImage = function (pnIdx) {
        /*
        if (self.timingsInfo.aniKey.indexOf('_mc_circle') > -1) {
            console.log(knIdx);
        }
        */

        var knCol = col,
            knRow = row;
        var knWidth = width,
            knHeight = height;
        var knStartLeft = 0,
            knStartTop = 0;
        var knDiffLeft = knWidth,
            knDiffTop = knHeight;

        var knColIdx = (pnIdx % knCol);
        var knRowIdx = Math.floor(pnIdx / knCol);

        var knLeft = (knColIdx * knDiffLeft) + knStartLeft;
        var knTop = (knRowIdx * knDiffTop) + knStartTop;

        if (bIsCanvasDraw === true) {
            oCtx.clearRect(0, 0, knWidth, knHeight);
            oCtx.drawImage(
                eImg,
                knLeft,
                knTop,
                knWidth,
                knHeight,
                0,
                0,
                knWidth,
                knHeight
            );
        } else if (bIsList === true) {
            if (oList.length > 0) {
                // Array
                if (Array.isArray(oList) === true) {
                    // 정지!
                    if (pnIdx <= -1) {
                        oList.forEach(function (item, index) {
                            value.removeClass('show');
                            if (index === 0) {
                                value.addClass('show');
                                return;
                            }
                            value.addClass('hide');
                        });
                        return false;
                    }

                    if (pnIdx > 0) {
                        oList.forEach(function (item, index) {
                            if (index === pnIdx) {
                                item.removeClass('hide').addClass('show');
                                return;
                            }
                            item.removeClass('show').addClass('hide');
                        });
                        /* oList[pnIdx].removeClass('hide').addClass('show');
                        oList[pnIdx - 1].removeClass('show').addClass('hide'); */
                    }
                // jQuery List
                } else {
                    // 정지!
                    if (pnIdx <= -1) {
                        oList.removeClass('show');
                        oList.eq(0).addClass('show');
                        oList.not(oList.eq(0)).addClass('hide');
                        return false;
                    }
                    oList.eq(pnIdx).removeClass('hide').addClass('show');
                    if (pnIdx > 0) {
                        oList.not(oList.eq(pnIdx)).removeClass('show').addClass('hide');
                        //oList.eq(pnIdx - 1).removeClass('show').addClass('hide');
                    }
                    /*
                    container.find('img').eq(pnIdx).css({ 'left': 0 }).show();
                    //container.find('img').not(':eq(' + pnIdx + ')').hide().css({ 'left': -10000 });
                    container.find('img').eq(pnIdx).prevAll().css({ 'left': -10000 }).hide();
                    */
                }
            }
        } else {
            container.css('backgroundPosition', '-' + knLeft + 'px -' + knTop + 'px');
        }

        //container.css('backgroundPosition', '-' + knLeft + 'px -' + knTop + 'px');
        //console.log(timingInfo.aniKey);
        /*
        if (timingInfo.aniKey === 'mc_circle2') {
            console.log(knLeft, ' / ' ,  knTop);
        }
        */
    };

    this.destroy = function () {
        this.stop();    // 반드시 this가 있어야함! 없으면 focus가 window로 간다.
        timings.remove(_timingsInfo.aniKey);
    };
    //---------------------------------------------------
    //
    //---------------------------------------------------
    this.start = function () {
        if (bIsCanvasDraw === true && bIsInit === false) {
            return false;
        }
        if (!bIsInit) {
            init();
        }
        timings.play(_timingsInfo.aniKey);
    };
    this.stop = function (bIsEnd) {
        if (bIsCanvasDraw === true && bIsInit === false) {
            return false;
        }
        if (!bIsInit) {
            init();
        }
        timings.stop(_timingsInfo.aniKey, bIsEnd);
    };
    this.seek = function (nMil, bIsIndex, bIsRunCallback) {
        var knMil;
        if (bIsIndex === true) {
            var knIdx = nMil;
            knMil = (knIdx - 1) * (_timingsInfo.duration / totalImg);
        } else {
            knMil = nMil;
        }
        timings.seek(_timingsInfo.aniKey, knMil, bIsIndex, bIsRunCallback);
    };
    this.pause = function () {
        timings.pause(_timingsInfo.aniKey);
    };
}