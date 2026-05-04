/* ───────────────────────────────────────────────────────┐
 * file name : common_ado.js
 * description : 22개정 3,4학년 과학용 <audio>관련코드 모음
 * create date : 2024-09-09 14:59:55
 * creator : JGY
 * modify:
 * usage:
└────────────────────────────────────────────────────── */

/**
 * 음원 재생(mp3파일명을 기준으로 <audio/>태그를 생성)
 * @param {*} adoId 재생할 mp3파일명
 * @param {*} psPath mp3파일의 상위경로
 * @param {*} bStopOther 다른 미디어 요소들을 정지시킬것인지 여부
 */
function contentAdoTp2(adoId, psPath, bStopOther) {
    let ado = `#${adoId}`;
    let adoURL = psPath ? psPath : './inc/media/mp3';

    if (wrapTop.find(ado).length === 0) {
        let html = `<audio id="${adoId}" src="${adoURL}/${adoId}.mp3" type="audio/mp3"></audio>`;
        wrapTop.append(html);
    }

    let $ado = wrapTop.find(ado);

    if (typeof (bStopOther) === 'undefined') {
        bStopOther = true;
    }
    /* const stop = typeof bStopOther !== 'undefined' && bStopOther === false;
    stop ? bStopOther = false : bStopOther = true; */
    if (bStopOther) {
        ado_stop($ado);
        // adoReset($ado);
    }

    $ado.off('canplaythrough').on('canplaythrough', function () {
        $(this).off('canplaythrough', arguments.callee);

        $ado[0].play();
    });
    $ado[0].load();


    // 한개의 <audio/>에 경로에 따른 분기 처리
    /*
    if ($('#contentAdo').attr('src').trim() !== sParentPath + '/' + self.src + '.mp3') {
        ado_reset();
        $('#contentAdo').attr('src', sParentPath + '/' + self.src + '.mp3');

        if ($('#contentAdo').currentTime > 0) { $('#contentAdo').currentTime = 0; }

        $('#contentAdo').unbind('canplaythrough').on('canplaythrough', function () {
            $(this).unbind('canplaythrough', arguments.callee);
            $(this)[0].play();
        });

        $('#contentAdo')[0].load();
    } else {
        $('#contentAdo')[0].play();
    }
    */
}

/* ──────────────────────────────────────────────────────
* AudioSimpleContents
/* ────────────────────────────────────────────────────── */

/**
 * 단순 오디오 플레이어
 * @param {jQuery} wrap 컨트롤러가 생길 div wrapper
 * @param {String} src *.mp3 파일명 리스트
 * @param {String} psType 컨트롤러 디자인 타입
 * @see file:///Z:/WEP/타회사_2016_제안샘플/visang_2021/int/01_w/01/07_08/intd12_107_08_04.html
 */
