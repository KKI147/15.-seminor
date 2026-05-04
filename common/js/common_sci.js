/* ───────────────────────────────────────────────────────┐
 * file name : common_sci.js
 * description : 22개정 3,4학년 과학용 코드 모음
 * create date : 2024-07-25 14:14:03
 * creator : JGY
 * modify: 2024-08-21 14:23:38 - 3,4학년 동일 사용
 * usage:
└────────────────────────────────────────────────────── */

/* ──────────────────────────────────────────────────────
* introContents
/* ────────────────────────────────────────────────────── */

/**
 * 캐릭터가 까딱이다가 화면전환(기능 삭제됨)
 * @param {*} wrap
 * @param {*} data
 */
/*
[use]
const introCon = new introContents(_page);
introCon.init();
introCon.onComplete = function () {
    console.log('onComplete');
};
*/

const introContents = function introContents(wrap, data) {
    let self = this;
    this.wrap = wrap;
    this.root = undefined;

    // let value = data.value || 0;

    const defaults = {
        value: 0,
    };
    data = $.extend(true, {}, defaults, data);

    this.elements = {
    };

    const timeoutId = {
        next: -1,
    };

    const intervalId = {};

    this.introConWrap = undefined;
    this.introImg = undefined;
    this.introChar = undefined;

    this.onComplete = undefined;

    this.init = function () {
        self.makeUI();

        self.reset();
        addEvent();


        self.next();
    };

    this.makeUI = function () {
        self.wrap.empty();
        let html = `
            <div class="introContent">
                <div class="scene scene2">
                    <div class="bg"></div>
                    <div class="target"></div>
                </div>
                <div class="scene scene1">
                    <div class="bg"></div>
                    <div class="introImg"></div>
                    <div class="introChar"></div>
                </div>
            </div>
        `;
        self.wrap.append(html);
        /* self.wrap.find('.listWrap li').remove();

        self.elements.menuWrap = self.wrap.find('.menuWrap'); */

        self.introConWrap = self.wrap.find('.introContent');
        self.introImg = self.wrap.find('.introImg');
        self.introChar = self.wrap.find('.introChar');
        self.introImg.off().on(sTransitionEnd, function () {
            self.introImg.off(sTransitionEnd);
            if (typeof (self.onComplete) !== 'undefined') {
                self.onComplete();
            }
        });
    };

    this.reset = function () {
        for (let prop in timeoutId) {
            clearTimeout(timeoutId[prop]);
        }
        for (let prop in intervalId) {
            clearTimeout(intervalId[prop]);
        }
    };

    const addEvent = function () {
    };

    const getPos = function () {
        getScale();
        const factor = FORTEACHERCD.responsive.baseContainerSize.zoom;
        // .target의 위치값 읽기
        const target = self.wrap.find('.target');
        // console.log(target);

        let introImgX = (self.introImg.offset().left - wrapTop.offset().left) / factor;
        let introImgY = (self.introImg.offset().top - wrapTop.offset().top) / factor;

        let targetX = (target.offset().left - wrapTop.offset().left) / factor;
        let targetY = (target.offset().top - wrapTop.offset().top) / factor;
        /* let targetCX = (target.offset().left - wrapTop.offset().left) / factor + (pxToInt(target.css('width')) / 2);
        let targetCY = (target.offset().top - wrapTop.offset().top) / factor + (pxToInt(target.css('height')) / 2); */

        targetX = parseInt(targetX, 10);
        targetY = parseInt(targetY, 10);

        self.introImg.css({
            '--sx': `${introImgX}px`,
            '--sy': `${introImgY}px`,
            '--ex': `${targetX}px`,
            '--ey': `${targetY}px`,
        });
    };

    this.next = function () {
        timeoutId.next = setTimeout(function () {
            clearTimeout(timeoutId.run);
            self.introConWrap.addClass('next');
            getPos();
        }, 500);
    };
};



/* ──────────────────────────────────────────────────────
* introContents2
/* ────────────────────────────────────────────────────── */
/**
 * 캐릭터가 까딱임
 * @param {*} wrap
 * @param {*} data
 */
const introContents2 = function introContents2(wrap, data) {
    let self = this;
    this.wrap = wrap;
    this.root = undefined;

    // let value = data.value || 0;

    const defaults = {
        total: 1,
    };
    data = $.extend(true, {}, defaults, data);

    this.elements = {
    };

    const timeoutId = {};

    const intervalId = {};

    this.conWrap = undefined;
    this.chars = undefined;
    this.msgs = undefined;

    this.onComplete = undefined;

    // imagePreload
    (function () {
        const url = `${COMM_IMG_SCI_PATH}intro/`;
        imgPreLoad([
            `${url}char_bg1.png`,
            `${url}char_bg2.png`,
            `${url}char_msg1.png`,
            `${url}char_msg2.png`,
        ], true);
    })();

    this.init = function () {
        self.makeUI();

        self.reset();
        addEvent();

        self.chars.addClass('on');
        self.chars.find('.bg').addClass('sharpen');
        self.chars.find('.msg').addClass('sharpen_blur');
    };

    this.makeUI = function () {
        if (self.wrap.find('.introContent2').length > 0) {
            self.wrap.find('.introContent2').empty();
        }

        self.wrap.empty();
        let html = `
            <div class="introContent2">
                <div class="charWrap">
                    <div class="char char1">
                    </div>
                    <div class="char char2">
                    </div>
                </div>
            </div>
        `;
        self.wrap.append(html);
        /* self.wrap.find('.listWrap li').remove();

        self.elements.menuWrap = self.wrap.find('.menuWrap'); */

        self.conWrap = self.wrap.find('.introContent2');

        html = ``;
        for (let i = 0; i < data.total; ++i) {
            html += `
                <div class="char char${i + 1}">
                    <div class="msg"></div>
                    <div class="shadow"></div>
                    <div class="bg"></div>
                </div>
                `;
        }
        self.conWrap.html(html);

        self.chars = self.conWrap.find('.char');
        self.msgs = self.conWrap.find('.msg');
    };

    this.reset = function () {
        for (let prop in timeoutId) {
            clearTimeout(timeoutId[prop]);
        }
        for (let prop in intervalId) {
            clearTimeout(intervalId[prop]);
        }
    };

    const addEvent = function () {
    };
};

/* ──────────────────────────────────────────────────────
* aniContentsSci(캐릭터 음원)
/* ────────────────────────────────────────────────────── */
/**
 * 캐릭터 음원 컨텐츠(과학)
 *  - 음원없이 gif 만으로 동작 가능
 *  - 재생,정지버튼 추가
 *  - 재생완료후, 정지상태로 유지
 *
 * @param {*} wrap aniContentsSci2 가 생성될 요소
 * @param {Array} set ado, img 생성 정보값
 * @param {String} adoPath 오디오 파일 경로
 * @param {String} imgPath 이미지 파일 경로
 * @param {String} type aniItem의 이미지 타입('gif')
 * @param {number} duration 총 시간
 * @param {boolean} bStopOther 다른 음성요소 정지 시킬지 여부
 */
