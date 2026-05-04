var dragCon = [];

// dragCon .dragItem 에 별도의 분리 클래스 부여하고자 할때사용
function classDrag(pjPage) {

    if (typeof (dragCon) === 'undefined') { return; }

    for (var i = 1; i < dragCon.length; ++i) {
        dragCon[i].dragArea.attr('data-dragarea-idx', i - 1);
        dragCon[i].dropArea.attr('data-droparea-idx', i - 1);
        for (var k = 0; k < dragCon[i].dragItem.length; ++k) {
            dragCon[i].dragItem.eq(k).addClass('drag' + (i - 1) + '_' + (k));
        }
    }
}

// 2022-11-18 10:00:10 - JGY
// dragContentsSci2와 통합
// use) \\laypop-server-2\laypop\WEP\타회사_2016_제안샘플\visang_2021\int\01\00\00_sample\int_quiz_drag.html
/**
 * .draggable 요소에 margin값이 있으면 revert위치가 틀어짐
 */
(function () {
    function dragContentsSci(wrap, set, poOpt) {
        var self = this;
        this.wrap = wrap;

        var value;  // private
        this.value = undefined;  // public

        this.dragItems = set;      // drag, drop생성 정보값
        this.dragArea, this.dropArea; // .dragArea , .dropObj
        this.txtArea;
        this.dragItem, this.dropItem;

        this.dragObj = set.drag;    // drag정답값
        this.dropObj = set.drop;    // drop정답값

        this.isRec = null;          // 현재 drag중인 .dragItem

        this.ansbtn;                // 정답 ↔ 리셋버튼
        //----------------------------

        var zIndex = 10;

        poOpt = poOpt || {};
        this.options = {};
        this.options.clone = (poOpt.clone === true) ? true : false;
        this.options.tolerance = poOpt.tolerance || 'pointer'; // intersect | fit | pointer | touch

        this.instance = null;           // 드래그할 수 있는 인스턴스 개체

        this.callbackDrag = null;       // drag시작할때
        this.callbackDrop = null;       // drop되었을때
        this.callbackAns = null;        // 정답보기
        this.callbackReset = null;      // 다시하기

        this.setEnabledDrag = function (pbIsEnable, pnIdx) {
            var kjDrag = isNaN(pnIdx) ? self.dragItem : self.dragItem.eq(pnIdx);
            if (pbIsEnable == true) {
                kjDrag.draggable('enable');
                //$( ".selector" ).draggable( "option", { disabled: false } );
            }
            else {
                kjDrag.draggable('disable');
                //$( ".selector" ).draggable( "option", { disabled: true } );
            }
        };

        this.setEnabledDrop = function (pbIsEnable, pnIdx) {
            var kjDrop = isNaN(pnIdx) ? self.dropItem : self.dropItem.eq(pnIdx);
            if (pbIsEnable == true) {
                kjDrop.droppable('enable');
            }
            else {
                kjDrop.droppable('disable');
            }
        };

        this.destroyDrag = function (pnIdx) {
            var kjDrag = isNaN(pnIdx) ? self.dragItem : self.dragItem.eq(pnIdx);
            if (!kjDrag.hasClass('destroy')) {
                kjDrag.draggable('destroy').addClass('destroy');
            }
        };

        this.destroyDrop = function (pnIdx) {
            var kjDrop = isNaN(pnIdx) ? self.dropItem : self.dropItem.eq(pnIdx);
            if (!kjDrop.hasClass('destroy')) {
                kjDrop.droppable('destroy').addClass('destroy');
            }
            kjDrop.droppable('destroy');
        };

        this.init = function () {
            /*
            self.wrap[0].addEventListener('touchmove', function (event) {
                event.preventDefault();
                event.stopPropagation();
            });
            */

            self.wrap[0].addEventListener(
                'touchmove',
                function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                },
                { passive: false }
            );

            if (self.wrap.hasClass('dragContents')) {
                self.wrap.removeClass('dragContents');
                self.wrap.find('.dragArea').remove();
                self.wrap.find('.dropArea').remove();
                self.wrap.find('.ansbtn').remove();
            }

            self.makeArea();
            self.makeObj();
            self.makeBtn();

            self.addDrag();
            self.addDrop();
            /* setTimeout(function () {
                self.addDrag();
                self.addDrop();
            }, 100); */

            // 정답보기 ↔ 다시하기
            self.ansbtn.on('click', function () {
                // 다시하기
                if ($(this).hasClass('re')) {
                    //effectAdo('click');
                    self.init();
                    if (self.callbackReset) {
                        self.callbackReset();
                    }
                }
                // 정답보기
                else {
                    $(this).addClass('re');
                    correctAudio();
                    //effectAdo('anschk_o');
                    self.dropArea.each(function (i) {
                        /// 변경
                        /*$(this).find('.dropCode').html(self.dropObj[i]);
                        $(this).find('.dropCode').addClass('ans');*/
                        $(this).find('.dropCode').each(function (idx) {
                            $(this).addClass("ans");
                            $(this).html(self.dropObj[idx]);
                        });
                        /////
                        self.dragItem.each(function (j) {
                            if ($(this).html() == self.dropObj[j]) {
                                $(this).css('visibility', 'hidden');
                            }
                        });
                    });
                    if (self.callbackAns) {
                        self.callbackAns();
                    }
                }
            });
        };

        this.makeArea = function () {
            var html = '';
            html += '<div class="dropArea">';
            html += '    <div class="conObj"></div>';
            html += '    <div class="txtArea"></div>';
            html += '    <div class="dropObj"></div>';
            html += '</div>';
            html += '<div class="dragArea"></div>';

            self.wrap.addClass('dragContents');
            self.wrap.append(html);
            self.dragArea = self.wrap.find('.dragArea');
            self.dropArea = self.wrap.find('.dropObj');
            self.txtArea = self.wrap.find('.txtArea');
        };

        this.makeObj = function () {
            for (var a = 0; a < self.dragObj.length; a++) {
                var dragDiv = '<div class="dragItem dragItem ' + 'drag' + a + '"><p class="txt">' + self.dragObj[a] + '</p></div>';
                self.dragArea.append(dragDiv);
            }

            for (var b = 0; b < self.dropObj.length; b++) {
                var dropDiv = '<div class="dropCode dropCode ' + 'drop' + b + '"><p class="txt"></p></div>';
                self.dropArea.append(dropDiv);
            }
        };

        this.addDrag = function () {
            self.dragItem = self.dragArea.find('.dragItem');

            self.dragItem.each(function (index, item) {
                var $this = this;

                // 초기위치
                $(this).attr('data-drop', '');     // 드롭되었을때, .dropCode의 idx값
                $(this).attr('data-start-pos', pxToInt($(this).css('left')) + ' ' + pxToInt($(this).css('top')));

                // 드래그 개별 인덱스 부여
                $(this).attr('data-idx', index);
            });
            /*
            function classDrag(pjPage) {
                var p = pageCon1.currentPage + 1;
                var kjPage = $('.contents .dragPage' + p);
                var dragelh = $('.contents .dragArea .dragItem').length;
                for (var p = 0; p < dragCon.length; p++) {
                    for (i = 0; i < dragelh; i++) {
                        $('.dragPage').eq(p).find('.dragItem').eq(i).addClass('drag' + p + '_' + i);
                    }
                }
            }
            */

            self.dragItem.draggable({
                cursor: 'pointer',
                scroll: false,
                helper: (self.options.clone) ? 'clone' : 'original',
                revert: 'invalid',
                // @see https://api.jqueryui.com/draggable/#option-revert
                /*
                revert: true   	// 항상 되돌림
                revert: invalid // 드래그 가능 항목이 드롭 가능 항목에 드롭되지 않은 경우(invalid)에만 되돌리기가 발생
                revert: valid 	// 드래그 가능 항목이 드롭 가능 항목에 드롭되지 않아도 되돌리기 발생 안함(valid)
                */
                /* revert: function (e, obj) {
                    console.log('process step - 2: revert');
                    // drop된것이 없음
                    if (e == false) {
                        isRevert = false;
                        return true;	// 되돌아 가게 함
                    // drop되었음!
                    } else {
                        isRevert = true;
                        //return true; // 되돌아 가게 함
                        //return false; // = 원래위치로 되돌아가지 않음
                    }
                }, */
                start: function (e, obj) {
                    //getScale();
                    var factor = FORTEACHERCD.responsive.baseContainerSize.zoom;
                    obj.position.top = Math.round(obj.position.top / factor);
                    obj.position.left = Math.round(obj.position.left / factor);
                    self.isRec = $(this);

                    var startPos = obj.position;
                    obj.startPos = startPos;

                    // option에 따라, clone 또는 자기자신
                    obj.helper.attr({
                        'data-pos-x': obj.startPos.left,
                        'data-pos-y': obj.startPos.top
                    });
                    obj.helper.css({
                        'z-index': '999'
                    });

                    self.isRec.addClass('on');

                    self.wrap.parents('#wrap').addClass('dragging');
                    $('body').addClass('dragging');
                    $('body').attr('ondragstart', 'return false');
                    $('body').attr('onselectstart', 'return false');

                    if (self.callbackDrag) {
                        self.callbackDrag($(this), e, obj);
                    }
                },
                drag: function (e, obj) {
                    //getScale();
                    var factor = FORTEACHERCD.responsive.baseContainerSize.zoom;
                    obj.position.top = Math.round(obj.position.top / factor);
                    obj.position.left = Math.round(obj.position.left / factor);

                    /*
                    // 좌우
                    if (0 - ($(this).parent().offset().left / factor) > obj.position.left) return false;
                    if (2048 - 10 - $(this).parent().offset().left / factor < obj.position.left + $(this).width()) return false;

                    // 상하
                    if (0 + ($('#wrap').offset().top / factor) - ($(this).parent().offset().top / factor) > obj.position.top) return false;
                    if (($('#wrap').offset().top / factor + $('#wrap').height() - $(this).parent().offset().top / factor) < obj.position.top + $(this).height()) return false;
                    */
                },
                stop: function (e, obj) {
				    //console.log('process step - 3: stop');
                    this.style.zIndex = zIndex++;

                    var $item = $(obj.helper);
                    var $this = $(this);

                    // 정답이 맞았다면...
                    if ($(this)[0] === self.isRec[0] && self.isRec.hasClass('match')) {
                        /* self.isRec.css('z-index', '1');
                        self.isRec.removeClass('dragging'); */

                        /* self.isRec.removeAttr('style');
                        var idx = parseInt(self.isRec.attr('data-idx'), 10);
                        self.isRec.css('left', self.pos[idx].left + 'px');
                        self.isRec.css('top', self.pos[idx].top + 'px');
                        self.isRec.hide(); */
                    }
                    // 정답이 맞지 않거나 또는 droppable이 아닌 곳에 revert되었다면
                    else {
                        self.isRec.css('z-index', '1');
                    }

                    self.dragItem.not('.ans, .match').removeClass('on');

                    self.wrap.parents('#wrap').removeClass('dragging');
                    $('body').css('cursor', 'auto');
                    $('body').removeClass('dragging');
                    $('body').removeAttr('ondragstart');
                    $('body').removeAttr('onselectstart');

                    /*
                    clone삭제할지 여부
                    false이면, 클론이 삭제안되고 남아있음
                    */
                    //return true;
                }

            });

            self.instance = self.dragItem.eq(0).draggable('instance');
        };

        this.addDrop = function () {
            self.dropItem = self.dropArea.find('.dropCode');

            // 드롭 개별 인덱스 부여
            self.dropItem.each(function (index, item) {
                $(this).attr('data-idx', index);
            });

            self.dropItem.droppable({
                accept: self.dragItem,
                tolerance: self.options.tolerance,
                over: function (e, obj) {
                    var $item = $(obj);
                    var $this = $(this);
                },
                drop: function (e, obj) {
                    //console.log('process step - 1: drop');
                    var factor = FORTEACHERCD.responsive.baseContainerSize.zoom;
                    obj.position.top = Math.round(obj.position.top / factor);
                    obj.position.left = Math.round(obj.position.left / factor);
                    var $item = $(obj);
                    var $this = $(this);    // .dropCode

                    var dragIdx = parseInt(self.isRec.attr('data-idx'), 10);
                    var dropIdx = parseInt($this.attr('data-idx'), 10);

                    var drag_ans = self.isRec.find('.txt').html();
                    var drop_ans = self.dropObj[dropIdx];

                    var kbAns = false;
                    var kbComplete = false;

                    if (drop_ans.indexOf(drag_ans) > -1) {
                        $this.html('<p class="txt">' + drag_ans + '</p>');
                        $this.addClass('ans on');
                        if ($this.is('[data-drag]')) {
                            $this.attr('data-drag', $this.attr('data-drag') + ',' + dragIdx);
                        }
                        else {
                            $this.attr('data-drag', dragIdx);
                        }

                        /*
                        $(this).text(isRec.text());
                        self.drag.addClass('dis');
                        self.drag.eq(drag_ans).addClass('on');
                        */
                        // 변경
                        // isRec.css('visibility', 'hidden');
                        if (self.options.clone) {
                            self.isRec.css('visibility', 'visible');
                        } else {
                            self.isRec.css('visibility', 'hidden');
                        }
                        self.isRec.attr('data-drop', dropIdx);
                        self.isRec.addClass('match');
                        /////

                        //effectAdo('anschk_o');
                        correctAudio();

                        // 모두다 맞춤 체크
                        if (self.dropItem.length == self.dropArea.find('.ans').length) {
                            self.destroyDrag();
                            self.ansbtn.addClass('re');
                            kbComplete = true;
                        }
                        kbAns = true;
                    } else {
                        self.isRec.draggable({
                            revert: true
                        });
                        //effectAdo('anschk_x');
                        wrongAudio();

                        kbAns = false;
                    }

                    if (typeof self.callbackDrop !== 'undefined') {
                        self.callbackDrop(
                            dragIdx,     // dragIdx
                            dropIdx,     // dropIdx
                            kbAns,       // is ans
                            kbComplete,  // is complete
                            self.isRec,
                            e,
                            obj
                        );
                    }
                }
            });
        };

        this.makeBtn = function () {
            var html = '<div class="ansbtn"></div>';
            self.wrap.append(html);

            self.ansbtn = this.wrap.find('.ansbtn');
        };
    }
    // prototype method
    dragContentsSci.prototype.fn = function () {

    };
    window.dragContentsSci = dragContentsSci;
})();