// 재생, 일시정지, 정지만 있음
const AudioSimpleContents = function AudioSimpleContents(wrap, srcList, psType) {

    let self = this;

    this.wrap = wrap;
    this.wrapCtrl = '';

    this.btns = undefined;
    this.playBtn = undefined;
    this.pauseBtn = undefined;
    this.stopBtn = undefined;

    this.srcList = srcList;         // 재생목록
    this.srcListNow = undefined;    // 재생목록중 현재 재생중인 목록

    this.ado = undefined;           // 현재 재생중인 <audio/>
    this.loop = false;              // 반복재생 여부

    this.now = 0;                   // 재생목록 인덱스
    this.total = srcList.length;    // 재생목록의 총 개수

    this.onPlay = undefined;
    this.onPause = undefined;
    this.onStop = undefined;
    this.onEnded = undefined;

    this.init = function () {
        psType = psType || '';
        if (psType) {
            wrap.addClass(psType);
        }

        self.makeUI();
        self.makeBtn();
        self.addEvent();

        self.btns.removeClass('on');
        self.playBtn.show();
        self.pauseBtn.hide();
    };

    this.makeUI = function () {
        let html = `<div class="ctrlWrap"></div>`;
        self.wrap.append(html);
        self.wrapCtrl = self.wrap.find('.ctrlWrap');
    };

    this.makeBtn = function () {
        var html = `
        <div class="bg"></div>
        <div class="btn play"></div>
        <div class="btn pause"></div>
        <div class="btn stop"></div>
        `;
        self.wrapCtrl.append(html);
        self.playBtn = self.wrapCtrl.find('.play');
        self.pauseBtn = self.wrapCtrl.find('.pause');
        self.stopBtn = self.wrapCtrl.find('.stop');
        self.btns = self.wrapCtrl.find('.btn');
    };

    this.addEvent = function () {
        self.playBtn.off('click').on('click', function () {
            self.play();
        });
        self.pauseBtn.off('click').on('click', function () {
            self.pause();
        });
        self.stopBtn.off('click').on('click', function () {
            self.stop();
        });
    };


    this.play = function () {
        self.btns.removeClass('on');
        self.playBtn.addClass('on');

        self.pauseBtn.show();
        self.playBtn.hide();

        self.srcListNow = self.srcList[self.now];
        contentAdoTp2(self.srcListNow);
        // contentAdoTp2(self.srcList, '', false);

        self.ado = $(`#${self.srcListNow}`);
        self.ado.off('ended').on('ended', function () {
            if (typeof (self.onEnded) !== 'undefined') {
                self.onEnded(self.now, self.total);
            }

            self.now++;

            // 재생목록 다음 재생
            if (self.now < self.total) {
                self.play();
            }
            // 재생목록 모두 재생완료
            else {
                self.stop();

                // 루프 처리
                if (self.loop === true) {
                    self.now = 0;
                    self.play();
                }
            }
        });

        if (typeof (self.onPlay) !== 'undefined') {
            self.onPlay(self.now, self.total);
        }
    };

    this.pause = function () {
        self.btns.removeClass('on');
        self.pauseBtn.addClass('on');

        self.playBtn.show();
        self.pauseBtn.hide();

        if (self.ado) {
            self.ado[0].pause();
        }

        if (typeof (self.onPause) !== 'undefined') {
            self.onPause();
        }
    };

    this.stop = function () {
        self.btns.removeClass('on');

        self.pause();

        self.now = 0;

        if (self.ado) {
            self.ado.off('ended');
            if (self.ado[0].currentTime > 0) {
                self.ado[0].currentTime = 0;
            }
        }

        if (typeof (self.onStop) !== 'undefined') {
            self.onStop();
        }
    };
};