const aniContentsSci = function aniContentsSci(wrap, set, adoPath, imgPath, type, duration, bStopOther) {
    var self = this;
    this.wrap = wrap;
    this.set = set;

    this.type = type.toLowerCase();

    this.bStopOther = (bStopOther === false) ? false : true;

    this.adoItems = self.set.ado;
    this.imgItems = self.set.img;

    this.itemwrap = '';                         // .aniWrap
    this.items = '';                            // .aniWrap .aniItem
    this.playBtn = undefined;                   // .aniWrap .aniItem .play
    this.stopBtn = undefined;

    this.soundBtn = '';                         // .aniWrap .soundBtn (모두듣기|다시하기)

    this.cnt = 0;
    this.allChk = false;

    this.onClick = undefined;
    this.onEnded = undefined;
    this.onPlayAll = undefined;
    this.onReset = undefined;

    this.isAdoGif = true; // audio + gif 모드인지 여부 확인

    const timeoutId = {
    };


    this.duration = duration;

    this.init = function () {
        if (self.wrap.find('.aniWrap').length > 0) {
            self.wrap.find('.aniWrap').remove();
        }

        if (typeof (self.adoItems) === 'undefined') {
            self.isAdoGif = false;
        }

        self.cnt = 0;
        self.allChk = false;

        self.makeWrap();
        self.makeItem();
        self.makeBtn();

        self.addEventItem();
        self.addEventBtn();
    };

    this.clearTimeoutAll = function () {
        // console.log(timeoutId);
        for (let prop in timeoutId) {
            clearTimeout(timeoutId[prop]);
        }
    };

    this.makeWrap = function () {
        var html = '<div class="aniWrap"></div>';
        self.wrap.append(html);
        self.itemwrap = self.wrap.find('.aniWrap');
    };

    this.makeItem = function () {
        var html = '';

        // audio + gif
        var i;
        if (self.isAdoGif) {
            for (i = 0; i < self.adoItems.length; i++) {
                html += `<div class="aniItem aniItem${i + 1}" data-idx="${i}" data-ado="${self.adoItems[i]}"></div>`;
            }
        }
        // gif
        else {
            for (i = 0; i < self.imgItems.length; i++) {
                html += `<div class="aniItem aniItem${i + 1}" data-idx="${i}"></div>`;
            }
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
                <div class="btnWrap">
                    <div class="btn play">재생</div>
                    <div class="btn stop">정지</div>
                </div>
            `);
        }

        if (self.type ===  'gif') {
            for (let k = 0; k < self.items.length; k++) {
                self.items.eq(k).append(`
                    <div class="motionWrap">
                        <div class="cover"></div>
                        <img class="motion" src="`+ imgPath + self.imgItems[k] + `.gif" title="" alt="">
                    </div>
                `);
            }
        }

        for (let i = 0; i < self.items.length; ++i) {
            timeoutId[`aniItem${i + 1}`] = -1;
        }
    };

    this.makeBtn = function () {
        self.itemwrap.append('<div class="soundBtn"></div>');
        self.soundBtn = self.itemwrap.find('.soundBtn');
    };

    this.aniItemReset = function () {
        self.clearTimeoutAll();
        self.items.removeClass('ing on');
        self.items.each(function () {
            $(this).find('.play').show();
            $(this).find('.stop').hide();
        });
        if (self.type) {
            self.stopMotion(self.items);
        }
    };

    this.addEventItem = function () {
        // 정지
        self.items.find('.stop').off().on('click', function (e) {
            e.stopPropagation();
            ado_stop();

            self.allChk = false;

            const $ts = $(this);
            const $aniItem = $ts.closest('.aniItem');
            const idx = Number($ts.attr('data-idx'));

            $aniItem.find('.stop').hide();
            $aniItem.find('.play').show();

            $aniItem.removeClass('ing on');

            // 개별 정지
            self.stopMotion($aniItem);
            // 모두 정지
            /* if (self.type) {
                self.stopMotion(self.items);
            } */

            self.items.length === self.itemwrap.find('.ing').length ? self.soundBtn.addClass('re') : self.soundBtn.removeClass('re');
        });

        // 재생
        self.items.find('.play').off().on('click', function (e) {
            e.stopPropagation();
            ado_stop();

            self.allChk = false;

            const $ts = $(this);
            const $aniItem = $ts.closest('.aniItem');
            const idx = Number($aniItem.attr('data-idx'));

            const ado = $aniItem.attr('data-ado');

            // 재생 → 정지
            if ($aniItem.hasClass('ing')) {
                $aniItem.removeClass('ing on');

                if (self.type) {
                    self.stopMotion(self.items);
                }
                self.items.find('.play').show();
                self.items.find('.stop').hide();
            }
            // 정지 → 재생
            else {
                // 모든 요소 정지
                self.aniItemReset();

                $aniItem.find('.play').hide();

                /* setTimeout(function () {

                }, 300); */

                $aniItem.addClass('ing on');

                // audio + gif
                if (self.isAdoGif) {
                    effectAdo(ado, self.bStopOther, adoPath);
                }
                // gif
                else {

                }

                if (self.type) {
                    self.playMotion($aniItem, true);
                }
            }

            // 모두 재생 | 다시하기 판별
            self.items.length === self.itemwrap.find('.ing').length ? self.soundBtn.addClass('re') : self.soundBtn.removeClass('re');

            // if (typeof (videoCon) != 'undefined') { videoCon.stop(); }

            if (typeof (self.duration) !== 'undefined') {
                timeoutId[`aniItem${idx + 1}`] = setTimeout(function () {
                    if (typeof (self.onEnded) !== 'undefined') { self.onEnded(false); }

                    // 재생완료 후 정지상태로 유지해야 하므로, 주석처리
                    /* $aniItem.removeClass('on');
                    self.stopMotion(self.items); */

                    $aniItem.find('.stop').show();
                }, self.duration);
            }
            else {
                $(`#${ado}`).off('ended').on('ended', function () {
                    if (typeof (self.onEnded) !== 'undefined') { self.onEnded(false); }

                    // 재생완료 후 정지상태로 유지해야 하므로, 주석처리
                    /* $aniItem.removeClass('on');
                    self.stopMotion(self.items); */

                    $aniItem.find('.stop').show();
                });
            }

            if (typeof (self.onClick) !== 'undefined') { self.onClick($(this)); }
        });
    };

    this.addEventBtn = function () {
        // 모두 듣기 | 다시하기
        self.soundBtn.off('click').on('click', function (e) {
            e.stopPropagation();
            ado_stop();

            // 모든 요소 정지
            self.aniItemReset();

            // 다시하기
            if ($(this).hasClass('re')) {
                $(this).removeClass('re');
                self.allChk = false;
                self.stopMotion(self.items);
                self.items.find('.play').show();
                self.items.find('.stop').hide();
                if (typeof (self.onReset) !== 'undefined') { self.onReset(); }
            }
            // 모두 듣기
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
            if (play === undefined) {
                self.cnt++;
            }
            const $aniItem = self.items.eq(self.cnt); // .aniItem
            const idx = Number($aniItem.attr('data-idx'));

            const ado = $aniItem.attr('data-ado');

            $aniItem.find('.play').hide();
            // self.items.removeClass('on');
            $aniItem.addClass('ing on');

            // audio + gif
            if (self.isAdoGif) {
                effectAdo(ado, self.bStopOther, adoPath);
            }
            // gif
            else {

            }

            if (self.type) {
                self.playMotion($aniItem, true);
            }

            if (typeof (self.duration) !== 'undefined') {
                timeoutId[`aniItem${idx + 1}`] = setTimeout(function () {
                    if (typeof (self.onEnded) !== 'undefined') { self.onEnded(false); }

                    // 재생완료 후 정지상태로 유지해야 하므로, 주석처리
                    /* $aniItem.removeClass('on');
                    self.stopMotion(self.items); */

                    $aniItem.find('.stop').show();

                    if (self.items.length - 1 > self.cnt) self.allSound();
                    $aniItem.find('.motionWrap').addClass('on'); // .cover가 보이지 않게 강제 처리
                }, self.duration);
            }
            else {
                $(`#${ado}`).off('ended').on('ended', function () {
                    if (typeof (self.onEnded) !== 'undefined') { self.onEnded(true); }

                    // 재생완료 후 정지상태로 유지해야 하므로, 주석처리
                    /*
                    $aniItem.removeClass('on');
                    self.stopMotion($aniItem);
                    */

                    $aniItem.find('.stop').show();
                    if (self.items.length - 1 > self.cnt) self.allSound();
                    $aniItem.find('.motionWrap').addClass('on'); // .cover가 보이지 않게 강제 처리
                });
            }
        }
    };
};

/* ──────────────────────────────────────────────────────
* slideBtnArrow
/* ────────────────────────────────────────────────────── */


/* ──────────────────────────────────────────────────────
* oxContents
/* ────────────────────────────────────────────────────── */

/**
 * [스스로 확인해요] - ox : 클릭하자마자 정오답판별
 * @param {*} wrap
 * @param {*} ans
 * @see {*} file:///Z:/WEP/타회사_2016_제안샘플/visang_gum/society/k/03/01/06/soc31_106_09.html
 */
const oxContents = function (wrap, data) {
    const self = this;
    this.wrap = wrap;
    this.root = undefined;

    // let value = data.value || 0;

    const defaults = {
        ans: 'o',
        tryOnce: true,    // true: 도전 한 번만 가능, false: 맞출때까지 도전 가능
    };
    data = $.extend(true, {}, defaults, data);

    this.elements = {
    };

    const timeoutId = {};

    const intervalId = {};

    this.displayLog = false;

    this.ans = data.ans;
    this.oxQuiz = undefined;
    this.oxBtns = undefined;
    this.ansBtn = undefined;

    this.onClick = undefined;       // ox선택
    this.onCorrect = undefined;     // ox선택 정답
    this.onWrong = undefined;       // ox선택 오답
    this.onComplete = undefined;    // 모두맞춤
    this.onShowAns = undefined;     // 정답 보기
    this.onReset = undefined;       // 다시 하기

    // imagePreload
    (function () {
        const url = `${COMM_IMG_SCI_PATH}quiz/surprise/`;
        imgPreLoad([
            `${url}ox_o.png`,
            `${url}ox_o_off.png`,
            `${url}ox_o_on.png`,
            `${url}ox_x.png`,
            `${url}ox_x_off.png`,
            `${url}ox_x_on.png`,
        ], true);
    })();

    this.init = function () {
        self.makeUI();

        self.reset();
        self.addEvent();
    };

    this.makeUI = function () {
        if (self.wrap.find('.oxQuiz').length > 0) {
            self.wrap.find('.oxQuiz').remove();
        }

        // oItem, xItem 각각이 정답인지 아닌지 여부
        const correctO = (self.ans === 'o') ? 'true' : 'false';
        const correctX = (self.ans === 'x') ? 'true' : 'false';

        let html = ``;
        html = `
            <div class="oxQuiz">
                <div class="oxWrap">
                    <div class="ox oItem" data-cor="${correctO}"></div>
                    <div class="ox xItem" data-cor="${correctX}"></div>
                </div>
                <div class="ansbtn"></div>
            </div>
        `;
        self.wrap.append(html);

        self.oxQuiz = self.wrap.find('.oxQuiz');
        self.oxBtns = self.oxQuiz.find('.ox');
        self.ansBtn = self.oxQuiz.find('.ansbtn');
    };

    this.reset = function () {
        for (let prop in timeoutId) {
            clearTimeout(timeoutId[prop]);
        }
        for (let prop in intervalId) {
            clearTimeout(intervalId[prop]);
        }

        self.oxBtns.removeClass('dis cor');
    };

    this.addEvent = function () {
        self.oxBtns.off('click').on('click', function () {
            const $ts = $(this);

            if ($ts.hasClass('dis') || $ts.hasClass('cor')) {
                return;
            }

            self.quizResult($ts);
        });

        self.ansBtn.off('click').on('click', function () {
            const $ts = $(this);

            // 다시 하기
            if ($ts.hasClass('re')) {
                effectAdo('click');
                $ts.removeClass('re');

                self.init();

                if (typeof (self.onReset) !== 'undefined') {
                    if (self.displayLog) console.log('oxContents - 다시 하기');
                    self.onReset();
                }
            }
            // 정답 보기
            else {
                // effectAdo('anschk_o');
                $ts.addClass('re');

                self.oxBtns.filter(`[data-cor="true"]`).addClass('cor');
                self.oxBtns.filter(`[data-cor="false"]`).addClass('dis');

                if (typeof (self.onShowAns) !== 'undefined') {
                    if (self.displayLog) console.log('oxContents - 정답 확인');
                    self.onShowAns();
                }
            }
        });
    };

    this.quizResult = function (oxBtn) {
        let ksUserSelect = oxBtn.hasClass('oItem') ? 'o' : 'x';
        let kbIsCorrect;

        if (typeof (self.onClick) !== 'undefined') {
            if (self.displayLog) console.log('oxContents - ox선택');
            self.onClick(ksUserSelect, oxBtn);
        }

        if (oxBtn.attr('data-cor') === 'true') {
            oxBtn.addClass('cor');
            oxBtn.siblings().addClass('dis');
            effectAdo('anschk_o');
            kbIsCorrect = true;
        }
        else {
            if (data.tryOnce === true) {
                oxBtn.siblings().addClass('cor');
                oxBtn.addClass('dis');
            }
            effectAdo('anschk_x');
            kbIsCorrect = false;
        }

        if (data.tryOnce) {
            self.ansBtn.addClass('re');

            if (kbIsCorrect) {
                if (typeof (self.onCorrect) !== 'undefined') {
                    if (self.displayLog) console.log('oxContents - 정답');
                    self.onCorrect();
                }
            }
            else {
                if (typeof (self.onWrong) !== 'undefined') {
                    if (self.displayLog) console.log('oxContents - 오답');
                    self.onWrong();
                }
            }

            if (typeof (self.onComplete) !== 'undefined') {
                if (self.displayLog) console.log('oxContents - 완료');
                self.onComplete();
            }
        }
        else {
            if (kbIsCorrect) {
                if (typeof (self.onCorrect) !== 'undefined') {
                    if (self.displayLog) console.log('oxContents - 정답');
                    self.onCorrect();
                }
            }
            else {
                if (typeof (self.onWrong) !== 'undefined') {
                    if (self.displayLog) console.log('oxContents - 오답');
                    self.onWrong();
                }
            }

            // 무한히 도전할때, 정답을 맞췄을 때에만...
            if (kbIsCorrect === true) {
                self.ansBtn.addClass('re');

                if (typeof (self.onComplete) !== 'undefined') {
                    if (self.displayLog) console.log('oxContents - 완료');
                    self.onComplete();
                }
            }
        }
    };

    this.default = function () {
        self.oxQuiz.addClass('defaultOX');

        self.ansBtn.on('click', function () {
            // addEvent에 등록된 첫 이벤트핸들러 동작후 작동하므로, 're'가 없는게 '다시하기' 임
            if ($(this).hasClass('re') === false) {
                self.default();
            }
        });
    };
};

