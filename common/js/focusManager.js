var FocusManager = function FocusManager() {
    var self = this;

    var jList = null;

    var nIdx = 0;
    var nTotal = 0;

    this.getList = function () {
        return jList;
    };

    this.run = function (pTarget) {
        if (!pTarget || pTarget.length === 0) {
            console.log('적용대상이 없네? w(ﾟДﾟ)w');
            return false;
        }

        self.clear();
        //console.log('run!');

        jList = pTarget.find('input[type=text]:not(:disabled), textarea:not(:disabled)');
        if (jList.length === 0) {
            console.log('input이나 textarea가 없네? w(ﾟДﾟ)w');
            return false;
        }

        nIndx = 0;
        nTotal = jList.length;
        jList.each(function (index) {
            $(this).attr({
                'data-tab-idx': index + 1,
                'data-tab-total': nTotal,
                //'tabindex': index + 1
            });
        });
        jList.eq(0).focus().select().val('');
        if (jList.length === 1) {
            //console.log('입력이 1개밖에 없어! w(ﾟДﾟ)w');
            return false;
        }
        $(document).on('keyup', onKeyUp);
    };

    this.focusPrev = function (e) {
        var kjFocus = $(e.target);
        if (jList.filter(kjFocus).length === 0) {
            console.log('포커스된게 없어! w(ﾟДﾟ)w');
            return false;
        }
        var knIdx = jList.index(e.target);
        var knIdxPrev = knIdx - 1;
        if (knIdxPrev < 0) {
            knIdxPrev = nTotal - 1;
        }
        nIdx = knIdxPrev;
        var kjPrev = jList.eq(knIdxPrev);
        if (kjPrev.length > 0) {
            kjFocus.blur();
            kjPrev.focus().select();
        }
    };

    this.focusNext = function (e) {
        var kjFocus = $(e.target);
        if (jList.filter(kjFocus).length === 0) {
            console.log('포커스된게 없어! w(ﾟДﾟ)w');
            return false;
        }
        var knIdx = jList.index(e.target);
        var knIdxNext = knIdx + 1;
        if (knIdxNext >= nTotal) {
            knIdxNext = 0;
        }
        nIndx = knIdxNext;
        var kjNext = jList.eq(nIndx);
        if (kjNext.length > 0) {
            kjFocus.blur();
            kjNext.focus().select();
        }
    };

    this.clear = function () {
        if (!jList || jList.length === 0) {
            return false;
        }
        jList.each(function (index) {
            $(this).removeAttr('data-tab-idx data-tab-total');
        });
        $(document).unbind('keyup', onKeyUp);
    };

    var onKeyUp = function (e) {
        var knCode = e.keyCode ? e.keyCode : e.which;
        // 이전(↑, ←)
        if (knCode == 37 || knCode == 38) {
            self.focusPrev(e);
            e.preventDefault();
        // 다음(↓, →)
        } else if (knCode == 39 || knCode == 40) {
            self.focusNext(e);
            e.preventDefault();
        }
    };
};

var oFocus = new FocusManager();

/*
// enter키 눌렀을 때 포커스 변경
$(document).on('keypress', function (e) {
	e = e || window.event;
	var knKeyCode = (e.which) ? e.which : e.keyCode;

	if (knKeyCode === 13) {
		e.preventDefault();
		//e.stopPropagation();
		var list = oFocus.getList();
		var total = list.length;
		var idx = $(':focus').attr('data-tab-idx');

		if (idx < total) {
			list.blur();
			// list.each(function () {
			// 	$(this).val($(this).val().substring(0, 1));
			// });
			list.eq(idx - 1).val(list.eq(idx - 1).val().substring(0, 1));
			list.eq(idx).focus().select();
		}
		return false;
	}
});
*/
/*
// 부여
        var knTotal = 0;
        self.textarea.each(function () {
            if ($(this).attr('disabled') !== 'disabled') {
                knTotal++;
            }
        });
        var knIdx = 0;
        self.textarea.each(function (index, item) {
            if ($(this).attr('disabled') !== 'disabled') {
                $(this).attr({
                    'data-idx': knIdx + 1,
                    'data-total': knTotal
                });
                knIdx++;
            }
        });
        function focusPrev(e) {
            if ($('.textarea:focus').length === 0) {
                return false;
            }
            var kjFocus = $(e.target);
            var knIdx = parseInt(kjFocus.attr('data-idx'));
            var knTotal = parseInt(kjFocus.attr('data-total'));

            var knIdxPrev = knIdx - 1;
            if (knIdxPrev <= 0) {
                knIdxPrev = knTotal;
            }
            var kjPrev = $('input[data-idx=' + knIdxPrev + ']');
            if (kjPrev.length > 0) {
                kjPrev.eq(0).focus();
            }

        }
        function focusNext(e) {
            if ($('.textarea:focus').length === 0) {
                return false;
            }
            var kjFocus = $(e.target);
            var knIdx = parseInt(kjFocus.attr('data-idx'));
            var knTotal = parseInt(kjFocus.attr('data-total'));

            var knIdxNext = knIdx + 1;
            if (knIdxNext > knTotal) {
                knIdxNext = 1;
            }
            var kjNext = $('input[data-idx=' + knIdxNext + ']');
			if (kjNext.length > 0) {
				kjNext.eq(0).focus();
			}
        }

        $('input[data-idx=1]').focus();

        $(document).unbind('keyup').on('keyup', function (e) {
            var code = e.keyCode ? e.keyCode : e.which;

            // 이전(↑, ←)
            if (code == 37 || code == 38) {
                //if ($('.pagebtns .prev, .pagebox .prev').hasClass('dis') === false) {
                    focusPrev(e);
                //}
                // 다음(↓, →)
            } else if (code == 39 || code == 40) {
                //if ($('.pagebtns .next, .pagebox .next').hasClass('dis') === false) {
                    focusNext(e);
                //}
            }
        });
*/