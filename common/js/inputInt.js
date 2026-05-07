imgPreLoad([
	// 입력 아이콘
	'common/images/inputItem/icon.png'
], true);


var pageCon;
console.log('>>>>> inputInt');
$(window).on('load', function () {

	var timer;
	$('.contents').eq(0).show();
	$('textarea').val('');

	$('.setContent li').on('click', function () {
		effectAdo('click', true);

		var idx = $(this).index();
		var page = $('.contents').eq(idx);

		clearTimeout(timer);
		$('.tobtn').show();
		$('.to').hide().removeClass('motion');

		if (page.attr('class').indexOf('toPage') > -1) {
			if (page.css('display') == 'block') return false;

		} else {
			if (page.css('display') == 'block') return false;
		}
	});

	$('textarea').focus(function () {
		//$(this).addClass('input');
		$(this).css('background', 'none');
		$(this).attr('placeholder', '');
	});

	$('textarea').blur(function () {
		var txtval = $(this).val();
		if (txtval.trim() != "") {
			$(this).css('background', 'none');
		} else {
			$(this).css({
				'background': 'url(inc/images/03/icon.png) 19px 33px no-repeat',
				'background-size': '77px 82px'
			});
			$(this).attr('placeholder', '     직접 써 보세요.');
		}
	});

	$('.tobtn').on('click', function () {
		var self = $(this);
		self.hide();
		self.parent().find('.to').show().addClass('motion');
		var time = self.parent().find('.to').css('animation-duration');
		time = time.replace('s', '');
		time = Number(time) * 1000;

		effectAdo('click');
		effectAdo('count');
		timer = setTimeout(function () {
			self.show();
			self.parent().find('.to').hide().removeClass('motion');
		}, time + 2000);
	});
});