/* ──────────────────────────────────────────────────────
* oxListContents
/* ────────────────────────────────────────────────────── */

/**
 * [문제로 확인해요] - oxList : 클릭하자마자 정오답판별
 * @param {*} wrap
 * @param {*} ansitem
 * @see {*} file:///Z:/WEP/타회사_2016_제안샘플/visang_gum3/society/s/05/01/12/soc51_112_13.html
 */
const oxListContents = function oxListContents(wrap, data) {
    const self = this;
    this.wrap = wrap;
    this.root = undefined;

    // let value = data.value || 0;

    // ['o', 'x']
    const defaults = {
        ans: ['o', 'x'],
    };
    data = $.extend(true, {}, defaults, data);

    this.elements = {
    };

    const timeoutId = {};

    const intervalId = {};

    this.displayLog = false;

    this.ans = data.ans;                // ox퀴즈 정답
    this.oxQuizTotal = self.ans.length; // ox퀴즈의 총개수

    this.oxQuizWrap = undefined;
    this.oxQuizs = undefined;
    this.oxBtns = undefined;
    this.ansBtn = undefined;

    this.onClick = undefined;       // ox선택
    this.onCorrect = undefined;     // ox선택 정답
    this.onWrong = undefined;       // ox선택 오답
    this.onComplete = undefined;    // 모두맞춤
    this.onShowAns = undefined;     // 정답 보기
    this.onReset = undefined;       // 다시 하기

    this.init = function () {
        self.makeUI();

        self.reset();
        self.addEvent();
    };

    this.makeUI = function () {
        if (self.wrap.find('.oxQuizWrap').length > 0) {
            self.wrap.find('.oxQuizWrap').remove();
            self.wrap.find('.ansbtn').remove();
        }

        let html = ``;
        html = `
            <div class="oxQuizWrap">
        `;
        for (let i = 0; i < self.oxQuizTotal; ++i) {
            html += `<div class="oxQuiz ox${i + 1}" data-comp="false"></div>`;
        }
        html += `
                <div class="ansbtn"></div>
            </div>
        `;
        self.wrap.append(html);

        html = ``;
        for (let i = 0; i < self.oxQuizTotal; ++i) {
            // 정답이 o라면,
            if (self.ans[i] === 'o') {
                html = `
                    <div class="ox o_item" data-cor="true"></div>
                    <div class="ox x_item" data-cor="false"></div>
                `;
            }
            // 정답이 x라면
            else if (self.ans[i] === 'x') {
                html = `
                    <div class="ox o_item" data-cor="false"></div>
                    <div class="ox x_item" data-cor="true"></div>
                `;
            }
            self.wrap.find('.oxQuiz').eq(i).append(html);
        }

        self.oxQuizWrap = self.wrap.find('.oxQuizWrap');
        self.oxQuizs = self.oxQuizWrap.find('.oxQuiz');
        self.oxBtns = self.oxQuizs.find('.ox');
        self.ansBtn = self.oxQuizWrap.find('.ansbtn');
    };

    this.reset = function () {
        for (let prop in timeoutId) {
            clearTimeout(timeoutId[prop]);
        }
        for (let prop in intervalId) {
            clearTimeout(intervalId[prop]);
        }
    };


    this.addEvent = function () {
        self.oxBtns.off('click').on('click', function () {
            const $ts = $(this);

            if ($ts.hasClass('dis') || $ts.hasClass('cor')) {
                return;
            }

            self.quizResult($ts);
        });

        self.ansBtn.off('click').on('click', function () {
            const $ts = $(this);

            // 다시 하기
            if ($ts.hasClass('re')) {
                effectAdo('click');
                $ts.removeClass('re');

                self.init();

                if (typeof (self.onReset) !== 'undefined') {
                    if (self.displayLog) console.log('oxListContents - 다시 하기');
                    self.onReset();
                }
            }
            // 정답 보기
            else {
                effectAdo('anschk_o');
                $ts.addClass('re');

                self.oxBtns.filter(`[data-cor="true"]`).addClass('cor');
                self.oxBtns.filter(`[data-cor="false"]`).addClass('dis');

                if (typeof (self.onShowAns) !== 'undefined') {
                    if (self.displayLog) console.log('oxListContents - 정답 확인');
                    self.onShowAns();
                }
            }
        });
    };
    this.quizResult = function (oxBtn) {
        let ksUserSelect = oxBtn.hasClass('oItem') ? 'o' : 'x';
        let kbIsCorrect;

        if (typeof (self.onClick) !== 'undefined') {
            if (self.displayLog) console.log('oxListContents - ox선택');
            self.onClick(ksUserSelect, oxBtn);
        }

        if (oxBtn.attr('data-cor') === 'true') {
            oxBtn.addClass('cor');
            oxBtn.siblings().addClass('dis');
            effectAdo('anschk_o');
            kbIsCorrect = true;

            oxBtn.closest('.oxQuiz').attr('data-comp', 'true');
            if (self.oxQuizs.filter('[data-comp="true"]').length === self.oxQuizTotal) {
                self.ansBtn.addClass('re');
            }
        }
        else {
            effectAdo('anschk_x');
            kbIsCorrect = false;
        }

        if (kbIsCorrect) {
            if (typeof (self.onCorrect) !== 'undefined') {
                if (self.displayLog) console.log('oxListContents - 정답');
                self.onCorrect();
            }
        }
        else {
            if (typeof (self.onWrong) !== 'undefined') {
                if (self.displayLog) console.log('oxListContents - 오답');
                self.onWrong();
            }
        }

        if (typeof (self.onComplete) !== 'undefined') {
            if (self.displayLog) console.log('oxListContents - 완료');
            self.onComplete();
        }
    };
};


/* ──────────────────────────────────────────────────────
* choiceContents
/* ────────────────────────────────────────────────────── */

/**
 * [문제로 확인해요] - 객관식 : 클릭하자마자 정오답판별
 * @param {*} wrap
 * @param {*} items
 * @see {*} file:///Z:/WEP/타회사_2016_제안샘플/visang_gum3/society/s/05/01/12/soc51_112_13.html
 */