// 2021-04-22 10:33:02 - JGY
// dragContentsSci상속
// 드래그해서 분류
// use) \\laypop-server-2\laypop\WEP\타회사_2016_제안샘플\visang_2021/int/01/00/00_sample/int_quiz_drag_sort+page.html
var dragContentsSci4 = function dragContentsSci4(wrap, set, poOpt) {
    dragContentsSci.call(this, wrap, set, poOpt);
    var self = this;

    var value;  // private
    this.value  // public

    this.resetAnsBtn = function () {
        this.ansbtn.unbind('click').on('click', function () {
            // 다시하기
            if ($(this).hasClass('re')) {
                //effectAdo('click');

                self.init();
                self.resetAnsBtn();
            // 정답보기
            } else {
                self.init();
                self.resetAnsBtn();

                //effectAdo('anschk_o');
                correctAudio();

                self.dropArea.each(function (i) {
                    $(this).find('.dropCode').each(function (idx) {
                        var t = $(this);
                        $(this).addClass('ans');
                        self.dragItem.each(function (j) {
                            if (self.dropObj[idx].indexOf($(this).html()) > -1) {
                                t.append($(this).clone());
                            }
                        });
                    });
                });
                self.ansbtn.addClass('re');
            }
        });
    };

    this.addDrop = function () {
        self.dropItem = self.dropArea.find('.dropCode');

        // 드롭 개별 인덱스 부여
        self.dropItem.each(function (index, item) {
            $(this).attr('data-idx', index);
        });

        self.dropItem.droppable({
            accept: self.dragItem,
            tolerance: self.options.tolerance,
            over: function (e, obj) {
                var $item = $(obj);
                var $this = $(this);
            },
            drop: function (e, obj) {
                var factor = FORTEACHERCD.responsive.baseContainerSize.zoom;
                obj.position.top = Math.round(obj.position.top / factor);
                obj.position.left = Math.round(obj.position.left / factor);
                var $item = $(obj);
                var $this = $(this);    // .dropCode

                var dragIdx = parseInt(self.isRec.attr('data-idx'), 10);
                var dropIdx = parseInt($this.attr('data-idx'), 10);

                var drag_ans = self.isRec.find('.txt').html();
                var drop_ans = self.dropObj[dropIdx];

                var kbAns = false;
                var kbComplete = true;

                if (drop_ans.indexOf(drag_ans) > -1) {

                    // drag중인걸 복제해서 집어넣기
                    var c = self.isRec.clone();
                    $this.append(c);
                    c.css({
                        'position': 'static'
                    });
                    /////

                    $this.addClass('ans on');
                    if ($this.is('[data-drag]')) {
                        $this.attr('data-drag', $this.attr('data-drag') + ',' + dragIdx);
                    }
                    else {
                        $this.attr('data-drag', dragIdx);
                    }

                    if (self.options.clone) {
                        self.isRec.css('visibility', 'visible');
                    } else {
                        self.isRec.css('visibility', 'hidden'); // 복제했으니, 원본 보이기
                    }
                    self.isRec.attr('data-drop', dropIdx);
                    self.isRec.addClass('match');

                    //effectAdo('click');
                    correctAudio();

                    // 모두다 맞춤 체크
                    self.dropItem.each(function (index, item) {
                        if ($(this).find('.dragItem').length !== self.dropObj[index].length) {
                            kbComplete = false;
                            return false;
                        }
                    });
                    if (kbComplete === true) {
                        self.dragItem.draggable('destroy');
                        self.ansbtn.addClass('re');
                    }
                    kbAns = true;
                } else {
                    kbComplete = false;
                    self.isRec.draggable({
                        revert: true
                    })

                    //effectAdo('anschk_x');
                    wrongAudio();
                }

                if (typeof self.callbackDrop !== 'undefined') {
                    self.callbackDrop(
                            dragIdx,     // dragIdx
                            dropIdx,     // dropIdx
                            kbAns,       // is ans
                            kbComplete,  // is complete
                            c,
                            e,
                            obj
                        );
                }

            }
        });
    };
};
dragContentsSci4.prototype = Object.create(dragContentsSci.prototype);
dragContentsSci4.prototype.constructor = dragContentsSci4;



