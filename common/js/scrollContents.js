/**
 * 2022-11-29 18:35:30 - draggable을 활용한 스크롤바
 * @param {*} wrap
 * @param {*} tmax_pos 스크롤바의 최대너비 또는 높이값
 * @param {*} idx dragScrollContents끼리의 index값
 * @param {*} axis 가로형(x), 세로형(y)
 * @param {*} maxDir 최대값이 어느방향인지(r, l, b, t)
 */
var dragScrollContents = function dragScrollContents(wrap, tmax_pos, idx, axis, maxDir) {
    var self = this;
    self.wrap = wrap;

    /* this.options = {
        axis: 'x'
    };
    Object.assign(this.options, poOptions); */

    this.conWrap = '';      // .dragScrollWrap
    this.scrollWrap = '';   // .dragScrollWrap .dragScroll
    this.bar = '';          // .dragScrollWrap .dragScroll .bar
    this.jog = '';          // .dragScrollWrap .dragScroll .jog

    this.index = typeof (idx) === 'undefined' ? 0 : idx; // index값
    this.axis = axis || 'x';            //수평(x)|수직(y)
    this.maxDir = maxDir || 'r';        //최대값의 방향(l, r, b, t)
    // r: 시작이 l, r이 최대값
    // l: 시작이 r, l이 최대값
    // b: 시작이 t, b가 최대값
    // t: 시작이 b, t가 최대값
    if (self.axis === 'x') {
        self.maxDir = maxDir || 'r';
    }
    else {
        self.maxDir = maxDir || 'b';
    }

    this.tmin_pos = 0;                  // 최소값
    this.tmax_pos = typeof (tmax_pos) === 'undefined' ? 300 : tmax_pos; // 최대값

    this.onScroll = undefined;

    var clickPos = { x: 0, y: 0 };
    var orgPos = { x: 0, y: 0 };

    this.init = function () {
        if (self.wrap.find('.dragScrollWrap').length > 0) {
            self.wrap.find('.dragScrollWrap').remove();
        }
        self.makeWrap();
        self.makeCon();

        setTimeout(function () {
            self.addDrag();
        }, 100);
    };

    this.reset = function () {
        self.jog.removeAttr('style');

        var v_pos, left_max, top_max;
        var knValue;

        switch (self.axis) {
            case 'x':
            default:
                if (self.maxDir === 'r') {
                    left_max = self.tmin_pos;
                    v_pos = Number((self.tmax_pos - left_max));
                    knValue = Math.abs(v_pos - self.tmax_pos);
                }
                else if (self.maxDir === 'l') {
                    left_max = self.tmax_pos;
                    v_pos = Number((self.tmax_pos - left_max));
                    knValue = v_pos;
                }
                break;
            case 'y':
                if (self.maxDir === 'b') {
                    top_max = self.tmin_pos;
                    v_pos = Number((self.tmax_pos - top_max));
                    knValue = Math.abs(v_pos - self.tmax_pos);
                }
                else {
                    top_max = self.tmax_pos;
                    v_pos = Number((self.tmax_pos - top_max));
                    knValue = v_pos;
                }
                break;
        }

        if (typeof (self.onScroll) !== 'undefined') { self.onScroll(knValue, v_pos, self.tmin_pos, self.tmax_pos); }
    };

    this.makeWrap = function () {
        var html = '<div class="dragScrollWrap" data-idx="' + self.index + '"></div>';
        self.wrap.append(html);
        self.conWrap = self.wrap.find('.dragScrollWrap');
    };

    this.makeCon = function () {
        var html = '';
        html += '<div class="dragScroll" data-axis="' + self.axis + '">';
        html += '    <span class="bar"></span>';
        html += '    <span class="jog"></span>';
        html += '</div >';
        self.conWrap.append(html);
        self.scrollWrap = self.conWrap.find('.dragScroll');
        self.bar = self.scrollWrap.find('.bar');
        self.jog = self.scrollWrap.find('.jog');
    };

    this.addBarEvt = function () {
        self.bar.addClass('evt');
        self.bar.on('mousedown', self.onProgressControl);
    };

    this.onProgressControl = function (e) {
        var factor = FORTEACHERCD.responsive.baseContainerSize.zoom;
        var mx = e.pageX;
        var my = e.pageY;

        var top_max = 0;
        var left_max = 0;

        var v_pos;      // jquery draggable 특성상 r, b가 시작점일때의 계산값
        var knValue;    // 현재 실제값


        // ui.position.left, ui.position.top 을 흉내내기
        function PositionInfo() {
            var self = this;

            this.jog = '';
            this.leftValue = 0;
            this.topValue = 0;

            Object.defineProperty(this, 'left', {
                get() {
                    return this.leftValue;
                },
                set(value) {
                    this.leftValue = value;
                    this.jog.css('left', this.leftValue);
                }
            });
            Object.defineProperty(this, 'top', {
                get() {
                    return this.topValue;
                },
                set(value) {
                    this.topValue = value;
                    this.jog.css('top', this.topValue);
                }
            });
        }
        var ui = {
            position: new PositionInfo()
        };
        ui.position.jog = self.jog;
        //////

        switch (self.axis) {
            case 'x':
            default:
                left_max = (mx - self.bar.offset().left) / factor;
                left_max = Math.max(Math.min(left_max, self.tmax_pos), self.tmin_pos);
                self.jog.css('left', left_max);

                ui.position.top = top_max;
                ui.position.left = left_max;

                v_pos = Number(self.tmax_pos - left_max);
                if (self.maxDir === 'r') {
                    knValue = Math.abs(v_pos - self.tmax_pos);
                }
                else if (self.maxDir === 'l') {
                    knValue = v_pos;
                }
                break;
            case 'y':
                top_max = (my - self.bar.offset().top) / factor;
                top_max = Math.max(Math.min(top_max, self.tmax_pos), self.tmin_pos);
                self.jog.css('top', top_max);

                ui.position.top = top_max;
                ui.position.left = left_max;

                v_pos = Number(self.tmax_pos - top_max);
                if (self.maxDir === 'b') {
                    knValue = Math.abs(v_pos - self.tmax_pos);
                }
                else if (self.maxDir === 't') {
                    knValue = v_pos;
                }
                break;
        }

        if (typeof (self.onScroll) !== 'undefined') { self.onScroll(knValue, v_pos, self.tmin_pos, self.tmax_pos, ui, e, 'down'); }
    };

    this.addDrag = function () {
        self.jog.draggable({
            axis: self.axis,
            start: function (e, ui) {
                //getScale();
                clickPos.x = e.clientX;
                clickPos.y = e.clientY;
                orgPos.y = $(e.currentTarget).css('top');
                orgPos.x = $(e.currentTarget).css('left');

                self.onDrag('start', e, ui);
            },
            stop: function (e, ui) {
                self.onDrag('stop', e, ui);
            },
            drag: function (e, ui) {
                self.onDrag('drag', e, ui);
                /*
                var factor = FORTEACHERCD.responsive.baseContainerSize.zoom;

                var original = ui.originalPosition;
                var top_max = 0;
                var left_max = 0;

                var v_pos;      // jquery draggable 특성상 r, b가 시작점일때의 계산값
                var knValue;    // 현재 실제값

                switch (self.axis) {
                    case 'x':
                    default:
                        if (((e.clientX - clickPos.x + original.left) / factor) <= self.tmax_pos) {
                            left_max = (e.clientX - clickPos.x + original.left) / factor;
                            //console.log(left_max, e.clientX, clickPos.x, original.left);
                        }
                        else {
                            left_max = self.tmax_pos;
                        }
                        if ((e.clientX - clickPos.x + original.left) / factor <= self.tmin_pos) {
                            left_max = self.tmin_pos;
                        }

                        ui.position = {
                            top: top_max,
                            left: left_max
                        };

                        v_pos = Number((self.tmax_pos - left_max));
                        if (self.maxDir === 'r') {
                            knValue = Math.abs(v_pos - self.tmax_pos);
                        }
                        else if (self.maxDir === 'l') {
                            knValue = v_pos;
                        }
                        break;
                    case 'y':
                        if (((e.clientY - clickPos.y + original.top) / factor) <= self.tmax_pos) {
                            top_max = (e.clientY - clickPos.y + original.top) / factor;
                            // console.log( top_max ,event.clientY ,clickPos.y ,original.top )
                        }
                        else {
                            top_max = self.tmax_pos;
                        }

                        if ((e.clientY - clickPos.y + original.top) / factor <= self.tmin_pos) {
                            top_max = self.tmin_pos;
                        }

                        ui.position = {
                            top: top_max,
                            left: left_max
                        };

                        v_pos = Number((self.tmax_pos - top_max));
                        if (self.maxDir === 'b') {
                            knValue = Math.abs(v_pos - self.tmax_pos);
                        }
                        else if (self.maxDir === 't') {
                            knValue = v_pos;
                        }
                        break;
                }
                if (typeof (self.onScroll) !== 'undefined') { self.onScroll(knValue, v_pos, self.tmin_pos, self.tmax_pos, ui, e, 'drag'); }
                */
            }
        });
    };

    this.onDrag = function (psType, e, ui) {
        // drag에 있는 것과 동일
        var factor = FORTEACHERCD.responsive.baseContainerSize.zoom;

        var original = ui.originalPosition;
        var top_max = 0;
        var left_max = 0;

        var v_pos;      // jquery draggable 특성상 r, b가 시작점일때의 계산값
        var knValue;    // 현재 실제값

        switch (self.axis) {
            case 'x':
            default:
                if (((e.clientX - clickPos.x + original.left) / factor) <= self.tmax_pos) {
                    left_max = (e.clientX - clickPos.x + original.left) / factor;
                    //console.log(left_max, e.clientX, clickPos.x, original.left);
                }
                else {
                    left_max = self.tmax_pos;
                }
                if ((e.clientX - clickPos.x + original.left) / factor <= self.tmin_pos) {
                    left_max = self.tmin_pos;
                }

                ui.position = {
                    top: top_max,
                    left: left_max
                };

                v_pos = Number((self.tmax_pos - left_max));
                if (self.maxDir === 'r') {
                    knValue = Math.abs(v_pos - self.tmax_pos);
                }
                else if (self.maxDir === 'l') {
                    knValue = v_pos;
                }
                break;
            case 'y':
                if (((e.clientY - clickPos.y + original.top) / factor) <= self.tmax_pos) {
                    top_max = (e.clientY - clickPos.y + original.top) / factor;
                    // console.log( top_max ,event.clientY ,clickPos.y ,original.top )
                }
                else {
                    top_max = self.tmax_pos;
                }

                if ((e.clientY - clickPos.y + original.top) / factor <= self.tmin_pos) {
                    top_max = self.tmin_pos;
                }

                ui.position = {
                    top: top_max,
                    left: left_max
                };

                v_pos = Number((self.tmax_pos - top_max));
                if (self.maxDir === 'b') {
                    knValue = Math.abs(v_pos - self.tmax_pos);
                }
                else if (self.maxDir === 't') {
                    knValue = v_pos;
                }
                break;
        }
        if (typeof (self.onScroll) !== 'undefined') { self.onScroll(knValue, v_pos, self.tmin_pos, self.tmax_pos, ui, e, psType); }
    };
};