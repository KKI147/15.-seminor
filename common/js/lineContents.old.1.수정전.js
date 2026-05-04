/* var GameManager = {
    event: {
        isTouchDevice: 'ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch,
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
        }
    }
}; */



//var ZOOMVALUE = (parent.ZOOMVALUE == undefined) ? 1 : parent.ZOOMVALUE;
var factor = 1;
var isMobile;

var multiLineTimerId = -1;

/**
 * 선잇기 컨텐츠
 * @param {*} wrap lineContents가 생성될 요소
 * @param {string} type lineContents의 타입('line', 'multiline')
 * @param {Object} data 옵션값
 */
var lineContents = function lineContents(wrap, type, data) {
    var self = this;
    this.wrap = wrap;

    type = type || 'line';
    this.type = type;         // 문제 유형
    this.btnConfirm = wrap.find('.ansbtn'); // 정답 확인하기 버튼
    this.btnRe = wrap.find('.rebtn');           // 다시 하기 버튼

    this.nlc = undefined;
    this.nlc1 = undefined;
    this.nlc2 = undefined;
    this.lineConAns = '';              // 선잇기 정답
    this.lineConResult = false;        // 선잇기 정답결과

    this.mlc = undefined;
    this.mlc1 = undefined;
    this.mlc2 = undefined;
    this.multilineConAns = '';         // 중복 선잇기 정답
    this.multilineConResult = false;   // 중복 선잇기 정답결과

    this.onCorrect = undefined;
    this.onWrong = undefined;
    this.onResetAns = undefined;
    this.onShowAns = undefined;

    // 초기화
    this.init = function () {
        self.wrap.attr('data-type', self.type)
        self.btnConfirm.removeClass('re');
        switch (self.type) {
            case 'line':
                self.lineCon();
                break;
            case 'multiLine':
                self.multiLineCon();
                break;
        }

        $('.setContent > li, .pageing > .dot, .prev, .next, .btnTab').on('click', function(){
            switch (self.type) {
                case 'line':
                    self.lineCon();
                    break;
                case 'multiLine':
                    self.multiLineCon();
                    break;
            }

            self.wrap.attr('data-type', self.type);
            self.btnConfirm.removeClass('re');
        });
    };

    // 리셋
    this.reset = function () {
        switch (self.type) {
            case 'line':
                self.lineConReset();
                break;
            case 'multiLine':
                self.multilineConReset();
                break;
        }
    };

    this.lineCon = function () {
        var lineWrap = self.wrap;
        var lineArea = lineWrap.find('.lineArea');
        var leftWrap = lineArea.find('.leftLine');
        var chkBox = leftWrap.find('.clickArea');

        self.makeLineConnector();

        self.nlc.enable();

        // 확인하기 ↔ 다시하기
        self.btnConfirm.off('click').on('click', function () {
            var $this = $(this);

            // 다시 하기
            if ($this.hasClass('re')) {
                $this.removeClass('re');
                ado_stop();
                self.lineConReset();
                self.nlc.enable();
                if (typeof self.onResetAns !== 'undefined') { self.onResetAns(self); }
                return;
            }

            var lineCon_ans = true;
            console.log('연결한 선의 총 개수: ', self.nlc.com());

            // 하나라도 선을 이었음 → 정오답 판단
            let lineAns = [];
            if (self.nlc.com() > 0) {
                for (var i = 0; i < chkBox.length; i++) {
                    var line_ans = chkBox[i].getAttribute('data-line-ans');
                    line_ans = line_ans.split('_');
                    lineAns.push(parseInt(line_ans[1], 10));
                    if (parseInt(line_ans[1], 10) != self.nlc.connections[i]) {
                        lineCon_ans = false;
                    }
                }

                console.log('정답: ', lineAns);
                console.log('좌변이 연결된 우변의 idx값 목록: ', self.nlc.connections);

                // 정답
                if (lineCon_ans) {
                    ado_stop();
                    self.lineConShowAns();
                    self.lineConResult = true;
                    self.nlc.disable();

                    if (typeof self.onCorrect !== 'undefined') { self.onCorrect(self); }
                }
                // 오답
                else {
                    ado_stop();
                    self.lineConShowAns();
                    self.lineConResult = false;
                    self.nlc.disable();
                    if (typeof self.onWrong !== 'undefined') { self.onWrong(self); }
                }
            }
            // 선을 이은것이 없음 → 답보여주기
            else {
                ado_stop();
                self.lineConShowAns();
                self.lineConResult = true;
                self.nlc.disable();

                if(wrapTop.hasClass('math quiz') && $('.setContent > li:last-child').hasClass('on')){
                    $('.finish_btn').addClass('on');
                };

                if (typeof self.onShowAns !== 'undefined') { self.onShowAns(self); }
            }

            // 확인하기 → 다시하기
            if (self.btnRe.length === 0) {
                $this.addClass('re');
            }
        });
    };

    this.makeLineConnector = function () {
        var lineWrap = self.wrap;
        var lineArea = lineWrap.find('.lineArea');
        var leftDots = lineArea.find('.leftLine .dot').get();
        var rightDots = lineArea.find('.rightLine .dot').get();

        // 정답값 모으기
        self.lineConAns = [];
        lineArea.find('.leftLine .leftItem').each(function () {
            self.lineConAns.push($(this).attr('data-line-ans').split('_')[1]);
        });
        self.lineConAns = self.lineConAns.toString();

        lineArea[0].addEventListener('touchmove', function (event) {
            event.preventDefault();
            event.stopPropagation();
        });

        self.nlc = new LineConnector(leftDots, rightDots, data);
        self.nlc.chkConnAns = self.wrap.is('[data-chk-conn-ans]');
        self.nlc.onConnect = function (curIndex, curDot, connDot, isConnAns, connectAll, setRe) {
            if (self.nlc.chkConnAns) {
                // ado_stop();

                setRe = false;

                if (isConnAns === true) {
                    if(connectAll === true){
                        setRe = true;
                        self.btnConfirm.addClass('re');

                        if(wrapTop.hasClass('math quiz') && $('.setContent > li:last-child').hasClass('on')){
                            $('.finish_btn').addClass('on');
                        };
                    }

                    if (typeof self.onCorrect !== 'undefined') { self.onCorrect(curIndex, curDot, connDot, isConnAns, connectAll, setRe); }
                }
                else if (isConnAns === false) {
                    if (typeof self.onWrong !== 'undefined') { self.onWrong(curIndex, curDot, connDot, isConnAns, connectAll, setRe); }
                }
               else {
                    if (typeof self.onConnect !== 'undefined') { self.onConnect(curIndex, curDot, connDot, isConnAns, connectAll, setRe); }
                }
            }
        };
    };

    this.lineConReset = function () {
        var lineWrap = self.wrap;
        var lineArea = lineWrap.find('.lineArea');
        var leftWrap = lineArea.find('.leftLine');
        var chkBox = leftWrap.find('.clickArea');
        var Itembox = lineArea.find('.rightLine').find('.r_item');


        chkBox.find('.line').remove();
        chkBox.removeAttr('data-right-index');
        Itembox.removeAttr('data-left-index');

        self.nlc.enable();
        self.nlc.reset();

        self.makeLineConnector();

        self.btnConfirm.removeClass('re');
    };

    this.lineConShowAns = function () {
        self.nlc.resetLine(true);
        self.nlc.autoDrawLines(self.lineConAns);
    };

    // multi
    this.multiLineCon = function () {
        var lineWrap = self.wrap;
        var lineArea = lineWrap.find('.lineArea');
        var leftWrap = lineArea.find('.leftLine');
        var chkBox = leftWrap.find('.clickArea');

        self.makeMultiLineConnector();


        self.mlc.enable();

        // 확인하기 ↔ 다시하기
        self.btnConfirm.off('click').on('click', function () {
            var $this = $(this);

            // 다시 하기
            if ($this.hasClass('re')) {
                $this.removeClass('re');
                ado_stop();
                // clickAudio();
                self.multilineConReset();

                if (typeof self.onResetAns !== 'undefined') { self.onResetAns(self); }
                return;
            }

            var lineCon_ans = true;


            /*
            self.mlc.connections : 좌변이 연결된 우변의 idx값 목록
            self.mlc.com() : 연결한 선의 총 개수
            */

            // (숫자)오름차순으로 정렬
            self.mlc.connections.forEach(function (value, idx) {
                value = value.sort();
            });

            //console.log('연결한 선의 총 개수: ', self.mlc.com());
            //console.log('좌변이 연결된 우변의 idx값 목록: ', self.mlc.connections);
            // ex) [null, null, 0] : idx가 2인 좌변 점이 idx가 0인 우변 점과 연결됨

            // 하나라도 선을 이었음 → 정오답 판단
            var knAnsTotal = 0;   // 정답의 총 개수
            if (self.mlc.com() > 0) {
                for (var i = 0; i < chkBox.length; i++) {

                    var line_ans = chkBox[i].getAttribute('data-line-ans');

                    // 정답이 1개
                    if (line_ans.indexOf('|') === -1) {
                        knAnsTotal++;

                        line_ans = line_ans.split('_');
                        if (self.mlc.connections[i].indexOf(parseInt(line_ans[1], 10)) === -1) {
                            lineCon_ans = false;
                        }
                    }
                    // 정답이 1개 이상
                    else {
                        line_ans = line_ans.split('|');
                        knAnsTotal += line_ans.length;

                        // connections의 length값이 line_ans값과 다름
                        if (line_ans.length !== self.mlc.connections[i].length) {
                            // console.log('오답: connections의 length값이 line_ans값과 다름');
                            lineCon_ans = false;
                            continue;
                        }

                        // (문자)오름차순으로 정렬
                        line_ans.sort();
                        var line_ans2, k;
                        for (k = 0; k < line_ans.length; ++k) {
                            line_ans2 = line_ans[k].split('_');
                            if (self.mlc.connections[i].indexOf(parseInt(line_ans2[1], 10)) === -1) {
                                lineCon_ans = false;
                            }
                        }
                    }
                }

                // 정답
                if (lineCon_ans && knAnsTotal === self.mlc.com()) {
                    ado_stop();
                    self.multilineConShowAns();
                    self.multilineConResult = true;
                    self.mlc.disable();

                    if (typeof self.onCorrect !== 'undefined') { self.onCorrect(self); }
                }
                // 오답
                else {
                    ado_stop();
                    if (wrap.attr('data-chk-conn-ans') == 'true') {
                        // effectAdo('anschk_o', self.bStopOther);
                    } else {
                        // effectAdo('anschk_x', self.bStopOther);
                    }
                    self.multilineConShowAns();
                    self.multilineConResult = false;
                    self.mlc.disable();
                    if (typeof self.onWrong !== 'undefined') { self.onWrong(self); }
                }
            }
            // 선을 이은것이 없음 → 답보여주기
            else {
                self.multilineConShowAns();
                self.multilineConResult = true;
                self.mlc.disable();

                if(wrapTop.hasClass('math quiz') && $('.setContent > li:last-child').hasClass('on')){
                    $('.finish_btn').addClass('on');
                };

                if (typeof self.onShowAns !== 'undefined') { self.onShowAns(self); }
            }

            // 확인하기 → 다시하기
            if (self.btnRe.length === 0) {
                $this.addClass('re');
            }
        });
    };

    this.makeMultiLineConnector = function () {
        var lineWrap = self.wrap;
        var lineArea = lineWrap.find('.lineArea');
        var leftDots = lineArea.find('.leftLine .dot').get();
        var rightDots = lineArea.find('.rightLine .dot').get();

        // 정답값 모으기
        self.multilineConAns = [];

        var kaAns = [];
        lineArea.find('.leftLine .leftItem').each(function () {

            // 2022-11-22 11:45:58 - 1개 이상의 답 처리
            if ($(this).attr('data-line-ans').indexOf('|') === -1) {
                self.multilineConAns.push($(this).attr('data-line-ans'));
            }
            else {
                kaAns = $(this).attr('data-line-ans').split('|');
                self.multilineConAns = self.multilineConAns.concat(kaAns);
            }
            /////

        });
        self.multilineConAns = self.multilineConAns.toString();

        lineArea[0].addEventListener('touchmove', function (event) {
            event.preventDefault();
            event.stopPropagation();
        });

        self.mlc = new MultiLineConnector(leftDots, rightDots, data);
        self.mlc.chkConnAns = self.wrap.is('[data-chk-conn-ans]');
        self.mlc.se52_1_0500_06 = self.wrap.is('[data-se52_1_0500_06]');
        var knCorrectTotal = 0;
        self.mlc.onConnect = function (curIndex, curDot, connDot, isConnAns, removeDup, setRe) {

            setRe = false;

            if (self.mlc.chkConnAns) {
                ado_stop();

                if (isConnAns === true && removeDup === false) {
                    knCorrectTotal++;

                    if (knCorrectTotal == self.multilineConAns.split(',').length) {
                        setRe = true
                        self.btnConfirm.addClass('re');
                        if(wrapTop.hasClass('math quiz') && $('.setContent > li:last-child').hasClass('on')){
                            $('.finish_btn').addClass('on');
                        };
                    }

                    if (typeof self.onCorrect !== 'undefined') { self.onCorrect(curIndex, curDot, connDot, isConnAns, removeDup, setRe); }
                }
                else if (isConnAns === false) {

                    if (typeof self.onWrong !== 'undefined') { self.onWrong(curIndex, curDot, connDot, isConnAns, removeDup, setRe); }
                }
                else {
                    if (typeof self.onConnect !== 'undefined') { self.onConnect(curIndex, curDot, connDot, isConnAns, removeDup, setRe); }
                }
            }

            lineWrap.find('.rebtn').removeClass('dis');
        };
    };

    this.multilineConReset = function () {
        var lineWrap = self.wrap;
        var lineArea = lineWrap.find('.lineArea');
        var leftWrap = lineArea.find('.leftLine');
        var chkBox = leftWrap.find('.clickArea');
        var Itembox = lineArea.find('.rightLine').find('.r_item');

        lineCon_ans = true;

        chkBox.find('.line').remove();
        chkBox.removeAttr('data-right-index');
        Itembox.removeAttr('data-left-index');

        self.mlc.enable();
        self.mlc.reset();

        self.makeMultiLineConnector();

        self.btnConfirm.removeClass('re');
    };

    this.multilineConShowAns = function () {
        self.mlc.resetLine(true);
        self.mlc.autoDrawLines(self.multilineConAns);
    };
};