/*
// 재생, 일시정지, 정지, 자막싱크
var AudioSimpleContents = function AudioSimpleContents(wrap, src) {

    var self = this;

    var id = 0;
    var loop = 0;				// 재생종료 체크를 위한 progress % 값

    this.audio = null;
    this.audioDuration = 0;

    this.wrap = wrap;
    this.wrapCtrl = '';
    this.src = src;
    this.loop = false;

    this.scriptArea = undefined;
    this.script_stTime = null;
    this.script_endTime = null;

    this.crT = 0;
    this.toT = 0;
    this.playEnd = false;		// 끝에 도달했는지 여부
    this.adoMode = '';			// 현재 진행중인 재생 상태(play, pause, stop)

    this.init = function () {
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
        // 끝까지 재생완료한 상태에서 첫 재생
        if (this.playEnd) {
            this.adoMode = 'stop';
            if (this.scriptArea) {
                this.scriptArea.mCustomScrollbar('scrollTo', 0, {
                    scrollInertia: 500
                });
            }
		} else {
			this.adoMode = 'pause';
		}

        window.cancelAnimationFrame(this.id);
        this.renderPlay();

        this.wrap.find('.btn').removeClass('on');
        this.wrap.find('.play').addClass('on');

        this.wrap.find('.pause').show();
        this.wrap.find('.play').hide();

        contentAdo(this.src, false);

        this.audio = $('#' + this.src);
        this.audio.unbind('loadedmetadata loadeddata').on('loadedmetadata loadeddata', function () {
            self.audioDuration = Math.floor(self.audio[0].duration);
            console.log(self.audioDuration);
        });
        this.audio.unbind('ended');
        this.audio.on('ended', this.ended);// requestAnimationFrame이 더 빠름...


        this.adoMode = 'play';
    };

    this.pause = function () {
		window.cancelAnimationFrame(self.id);
        this.audio[0].pause();
        this.wrap.find('.btn').removeClass('on');
        this.wrap.find('.pause').addClass('on');

        this.wrap.find('.play').show();
        this.wrap.find('.pause').hide();
        this.adoMode = 'pause';
    };

    this.stop = function () {
        window.cancelAnimationFrame(self.id);

        this.pause();

        loop = 0;

        if (this.audio[0].currentTime > 0) {
            this.audio[0].currentTime = 0;
        }

        if (this.scriptArea) {
            this.scriptArea.mCustomScrollbar('scrollTo', 0, {
                scrollInertia: 500
            });
        }

        this.wrap.find('.btn').removeClass('on');
        this.audio.unbind('ended');

        this.playEnd = false;
        this.adoMode = 'stop';
    };

    this.ended = function () {
        //self.conArea.find('.scriptView > p').removeClass('on');
        window.cancelAnimationFrame(self.id);
        self.stop();
        this.playEnd = true;

        if (self.scriptArea) {
            self.scriptArea.find('li').removeClass('on');
            self.scriptArea.find('li > p').removeClass('ing');
            self.scriptArea.removeClass(function (index, className) {
                return (className.match(new RegExp('\\b' + 'idx_' + '\\S+', 'g')) || []).join(' ');
            });
        }

        // 반복재생
        if (this.loop === true) {
            self.play();
        }
    };


    this.renderPlay = function () {
        self.id = window.requestAnimationFrame(self.render);
    };

    this.render = function () {
        if (!self.audio || self.audio[0].readyState !== 4) {
            self.renderPlay();
            return false;
        }
        self.crT = self.audio[0].currentTime.toFixed(1);
        self.toT = self.audio[0].duration.toFixed(1);

        // var test = (syn_stTime + 0.3).toFixed(1);
        // test = Number(test);
        self.scriptSync();
        self.progress();

        // 재생의 완전 종료
		if (loop === 0) {
			if (self.crT == self.toT || (self.crT = self.toT && Math.abs(self.toT - self.crT) <= 0.1)) {
                console.log('end - play complete');
                self.ended();
				return false;
			}
        }

		self.id = window.requestAnimationFrame(self.render);
    };

    this.progress = function () {
        self.crT = this.audio[0].currentTime.toFixed(1);
        self.toT = Math.floor(this.audio[0].duration * 10) / 10;

        var knNow = Number(this.audio[0].currentTime.toFixed(1));
        var knTotal = Math.floor(this.audio[0].duration * 10) / 10;

        loop = (this.crT / this.toT) * 100;
        loop = loop.toFixed(1);

        // 재생 종료체크
		if (loop >= 100) {
			console.log('end - progress');
            this.stop();
			this.playEnd = true;
		} else {
			this.playEnd = false;
		}
    };


    var s_sync = false;
    var scrollView = 0;  // 자막이 있는 영역인지 여부
    var s_sync = false;
    var st_syn = 0;

    this.scriptSync = function () {
        if (this.script_stTime === null || this.script_endTime === null) {
            return false;
        }

        s_sync = false;

        for (var i = 0; i < this.script_stTime.length; ++i) {
            var stTiming = this.script_stTime[i];
            var endTiming = this.script_endTime[i];
            var setTime = (this.script_endTime[i] - this.script_stTime[i]) * 1000;
            var isN = i;
            var sing_isN = i - 1;

            st_syn = 0;

            if (this.script_endTime[sing_isN] == this.script_stTime[isN]) {
                stTiming = Number((this.script_stTime[i] + 0.1).toFixed(1));
            }

            if (Number(stTiming) <= Number(this.crT)) {
                scrollView = 0;

                // 자막 인덱스클래스 idx_ 제거
                self.scriptArea.removeClass(function (index, className) {
                    return (className.match(new RegExp('\\b' + 'idx_' + '\\S+', 'g')) || []).join(' ');
                });
                /////
            }

            if (Number(stTiming) <= Number(this.crT) && Number(this.crT) <= Number(endTiming)) {
                self.scriptArea.find('li').eq(isN).addClass('on');
                scroll_txt = isN;
                //text = script[Number(st_syn) + scroll_txt];
                scrollView++;

                if (scrollView == 1) {
                    // 자막 index부여
                    self.scriptArea.addClass('idx_' + isN);
                    self.scriptArea.find('li > p').removeClass('ing');
                    self.scriptArea.find('li').eq(isN).find('p').addClass('ing');
                }

                s_sync = true;

                if (self.scriptArea.find('li').length > 4) {
                    if (scrollView == 1) {

                        factor = FORTEACHERCD.responsive.baseContainerSize.zoom;
                        var offset = self.scriptArea.find('li').eq(isN).position();
                        var st = (offset.top / factor) - (self.scriptArea.parents('.scr').height() / 2) + (self.scriptArea.find('li').eq(isN).height() / 2);
                        if (st < 10) st = 0;

                        self.scriptArea.parents('.scr').mCustomScrollbar('scrollTo', st, {
                            scrollInertia: 200
                        });
                    }
                }
                break;
            }
        }

        // sync된거 없음
        if (!s_sync) {
            self.scriptArea.find('li').removeClass('on');
            self.scriptArea.find('li > p').removeClass('ing');

            //console.log('없네?');
        // sync된거 있음
        } else {
            //console.log(scroll_txt);
        }
    };
};
*/