const choiceContents = function choiceContents(wrap, data) {
    let self = this;
    this.wrap = wrap;
    this.root = undefined;

    // let value = data.value || 0;


    /*
    exp: [
        '㉠ 서원 정리',
        '조선이 일본을 압박하여 맺은 조약이었다.',
        '우리나라가 외국과 맺은 최초의 근대적 조약이었다.',
        '일본이 조선군의 공격을 빌미로 조선에 개항을 요구하였다.',
        '강화도 조약 이후 <br/>조선은 서양의 다른 나라들과도 조약을 맺었다.',
    ],
    ans: ['1', '2'],
    */
    const defaults = {
        ans: {
            exp: [
                '',
                '',
                // '㉠ 서원 정리',
            ],
            ans: ['1'],
        },
    };
    data = $.extend(true, {}, defaults, data);

    this.elements = {
    };

    const timeoutId = {};

    const intervalId = {};

    this.ansbtn = undefined;
    this.quizGroup = undefined;
    this.items = undefined;

    this.expObj = data.ans.exp;    // 보기
    this.ansObj = data.ans.ans;    // 정답

    this.displayLog = false;
    this.isEffectAdo = true;

    this.onClick = undefined;       // 선택
    this.onCorrect = undefined;     // 선택 - 정답
    this.onWrong = undefined;       // 선택 - 오답
    this.onComplete = undefined;    // 모두맞춤
    this.onShowAns = undefined;     // 정답보기
    this.onReset = undefined;       // 다시하기

    this.init = function () {
        self.makeUI();

        self.reset();
        addEvent();
    };

    this.makeUI = function () {
        self.wrap.find('.quizGroup').remove();
        self.wrap.find('.ansbtn').remove();

        let html = ``;
        html = `
        <div class="quizGroup">
            <ul class="bogi">
        `;

        for (let i = 0; i < self.expObj.length; ++i) {
            // 보기가 없을때,
            if (self.expObj[i] === '') {
                html += `<li><div class="text">${self.expObj[i]}</div><div class="icon"></div></li>`;
            }
            // 보기가 있을때,
            else {
                html += `<li><span class="no">${i + 1}</span><div class="text">${self.expObj[i]}</div><div class="icon"></div></li>`;
            }
        }
        html += `
            </ul>
            <div class="ansbtn"></div>
        </div>
        `;
        self.wrap.append(html);

        self.ansbtn = self.wrap.find('.ansbtn');
        self.quizGroup = self.wrap.find('.quizGroup');
        self.items = self.quizGroup.find('li');
    };

    this.reset = function () {
        for (let prop in timeoutId) {
            clearTimeout(timeoutId[prop]);
        }
        for (let prop in intervalId) {
            clearTimeout(intervalId[prop]);
        }
    };

    const addEvent = function () {
        let nAnsCnt = 0;    // 전체 정답 맞춘 개수
        let bIsAns = true;  // item별 개별 정답맞추었는지 여부

        self.items.on('click', function () {
            const $ts = $(this);

            // 퀴즈 종료 || 선택되었음
            if (self.quizGroup.hasClass('ended') || $ts.hasClass('on')) {
                return;
            }

            let itemIdx = $ts.index();
            let bIsAns = false;

            if (typeof (self.onClick) !== 'undefined') {
                if (self.displayLog) console.log('choice선택');
                self.onClick($ts);
            }

            // 정답 검색
            for (let i = 0; i < self.ansObj.length; ++i) {
                let ansNo = parseInt(self.ansObj[i], 10);
                let ansIdx = ansNo - 1;
                if (itemIdx === ansIdx) {
                    bIsAns = true;
                }
            }

            // 정답
            if (bIsAns) {
                if (self.isEffectAdo) effectAdo('anschk_o');
                $ts.addClass('on');
                $ts.find('.icon').show();
                nAnsCnt++;

                if (typeof (self.onCorrect) !== 'undefined') {
                    if (self.displayLog) console.log('choiceContents - 정답');
                    self.onCorrect();
                }

                // 모든 정답 맞춤
                if (nAnsCnt === self.ansObj.length) {
                    self.showAnsAll();

                    if (typeof (self.onComplete) !== 'undefined') {
                        if (self.displayLog) console.log('choiceContents - 모두 맞춤');
                        self.onComplete();
                    }
                }
            }
            // 오답
            else {
                if (self.isEffectAdo) effectAdo('anschk_x');
                $ts.addClass('off');

                if (typeof (self.onWrong) !== 'undefined') {
                    if (self.displayLog) console.log('choiceContents - 오답');
                    self.onWrong();
                }
            }
        });

        // 정답 보기 ↔ 다시 하기
        self.ansbtn.on('click', function () {
            const $ts = $(this);

            // 다시 하기
            if ($ts.hasClass('re')) {
                if (self.isEffectAdo) effectAdo('click');
                self.init();

                if (typeof (self.onReset) !== 'undefined') {
                    if (self.displayLog) console.log('choiceContents - 다시 하기');
                    self.onReset();
                }
            }
            // 정답 보기
            else {
                if (self.isEffectAdo) effectAdo('anschk_o');
                self.showAnsAll();

                if (typeof (self.onShowAns) !== 'undefined') {
                    if (self.displayLog) console.log('choiceContents - 정답 보기');
                    self.onShowAns();
                }
            }
        });
    };

    this.showAnsAll = function () {
        self.ansbtn.addClass('re');
        self.quizGroup.addClass('ended');

        // 정답표시
        self.items.addClass('off');

        for (let i = 0; i < self.ansObj.length; ++i) {
            let ansNo = parseInt(self.ansObj[i], 10);
            let ansIdx = ansNo - 1;
            self.items.eq(ansIdx).find('.icon').show();
            self.items.eq(ansIdx).removeClass('off');
            self.items.eq(ansIdx).addClass('on');
        }
    };
};

/* ──────────────────────────────────────────────────────
* CardContents
/* ────────────────────────────────────────────────────── */

const cardContents = function cardContents(wrap, data) {
    let self = this;
    this.wrap = wrap;
    this.root = undefined;

    // let value = data.value || 0;

    const defaults = {
        arrange: ['1', '0', '2'],
    };
    data = $.extend(true, {}, defaults, data);

    this.elements = {
    };

    const timeoutId = {
        runIdle: -1,
    };

    const intervalId = {};

    this.conWrap = undefined;

    this.spotWrap = undefined;
    this.spots = undefined;
    this.spotPos = [];
    this.spotTotal = 0;

    this.cardWrap = undefined;
    this.cards = undefined;

    this.navigation = undefined;
    this.prev = undefined;
    this.next = undefined;
    this.nextBtn = undefined;
    this.prevBtn = undefined;

    this.inputWrap = undefined;

    // 키값의 현재 배치 상태
    this.arrange = data.arrange;

    let isEnable = false;

    this.onChangeComplete = undefined;  // 카드 모션 이동 완료

    this.init = function () {
        self.makeUI();

        self.reset();
        addEvent();

        self.displayArrange('next');

        timeoutId.runIdle = setTimeout(function () {
            self.cards.addClass('run');
            isEnable = true;
        }, 100);
    };

    this.makeUI = function () {
        // self.wrap.empty();
        /* self.wrap.find('.listWrap li').remove();
        self.elements.menuWrap = self.wrap.find('.menuWrap'); */

        if (self.wrap.find('.cardConWrap').length > 0) {
            self.wrap.find('.cardConWrap').remove();
        }

        let html = `
            <div class="cardConWrap">
                <div class="spotWrap">
                    <!--
                    <div class="spot spot1">spot1</div>
                    <div class="spot spot2">spot2</div>
                    <div class="spot spot3">spot3</div>
                    -->
                </div>
                <div class="cardWrap">
                    <!--
                    <div class="card card1">0</div>
                    <div class="card card2">1</div>
                    <div class="card card3">2</div>
                    -->
                </div>
                <div class="navigation">
                    <div class="btn prev">prev</div>
                    <div class="btn next">next</div>
                    <div class="btn nextBtn">nextBtn</div>
                    <div class="btn prevBtn">prevBtn</div>
                </div>
                <div class="inputWrap">
                    <input type="text"/>
                </div>
            </div>
        `;
        self.wrap.append(html);

        self.conWrap = self.wrap.find('.cardConWrap');
        self.spotWrap = self.conWrap.find('.spotWrap');
        self.cardWrap = self.conWrap.find('.cardWrap');
        self.navigation = self.conWrap.find('.navigation');
        self.prev = self.navigation.find('.prev');
        self.next = self.navigation.find('.next');
        self.nextBtn = self.navigation.find('.nextBtn');
        self.prevBtn = self.navigation.find('.prevBtn');

        self.inputWrap = self.conWrap.find('.inputWrap');

        let i;

        self.spotPos = [];
        self.spotTotal = data.arrange.length;

        self.spotWrap.empty();
        html = ``;
        for (i = 0; i < self.spotTotal; ++i) {
            html += `<div class="spot spot${i + 1}">spot${i + 1}</div>`;
        }
        self.spotWrap.html(html);
        self.spots = self.spotWrap.find('.spot');

        self.spots.each(function (idx) {
            const $spot = $(this);
            $spot.attr('data-spot-idx', idx);

            self.spotPos.push({
                'left': pxToInt($spot.css('left')),
                'top': pxToInt($spot.css('top')),
            });
        });




        self.cardWrap.empty();
        html = ``;
        for (i = 0; i < self.spotTotal; ++i) {
            html += `<div class="card card${i + 1}">card${i + 1}</div>`;
        }
        self.cardWrap.html(html);
        self.cards = self.cardWrap.find('.card');

        self.cards.each(function (idx) {
            const $card = $(this);
            $card.attr({
                'data-key': idx,
                'data-card-idx': idx,
            });
        });
    };

    this.reset = function () {
        for (let prop in timeoutId) {
            clearTimeout(timeoutId[prop]);
        }
        for (let prop in intervalId) {
            clearTimeout(intervalId[prop]);
        }
    };

    const addEvent = function () {
        self.prev.on('click', function () {
            if (isEnable === false) {
                return;
            }
            effectAdo('click');

            self.prevCard();
        });

        self.next.on('click', function () {
            if (isEnable === false) {
                return;
            }
            effectAdo('click');

            self.nextCard();
        });

        self.nextBtn.on('click', function () {
            if (isEnable === false) {
                return;
            }
            effectAdo('click');

            self.nextCard();
        });

        self.prevBtn.on('click', function () {
            if (isEnable === false) {
                return;
            }
            effectAdo('click');

            self.prevCard();
        });
    };


    this.prevCard = function () {
        const arrangeOld = self.arrange.concat();

        // Last to First
        self.arrange.push(self.arrange.shift());

        self.displayArrange('prev', arrangeOld);
    };
    this.nextCard = function () {
        const arrangeOld = self.arrange.concat();

        // First to Last
        self.arrange.unshift(self.arrange.pop());

        self.displayArrange('next', arrangeOld);
    };


    // 정렬하여 화면에 출력
    this.displayArrange = function (dir, arrangeOld) {
        isEnable = false;

        // 회전방향에 따락 zIndex값을 재계산
        let zIdx = 10;
        let cardKey, card;
        switch (dir) {
            case 'next':
            case 'prev':
                for (let i = 0; i < self.arrange.length; ++i) {
                    cardKey = self.arrange[i];
                    card = self.cards.filter(`[data-key="${cardKey}"]`);

                    card.css('z-index', zIdx);
                    zIdx++;

                    // prev일때, 배열 변경전 원래 맨 왼쪽 끝에 있던것
                    if (dir === 'prev' && i === self.arrange.length - 1) {
                        card.addClass('first_to_last');
                        card.off(sTransitionEnd).on(sTransitionEnd, function (e) {
                            if (e.originalEvent.propertyName === 'left') {
                                $(this).removeClass('first_to_last');
                            }
                        });
                    }
                }
                break;
        }

        // 카드들 배치
        self.cards.each(function () {
            const $card = $(this);
            const key = $card.attr('data-key');         // data-key값
            const arrangeIdx = self.arrange.indexOf(key);   // data-key값으로 arrange에서 index값 탐색

            $card.attr('data-arrange-idx', arrangeIdx);
            $card.css({
                'left': self.spotPos[arrangeIdx].left,
                'top': self.spotPos[arrangeIdx].top,
            });
        });

        // 배열의 중앙값으로 보고자하는 카드를 계산
        let viewIdx = parseInt(self.arrange.length / 2, 10);     // arrange 배열의 가운데 인덱스 값
        let viewKey = self.arrange[viewIdx];
        let viewCard = self.cards.filter(`[data-key="${viewKey}"]`);
        self.cards.removeClass('view');
        // self.cards.off(sTransitionEnd);
        viewCard.addClass('view');
        viewCard.off(sTransitionEnd).on(sTransitionEnd, function (e) {
            if (
                e.originalEvent.propertyName === 'left' &&
                $(this).hasClass('view') === true
            ) {
                isEnable = true;
                if (typeof (self.onChangeComplete) !== 'undefined') {
                    self.onChangeComplete(viewIdx, viewKey, self.arrange);
                }
            }
        });

        self.inputWrap.find('input').val(self.arrange);
    };
};