// 2021-10-19 10:30:48 - JGY
// 기존 dragContentsSci가 clone처리가 미약해서 개선

// 2022-11-18 09:58:48 - JGY
// dragContentsSci에 통합
/*
var dragContentsSci2 = function (wrap, set, poOpt) {
    dragContentsSci.call(this, wrap, set, poOpt);
    var self = this;

    var value;  // private
    this.value = undefined;  // public

    var zIndex = 10;

    this.makeObj = function () {
        for (var a = 0; a < self.dragObj.length; a++) {
            var dragDiv = '<div class="dragItem"><p>' + self.dragObj[a] + '</p></div>';
            self.dragArea.append(dragDiv);
        }

        for (var b = 0; b < self.dropObj.length; b++) {
            var dropDiv = '<div class="dropCode"></div>';
            self.dropArea.append(dropDiv);
        }
    };

    this.addDrag = function () {
        self.dragItem = self.dragArea.find('.dragItem');

        self.dragItem.each(function (index, item) {
            // 초기위치
            $(this).attr('data-drop', '');
            $(this).attr('data-start-pos', pxToInt($(this).css('left')) + ' ' + pxToInt($(this).css('top')));
            // 드래그 개별 인덱스 부여
            $(this).attr('data-idx', index);
        });

        self.dragItem.draggable({

            cursor: 'pointer',
            revert: 'invalid',
            // 추가
            helper: (self.options.clone) ? 'clone' : 'original',
            ////
            // revert: function (e, obj) {
            //     if (e == false) {
            //         isRevert = false;
            //         return true;
            //     } else {
            //         isRevert = true;
            //     }
            // },
            start: function (e, obj) {
                var factor = FORTEACHERCD.responsive.baseContainerSize.zoom;
                obj.position.top = Math.round(obj.position.top / factor);
                obj.position.left = Math.round(obj.position.left / factor);
                self.isRec = $(this);

                var startPos = obj.position;
                obj.startPos = startPos;

                obj.helper.attr({
                    'data-pos-x': obj.startPos.left,
                    'data-pos-y': obj.startPos.top
                });
                obj.helper.css({
                    'z-index': '999'
                });

                self.isRec.addClass('on');

                $('body').attr('ondragstart', 'return false');
                $('body').attr('onselectstart', 'return false');

                if (self.callbackDrag) {
                    self.callbackDrag($(this), e, obj);
                }
            },
            drag: function (e, obj) {
                var factor = FORTEACHERCD.responsive.baseContainerSize.zoom;
                obj.position.top = Math.round(obj.position.top / factor);
                obj.position.left = Math.round(obj.position.left / factor);
            },
            stop: function (e, obj) {
                this.style.zIndex = zIndex++;
                var $item = $(obj.helper);
                var $this = $(this);

                self.dragItem.not('.ans').removeClass('on');

                $('body').removeAttr('ondragstart');
                $('body').removeAttr('onselectstart');

                //return true;
            }

        });
    };

    this.addDrop = function () {
        self.dropItem = self.dropArea.find('.dropCode');
        self.dropItem.each(function (index, item) {
            // 드롭 개별 인덱스 부여
            $(this).attr('data-idx', index);
        });
        self.dropItem.droppable({
            accept: self.dragItem,
            tolerance: self.options.tolerance,
            over: function (e, obj) {
                var $item = $(obj);
                var $this = $(this);
            },
            drop: function (e, obj) {
                var factor = FORTEACHERCD.responsive.baseContainerSize.zoom;
                obj.position.top = Math.round(obj.position.top / factor);
                obj.position.left = Math.round(obj.position.left / factor);
                var $item = $(obj);
                var $this = $(this);    // .dropCode
                var dropIdx = $this.index();
                var drag_ans = self.isRec.find('p').html();
                var drop_ans = self.dropObj[dropIdx];

                var kbAns = false;
                var kbComplete = false;

                // if (self.options.clone) {
                //     self.isRec.css('visibility', 'visible');
                // }

                if (drop_ans.indexOf(drag_ans) > -1) {
                    $this.html('<p>' + drag_ans + '</p>');
                    $this.addClass('ans');

                    // $(this).text(isRec.text());
                    // self.drag.addClass('dis');
                    // self.drag.eq(drag_ans).addClass('on');

                    // 변경
                    // isRec.css('visibility', 'hidden');
                    if (self.options.clone) {
                        //self.isRec.css('visibility', 'visible');
                        obj.helper.css('visibility', 'hidden');
                    } else {
                        self.isRec.css('visibility', 'hidden');
                    }

                    /////
                    effectAdo('anschk_o');

                    // 모두다 맞춤 체크
                    if (self.dropItem.length == self.dropArea.find('.ans').length) {
                        //self.dragItem.draggable('destroy');
                        self.ansbtn.addClass('re');
                        kbComplete = true;
                    }
                    kbAns = true;
                } else {
                    self.isRec.draggable({
                        revert: true
                    });
                    effectAdo('anschk_x');
                }

                if (self.callbackDrop) {
                    self.callbackDrop(parseInt(self.isRec.attr('data-idx'), 10), parseInt($(this).attr('data-idx'), 10), kbAns, kbComplete, e, obj);
                }

            }
        });
    };
};
dragContentsSci2.prototype = Object.create(dragContentsSci.prototype);
dragContentsSci2.prototype.constructor = dragContentsSci2;
*/
