/**
 * 받아쓰기
 * @param {*} wrap 받아쓰기 컨텐츠가 만들어질 요소
 * @param {Array} paSounds 음원의 종류와 시간값
 * @param {Array} paDic 정답에 들어갈 텍스트
 * @param {boolean} bStopOther 다른 음성요소 정지 시킬지 여부
 */
var dictation = function dictation(wrap, paSounds, paDic, bStopOther) {
    var self = this;
    this.wrap = wrap;
    this.bStopOther = (bStopOther === false) ? false : true;

    var adoPlayer;
    var asrc, times;
    var idx, time;
    var set = 0;
    var tab = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

    this.intro, this.queBtn, this.startbtn;

    this.dicContents, this.numBtn, this.ansBtn, this.homeBtn;

    this.ansPop, this.tablewrap, this.table;

    this.init = function () {
        self.makeHtml();
        self.makeTable();
        self.addEventBtn();
    }

    this.makeHtml = function(){
        var html = `
            <div class="intro">
                <div class="title animated slideInRight"></div>
                <div class="bullet1 bulletani"></div>
                <div class="bullet2 bulletani"></div>
                <div class="bullet3 bulletani"></div>
                <div class="bullet4 bulletani"></div>
                <div class="bullet5 bulletani"></div>
                <div class="bullet6 bulletani"></div>
                <div class="que animated fadeInUp delay-1s">
                    <div class="btn man on"></div>
                    <div class="btn woman"></div>
                </div>
                <div class="btn startbtn animated fadeInUp delay-1s"></div>
            </div>
            <div class="diccontents">
                <div class="bg"></div>
                <div class="home"></div>
                <div class="btn ansbtn"></div>
                <div class="videoFrame adomode"></div>
            </div>      
            <div class="ansPop">
                <div class="title">
                    <div class="btn close"></div>
                </div>
                <div class="tablewrap"></div>
            </div>
        `
        wrap.append(html);

        self.intro = self.wrap.find('.intro');
        self.queBtn = self.intro.find('.que .btn');
        self.startbtn = self.intro.find('.startbtn');

        self.dicContents = self.wrap.find('.diccontents');
        self.numBtn = self.dicContents.find('.num.btn');
        self.ansBtn = self.dicContents.find('.ansbtn');
        self.homeBtn = self.dicContents.find('.home');

        self.ansPop = self.wrap.find('.ansPop');
        self.tablewrap = self.ansPop.find('.tablewrap');
    }

    this.makeTable = function () {
        self.tablewrap.html('');

        for (var i = 0; i < paDic.length; i++) {
            var count = paDic[i].length;
            var tableHtml = '';
            var tdHtml = '';
            for(idx = 0; idx < 14; idx++){
                tdHtml += '<td></td>'
            }
            
            if (count >= 15 && count < 30) {
                tableHtml = '<table class="way2">' +
                '<tr>' +
                '<th rowspan="2"><div class="number"></div></th>' +
                tdHtml +
                '</tr>' +
                '<tr>' +
                tdHtml +
                '</tr>' +
                '</table>';
            }
            else if (count >= 30) {
                tableHtml = '<table class="way3">' +
                '<tr>' +
                '<th rowspan="3"><div class="number"></div></th>' +
                tdHtml +
                '</tr>' +
                '<tr>' +
                tdHtml +
                '</tr>' +
                '<tr>' +
                tdHtml +
                '</tr>' +
                '</table>';
            }
            else {
                tableHtml = '<table class="way1">' +
                '<tr>' +
                '<th><div class="number"></div></th>' +
                tdHtml +
                '</tr>' +
                '</table>';
            }
            self.tablewrap.append(tableHtml);


            self.table = self.tablewrap.find('table');

            for (var j = 0; j < paDic[i].length; j++) {
                if (paDic[i][j] == '.' || paDic[i][j] == ',') {
                    self.table.eq(i).find('td').eq(j).css('text-align', 'left');
                }
                self.table.eq(i).find('td').eq(j).html(dic[i][j]);
            }
        }

        self.tablewrap.mCustomScrollbar({
            scrollInertia: 200,
            theme: "my-theme"
        });
    }

    this.addEventBtn = function () {
        // 음원 성별 체크
        self.queBtn.on('click', function () {
            effectAdo('click', bStopOther);
            $(this).addClass('on').siblings().removeClass('on');
        });

        // 시작하기
        self.startbtn.on('click', function () {
            effectAdo('click', bStopOther);

            self.intro.fadeOut(500, function () {
                self.dicContents.show();
            });

            set = self.intro.find('.que .btn.on').index();

            asrc = 'inc/media/mp3/' + paSounds[set][0] + '.mp3';
            times = paSounds[set][1];

            adoPlayer = new videoPlayer($('.videoFrame'));
            adoPlayer.src = asrc;
            adoPlayer.init();
            adoPlayer.markMaker(times);
            adoPlayer.tabMaker(tab, times, true);
        });

        // 비디오 마커 탭 버튼
        self.numBtn.on('click', function () {
            idx = $(this).index() + 1;
            time = $('.marker' + idx).attr('data-time');

            adoPlayer.video[0].currentTime = time;
            adoPlayer.play();

            $(this).addClass('on').siblings().removeClass('on');
        });

        // 정답 보기
        self.ansBtn.on('click', function () {
            effectAdo('click', bStopOther);
            adoPlayer.pause();
            self.ansPop.show();
            self.tablewrap.mCustomScrollbar('update');
        });

        // 정답 닫기
        self.ansPop.find('.close').on('click', function () {
            effectAdo('click', bStopOther);
            $(this).parent().parent().hide();
        });

        // 홉 버튼
        self.homeBtn.on('click', function(){
            effectAdo('click', bStopOther);
            adoPlayer.stop();

            self.dicContents.hide();
            self.intro.show();
        });
    }
}