/* ──────────────────────────────────────────────────────
* findOutContents
/* ────────────────────────────────────────────────────── */

/**
 * '함께 알아봐요'
 * @param {*} wrap
 * @param {*} data
 */
/*
scene1: 확대 상태 대기시간
scene2: 축소 및 연결선 대기시간
*/
const findOutContents = function findOutContents(wrap, data) {
    let self = this;
    this.wrap = wrap;
    this.root = undefined;

    // let value = data.value || 0;

    const defaults = {
        total: 2,
        delay: [
            { scene1: 1000, scene2: 500 },
            { scene1: 1000, scene2: 500 },
        ]
    };
    data = $.extend(true, {}, defaults, data);

    this.elements = {
    };

    const timeoutId = {
        scene1: -1,
        scene2: -1,

        sceneAll1: -1,
        sceneAll2: -1,
    };

    const intervalId = {};

    this.now = 1;
    this.total = data.total;

    this.conWrap = undefined;       // .findOutConWrap
    this.stepSceneWrap = undefined; // .stepSceneWrap

    this.stepScenes = undefined;    // .stepScene
    this.stepWraps = undefined;     // .stepWrap
    this.sceneWraps = undefined;    // .sceneWrap

    this.contentBgWrap = undefined; // .contentBgWrap
    this.contentBgs = undefined;    // .contentBg

    this.showAllBtn = undefined;

    this.onReset = undefined;           // 리셋
    this.onShowAll = undefined;
    this.onShowScene = undefined;
    this.onShowAllScene = undefined;


    // imagePreload
    (function () {
        const url = `${COMM_IMG_SCI_PATH}findout/`;
        imgPreLoad([
            `${url}ballon_lrg_ch1.png`,
            `${url}ballon_lrg_ch2.png`,
            `${url}ballon_lrg_ch3.png`,
            `${url}btnStepStart.png`,
            `${url}circle2_line1_1.png`,
            `${url}circle2_line1_2.png`,
            `${url}circle2_line1_3.png`,
            `${url}circle2_line1_4.png`,
            `${url}circle2_line1_5.png`,
            `${url}circle3_line1_1.png`,
            `${url}circle3_line1_2.png`,
            `${url}circle3_line1_3.png`,
            `${url}circle4_line1_1.png`,
            `${url}circle4_line1_2.png`,
            `${url}circle4_line1_3.png`,
            `${url}circle4_line1_4.png`,
            `${url}circle_line_last.png`,
            `${url}circle_line_prev.png`,
            `${url}scene_ch1_txt.png`,
            `${url}scene_ch2_txt.png`,
            `${url}scene_ch3_txt.png`,
            `${url}study_step_char.png`,
        ], true);
    })();


    this.init = function () {
        self.makeUI();

        // self.reset();
        // addEvent();

        makeComponent();
    };

    this.makeUI = function () {
        if (self.wrap.find('.findOutConWrap') > 0) {
            self.wrap.find('.findOutConWrap').remove();
        }

        html = `
            <div class="findOutConWrap" data-total="${self.total}" data-now="${self.now}">
                <div class="stepSceneWrap">
                </div>
                <div class="showAllBtn"></div>
            </div>
        `;
        self.wrap.prepend(html);

        self.conWrap = self.wrap.find('.findOutConWrap');
        self.stepSceneWrap = self.conWrap.find('.stepSceneWrap');
        self.showAllBtn = self.conWrap.find('.showAllBtn');

        html = ``;
        let i;
        for (i = 0; i < self.total; ++i) {
            /* html += `
                <div class="stepScene stepScene${i + 1}">
                    <div class="stepWrap">
                        <div class="stepBtn"></div>
                    </div>
                    <div class="sceneWrap">
                        <div class="em"></div>
                    </div>
                </div>
            `; */
            html += `
                <div class="stepScene stepScene${i + 1}">
                    <div class="sceneWrap">
                        <div class="txt"></div>
                        <div class="em"></div>
                        <div class="stepWrap">
                            <div class="stepBtn"></div>
                        </div>
                    </div>
                </div>
            `;
        }
        self.stepSceneWrap.append(html);

        html = `<div class="contentBgWrap">`;
        for (i = 0; i < self.total; ++i) {
            html += `<div class="contentBg contentBg${i + 1}"></div>`;
        }
        html += `</div>`;
        self.stepSceneWrap.append(html);

        self.stepScenes = self.stepSceneWrap.find('.stepScene');
        self.stepWraps = self.stepSceneWrap.find('.stepWrap');
        self.sceneWraps = self.stepSceneWrap.find('.sceneWrap');

        self.contentBgWrap = self.stepSceneWrap.find('.contentBgWrap');
        self.contentBgs = self.contentBgWrap.find('.contentBg');

        /* self.wrap.empty();
        let html = `
        `;
        self.wrap.append(html); */
        /* self.wrap.find('.listWrap li').remove();

        self.elements.menuWrap = self.wrap.find('.menuWrap'); */
    };

    this.reset = function () {
        for (let prop in timeoutId) {
            clearTimeout(timeoutId[prop]);
        }
        for (let prop in intervalId) {
            clearTimeout(intervalId[prop]);
        }
    };

    const addEvent = function () {
    };

    //*--------------------

    const makeComponent = function () {
        // stepScene
        self.stepScenes.removeClass('on');
        self.stepScenes.find('.stepBtn').off().on('click', function () {
            stepRun();
        });

        self.showAllBtn.off().on('click', function () {
            for (let prop in timeoutId) {
                clearTimeout(timeoutId[prop]);
            }

            // 모두 보기
            if (!$(this).hasClass('re')) {
                self.stepScenes.addClass('on');

                timeoutId.sceneAll1 = setTimeout(function () {
                    self.stepScenes.addClass('scene1');

                    timeoutId.sceneAll2 = setTimeout(function () {
                        self.stepScenes.addClass('scene2');
                        self.contentBgs.addClass('on');

                    }, 0);
                }, 0);

                $(this).addClass('re');
                // $(this).hide();

                if (typeof (self.onShowAll) !== 'undefined') {
                    self.onShowAll();
                }
            }
            // 다시 하기
            else {
                self.stepSceneReset();

                $(this).removeClass('re');

                if (typeof (self.onReset) !== 'undefined') {
                    self.onReset();
                }
            }
        });

        stepSceneShow();
    };

    this.stepSceneReset = function () {
        self.now = 1;
        self.showAllBtn.show().removeClass('re');

        self.stepScenes.removeClass('on scene1 scene2');
        self.contentBgs.removeClass('on');

        stepSceneShow();
    };

    const stepSceneShow = function () {
        self.conWrap.attr('data-now', self.now);

        let stepScene = self.stepScenes.filter(`.stepScene${self.now}`);
        stepScene.addClass('on');

        if (typeof (self.onShowScene) !== 'undefined') {
            self.onShowScene(self.now, self.total);
        }
    };

    const stepRun = function () {
        let stepScene = self.stepScenes.filter(`.stepScene${self.now}`);
        let contentBg = self.contentBgs.filter(`.contentBg${self.now}`);

        const delayScene1 = data.delay[self.now - 1].scene1;
        const delayScene2 = data.delay[self.now - 1].scene2;

        // 버튼 fade-out
        stepScene.addClass('scene1');

        if (self.now === self.total) {
            self.showAllBtn.addClass('re');
        }

        // 내용 scale-down
        timeoutId.scene1 = setTimeout(function () {
            stepScene.addClass('scene2');
            contentBg.addClass('on');

            // 연결선 보이기 종료
            timeoutId.scene2 = setTimeout(function () {

                // 마지막 단계 직전
                if (self.now === self.total - 1) {
                    // self.showAllBtn.hide();
                }

                if (self.now < self.total) {
                    self.now++;
                    stepSceneShow();
                }
                else {
                    if (typeof (self.onShowAllScene) !== 'undefined') {
                        self.onShowAllScene(self.now, self.total);
                    }
                }
            }, delayScene2);

        }, delayScene1);
    };
};