// 선긋기(기본)
(function () {

    var lineq = LineConnector.prototype;

    function LineConnector(leftItems, rightItems, option) {
        getScale();
        this.leftItems = leftItems;
        this.rightItems = rightItems;

        this.connections = [];
        this.lConnections = [];
        this.rConnections = [];

        this.enabled = true;
        this.compledted = false;

        this.colorLine = '#5CA9D0'; // 선잇기 색상
        this.colorAns = '#D1202D';  // 정답선 색상

        this.strokeWidthLine = 5;     // 선잇기 굵기
        this.strokeWidthAns = 8;      // 정답선 굵기

        if(wrapTop.hasClass('math')){
            this.colorLine = '#c1272d';
        }

        if(wrapTop.hasClass('kor')){
            this.colorAns = '#ff261f';
        }

        this.option = {};
        if (typeof (option) !== 'undefined') {
            this.option = option;
            if (this.option.colorLine) { this.colorLine = this.option.colorLine; }
            if (this.option.colorAns) { this.colorAns = this.option.colorAns; }

            if (this.option.strokeWidthLine) { this.strokeWidthLine = this.option.strokeWidthLine; }
            if (this.option.strokeWidthAns) { this.strokeWidthAns = this.option.strokeWidthAns; }
            // console.log(this.option);
        }

        this.chkConnAns = false;    // 연결하자마자 정답을 맞출지 여부 확인

        this.svg;
        this.createSVG();
        this.svgCreated = true;
        this.setHandler();
    }

    lineq.setHandler = function () {
        var self = this;

        var lineCon = $('[data-type="line"]').find('.lineArea');

        var moving = false;

        lineCon.on('dragstart selectstart', function (e) {
            return false;
        });

        lineCon.off(moveEvent).on(moveEvent, function (e) {
            e.preventDefault();
            e.stopPropagation();
        });

        for (var i = 0; i < self.leftItems.length; i++) {
            var leftItem = self.leftItems[i];
            leftItem.ondragstart = function () {
                return false;
            };

            var mx, my;
            $(leftItem).off(downEvent).on(downEvent, function (e) {
                var $this = $(this);
                getScale();
                mx = isMobile ? e.originalEvent.touches[0].pageX : e.pageX;
                my = isMobile ? e.originalEvent.touches[0].pageY : e.pageY;

                self.mouseX = (mx - wrapTop.offset().left) / factor;
                self.mouseY = (my - wrapTop.offset().top) / factor;

                self.curItem = this;
                self.pressed = true;
                if (!self.svgCreated) {
                    getScale();
                    self.createSVG();
                    self.svgCreated = true;
                }

                var curIndex = self.leftItems.indexOf(self.curItem);

                self.connections[curIndex] = undefined;
                // for (var i in self.rConnections) {
                //     if (self.rConnections[i] == curIndex) {
                //         var line = self.rLines[i];
                //         self.updateLine(line, self.rightItems[i].ox, self.rightItems[i].oy);
                //         self.rConnections[i] = undefined;
                //     }
                // }

                moving = false;

                $(lineCon).off(moveEvent).on(moveEvent, function (e) {
                    if (!self.pressed) return;
                    e.preventDefault();
                    e.stopPropagation();

                    getScale();
                    mx = isMobile ? e.originalEvent.touches[0].pageX : e.pageX;
                    my = isMobile ? e.originalEvent.touches[0].pageY : e.pageY;
                    self.mouseX = (mx - wrapTop.offset().left) / factor;
                    self.mouseY = (my - wrapTop.offset().top) / factor;

                    var line = self.lLines[curIndex];
                    self.updateLine(line, self.mouseX, self.mouseY);

                    for (var i in self.rConnections) {
                        if (self.rConnections[i] == curIndex) {
                            var line = self.rLines[i];
                            self.updateLine(line, self.rightItems[i].ox, self.rightItems[i].oy);
                            self.rConnections[i] = undefined;
                        }
                    }

                    moving = true;
                });


                $(document).off(upEvent).on(upEvent, function (e) {
                    $(lineCon).off(moveEvent);
                    $(document).off(upEvent);
                    if (!self.pressed) return;
                    if (!moving) return;
                    self.pressed = false;
                    getScale();
                    var rightItem = self.lHitTest(self.mouseX, self.mouseY);
                    var linevalue = $(self.svg).parents('.lineArea').find('textarea[data-type=linevalue]');
                    var tx, ty;


                    //-----------------------------------
                    // 2023-08-08 16:45:01 - JGY
                    // 넘어가는선 방지
                    var cline = true;
                    if ($this.attr('data-cline')) {
                        if ($this.attr('data-cline').indexOf(self.rightItems.indexOf(rightItem)) >= 0) {
                            cline = true;
                        } else {
                            cline = false;
                        }
                    }

                    var conn_x = false;
                    if ($this.parent().attr('data-conn-line') !== undefined) {
                        var ts_conn = $(rightItem).parent().attr('data-conn-line');
                        if ($this.parent().attr('data-conn-line') !== ts_conn) conn_x = true;
                    }

                    //if (rightItem && cline) {
                    if (rightItem && cline && !conn_x) {
                        //-----------------------------------
                        // 연결하자마자 정오답 체크
                        if (self.chkConnAns) {
                            var ans = $this.parent().attr('data-line-ans').split('_');
                            var li = Number(ans[1])
                            var ri = $(rightItem).parent().index();
                            if(li !== ri){
                                tx = self.curItem.ox;
                                ty = self.curItem.oy;

                                self.lConnections[curIndex] = undefined;

                                var line = self.lLines[curIndex];
                                self.updateLine(line, tx, ty);


                                if (self.onConnect) self.onConnect(curIndex, self.curItem, rightItem, false, false);
                                return;
                            }
                        }
                        tx = ($(rightItem).offset().left - wrapTop.offset().left) / factor + $(rightItem).width() / 2;
                        ty = ($(rightItem).offset().top - wrapTop.offset().top) / factor + $(rightItem).height() / 2;

                        //중복선 제거
                        var l = self.lConnections.indexOf(self.rightItems.indexOf(rightItem));
                        if (l >= 0) {
                            var ll = $(rightItem).parents('.lineArea').find('#leftItem' + l)[0];
                            self.lConnections[l] = undefined;
                            self.updateLine(ll, self.leftItems[l].ox, self.leftItems[l].oy);
                            self.connections[l] = undefined; //0130
                        }
                        //0211
                        var rightIndex = self.rightItems.indexOf(rightItem);
                        if (self.connections.indexOf(rightIndex) > -1) {
                            self.connections[self.connections.indexOf(rightIndex)] = undefined;
                        }
                        //
                        self.lConnections[curIndex] = self.rightItems.indexOf(rightItem); //연결 확인용
                        self.connections[curIndex] = self.rightItems.indexOf(rightItem); //정답확인용

                        //기존선 없애기
                        var line = self.rLines[rightIndex];
                        self.updateLine(line, self.rightItems[rightIndex].ox, self.rightItems[rightIndex].oy);
                        self.rConnections[rightIndex] = undefined;

                        var connectAll = false;
                        if (self.onConnect) {
                            if (self.chkConnAns) {
                                var arrChk = false;
                                var cnt = 0;
                                self.connections.forEach(function(el, index){
                                    if(typeof el == 'number'){
                                        cnt++;
                                    }
                                    if(cnt == self.connections.length){
                                        arrChk = true;
                                    }
                                });
                                if(arrChk == true && self.connections.length == self.leftItems.length){
                                    connectAll = true;

                                }
                                self.onConnect(curIndex, self.curItem, rightItem, true, connectAll);
                            }
                            else {
                                self.onConnect(curIndex, self.curItem, rightItem, undefined, connectAll);
                            }
                        };
                    } else {
                        tx = self.curItem.ox;
                        ty = self.curItem.oy;
                        self.lConnections[curIndex] = undefined;
                        self.connections[curIndex] = undefined;
                    }
                    var line = self.lLines[curIndex];
                    self.updateLine(line, tx, ty);
                    if (self.onConnect) self.onConnect(self.curItem, rightItem);
                    if (linevalue.length > 0) linevalue.val(self.connections);
                });
            });

        }

        for (var i = 0; i < self.rightItems.length; i++) {
            var rightItem = self.rightItems[i];
            rightItem.ondragstart = function () {
                return false;
            };

            var mx, my;

            $(rightItem).off(downEvent).on(downEvent, function (e) {
                getScale();
                var $this = $(this);
                mx = isMobile ? e.originalEvent.touches[0].pageX : e.pageX;
                my = isMobile ? e.originalEvent.touches[0].pageY : e.pageY;


                // 2022-11-16 09:55:52 - JGY
                /* self.mouseX = mx / factor;
                self.mouseY = my / factor; */
                self.mouseX = (mx - wrapTop.offset().left) / factor;
                self.mouseY = (my - wrapTop.offset().top) / factor;


                self.curItem = this;
                self.pressed = true;
                if (!self.svgCreated) {
                    getScale();
                    self.createSVG();
                    self.svgCreated = true;
                }

                var curIndex = self.rightItems.indexOf(self.curItem);
                if (self.connections.indexOf(curIndex) > -1) self.connections[self.connections.indexOf(curIndex)] = undefined; //0130
                // for (var i in self.lConnections) {
                //     if (self.lConnections[i] == curIndex) {
                //         var line = self.lLines[i];
                //         self.updateLine(line, self.leftItems[i].ox, self.leftItems[i].oy);
                //         self.lConnections[i] = undefined;
                //     }
                // }

                moving = false;

                $(lineCon).off(moveEvent).on(moveEvent, function (e) {
                    if (!self.pressed) return;
                    e.preventDefault();
                    e.stopPropagation();

                    // 2022-11-15 18:40:52 - JGY
                    /* mx = isMobile ? e.originalEvent.touches[0].pageX : e.pageX;
                    my = isMobile ? e.originalEvent.touches[0].pageY : e.pageY;
                    self.mouseX = mx / factor;
                    self.mouseY = my / factor; */
                    getScale();
                    mx = isMobile ? e.originalEvent.touches[0].pageX : e.pageX;
                    my = isMobile ? e.originalEvent.touches[0].pageY : e.pageY;
                    self.mouseX = (mx - wrapTop.offset().left) / factor;
                    self.mouseY = (my - wrapTop.offset().top) / factor;


                    var curIndex = self.rightItems.indexOf(self.curItem);
                    var line = self.rLines[curIndex];
                    self.updateLine(line, self.mouseX, self.mouseY);

                    for (var i in self.lConnections) {
                        if (self.lConnections[i] == curIndex) {
                            var line = self.lLines[i];
                            self.updateLine(line, self.leftItems[i].ox, self.leftItems[i].oy);
                            self.lConnections[i] = undefined;
                        }
                    }

                    moving = true;
                });


                $(document).off(upEvent).on(upEvent, function (e) {
                    $(lineCon).off(moveEvent);
                    $(document).off(upEvent);
                    if (!self.pressed) return;
                    if (!moving) return;
                    self.pressed = false;
                    getScale();
                    var leftItem = self.rHitTest(self.mouseX, self.mouseY);
                    var linevalue = $(self.svg).parents('.lineArea').find('textarea[data-type=linevalue]');

                    var tx, ty;

                    //-----------------------------------
                    // 2023-08-08 16:50:10 - JGY
                    // 넘어가는선 방지
                    var cline = true;
                    if ($this.attr('data-cline')) {
                        if ($this.attr('data-cline').indexOf(self.leftItems.indexOf(leftItem)) >= 0) {
                            cline = true;
                        } else {
                            cline = false;
                        }
                    }

                    var conn_x = false;
                    if ($this.parent().attr('data-conn-line') !== undefined) {
                        var ts_conn = $(leftItem).parent().attr('data-conn-line');
                        if ($this.parent().attr('data-conn-line') !== ts_conn) conn_x = true;
                    }

                    // if (leftItem && cline) {
                    if (leftItem && cline && !conn_x) {
                        //-----------------------------------

                        // 연결하자마자 정오답 체크
                        if (self.chkConnAns) {
                            var ans = $(leftItem).parent().attr('data-line-ans').split('_');
                            var li = Number(ans[1])
                            var ri = $this.parent().index();
                            if(ri !== li){
                                tx = self.curItem.ox;
                                ty = self.curItem.oy;

                                self.rConnections[curIndex] = undefined;

                                var line = self.rLines[curIndex];
                                self.updateLine(line, tx, ty);

                                if (self.onConnect) self.onConnect(curIndex, self.curItem, rightItem, false, false);
                                return;
                            }
                        }
                        tx = ($(leftItem).offset().left - wrapTop.offset().left) / factor + $(leftItem).width() / 2;
                        ty = ($(leftItem).offset().top - wrapTop.offset().top) / factor + $(leftItem).height() / 2;

                        //중복선 제거
                        var r = self.rConnections.indexOf(self.leftItems.indexOf(leftItem));
                        if (r >= 0) {
                            var rr = $(leftItem).parents('.lineArea').find('#rightItem' + r)[0];
                            self.rConnections[r] = undefined;
                            self.updateLine(rr, self.rightItems[r].ox, self.rightItems[r].oy);
                        }

                        if (self.leftItems.indexOf(leftItem) > -1) {
                            self.connections[self.leftItems.indexOf(leftItem)] = undefined;
                        }

                        self.rConnections[curIndex] = self.leftItems.indexOf(leftItem);
                        self.connections[self.leftItems.indexOf(leftItem)] = curIndex //정답확인용
                        //기존선 없애기
                        var leftIndex = self.leftItems.indexOf(leftItem);
                        var line = self.lLines[leftIndex];
                        self.updateLine(line, self.leftItems[leftIndex].ox, self.leftItems[leftIndex].oy);
                        self.lConnections[leftIndex] = undefined;

                        var connectAll = false;
                        if (self.onConnect) {
                            if (self.chkConnAns) {
                                var arrChk = false;
                                var cnt = 0;
                                self.connections.forEach(function(el, index){
                                    if(typeof el == 'number'){
                                        cnt++;
                                    }
                                    if(cnt == self.connections.length){
                                        arrChk = true;
                                    }
                                });
                                if(arrChk == true && self.connections.length == self.leftItems.length){
                                    connectAll = true;

                                }
                                self.onConnect(curIndex, self.curItem, rightItem, true, connectAll);
                            }
                            else {
                                self.onConnect(curIndex, self.curItem, rightItem, undefined, connectAll);
                            }
                        };
                    } else {
                        tx = self.curItem.ox;
                        ty = self.curItem.oy;
                        self.rConnections[curIndex] = undefined;
                        self.connections[self.connections.indexOf(curIndex)] = undefined;
                    }
                    var line = self.rLines[curIndex];
                    self.updateLine(line, tx, ty);
                    if (self.onConnect) self.onConnect(self.curItem, leftItem);
                    if (linevalue.length > 0) linevalue.val(self.connections);
                });
            });

        }
    }

    // <line/> 초기화
    lineq.resetLine = function (pbIsAns) {
        if (!this.lines) return;

        var ksLineColor = this.colorLine;
        if (pbIsAns) {
            ksLineColor = this.colorAns;
        }

        var self = this;
        for (var i = 0; i < this.leftItems.length; i++) {
            var item = this.leftItems[i];
            var line = this.lLines[i];
            this.updateLine(line, item.ox, item.oy, ksLineColor);
        }

        for (var i = 0; i < this.rightItems.length; i++) {
            var item = this.rightItems[i];
            var line = this.rLines[i];
            this.updateLine(line, item.ox, item.oy, ksLineColor);
        }
    }

    lineq.reset = function () {
        if (!this.lines) return;
        this.resetLine();

        // <line/> 지우기
        var self = this;
        $(self.svg).find('line').each(function () {
            if (
                $(this).parent()[0] == self.svg &&
                (
                    $(this).attr('stroke') == self.colorLine ||
                    $(this).attr('stroke') == self.colorAns
                ) &&
                $(this).attr('id') !== 'correctItem') {
                $(this).remove();
            }
        });

        this.connections = [];
        this.lConnections = [];
        this.rConnections = [];
    }

    lineq.createSVG = function () {
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', "svg");
        $(this.svg).attr("xmlns", "http://www.w3.org/2000/svg");
        $(this.svg).attr("width", wrapW);
        $(this.svg).attr("height", wrapH);
        $(this.svg).css("position", "absolute");
        $(this.svg).css("pointer-events", "none");

        this.lines = [];
        this.lLines = [];
        this.rLines = [];
        for (var i = 0; i < this.leftItems.length; i++) {
            var item = this.leftItems[i];

            item.ox = ($(item).offset().left - wrapTop.offset().left) / factor + $(item).width() / 2;
            item.oy = ($(item).offset().top - wrapTop.offset().top) / factor + $(item).height() / 2;

            var line = this.createLine(item.ox, item.oy, item.ox, item.oy, this.colorLine, 5, 'leftItem' + i);
            this.lines.push(line);
            this.lLines.push(line);
            this.svg.appendChild(line);
        }

        for (var i = 0; i < this.rightItems.length; i++) {
            var item = this.rightItems[i];

            item.ox = ($(item).offset().left - wrapTop.offset().left) / factor + $(item).width() / 2;
            item.oy = ($(item).offset().top - wrapTop.offset().top) / factor + $(item).height() / 2;

            var line = this.createLine(item.ox, item.oy, item.ox, item.oy, this.colorLine, 5, 'rightItem' + i);
            this.lines.push(line);
            this.rLines.push(line);
            this.svg.appendChild(line);
        }

        $(this.leftItems[0]).parent().find('svg').remove();

        $(this.svg).insertBefore(this.leftItems[0]);

        var offset = $(this.svg).parent().parent().position(); // .leftLine, .rightLine

        $(this.svg).css({
            left: -offset.left / factor,
            top: -offset.top / factor
        });

        // 기존 선 그리기
        /* var linevalue = $(this.svg).parents('.lineArea').find('textarea[data-type=linevalue]');
        if(linevalue.length > 0){
            var ans = linevalue.val().split(',');
            for(var i = 0;i<ans.length;i++){
                if(ans[i] !== ''){
                    var num = Number(ans[i]);
                }else{
                    var num = '';
                }
                this.connections.push(num);
                this.lConnections.push(num);
                this.rConnections.push(num);
            }
            for(var j = 0; j < ans.length; j++){
                if(ans[j]){
                    var line = this.lLines[j];
                    this.updateLine(line, this.rightItems[ans[j]].ox, this.rightItems[ans[j]].oy)
                }
            }
        } */
    };

    // '기존 선 그리기' → 정답 그리기
    lineq.autoDrawLines = function (linevalue) {
        var ans = linevalue.split(',');
        for (var i = 0; i < ans.length; i++) {
            if (ans[i] !== '') {
                var num = Number(ans[i]);
            } else {
                var num = '';
            }
            this.connections.push(num);
            this.lConnections.push(num);
            this.rConnections.push(num);
        }

        for (var j = 0; j < ans.length; j++) {
            if (ans[j]) {
                var line = this.lLines[j];

                line.setAttribute('stroke-width', this.strokeWidthAns);

                this.updateLine(line, this.rightItems[ans[j]].ox, this.rightItems[ans[j]].oy, this.colorAns);
            }
        }
    };

    lineq.createLine = function (x1, y1, x2, y2, color, w, id) {
        var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', w);
        line.setAttribute('id', id);
        return line;
    };

    lineq.updateLine = function (line, tx, ty, color) {
        line.setAttribute('x2', tx);
        line.setAttribute('y2', ty);

        if (color != undefined) {

            line.setAttribute("stroke", color);
        }
    }


    // 2022-11-15 18:45:39 - JGY
    /* lineq.lHitTest = function(x, y) {

        for (var i = 0; i < this.rightItems.length; i++) {
            var item = this.rightItems[i];
            var rect = item.getBoundingClientRect();

            var top = rect.top + document.documentElement.scrollTop;
            var bottom = rect.bottom + document.documentElement.scrollTop;

            if (x > rect.left / factor && x < rect.right / factor && y > top / factor && y < bottom / factor) {
                return item;
            }
        }

        return null;
    }

    lineq.rHitTest = function(x, y) {

        for (var i = 0; i < this.leftItems.length; i++) {
            var item = this.leftItems[i];
            var rect = item.getBoundingClientRect();

            var top = rect.top + document.documentElement.scrollTop;
            var bottom = rect.bottom + document.documentElement.scrollTop;

            if (x > rect.left / factor && x < rect.right / factor && y > top / factor && y < bottom / factor) {
                return item;
            }
        }

        return null;
    } */

    lineq.lHitTest = function (x, y) {
        for (var i = 0; i < this.rightItems.length; i++) {
            var item = this.rightItems[i];
            var rect = item.getBoundingClientRect();
            var top = rect.top - wrapTop.offset().top;
            var bottom = rect.bottom - wrapTop.offset().top;
            var left = rect.left - wrapTop.offset().left;
            var right = rect.right - wrapTop.offset().left;
            if (x > left / factor && x < right / factor && y > top / factor && y < bottom / factor) {
                return item;
            }

        }


        return null;
    }

    lineq.rHitTest = function (x, y) {

        for (var i = 0; i < this.leftItems.length; i++) {
            var item = this.leftItems[i];
            var rect = item.getBoundingClientRect();

            var top = rect.top - wrapTop.offset().top;
            var bottom = rect.bottom - wrapTop.offset().top;
            var left = rect.left - wrapTop.offset().left;
            var right = rect.right - wrapTop.offset().left;

            if (x > left / factor && x < right / factor && y > top / factor && y < bottom / factor) {
                return item;
            }
        }

        return null;
    }

    lineq.enable = function () {
        this.enabled = true;

        for (var i = 0; i < this.leftItems.length; i++) {
            $(this.leftItems[i]).css({
                pointerEvents: "all"
            });
        }

        for (var i = 0; i < this.rightItems.length; i++) {
            $(this.rightItems[i]).css({
                pointerEvents: "all"
            });
        }

    }

    lineq.com = function () {
        var cl = 0;
        for (var i in this.lines) {
            if (this.lines[i].x1.baseVal.value !== this.lines[i].x2.baseVal.value || this.lines[i].y1.baseVal.value !== this.lines[i].y2.baseVal.value) {
                cl++
            }
        }

        return cl;
    }

    lineq.disable = function () {
        this.enabled = false;

        for (var i = 0; i < this.leftItems.length; i++) {
            $(this.leftItems[i]).css({
                pointerEvents: "none"
            });
        }

        for (var i = 0; i < this.rightItems.length; i++) {
            $(this.rightItems[i]).css({
                pointerEvents: "none"
            });
        }

    }

    // [{targetIndex:index, lineColor:"color"}, ....]
    lineq.drawLines = function (settings) {

        if (!this.lines) {
            getScale();
            this.createSVG();
        }

        for (var i = 0; i < settings.length; i++) {

            var setting = settings[i];
            var leftItem = this.leftItems[setting.LIndex];
            var rightItem = this.rightItems[setting.RIndex];

            var lx = $(leftItem).offset().left / factor + $(leftItem).width() / 2;
            var ly = $(leftItem).offset().top / factor + $(leftItem).height() / 2;
            var rx = $(rightItem).offset().left / factor + $(rightItem).width() / 2;
            var ry = $(rightItem).offset().top / factor + $(rightItem).height() / 2;
            var line = this.createLine(lx, ly, rx, ry, setting.color, 4, setting.id);
            this.svg.appendChild(line);

        }
    }

    lineq.removRedLine = function () {
        var self = this;

        // 2022-11-16 09:27:35 - JGY
        /* $('line').each(function() {
            if ($(this).parent()[0] == self.svg && $(this).attr('stroke') == 'red') $(this).remove();
        }); */
        $(self.svg).find('line').each(function () {
            if ($(this).parent()[0] == self.svg && $(this).attr('stroke') == 'red' && $(this).attr('id') !== 'correctItem') $(this).remove();
        });
    }

    window.LineConnector = LineConnector;
})();


