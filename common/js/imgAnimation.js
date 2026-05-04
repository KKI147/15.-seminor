// 2021-04-02 18:22:59 - JGY
// Animation 관리자
var dicImgAni = {
    'ready': false,
    'nChkLoadedId': -1,
    'init': function () {
        if ($('#imgAniPreload').length === 0) {
            $('#wrap').prepend('<div id="imgAniPreload"></div>');
            $('#imgAniPreload').css({
                'width': '100%',
                'height': '100%',
                'position': 'absolute',
                'z-index': -999,
                'opacity': 0.01,
                'pointer-events': 'none'
            });
        }
    },
    // 로드 체크
    'start': function (pfCallback) {
        var self = this;
        self.nChkLoadedId = setInterval(function () {
            var kbLoadCompleteAll = true;
            for (var key in self) {
                if (typeof self[key] === 'object' && self[key].loadComplete === false) {
                    kbLoadCompleteAll = false;
                    break;
                }
            }
            if (kbLoadCompleteAll === true) {
                clearInterval(self.nChkLoadedId);
                self.ready = true;
                $('#imgAniPreload').remove(); // 로더 지우기
                if (pfCallback) {
                    console.log('+++ imgAnimation ready');
                    pfCallback();
                }
            }
        }, 100);
    },
    'stopImgAni': function (psKey) {
        if (this.ready === false) {
            console.log('Image 준비중..', psKey , '(⊙_⊙;)');
            return false;
        }
        if (psKey in this) {
            this[psKey].movie.stop();
            this[psKey].movie.seek(-1, true);
        }
    },
    'startImgAni': function (psKey) {
        if (this.ready === false) {
            console.log('Image 준비중..', psKey , '(⊙_⊙;)');
            return false;
        }
        if (psKey in this) {
            if (this[psKey].getMode() === 'stop_end') {
                this[psKey].movie.seek(-1, true);
            }
            if (this[psKey].getMode() === 'stop' || this[psKey].getMode() === 'stop_end') {
                this[psKey].movie.start();
            }
        }
    }
};
// 2021-03-24 11:24:16
// JGY
// Sprite png animation
/*
@use
// 대상선택자, 유일한 애니메이션이름 식별자, 애니메이션 png의 총개수, 총 재생시간
imgAni1 = new ImgAnimation('.wrapAni', 'ani1', 33, 1300);
imgAni1.init();
*/
var ImgAnimation = function ImgAnimation(psSelector, psAniKey, pnTotal, pnDuration, pbLoop, pfCallback) {
    var self = this;

    var jTarget = $(psSelector).eq(0);

    this.movie = undefined;
    this.loadComplete = false;

    this.init = function () {
        // img 1개 빼고 강제 삭제
        if (jTarget.children('img').length > 1) {
            jTarget.children('img').not(':first').remove();
        }
        // loader생성
        if (jTarget.find('.wrapLoad').length === 0) {
            jTarget.append('<div class="wrapLoad"></div>');
        }
        // load
        var ksImgSrc = jTarget.children().first().attr('src');  // inc/images/test_animation/3-rv1_result_bee_00000.png
        var kaImgSrc = ksImgSrc.split('/'); // inc, images, test_animation, 3-rv1_result_bee_00000.png
        var ksImgName = kaImgSrc.pop();     // 3-rv1_result_bee_00000.png
        var ksImgPath = kaImgSrc.join('/'); // inc/images/test_animation

        var ksImgHead = ksImgName.split('.')[0].slice(0, -5);   // 3-rv1_result_bee_
        var ksExtension = ksImgName.split('.')[1];
        var ksHtml;
        var keImg;
        var knCntLoaded = 0;
        var ksLoadPath;
        for (var i = 1; i < pnTotal; ++i){
            // #imgAniPreload 에 넣기
            ksLoadPath = ksImgPath + '/' + ksImgHead + digit(i, 5) + '.' + ksExtension;
            $('#imgAniPreload').append('<div style="width: 100%; height: 100%; position:absolute; background-image: url(' + ksLoadPath + ');"></div>');

            // img도 로드
            ksHtml = '<img src="' + ksLoadPath + '" class="loading" alt="" />';
            jTarget.find('.wrapLoad').append(ksHtml);
            keImg = jTarget.find('.wrapLoad').find('img').last()[0];
            keImg.onload = keImg.onerror = keImg.onabort = function () {
                knCntLoaded++;
                if (knCntLoaded === pnTotal - 1) {
                    // 이미지 옮기기
                    jTarget.find('.wrapLoad > img').insertBefore(jTarget.find('.wrapLoad'));
                    jTarget.find('img').removeClass('loading');
                    jTarget.find('.wrapLoad').remove();
                    createSSM();
                    self.loadComplete = true;
                }
            };
        }
    };

    this.getMode = function () {
        //var ksState = timings.getInfo(self.movie.aniKey()).state;
        var ksState = self.movie.getMode();
        return ksState;
    };

    this.getTarget = function () {
        return jTarget;
    };

    var createSSM = function () {
        //console.log([].slice.apply(jTarget.find('img')));
        self.movie = new SpriteSheetMovie(psSelector, {
            col: pnTotal,
            row: 1,
            width: jTarget.css('width'),
            height: jTarget.css('height'),
            total: pnTotal,
            list: jTarget.find('img')
        }, {
            aniKey: psAniKey,
            duration: pnDuration,
            easing: undefined,
            maxLoopCnt: pbLoop ? -1 : 1,
            draw: (pfCallback) ? pfCallback.bind(jTarget[0]) : undefined
        });
        self.movie.init();
    };

    // 숫자를 자릿수 만큼 0으로 채워서 문자열 리턴
    function digit(pn, pnWidth) {
        if (isNaN(pnWidth) || !pnWidth) {
            pnWidth = 2;
        }
        pn = pn + '';
        return (pn.length >= pnWidth) ? pn : new Array(pnWidth - pn.length + 1).join('0') + pn;
    }
};