/* ──────────────────────────────────────────────────────
* quizContents
/* ────────────────────────────────────────────────────── */
/**
 * '확인 꼭꼭' 과 같이 사용자의 선택에 따라 정오답 판별 from 동규주임
 * ? 흐름: common_sci.js → common.js → 개별 퀴즈 클래스(ex. dragContents)
 * @param {*} wrap
 * @param {*} quizType Quiz타입
 * @param {*} data 임의의 데이터 값
 */
const quizContents = function quizContents(wrap, quizType, data) {
    let self = this;
    this.wrap = wrap;

    this.quizType = quizType; //wrap.attr('data-quiz');         // 문제 유형

    // this.quizObjDic = {};
    this.quizObj = undefined;

    this.onInit = undefined;            // 초기화
    this.onReset = undefined;           // 리셋
    this.onShowAns = undefined;         // 정답보기
    this.onCorrect = undefined;         // 정답
    this.onWrong = undefined;           // 오답
    this.onGameSuccess = undefined;     // 전체 Quiz성공
    this.onGameFail = undefined;        // 전체 Quiz실패

    // 초기화
    this.init = function () {
        switch (self.quizType) {
            // 클릭
            case 'click':
                self.quizObj = new contentsSet(contents);
                // self.quizObj.clickCon('click');
                self.quizObj.clickCon(data.total);
                self.quizObj.onClick = function (pbIsOpen, pnIdx, pbIsSetRe) {
                    // console.log('클릭');
                };
                self.quizObj.onReset = function () {
                    // console.log('다시하기');
                };
                self.quizObj.onShowAns = function () {
                    // console.log('확인하기');
                };
                break;
            // 클릭(+ 초성)
            case 'click_cho':
                self.quizObj = new contentsSet(wrap);
                self.quizObj.clickCon(data.total, 'cho');
                /* self.quizObj.onShowCho = function () {
                    console.log('초성보기');
                }; */
                break;
            // 클릭(+ ox)
            case 'click_ox':
                self.quizObj = new contentsSet(wrap);
                self.quizObj.clickCon(data.total, 'OX', data.oxAns);
                self.quizObj.onClick = function (pbIsOpen, pnIdx, pbIsSetRe) {
                    self.quizObj.clickCon.items.each(function () {
                        const $ts = $(this);
                        if ($ts.hasClass('on')) {
                            $ts.addClass('selected');
                        }
                        else {
                            $ts.removeClass('selected');
                        }
                    });
                };
                self.quizObj.onReset = function () {
                    self.quizObj.clickCon.items.removeClass('selected');
                };
                self.quizObj.onShowAns = function () {
                };
                self.quizObj.onCorrect = function () {
                };
                self.quizObj.onWrong = function () {
                };
                break;
            // 선잇기(1:1)
            case 'line':
                self.quizObj = new contentsSet(wrap);
                self.quizObj.lineConHtml(data);
                self.quizObj.lineCon('', data);
                self.quizObj.onShowAns = function () {
                    //console.log('확인하기');
                };
                self.quizObj.onResetAns = function () {
                    //console.log('다시하기');
                };
                self.quizObj.onCorrect = function () {
                    //console.log('정답');
                };
                self.quizObj.onWrong = function () {
                    //console.log('오답');
                };
                break;
            // 선잇기(n:n)
            case 'multiLine':
                self.quizObj = new contentsSet(wrap);
                self.quizObj.lineConHtml(data);
                self.quizObj.lineCon('multiLine', data);
                self.quizObj.onShowAns = function () {
                    // console.log('확인하기');
                };
                self.quizObj.onResetAns = function () {
                    // console.log('다시하기');
                };
                self.quizObj.onCorrect = function () {
                    // console.log('정답');
                };
                self.quizObj.onWrong = function () {
                    // console.log('오답');
                };
                break;
            // 선잇기(n:1)
            case 'multiLineTp2':
                self.quizObj = new contentsSet(wrap);
                self.quizObj.lineConHtml(data);
                self.quizObj.lineCon('multiLineTp2', data);
                self.quizObj.onShowAns = function () {
                    // console.log('확인하기');
                };
                self.quizObj.onResetAns = function () {
                    // console.log('다시하기');
                };
                self.quizObj.onCorrect = function () {
                    // console.log('정답');
                };
                self.quizObj.onWrong = function () {
                    // console.log('오답');
                };
                break;
            // 드래그(즉시 정오답 체크)
            case 'drag_chkAns':
                if (wrap.find('.dragWrap').length === 0) {
                    wrap.append(`<div class="dragWrap"></div>`);
                }
                wrap.find('.dragWrap').removeClass('comp');

                // 섞기
                if (data.random === true) {
                    data.dragItems.drag = shuffle(data.dragItems.drag);
                }

                self.quizObj = new contentsSet(wrap.find('.dragWrap'));
                self.quizObj.dragCon(data.dragItems);
                //self.quizObj.dragCon.dropItem.droppable('option', 'tolerance', 'fit');
                self.quizObj.onDrag = function (pjRec, e, obj) {
                    // console.log('드래그 시작');
                };
                self.quizObj.endDrag = function (pjRec, e, obj) {
                    // console.log('드래그 완료');
                };
                self.quizObj.onDrop = function (pnDragIdx, pnDropIdx, pbAns, pbComplete, pjRec, e, obj) {
                    // console.log('드롭 완료', arguments);

                    const conSet = this; // contentsSet
                    const dragCon = conSet.dragCon; // dragContents
                    const $drag = dragCon.dragItem.filter(`[data-idx="${pnDragIdx}"]`);
                    const $drop = dragCon.dropItem.filter(`[data-idx="${pnDropIdx}"]`);

                    // 정답
                    if (pbAns) {
                        $drag.attr('data-drop', pnDropIdx);
                        $drag.removeAttr('style');

                        $drop.addClass('match');
                        $drop.attr('data-drag', pnDragIdx);
                        $drop.find('.dragItem').removeClass('match');
                    }
                    // 오답
                    else {

                    }

                    if (pbComplete === true) {
                        self.quizObj.wrap.addClass('comp');
                    }
                };
                self.quizObj.onShowAns = function () {
                    // console.log('정답보기');
                    self.quizObj.wrap.addClass('comp');

                    self.quizObj.dragCon.dropItem.addClass('ans');
                    // 다시하기 전에 미리 섞기
                    if (data.random === true) {
                        self.quizObj.dragCon.set.drag = shuffle(self.quizObj.dragCon.set.drag);
                        self.quizObj.dragCon.dragObj = self.quizObj.dragCon.set.drag;
                    }
                };
                self.quizObj.onReset = function () {
                    // console.log('다시하기');
                    self.quizObj.wrap.removeClass('comp');
                };
                self.quizObj.onCorrect = function () {
                    // console.log('정답');
                };
                self.quizObj.onWrong = function () {
                    // console.log('오답');
                };
                break;
            // 드래그(드롭된 곳에 드래그가능, 드롭한 것 이동 불가능)
            case 'drag_modify':
                if (wrap.find('.dragWrap').length === 0) {
                    wrap.append(`<div class="dragWrap"></div>`);
                }
                wrap.find('.dragWrap').removeClass('comp');
                wrap.find('.dragWrap').attr('data-chk-drop-ans', 'false');
                wrap.find('.dragWrap').attr('data-quiz-type', self.quizType);

                // 섞기
                if (data.random === true) {
                    data.dragItems.drag = shuffle(data.dragItems.drag);
                }

                self.quizObj = new contentsSet(wrap.find('.dragWrap'));
                self.quizObj.dragCon(data.dragItems);
                //self.quizObj.dragCon.dropItem.droppable('option', 'tolerance', 'fit');
                self.quizObj.onDrag = function (pjRec, e, obj) {
                    // console.log('드래그 시작');
                };
                self.quizObj.endDrag = function (pjRec, e, obj) {
                    // console.log('드래그 완료');
                };
                self.quizObj.onDrop = function (pnDragIdx, pnDropIdx, pbAns, pbComplete, pjRec, e, obj) {
                    // console.log('드롭 완료');
                };
                self.quizObj.onShowAns = function (dragIdxInfo, dropIdxInfo) {
                    // console.log('정답보기');

                    // dragIdxInfo : dragItem의 data-drop 값 모음(undefined: 매칭되지 않음)
                    // dropIdxInfo : dropItem의 data-drag 값 모음(undefined: 매칭되지 않음)
                    console.log('dragIdxInfo: ', dragIdxInfo);
                    console.log('dropIdxInfo: ', dropIdxInfo);

                    const conSet = this; // contentsSet
                    const dragCon = conSet.dragCon; // dragContents

                    // .dropItem > .dragItem 제거
                    dragCon.dropItem.empty();

                    let kbIsCorrect = false; // 전체 정오답 여부
                    let correctCnt = 0; // 정답 개수

                    let nowDrag = [];   // .dragItem기준으로 개별 정오답 확인
                    let nowDrop = [];   // .dropItem기준으로 개별 정오답 확인

                    for (let i = 0; i < dragCon.dragItem.length; ++i) {
                        nowDrag[i] = undefined;
                    }
                    for (let i = 0; i < dragCon.dropItem.length; ++i) {
                        nowDrop[i] = undefined;
                    }

                    // 한 개라도 드롭된것이 있는지 체크( = 게임을 진행했음 )
                    const isDropped = dragCon.dragItem.is(`[data-drop]`);

                    // dragAns의 정답 .dropItem의 data-idx를 탐색
                    function getAnsDropIdx(dragAns) {
                        let ansDropIdx;
                        for (let i = 0; i < dragCon.dropObj.length; ++i) {
                            if (dragCon.dropObj[i].indexOf(dragAns) > -1) {
                                ansDropIdx = i;
                            }
                        }
                        return ansDropIdx;
                    }

                    // 정답 개수 확인
                    dragCon.dragItem.each(function (idx) {
                        const $dragItem = $(this);
                        const drag_ans = $dragItem.attr('data-drag-value');

                        // 드롭됨
                        if ($dragItem.is('[data-drop]')) {
                            const droppedIdx = Number($dragItem.attr('data-drop'));

                            // drop 생성값으로 정오답 판별
                            // 정답
                            if (dragCon.dropObj[droppedIdx].indexOf(drag_ans) > -1) {
                                correctCnt++;
                                nowDrag[idx] = true;
                                nowDrop[droppedIdx] = true;
                            }
                            // 오답
                            else {
                                nowDrag[idx] = false;

                                // 정답 drop-idx
                                let dropIdxAns = getAnsDropIdx(drag_ans);
                                nowDrop[dropIdxAns] = false;
                            }
                        }
                        // 드롭 안됨
                        else {
                            nowDrag[idx] = false;

                            // 정답 drop-idx
                            let dropIdxAns = getAnsDropIdx(drag_ans);
                            nowDrop[dropIdxAns] = false;
                        }
                    });
                    if (correctCnt === dragCon.dropItem.length) {
                        kbIsCorrect = true;
                    }

                    /*console.log('피드백 처리여부: ', isDropped);
                    console.log('정답의 총개수: ', correctCnt);
                    console.log('dragItem기준 개별정오답(nowDrag): ', nowDrag);
                    console.log('dropItem기준 개별정오답(nowDrop): ', nowDrop); */
                    console.log('전체 정오답 여부: ', kbIsCorrect);

                    // 정답 표시
                    dragCon.showAnsCreate();



                    self.quizObj.dragCon.dropItem.addClass('ans');

                    self.quizObj.wrap.addClass('comp');

                    // 다시하기 전에 미리 drag정보값 섞기
                    if (data.random === true) {
                        self.quizObj.dragCon.set.drag = shuffle(self.quizObj.dragCon.set.drag);
                        self.quizObj.dragCon.dragObj = self.quizObj.dragCon.set.drag;
                    }

                    // 하나라도 드롭된게 있으면, 정오답 피드백 처리
                    if (isDropped) {
                        if (kbIsCorrect) {
                            effectAdo('anschk_o', conSet.bStopOther);
                        }
                        else {
                            effectAdo('anschk_x', conSet.bStopOther);
                        }
                    }
                };
                self.quizObj.onReset = function () {
                    // console.log('다시하기');
                    self.quizObj.wrap.removeClass('comp');
                };
                self.quizObj.onCorrect = function () {
                    // console.log('정답');
                };
                self.quizObj.onWrong = function () {
                    // console.log('오답');
                };
                break;
            // 드래그드롭된 곳에 드래그가능, 드롭한 것 이동 가능)
            /**
            //* [원리]: drop될때,
                a) style 속성을 지움
                b) .match 클래스 부여
                c) data-drop값을 부여해서 사용자가 입력한 css값 위치로 위치시킴
            */
            case 'drag_modify_all':
                if (wrap.find('.dragWrap').length === 0) {
                    wrap.append(`<div class="dragWrap"></div>`);
                }
                wrap.find('.dragWrap').removeClass('comp');
                wrap.find('.dragWrap').attr('data-chk-drop-ans', 'false');
                wrap.find('.dragWrap').attr('data-quiz-type', self.quizType);

                // 섞기
                if (data.random === true) {
                    data.dragItems.drag = shuffle(data.dragItems.drag);
                }

                self.quizObj = new contentsSet(wrap.find('.dragWrap'));
                self.quizObj.dragCon(data.dragItems);
                //self.quizObj.dragCon.dropItem.droppable('option', 'tolerance', 'fit');
                self.quizObj.isOut = false; // 동적 속성 생성
                self.quizObj.onDrag = function (pjRec, e, obj) {
                    // console.log('드래그 시작');
                    const conSet = this; // contentsSet
                    const dragCon = conSet.dragCon; // dragContents

                    // @see https://api.jqueryui.com/draggable/#option-revert
                    /*
                    revert: true   	// 항상 되돌림
                    revert: invalid // 드래그 가능 항목이 드롭 가능 항목에 드롭되지 않은 경우(invalid)에만 되돌리기가 발생
                    revert: valid 	// 드래그 가능 항목이 드롭 가능 항목에 드롭되지 않아도 되돌리기 발생 안함(valid)
                    */
                    //* old
                    // dragCon.dragItem.draggable('option', 'revert', 'invalid');
                    let isRevert = false;
                    dragCon.dragItem.draggable('option', 'revert', function (e, obj) {
                        // drop된것이 없음
                        if (e == false) {
                            isRevert = true;
                            // 추가 부여된 이벤트 삭제
                            dragCon.dropItem.off('drop');
                            return true;	// 되돌아 가게 함

                        }
                        // drop되었음!
                        else {
                            isRevert = false;
                            //return true; // 되돌아 가게 함
                            //return false; // = 원래위치로 되돌아가지 않음
                        }
                    });

                    conSet.endDrag = undefined;
                    conSet.isOut = false;

                    // console.log('onDrag', conSet.isOut);
                    dragCon.dropItem.on('drop', function (e, obj) {
                        dragCon.dropItem.off('drop');
                        conSet.isOut = false;
                        // console.log('--drop', conSet.isOut);

                        // 이전에 드롭됐었음
                        if (pjRec.is('[data-drop]')) {
                            const $dropOld = dragCon.dropItem.filter(`[data-idx="${pjRec.attr('data-drop')}"]`);
                            $dropOld.removeAttr('data-drag');
                        }
                    });

                    // drop된것에서 빼낼때
                    dragCon.dropItem.on('dropout', function (e, obj) {
                        dragCon.dropItem.off('dropout');

                        if (pjRec.attr('data-drop')) {
                            conSet.isOut = true;
                            pjRec.draggable('option', 'revert', false);
                        }
                        // console.log('--dropout', conSet.isOut);

                        conSet.endDrag = function (pjRec, e, obj) {
                            // console.log('endDrag', conSet.isOut);

                            // drop되었던것을 빼내어서 최초 위치로 이동
                            if (conSet.isOut === true) {
                                // 추가 부여된 이벤트 삭제
                                dragCon.dropItem.off('drop');

                                const $drop = dragCon.dropItem.filter(`[data-idx="${pjRec.attr('data-drop')}"]`);
                                $drop.removeAttr('data-drag');

                                pjRec.removeAttr('style');
                                pjRec.removeAttr('data-drop');
                                pjRec.removeClass('match');
                            }
                            pjRec.draggable('option', 'revert', 'invalid');
                        };
                    });
                };
                //* 사용안됨! */
                /*
                self.quizObj.endDrag = function (pjRec, e, obj) {
                    console.log('드래그 완료');
                };
                */
                self.quizObj.onDrop = function (pnDragIdx, pnDropIdx, pbAns, pbComplete, pjRec, e, obj) {
                    const conSet = this; // contentsSet
                    const dragCon = conSet.dragCon; // dragContents
                    const $drag = dragCon.dragItem.filter(`[data-idx="${pnDragIdx}"]`);
                    const $drop = dragCon.dropItem.filter(`[data-idx="${pnDropIdx}"]`);
                    // console.log('onDrop', conSet.isOut);

                    // drop된 곳과 같은 drop-idx값을 같는 .dragItem의 data-drop값 초기화(현재 드롭한 dragItem 제외) ===> css값을 해제해서, 원래 위치로 돌려냄
                    const $sameDroppedDrag = dragCon.dragArea.find(`[data-drop="${pnDropIdx}"]`).not(pjRec);
                    $sameDroppedDrag.removeAttr('style');
                    $sameDroppedDrag.removeClass('match');
                    $sameDroppedDrag.removeAttr('data-drop');

                    $drop.attr('data-drag', pnDragIdx);
                    $drop.empty();

                    // css로 입력된 값이 표현되도록 변경
                    pjRec.removeAttr('style');
                    pjRec.addClass('match');
                    pjRec.attr('data-drop', pnDropIdx);
                };
                self.quizObj.onShowAns = function (dragIdxInfo, dropIdxInfo) {
                    // console.log('정답보기');

                    // dragIdxInfo : dragItem의 data-drop 값 모음(undefined: 매칭되지 않음)
                    // dropIdxInfo : dropItem의 data-drag 값 모음(undefined: 매칭되지 않음)
                    console.log('dragIdxInfo: ', dragIdxInfo);
                    console.log('dropIdxInfo: ', dropIdxInfo);

                    const conSet = this; // contentsSet
                    const dragCon = conSet.dragCon; // dragContents

                    // .dropItem > .dragItem 제거
                    dragCon.dropItem.empty();

                    let kbIsCorrect = false; // 전체 정오답 여부
                    let correctCnt = 0; // 정답 개수

                    let nowDrag = [];   // .dragItem기준으로 개별 정오답 확인
                    let nowDrop = [];   // .dropItem기준으로 개별 정오답 확인

                    for (let i = 0; i < dragCon.dragItem.length; ++i) {
                        nowDrag[i] = undefined;
                    }
                    for (let i = 0; i < dragCon.dropItem.length; ++i) {
                        nowDrop[i] = undefined;
                    }

                    // 한 개라도 드롭된것이 있는지 체크( = 게임을 진행했음 )
                    const isDropped = dragCon.dragItem.is(`[data-drop]`);

                    // dragAns의 정답 .dropItem의 data-idx를 탐색
                    function getAnsDropIdx(dragAns) {
                        let ansDropIdx;
                        for (let i = 0; i < dragCon.dropObj.length; ++i) {
                            if (dragCon.dropObj[i].indexOf(dragAns) > -1) {
                                ansDropIdx = i;
                            }
                        }
                        return ansDropIdx;
                    }

                    // 정답 개수 확인
                    dragCon.dragItem.each(function (idx) {
                        const $dragItem = $(this);
                        const drag_ans = $dragItem.attr('data-drag-value');

                        // 드롭됨
                        if ($dragItem.is('[data-drop]')) {
                            const droppedIdx = Number($dragItem.attr('data-drop'));

                            // drop 생성값으로 정오답 판별
                            // 정답
                            if (dragCon.dropObj[droppedIdx].indexOf(drag_ans) > -1) {
                                correctCnt++;
                                nowDrag[idx] = true;
                                nowDrop[droppedIdx] = true;
                            }
                            // 오답
                            else {
                                nowDrag[idx] = false;

                                // 정답 drop-idx
                                let dropIdxAns = getAnsDropIdx(drag_ans);
                                nowDrop[dropIdxAns] = false;
                            }
                        }
                        // 드롭 안됨
                        else {
                            nowDrag[idx] = false;

                            // 정답 drop-idx
                            let dropIdxAns = getAnsDropIdx(drag_ans);
                            nowDrop[dropIdxAns] = false;
                        }
                    });
                    if (correctCnt === dragCon.dropItem.length) {
                        kbIsCorrect = true;
                    }

                    console.log('피드백 처리여부: ', isDropped);
                    console.log('정답의 총개수: ', correctCnt);
                    console.log('dragItem기준 개별정오답(nowDrag): ', nowDrag);
                    console.log('dropItem기준 개별정오답(nowDrop): ', nowDrop);
                    console.log('전체 정오답 여부: ', kbIsCorrect);

                    // 정답 표시
                    dragCon.showAnsCreate();

                    // dropItem으로 생성된 내부 비우기
                    dragCon.dropItem.empty();

                    self.quizObj.dragCon.dropItem.addClass('ans');

                    self.quizObj.wrap.addClass('comp');

                    // 다시하기 전에 미리 drag정보값 섞기
                    if (data.random === true) {
                        self.quizObj.dragCon.set.drag = shuffle(self.quizObj.dragCon.set.drag);
                        self.quizObj.dragCon.dragObj = self.quizObj.dragCon.set.drag;
                    }

                    // 하나라도 드롭된게 있으면, 정오답 피드백 처리
                    if (isDropped) {
                        if (kbIsCorrect) {
                            effectAdo('anschk_o', conSet.bStopOther);
                        }
                        else {
                            effectAdo('anschk_x', conSet.bStopOther);
                        }
                    }
                };
                self.quizObj.onReset = function () {
                    // console.log('다시하기');
                    self.quizObj.wrap.removeClass('comp');
                };
                self.quizObj.onCorrect = function () {
                    // console.log('정답');
                };
                self.quizObj.onWrong = function () {
                    // console.log('오답');
                };
                break;
        }

        self.wrap.addClass('quizContents');
        self.quizObj.key = '' + self.wrap.attr('data-quiz-idx');
        self.quizObj.quizMain = self;
        // self.quizObjDic[self.quizObj.key] = self.quizObj;

        if (typeof self.onInit !== 'undefined') { self.onInit(self, self.quizObj); }
    };

    // 리셋
    this.reset = function () {
        self.quizObj.reset();

        if (typeof self.onReset !== 'undefined') { self.onReset(self, self.quizObj); }
    };
};