// 선긋기(멀티)
(function () {

    var p = MultiLineConnector.prototype;

    function MultiLineConnector(leftItems, rightItems, option) {
        getScale();
        this.leftItems = leftItems;
        this.rightItems = rightItems;

        var self = this;
        this.connections = new Array(this.leftItems.length);
        this.leftItems.forEach(function (value, idx) {
            self.connections[idx] = [];
        });

        this.lConnections = [];
        this.rConnections = [];

        this.enabled = true;
        this.compledted = false;

        this.colorLine = '#5CA9D0'; // 선잇기 색상
        this.colorAns = '#D1202D';  // 정답선 색상

        this.strokeWidthLine = 5;     // 선잇기 굵기
        this.strokeWidthAns = 8;      // 정답선 굵기

        if (wrapTop.hasClass('math')) {
            this.colorLine = '#c1272d';
        }

        if(wrapTop.hasClass('kor')){
            this.colorAns = '#ff261f';
        }

        this.option = {};
        if (typeof (option) !== 'undefined') {
            this.option = option;
            if (this.option.colorLine) { this.colorLine = this.option.colorLine; }
            if (this.option.colorAns) { this.colorAns = this.option.colorAns; }

            if (this.option.strokeWidthLine) { this.strokeWidthLine = this.option.strokeWidthLine; }
            if (this.option.strokeWidthAns) { this.strokeWidthAns = this.option.strokeWidthAns; }
            // console.log(this.option);
        }

        this.chkConnAns = false;    // 연결하자마자 정오답을 체크할지 여부
        this.se52_1_0500_06 = false;    // se52_1_0500_06페이지인지 여부

        this.svg;
        this.createSVG();
        this.svgCreated = true;
        this.setHandler();
    }

    p.setHandler = function () {
        var self = this;

        var lineCon = $('[data-type="multiLine"]').find('.lineArea');

        var moving = false;

        lineCon.on('dragstart selectstart', function (e) {
            return false;
        });

        lineCon.parent().off(moveEvent).on(moveEvent, function (e) {
            e.preventDefault();
            e.stopPropagation();
        });

        for (var i = 0; i < self.leftItems.length; i++) {
            var leftItem = self.leftItems[i];
            leftItem.ondragstart = function () {
                return false;
            };

            var mx, my;
            $(leftItem).off(downEvent).on(downEvent, function (e) {
                var $this = $(this);
                getScale();
                mx = isMobile ? e.originalEvent.touches[0].pageX : e.pageX;
                my = isMobile ? e.originalEvent.touches[0].pageY : e.pageY;

                self.mouseX = (mx - wrapTop.offset().left) / factor;
                self.mouseY = (my - wrapTop.offset().top) / factor;

                self.curItem = this;
                self.pressed = true;
                if (!self.svgCreated) {
                    getScale();
                    self.createSVG();
                    self.svgCreated = true;
                }

                var curIndex = self.leftItems.indexOf(self.curItem);

                var item = $(this);

                this.ox = (item.offset().left - wrapTop.offset().left) / factor + item.width() / 2;
                this.oy = (item.offset().top - wrapTop.offset().top) / factor + item.height() / 2;

                var line = self.createLine(this.ox, this.oy, this.ox, this.oy, self.colorLine, self.strokeWidthLine);
                line.setAttribute('li', curIndex);
                self.lines.push(line);
                self.svg.appendChild(line);

                moving = false;

                $(lineCon).off(moveEvent).on(moveEvent, function (e) {
                    if (!self.pressed) return;
                    e.preventDefault();
                    e.stopPropagation();

                    getScale();
                    mx = isMobile ? e.originalEvent.touches[0].pageX : e.pageX;
                    my = isMobile ? e.originalEvent.touches[0].pageY : e.pageY;
                    self.mouseX = (mx - wrapTop.offset().left) / factor;
                    self.mouseY = (my - wrapTop.offset().top) / factor;

                    self.updateLine(line, self.mouseX, self.mouseY);

                    moving = true;
                });


                $(document).off(upEvent).on(upEvent, function (e) {
                    $(lineCon).off(moveEvent);
                    $(document).off(upEvent);
                    if (!self.pressed) return;
                    self.pressed = false;
                    var rightItem = self.lHitTest(self.mouseX, self.mouseY);
                    var linevalue = $(self.svg).parents('.lineArea').find('textarea[data-type=linevalue]');
                    var tx, ty;

                    //-----------------------------------
                    // 2023-08-08 16:45:01 - JGY
                    // 넘어가는선 방지
                    /* var cline = true;
                    if ($this.attr('data-cline')) {
                        if ($this.attr('data-cline').indexOf(self.rightItems.indexOf(rightItem)) >= 0) {
                            cline = true;
                        } else {
                            cline = false;
                        }
                    } */

                    var conn_x = false;
                    if ($this.parent().attr('data-conn-line') !== undefined) {
                        var ts_conn = $(rightItem).parent().attr('data-conn-line');
                        if ($this.parent().attr('data-conn-line') !== ts_conn) conn_x = true;
                    }

                    // if (rightItem) {
                    if (rightItem && !conn_x) {
                        //-----------------------------------

                        // 연결하자마자 정오답 체크
                        if (self.chkConnAns) {

                            // 두 .dot 거리가 1이하 라면(=위치가 같다면)
                            const left = $(item[0]);
                            const right = $(rightItem);
                            const isSame = self.sameTest(left, right);
                            if (isSame) {
                                console.log('same L → R!');
                                $(line).remove();
                                return;
                            }

                            // 정답으로 이어진 선이 먼저 있다면,
                            if (self.se52_1_0500_06) {
                                console.log('se52_1_0500_06', self.se52_1_0500_06);
                                const lIdx = curIndex;
                                const rIdx = self.rightItems.indexOf(rightItem);
                                const ltoRLine = $(`line[li="${lIdx}"][ri="${rIdx}"]`);
                                const rtoLLine = $(`line[li="${rIdx}"][ri="${lIdx}"]`);

                                // if (ltoRLine.length > 0 || rtoLLine.length > 0) {
                                //     console.log('before connected line! L → R');
                                //     $(line).remove();
                                //     return;
                                // }

                                if (ltoRLine.length > 0) {
                                    console.log('before connected line! L → R');
                                    $(line).remove();
                                    return;
                                }
                            }

                            var kaAns = item.parent().attr('data-line-ans').split('|');
                            var knCheckIdx = $(rightItem).parent().index();
                            var kbIsCorrect = false;
                            kaAns.forEach(function (ans, idx) {
                                var knAnsIdx = parseInt(ans.split('_')[1], 10);
                                if (knAnsIdx === knCheckIdx) {
                                    kbIsCorrect = true;
                                    return false;
                                }
                            });

                            // 정답이 아니라면, 선 지우기
                            if (!kbIsCorrect) {

                                tx = self.curItem.ox;
                                ty = self.curItem.oy;

                                self.lConnections[curIndex] = undefined;

                                $(line).remove();

                                if (self.onConnect) self.onConnect(curIndex, self.curItem, rightItem, false);
                                return;
                            }
                        }

                        tx = ($(rightItem).offset().left - wrapTop.offset().left) / factor + $(rightItem).width() / 2;
                        ty = ($(rightItem).offset().top - wrapTop.offset().top) / factor + $(rightItem).height() / 2;

                        self.lConnections[curIndex] = self.rightItems.indexOf(rightItem); //연결 확인용

                        //정답확인용
                        var knIdxLeft = curIndex;
                        var knIdxRight = self.rightItems.indexOf(rightItem);
                        if (self.connections[knIdxLeft].indexOf(knIdxRight) === -1) {
                            self.connections[knIdxLeft].push(knIdxRight);
                        }
                        //console.log('L → R:\n', JSON.stringify(self.connections, '', 4));

                        let removeDup = false;  // 기존의 정답과 연결된 선을 삭제했느지 여부
                        if ($('line[li = "' + curIndex + '"][ri = "' + self.rightItems.indexOf(rightItem) + '"]').length > 0) {
                            $('line[li = "' + curIndex + '"][ri = "' + self.rightItems.indexOf(rightItem) + '"]').remove();
                            removeDup = true;
                        }

                        // 현재 연결선을 제외한, ri와 연결된선 모두 삭제
                        if (self.Mode == 'line') {
                            $('line').each(function () {
                                if (parseInt($(this).attr('li')) === curIndex && $(this)[0] != line) {

                                    // <line/>참조를 배열에서 삭제
                                    if (self.lines.indexOf(this) > -1) {
                                        self.lines.splice(self.lines.indexOf(this), 1);
                                    }

                                    // <line/>삭제
                                    $(this).remove();
                                }
                            });
                        }

                        line.setAttribute('ri', self.rightItems.indexOf(rightItem));
                        self.updateLine(line, tx, ty);
                        var lva = [];
                        $('line').each(function () {
                            var l = $(this).attr('li');
                            var r = $(this).attr('ri');
                            var lv = l + '_' + r;
                            lva.push(lv);
                        });
                        if (linevalue.length > 0) linevalue.val(lva);

                        if (self.onConnect) {
                            if (self.chkConnAns) {
                                self.onConnect(curIndex, self.curItem, rightItem, true, removeDup);
                            }
                            else {
                                self.onConnect(curIndex, self.curItem, rightItem, undefined, removeDup);
                            }
                        }

                    } else {
                        tx = self.curItem.ox;
                        ty = self.curItem.oy;

                        self.lConnections[curIndex] = undefined;
                        //self.connections[curIndex] = undefined;

                        self.lines.pop(line);
                        $(line).remove();
                    }
                });
            });

        }


        for (var i = 0; i < self.rightItems.length; i++) {
            var rightItem = self.rightItems[i];
            rightItem.ondragstart = function () {
                return false;
            };

            var mx, my;

            $(rightItem).off(downEvent).on(downEvent, function (e) {
                var $this = $(this);
                getScale();
                mx = isMobile ? e.originalEvent.touches[0].pageX : e.pageX;
                my = isMobile ? e.originalEvent.touches[0].pageY : e.pageY;

                self.mouseX = (mx - wrapTop.offset().left) / factor;
                self.mouseY = (my - wrapTop.offset().top) / factor;

                self.curItem = this;
                self.pressed = true;
                if (!self.svgCreated) {
                    getScale();
                    self.createSVG();
                    self.svgCreated = true;
                }

                var curIndex = self.rightItems.indexOf(self.curItem);
                var item = $(this);

                // 2022-11-16 10:17:57
                /*
                this.ox = item.offset().left / factor + item.width() / 2;
                this.oy = item.offset().top / factor + item.height() / 2;
                */
                this.ox = (item.offset().left - wrapTop.offset().left) / factor + item.width() / 2;
                this.oy = (item.offset().top - wrapTop.offset().top) / factor + item.height() / 2;

                var line = self.createLine(this.ox, this.oy, this.ox, this.oy, self.colorLine, self.strokeWidthLine);
                line.setAttribute('ri', curIndex);

                self.lines.push(line);
                self.svg.appendChild(line);

                moving = false;

                $(lineCon).off(moveEvent).on(moveEvent, function (e) {
                    if (!self.pressed) return;
                    e.preventDefault();
                    e.stopPropagation();

                    getScale();
                    mx = isMobile ? e.originalEvent.touches[0].pageX : e.pageX;
                    my = isMobile ? e.originalEvent.touches[0].pageY : e.pageY;
                    self.mouseX = (mx - wrapTop.offset().left) / factor;
                    self.mouseY = (my - wrapTop.offset().top) / factor;

                    self.updateLine(line, self.mouseX, self.mouseY);

                    moving = true;
                });


                $(document).off(upEvent).on(upEvent, function (e) {
                    $(lineCon).off(moveEvent);
                    $(document).off(upEvent);
                    if (!self.pressed) return;
                    self.pressed = false;
                    var leftItem = self.rHitTest(self.mouseX, self.mouseY);
                    var linevalue = $(self.svg).parents('.lineArea').find('textarea[data-type=linevalue]');
                    var tx, ty;



                     //-----------------------------------
                    // 2023-08-08 16:45:01 - JGY
                    // 넘어가는선 방지
                    /* var cline = true;
                    if ($this.attr('data-cline')) {
                        if ($this.attr('data-cline').indexOf(self.leftItems.indexOf(leftItem)) >= 0) {
                            cline = true;
                        } else {
                            cline = false;
                        }
                    } */

                    var conn_x = false;
                    if ($this.parent().attr('data-conn-line') !== undefined) {
                        var ts_conn = $(leftItem).parent().attr('data-conn-line');
                        if ($this.parent().attr('data-conn-line') !== ts_conn) conn_x = true;
                    }

                    // if (leftItem) {
                    if (leftItem && !conn_x) {
                        //-----------------------------------

                        // 연결하자마자 정오답 체크
                        if (self.chkConnAns) {
                            // 두 .dot 거리가 1이하 라면(=위치가 같다면)
                            const left = $(leftItem);
                            const right = $(item[0]);
                            const isSame = self.sameTest(left, right);
                            if (isSame) {
                                console.log('same R → L!');
                                $(line).remove();
                                return;
                            }

                            var kaAns = $(leftItem).parent().attr('data-line-ans').split('|');
                            var knCheckIdx = item.parent().index();
                            var kbIsCorrect = false;
                            kaAns.forEach(function (ans, idx) {
                                var knAnsIdx = parseInt(ans.split('_')[1], 10);
                                if (knAnsIdx === knCheckIdx) {
                                    kbIsCorrect = true;
                                    return false;
                                }
                            });

                            // 정답으로 이어진 선이 먼저 있다면,
                            if (self.se52_1_0500_06) {
                                const lIdx = self.leftItems.indexOf(leftItem);
                                const rIdx = curIndex;
                                const ltoRLine = $(`line[li="${lIdx}"][ri="${rIdx}"]`);
                                const rtoLLine = $(`line[li="${rIdx}"][ri="${lIdx}"]`);

                                if (ltoRLine.length > 0 || rtoLLine.length > 0) {
                                    console.log('before connected line R → L!');
                                    $(line).remove();
                                    return;
                                }
                            }

                            // 정답이 아니라면, 선 지우기
                            if (!kbIsCorrect) {
                                tx = self.curItem.ox;
                                ty = self.curItem.oy;

                                self.rConnections[curIndex] = undefined;

                                self.lines.pop(line);
                                $(line).remove();

                                if (self.onConnect) self.onConnect(curIndex, self.curItem, leftItem, false);
                                return;
                            }
                        }

                        tx = ($(leftItem).offset().left - wrapTop.offset().left) / factor + $(leftItem).width() / 2;
                        ty = ($(leftItem).offset().top - wrapTop.offset().top) / factor + $(leftItem).height() / 2;

                        self.rConnections[curIndex] = self.leftItems.indexOf(leftItem); //연결 확인용

                        //정답확인용
                        var knIdxLeft = self.leftItems.indexOf(leftItem);
                        var knIdxRight = curIndex;
                        if (self.connections[knIdxLeft].indexOf(knIdxRight) === -1) {
                            self.connections[knIdxLeft].push(knIdxRight);
                        }
                        //console.log('R → L:\n', JSON.stringify(self.connections, '', 4));

                        let removeDup = false;  // 기존의 정답과 연결된 선을 삭제했느지 여부
                        if ($('line[li = "' + self.leftItems.indexOf(leftItem) + '"][ri = "' + curIndex + '"]').length > 0) {
                            $('line[li = "' + self.leftItems.indexOf(leftItem) + '"][ri = "' + curIndex + '"]').remove();
                            removeDup = true;
                        }

                        if (self.Mode == 'line') {
                            // 현재 연결선을 제외한, ri와 연결된선 모두 삭제
                            $('line').each(function () {
                                if (parseInt($(this).attr('li')) === self.leftItems.indexOf(leftItem) && $(this)[0] != line) {
                                    $(this).remove();
                                }
                            });
                        }

                        line.setAttribute('li', self.leftItems.indexOf(leftItem));
                        self.updateLine(line, tx, ty);

                        var lva = [];
                        $('line').each(function () {
                            var l = $(this).attr('li');
                            var r = $(this).attr('ri');
                            var lv = l + '_' + r;
                            lva.push(lv);
                        });
                        if (linevalue.length > 0) linevalue.val(lva);

                        if (self.onConnect) {
                            if (self.chkConnAns) {
                                self.onConnect(curIndex, self.curItem, leftItem, true, removeDup);
                            }
                            else {
                                self.onConnect(curIndex, self.curItem, leftItem, undefined, removeDup);
                            }
                        }
                        //----------

                    } else {
                        tx = self.curItem.ox;
                        ty = self.curItem.oy;

                        self.rConnections[curIndex] = undefined;
                        //self.connections[curIndex] = undefined;

                        self.lines.pop(line);
                        $(line).remove();
                    }
                });
            });

        }
    }

    // <line/> 초기화
    p.resetLine = function (pbIsAns) {
        var self = this;
        $(self.svg).find('line').each(function () {
            if (
                $(this).parent()[0] == self.svg &&
                (
                    $(this).attr('stroke') == self.colorLine ||
                    $(this).attr('stroke') == self.colorAns
                ) &&
                $(this).attr('id') !== 'correctItem') {
                $(this).remove();
            }
        });
    };

    // <line/> 지우기
    p.reset = function () {
        this.resetLine();

        this.lines = [];

        var self = this;
        this.connections = new Array(this.leftItems.length);
        this.leftItems.forEach(function (value, idx) {
            self.connections[idx] = [];
        });

        this.lConnections = [];
        this.rConnections = [];
    }

    p.createSVG = function () {
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', "svg");
        $(this.svg).attr("xmlns", "http://www.w3.org/2000/svg");
        $(this.svg).attr("width", wrapW);
        $(this.svg).attr("height", wrapH);
        $(this.svg).css("position", "absolute");
        $(this.svg).css("pointer-events", "none");

        this.lines = [];
        for (var i = 0; i < this.leftItems.length; i++) {
            var item = this.leftItems[i];

            item.ox = ($(item).offset().left - wrapTop.offset().left) / factor + $(item).width() / 2;
            item.oy = ($(item).offset().top - wrapTop.offset().top) / factor + $(item).height() / 2;

        }

        for (var i = 0; i < this.rightItems.length; i++) {
            var item = this.rightItems[i];

            item.ox = ($(item).offset().left - wrapTop.offset().left) / factor + $(item).width() / 2;
            item.oy = ($(item).offset().top - wrapTop.offset().top) / factor + $(item).height() / 2;


        }

        $(this.leftItems[0]).parent().find('svg').remove();
        $(this.svg).insertBefore(this.leftItems[0]);
        var tl = $(this.leftItems[0]);
        var tsvg = $(this.svg);
        var self = this;

        clearTimeout(multiLineTimerId);
        multiLineTimerId = setTimeout(function () {
            for (var i = 0; i < self.leftItems.length; i++) {
                var item = self.leftItems[i];

                item.ox = ($(item).offset().left - wrapTop.offset().left) / factor + $(item).width() / 2;
                item.oy = ($(item).offset().top - wrapTop.offset().top) / factor + $(item).height() / 2;

            }

            for (var i = 0; i < self.rightItems.length; i++) {
                var item = self.rightItems[i];

                item.ox = ($(item).offset().left - wrapTop.offset().left) / factor + $(item).width() / 2;
                item.oy = ($(item).offset().top - wrapTop.offset().top) / factor + $(item).height() / 2;
            }

            var offset = tsvg.parent().parent().position();
            if (typeof (offset) === 'undefined') {
                return;
            }
            tsvg.css({ left: -offset.left / factor, top: -offset.top / factor });

            // 기존 선 그리기
            /* var linevalue = $(self.svg).parents('.lineArea').find('textarea[data-type=linevalue]');
            if (linevalue.length > 0) {
                var ans = linevalue.val().split(',');
                / 2022-12-22 10:53:07 - JGY
                // 연결값 설정을 변경
                // self.connections = ans;
                self.connections = ans.concat();
                if (self.Mode === 'line') {
                    self.connections.forEach(function (value, idx, self) {
                        if (value !== '') {
                            self[idx] = parseInt(value.split('_')[1], 10);
                        }
                    });
                }
                //////
                for (var j = 0; j < ans.length; j++) {
                    if (ans[j]) {
                        var dot = ans[j].split('_');
                        var line = self.createLine(self.leftItems[dot[0]].ox, self.leftItems[dot[0]].oy, self.rightItems[dot[1]].ox, self.rightItems[dot[1]].oy, "red", 4);
                        $(line).attr('li', dot[0]).attr('ri', dot[1]);
                        self.lines.push(line);
                        self.svg.appendChild(line);
                    }
                }
            } */
        }, 100);
    }


    // 정답 그리기
    p.autoDrawLines = function (linevalue) {
        var self = this;
        var ans = linevalue.split(',');
        self.connections = ans;
        for (var j = 0; j < ans.length; j++) {
            if (ans[j]) {
                var dot = ans[j].split('_');
                var line = self.createLine(self.leftItems[dot[0]].ox, self.leftItems[dot[0]].oy, self.rightItems[dot[1]].ox, self.rightItems[dot[1]].oy, self.colorAns, self.strokeWidthAns);

                line.setAttribute('stroke-width', this.strokeWidthAns);

                $(line).attr('li', dot[0]).attr('ri', dot[1]);
                self.lines.push(line);
                self.svg.appendChild(line);
            }
        }
    };


    p.createLine = function (x1, y1, x2, y2, color, w, id) {
        var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', w);
        return line;
    }

    p.updateLine = function (line, tx, ty, color) {
        line.setAttribute('x2', tx);
        line.setAttribute('y2', ty);

        if (color != undefined) {

            line.setAttribute("stroke", color);
        }
    }

    // 두 .dot 의 거리가 1이하인지 여부 체크
    p.sameTest = function (pt1, pt2) {
        const rectPt1 = pt1[0].getBoundingClientRect();
        const rectPt2 = pt2[0].getBoundingClientRect();

        const knDiffX = parseInt(rectPt1.left, 10) - parseInt(rectPt2.left, 10);
        const knDiffY = parseInt(rectPt2.top, 10) - parseInt(rectPt2.top, 10);
        const knDist = Math.sqrt(Math.pow(knDiffX, 2) + Math.pow(knDiffY, 2));

        if (knDist < 1) {
            return true;
        }
        else {
            return false;
        }
    };


    p.lHitTest = function (x, y) {
        for (var i = 0; i < this.rightItems.length; i++) {
            var item = this.rightItems[i];
            var rect = item.getBoundingClientRect();
            var top = rect.top - wrapTop.offset().top;
            var bottom = rect.bottom - wrapTop.offset().top;
            var left = rect.left - wrapTop.offset().left;
            var right = rect.right - wrapTop.offset().left;
            if (x > left / factor && x < right / factor && y > top / factor && y < bottom / factor) {
                return item;
            }

        }


        return null;
    }

    p.rHitTest = function (x, y) {

        for (var i = 0; i < this.leftItems.length; i++) {
            var item = this.leftItems[i];
            var rect = item.getBoundingClientRect();

            var top = rect.top - wrapTop.offset().top;
            var bottom = rect.bottom - wrapTop.offset().top;
            var left = rect.left - wrapTop.offset().left;
            var right = rect.right - wrapTop.offset().left;

            if (x > left / factor && x < right / factor && y > top / factor && y < bottom / factor) {
                return item;
            }
        }

        return null;
    }

    p.enable = function () {
        this.enabled = true;

        for (var i = 0; i < this.leftItems.length; i++) {
            $(this.leftItems[i]).css({ pointerEvents: "all" });
        }

        for (var i = 0; i < this.rightItems.length; i++) {
            $(this.rightItems[i]).css({ pointerEvents: "all" });
        }

    }

    p.com = function () {
        return this.lines.length;
    }

    p.disable = function () {
        this.enabled = false;

        for (var i = 0; i < this.leftItems.length; i++) {
            $(this.leftItems[i]).css({ pointerEvents: "none" });
        }

        for (var i = 0; i < this.rightItems.length; i++) {
            $(this.rightItems[i]).css({ pointerEvents: "none" });
        }

    }

    // [{targetIndex:index, lineColor:"color"}, ....]
    p.drawLines = function (settings) {

        if (!this.lines) {
            getScale();
            this.createSVG();
        }

        for (var i = 0; i < settings.length; i++) {

            var setting = settings[i];
            var leftItem = this.leftItems[setting.LIndex];
            var rightItem = this.rightItems[setting.RIndex];
            var lx = $(leftItem).offset().left / factor + $(leftItem).width() / 2;
            var ly = $(leftItem).offset().top / factor + $(leftItem).height() / 2;
            var rx = $(rightItem).offset().left / factor + $(rightItem).width() / 2;
            var ry = $(rightItem).offset().top / factor + $(rightItem).height() / 2;

            var line = this.createLine(lx, ly, rx, ry, setting.color, 3, 'correctItem' + i);
            this.svg.appendChild(line);

        }
    }

    p.removRedLine = function () {
        $(self.svg).find('line').each(function () {
            if ($(this).parent()[0] == self.svg && $(this).attr('stroke') == 'red' && $(this).attr('id') !== 'correctItem') $(this).remove();
        });
    }

    window.MultiLineConnector = MultiLineConnector;
})();