/* ──────────────────────────────────────────────────────
* GameConfirmTp1 :: 3학년 - 확인 꼭꼭 > 실력을 더해요 > 2번 퀴즈
/* ────────────────────────────────────────────────────── */

const GameConfirmTp1 = function GameConfirmTp1(wrap, data) {
    let self = this;
    this.wrap = wrap;
    this.root = undefined;

    // let value = data.value || 0;

    const defaults = {
        ox: ['o', 'x'],
        choice: {
            exp: ['보기1', '보기2'],
            ans: ['1'],
        }
    };
    data = $.extend(true, {}, defaults, data);

    this.elements = {
    };

    const timeoutId = {
        autoNextTab: -1,
    };

    const intervalId = {};

    const gameType = 'tp1';

    this.gameWrap = undefined;
    this.hintPicWrap = undefined;

    this.tabCon = undefined;
    this.oxCon = undefined;
    this.choiceCon = undefined;

    this.step = 1;                      // 현재단계
    this.stepTotal = data.ox.length;    // 총단계

    this.oxConArr = new Array(self.stepTotal); // oxCon 관리

    // imagePreload
    (function () {
        const url = `${COMM_IMG_SCI_PATH}game/game_tp1/`;
        imgPreLoad([
            `${url}chk.png`,
            `${url}hint_pic_char.png`,
            `${url}ox_o.png`,
            `${url}ox_o_off.png`,
            `${url}ox_o_on.png`,
            `${url}ox_x.png`,
            `${url}ox_x_off.png`,
            `${url}ox_x_on.png`,
        ], true);
    })();

    this.init = function () {
        self.makeUI();

        // self.reset();
        // addEvent();

        makeComponent();
    };

    this.makeUI = function () {
        /* self.wrap.empty();
        let html = `
        `;
        self.wrap.append(html); */

        self.wrap.find('.gameContents').remove();

        let html = `
        <div class="gameWrap gameContents" data-tp="${gameType}">
            <div class="tabWrap">
                <div class="tab tab1"></div>
                <div class="tab tab2"></div>
                <div class="tab tab3"></div>
            </div>
            <div class="hintPicWrap" data-step="${self.step}">
                <div class="hintPic"></div>
            </div>

            <div class="gameAnsBtn"></div>
            <div class="popup" data-idx="0">
                <div class="gameReBtn"></div>
                <div class="close"></div>
            </div>
        </div>
        `;

        self.wrap.append(html);

        self.gameWrap = self.wrap.find(`.gameWrap[data-tp="${gameType}"]`);
        self.hintPicWrap = self.gameWrap.find('.hintPicWrap');
        self.hintPicWrap.attr('data-step', self.step);

        /* self.wrap.find('.listWrap li').remove();

        self.elements.menuWrap = self.wrap.find('.menuWrap'); */
    };

    this.reset = function () {
        for (let prop in timeoutId) {
            clearTimeout(timeoutId[prop]);
        }
        for (let prop in intervalId) {
            clearTimeout(intervalId[prop]);
        }

        self.step = 1;
        self.oxConArr = new Array(self.stepTotal);
        self.init();
    };

    const addEvent = function () {
    };

    //*--------------------

    const makeComponent = function () {
        // tabContents
        self.tabCon = new tabContents(self.gameWrap.find('.tabWrap'));
        self.tabCon.init();
        self.tabCon.wrap.find('.btnTab').on('click', function () {
            tabConEvent(self.tabCon.tab.eq(self.tabCon.currentTab));
        });
        tabConEvent(self.tabCon.tab.eq(0));

        self.tabCon.btn.addClass('dis');
        self.tabCon.btn.eq(self.step - 1).removeClass('dis');


        // choiceContents
        self.choiceCon = new choiceContents(self.gameWrap, { ans: data.choice });
        self.choiceCon.init();
        self.choiceCon.onClick = function (choice) { };
        self.choiceCon.onCorrect = function () { };
        self.choiceCon.onWrong = function () {
            effectAdo('anschk_x', true);
        };
        self.choiceCon.onComplete = function () {
            self.hintPicWrap.attr('data-step', 'complete');
            effectAdo('clap', true);
        };
        self.choiceCon.onShowAns = function () { };
        self.choiceCon.onReset = function () { };

        self.choiceCon.quizGroup.addClass('dis');
        self.choiceCon.isEffectAdo = false;

        // popup
        self.gameWrap.find('.popup[data-idx="0"]').hide();
        self.gameWrap.find('.gameAnsBtn').off().on('click', function () {
            effectAdo('click');
            adoReset($('#clap'));

            self.gameWrap.find('.popup[data-idx="0"]').show();
        });
        self.gameWrap.find('.popup[data-idx="0"]').find('.close').off().on('click', function () {
            effectAdo('click');
            self.gameWrap.find('.popup[data-idx="0"]').hide();
        });

        self.gameWrap.find('.popup[data-idx="0"]').find('.gameReBtn').off().on('click', function () {
            effectAdo('click');
            adoReset($('#clap'));

            self.reset();
        });
    };

    function tabConEvent(_page) {
        if (typeof (videoCon) !== 'undefined') { videoCon.stop(); }
        if (typeof (resetPopIn) !== 'undefined') { resetPopIn(); }
        if (typeof (resetContentsIn) !== 'undefined') { resetContentsIn(); }

        switch (_page.index()) {
            case 0:
                break;
            case 1:
                break;
            case 2:
                break;
        }

        clearTimeout(timeoutId.autoNextTab);

        self.hintPicWrap.attr('data-step', self.step);

        self.oxCon = new oxContents(_page, { ans: data.ox[self.step - 1] });
        self.oxCon.init();
        self.oxCon.default();
        self.oxCon.onClick = function (ox, oxBtn) { };
        self.oxCon.onCorrect = function () { };
        self.oxCon.onWrong = function () { };
        self.oxCon.onComplete = function () {
            if (self.step === self.stepTotal) {
                self.choiceCon.quizGroup.removeClass('dis');
            }
            else {
                self.step++;

                self.tabCon.btn.addClass('dis');
                let tabNext = self.tabCon.btn.eq(self.step - 1);
                tabNext.removeClass('dis');

                // 자동 넘김
                timeoutId.autoNextTab = setTimeout(function () {
                    tabNext.trigger('click');
                }, 2000);
            }
        };
        self.oxCon.onShowAns = function () { };
        self.oxCon.onReset = function () { };

        self.oxConArr[self.step - 1] = self.oxCon;
    }
};
