function showAns() {
	console.log('-----[ 정답 ]-----');
	for (var i = 0; i < quizList.length; ++i) {
		console.log('[' + (i) + '] ' + quizList[i].ans + ' | ' + quizList[i].quiz);
	}
}

goldenbell = function (wrap, quiz) {
	var self = this;
	this.wrap = wrap;
	this.count = 5;
	this.time = 20; // 제한 시간(second)
	//this.time = 20 * 100000;
	this.currentCount = 0;
	this.currentQuiz = 1;
	this.timer;
	this.quizlist = quiz;
	this.currentQuizList = [];
	this.quizCom = false;
	this.num;

	this.init = function () {
		self.makeHtml();

		self.wrap.find(".counter li").on("click", function () {
			$(this).siblings().removeClass("on");
			$(this).addClass("on");
			effectAdo('click');

			var idx = $(this).index();
			self.count = 5 * (idx + 1);
		});

		self.wrap.find(".timer li").removeClass("on");
		self.wrap.find(".timer li").eq(2).addClass("on");
		self.wrap.find(".timer li").on("click", function () {
			$(this).siblings().removeClass("on");
			$(this).addClass("on");
			effectAdo('click');

			var idx = $(this).index();
			self.time = 10 + 5 * idx;
		});

		self.wrap.find(".help").on("click", function () {
			effectAdo('click');
			self.wrap.find(".helppop").show();
			// makeMask();

			self.wrap
				.find(".helppop")
				.off("click")
				.on("click", function () {
					effectAdo('click');
					$(this).hide();
					// removeMask();
				});
		});

		self.wrap.find(".home").on("click", function () {
			effectAdo('click');
			clearInterval(self.timer);
			self.wrap.find(".intro").show();
			self.wrap.find(".game").hide();
		});

		self.wrap.find(".start").on("click", function () {
			effectAdo('click');

			self.currentCount = 0;
			self.currentQuiz = 1;
			self.currentQuizList = [];
			self.quizCom = false;

			var video = self.wrap.find("#introVideo");
			video.show();
			video[0].play();
			video.off("ended").on("ended", function () {
				video.hide();
				self.wrap.find(".intro").fadeOut("fast");
				self.setGame();
				self.wrap.find(".game").fadeIn("fast");
			});
		});

		// 전원탈락
		self.wrap.find(".quizout").on("click", function () {
			$(this).addClass("dis"); //--add

			clearInterval(self.timer);
			$(".outro .out_x").show();
			$(".outro .out_o").hide();
			$(".outro").show();

			$(".outro .btns .btn").addClass("dis"); //--add

			var video = self.wrap.find("#outroVideo2");
			video.show();
			video[0].play();

			video.off("ended").on("ended", function () {
				video.hide();
				$(".outro .btns .btn").removeClass("dis"); //--add
			});
		});

		// 골든벨성공
		self.wrap.find(".gameout .good").on("click", function () {
			$(".outro .out_o").show();
			$(".outro .out_x").hide();
			$(".outro").show();

			var video = self.wrap.find("#outroVideo1");
			video.show();
			video[0].play();

			$(".outro .btns .btn").addClass("dis"); //--add

			video.off("ended").on("ended", function () {
				video.hide();
				$(".outro .btns .btn").removeClass("dis"); //--add
			});
		});

		// 골든벨 전원탈락
		self.wrap.find(".gameout .bad").on("click", function () {
			$(".outro .out_x").show();
			$(".outro .out_o").hide();
			$(".outro").show();

			$(".outro .btns .btn").addClass("dis"); //--add

			var video = self.wrap.find("#outroVideo2");
			video.show();
			video[0].play();

			video.off("ended").on("ended", function () {
				video.hide();
				$(".outro .btns .btn").removeClass("dis"); //--add
			});
		});

		self.wrap.find(".regame").on("click", function () {
			self.wrap.find(".quizout").removeClass("dis"); //--add

			effectAdo('click');
			self.wrap.find(".outro").hide();
			self.wrap.find(".gameout").hide();

			self.currentCount = 0;
			self.currentQuiz = 1;
			self.currentQuizList = [];
			self.quizCom = false;
			self.setGame();
		});

		self.wrap.find(".end").on("click", function () {
			self.wrap.find(".quizout").removeClass("dis"); //--add

			effectAdo('click');
			self.wrap.find(".gameout").hide();
			self.wrap.find(".outro").hide();
			self.wrap.find(".game").hide();
			self.wrap.find(".intro").show();
		});
	};

	this.makeHtml = function () {
		var contentsHtml = `
			<div class="intro">
				<video id='introVideo' class='gbvideo' src="common/media/mp4/gb_int.mp4"></video>
				<div class="main"></div>
				<div class="option">
					<div class="counter">
						<ul>
							<li class="btn on"></li>
							<li class="btn"></li>
						</ul>
					</div>
					<div class="timer">
						<ul>
							<li class="btn on"></li>
							<li class="btn"></li>
							<li class="btn"></li>
						</ul>
					</div>
				</div>
				<div class="btn start"></div>
				<div class="btn help"></div>
			</div>
			<div class="game">
				<div class="top">
					<div class="help"></div>
					<div class="home"></div>
				</div>
				<div class="quiz"></div>
				<div class="count btn"></div>
				<div class="quizout btn"></div>
				<div class="quizcount">
					<ul>
						<li class="dis">1</li>
						<li class="on">2</li>
						<li>3</li>
						<li>4</li>
						<li>5</li>
					</ul>
				</div>
				<div class="btn quiznext"></div>
				<div class="btn quizprev"></div>
				<div class="gameout">
					<div class="btn good"></div>
					<div class="btn bad"></div>
				</div>
			</div>
			<div class="outro">
				<div class="out_o">
					<video id='outroVideo1' class='gbvideo' src="common/media/mp4/gb_suc.mp4"></video>
				</div>
				<div class="out_x">
					<video id='outroVideo2' class='gbvideo' src="common/media/mp4/gb_fail.mp4"></video>
				</div>
				<div class="btns">
					<div class="btn regame"></div>
					<div class="btn end"></div>
				</div>
			</div>
			<div class="helppop"></div>
		`;

		self.wrap.append(contentsHtml);
	};

	this.setGame = function (quizNum) {
		self.wrap.find(".game .quiz").html("");
		self.quizCom = false;
		if (quizNum > -1) {
			n = quizNum;
			self.currentQuiz = n;
			self.currentCount = self.currentQuizList.indexOf(n) + 1;
		} else {
			if (self.currentQuizList.length > self.currentCount) {
				n = self.currentQuizList[self.currentCount];
				self.currentQuiz = n;
				self.currentCount = self.currentQuizList.indexOf(n) + 1;
			} else {
				var n = Math.floor(Math.random() * self.quizlist.length);
				if (self.currentQuizList.indexOf(n) > -1) {
					//중복 체크
					while (self.currentQuizList.indexOf(n) > -1) {
						n = Math.floor(Math.random() * self.quizlist.length);
					}
					self.currentQuiz = n;
					self.currentCount++;
					self.currentQuizList.push(n);
				} else {
					self.currentQuiz = n;
					self.currentCount++;
					self.currentQuizList.push(n);
				}
			}
		}
		//console.log(self.currentQuizList);
		self.wrap.find(".quiz").attr('data-quiz-idx', self.currentQuiz);

		self.setPageing();
		if (self.currentCount < 10) self.num = "0" + self.currentCount;
		else self.num = self.currentCount;

		if (self.quizlist[n].q == "ox") {
			var html =
				"" +
				'<div class="quizNum">' +
				self.num +
				"</div>" +
				'<div class="textWrap">' +
				'<div class="text">' +
				self.quizlist[n].quiz +
				"</div>" +
				"</div>" +
				"<div>" +
				'<div class="btn quiz_o"></div>' +
				'<div class="btn quiz_x"></div>' +
				"</div>";
			self.wrap.find(".game .quiz").append(html);
			self.setox();
			self.setcount();
		} else if (self.quizlist[n].q == "multichoice") {
			var html =
				"" +
				'<div class="quizNum">' +
				self.num +
				"</div>" +
				'<div class="textWrap">' +
				'<div class="text">' +
				self.quizlist[n].quiz +
				"</div>" +
				"</div>" +
				"<div>" +
				'<ul class="choicebox"></ul>' +
				"</div>";
			self.wrap.find(".game .quiz").append(html);
			for (var i = 0; i < self.quizlist[n].choice.length; i++) {
				if (self.quizlist[n].choice.length > 1) {
					self.wrap
						.find(".choicebox")
						.append(
							'<li class="choice34"><span class="num">' +
							(i + 1) +
							'</span><span class="choiceText">' +
							self.quizlist[n].choice[i] +
							"</span></li>"
						);
				} else {
					self.wrap
						.find(".choicebox")
						.append(
							'<li class="choice"><span class="choiceText">' +
							self.quizlist[n].choice[i] +
							"</span></li>"
						);
				}
			}
			self.setchoice();
			self.setcount();
		} else {
			var html =
				"" +
				'<div class="quizNum">' +
				self.num +
				"</div>" +
				'<div class="textWrap">' +
				'<div class="text">' +
				self.quizlist[n].quiz +
				"</div>" +
				"</div>" +
				'<div class="quiz_box">' +
				self.quizlist[n].ans +
				"</div>" +
				'<div class="btn quiz_mask"></div>';
			self.wrap.find(".game .quiz").append(html);
			self.setcho();
			self.setcount();
		}
	};

	this.setox = function () {
		self.wrap.find(".quiz_o, .quiz_x").removeClass('dis');
		self.wrap.find(".quiz_o, .quiz_x").on("click", function () {
			if (self.quizCom) return false;
			// effectAdo('click');
			var ans = "o";
			if ($(this).index() == 0) {
				ans = "o";
			} else {
				ans = "x";
			}
			if (self.quizlist[self.currentQuiz].ans == ans) {
				$(this).siblings(".btn").addClass("ans");
				$(this).addClass("animated tada");
				effectAdo('correct_b');
			} else {
				$(this).addClass("ans");
				effectAdo('wrong_b');
			}

			self.wrap.find(".quiz_o, .quiz_x").addClass('dis');

			self.quizCom = true;
			if (self.count == self.currentCount) {
				setTimeout(function () {
					self.wrap.find(".gameout").show();
				}, 1000);
			}
			clearInterval(self.timer);
		});
	};

	this.setcho = function () {
		var ans = self.quizlist[self.currentQuiz].ans;
		ans = self.cho_hangul(ans);
		var idx = self.quizlist[self.currentQuiz].quiz.indexOf(ans);
		var l = ans.length;
		ans = ans.split("");
		var qt = "";
		for (var i = 0; i < ans.length; i++) {
			if (ans[i] == " ") {
				ans[i] = " ";
			} else {
				ans[i] = "<span>" + ans[i] + "</span>";
			}
			qt += ans[i];
		}
		var text = self.quizlist[self.currentQuiz].quiz.replace(
			self.cho_hangul(self.quizlist[self.currentQuiz].ans),
			qt
		);
		self.wrap.find(".quiz .text").html(text);

		self.wrap.find(".quiz_mask").on("click", function () {
			effectAdo('correct_b');
			$(this).remove();

			self.quizCom = true;
			clearInterval(self.timer);

			if (self.count == self.currentCount) {
				setTimeout(function () {
					self.wrap.find(".gameout").show();
				}, 1000);
			}
		});
	};

	this.setchoice = function () {
		self.wrap.find(".choice, .choice34").on("click", function () {
			if (self.quizCom) return false;
			effectAdo('click');
			var ans = $(this).find(".choiceText").text();
			ans.replace($(this).index(), "");
			if (self.quizlist[self.currentQuiz].ans == ans) {
				effectAdo('correct_b');
			} else {
				effectAdo('wrong_b');
			}
			$(this)
				.parent()
				.find(".choice, .choice34")
				.each(function () {
					if (
						$(this).find(".choiceText").text() ==
						self.quizlist[self.currentQuiz].ans
					) {
						$(this).addClass("ans");
					}
				});
			self.quizCom = true;
			if (self.count == self.currentCount) {
				setTimeout(function () {
					self.wrap.find(".gameout").show();
				}, 1000);
			}
			clearInterval(self.timer);
		});
	};

	this.setcount = function () {
		var c = self.time;
		var n = c;
		if (c < 10) {
			n = "0" + c;
		} else {
			n = c;
		}
		self.wrap.find(".count").removeClass("dis");
		self.wrap.find(".count").html("<span>" + n + "</span>");
		if (self.timer) clearInterval(self.timer);
		self.timer = setInterval(function () {
			// effectAdo('tick');
			// $('#tick')[0].volume = 0.3;
			c -= 1;
			if (c < 10) {
				n = "0" + c;
			} else {
				n = c;
			}
			self.wrap.find(".count").html("<span>" + n + "</span>");
			if (c == 0) {
				clearInterval(self.timer);
				effectAdo('wrong_b');
				self.quizCom = true;

				if (self.quizlist[self.currentQuiz].q == "ox") {
					var a = self.quizlist[self.currentQuiz].ans;
					self.wrap
						.find(".quiz_" + a)
						.siblings(".btn")
						.addClass("ans");
				} else if (self.quizlist[self.currentQuiz].q == "multichoice") {
					var a = self.quizlist[self.currentQuiz].ans;
					self.wrap.find(".choice, .choice34").each(function () {
						if (
							$(this).find(".choiceText").text() ==
							self.quizlist[self.currentQuiz].ans
						) {
							$(this).addClass("ans");
						}
					});
				} else {
					self.wrap.find(".quiz_mask").remove();
				}

				if (self.count == self.currentCount) {
					setTimeout(function () {
						self.wrap.find(".gameout").show();
					}, 1000);
				}
			}
		}, 1000);

		self.wrap
			.find(".count")
			.off("click")
			.on("click", function () {
				if (!$(this).hasClass("dis")) {
					clearInterval(self.timer);
					$(this).addClass("dis");
					effectAdo('click');
				} else {
					var c = Number(self.wrap.find(".count span").html());
					if (c == 0) return false;
					$(this).removeClass("dis");
					effectAdo('click');
					if (self.timer) clearInterval(self.timer);
					self.timer = setInterval(function () {
						// effectAdo('tick');
						c -= 1;
						if (c < 10) {
							n = "0" + c;
						} else {
							n = c;
						}
						self.wrap.find(".count").html("<span>" + n + "</span>");
						if (c == 0) {
							clearInterval(self.timer);
							effectAdo('wrong_b');
							self.quizCom = true;

							if (self.quizlist[self.currentQuiz].q == "ox") {
								var a = self.quizlist[self.currentQuiz].ans;
								self.wrap
									.find(".quiz_" + a)
									.siblings(".btn")
									.addClass("ans");
							} else if (self.quizlist[self.currentQuiz].q == "multichoice") {
								var a = self.quizlist[self.currentQuiz].ans;
								self.wrap.find(".choice, .choice34").each(function () {
									if (
										$(this).find(".choiceText").text() ==
										self.quizlist[self.currentQuiz].ans
									) {
										$(this).addClass("ans");
									}
								});
							} else {
								self.wrap.find(".quiz_mask").remove();
							}

							if (self.count == self.currentCount) {
								setTimeout(function () {
									self.wrap.find(".gameout").show();
								}, 1000);
							}
						}
					}, 1000);
				}
			});
	};

	this.setPageing = function () {
		var n = self.currentCount - 1;
		var nl = self.currentQuizList;
		self.wrap.find(".quizcount ul").html("");
		for (var i = 0; i < self.count; i++) {
			self.wrap.find(".quizcount ul").append("<li>" + digit(i + 1) + "</li>");
		}

		if (self.count == 5) {
			self.wrap.find(".quizcount").css("left", "722px");
		} else {
			self.wrap.find(".quizcount").css("left", "478px");
		}

		self.wrap.find(".quizcount li").removeClass("on dis");
		self.wrap.find(".quizcount li").each(function () {
			var idx = $(this).index();
			if (idx == n) {
				$(this).addClass("on");
			}

			if (idx + 1 > nl.length) {
				$(this).addClass("dis");
			}
		});

		if (n == 0) {
			self.wrap.find(".quizprev").addClass("dis");
			self.wrap.find(".quiznext").removeClass("dis");
		} else if (n == self.count - 1) {
			self.wrap.find(".quizprev").removeClass("dis");
			self.wrap.find(".quiznext").addClass("dis");
		} else {
			self.wrap.find(".quizprev").removeClass("dis");
			self.wrap.find(".quiznext").removeClass("dis");
		}

		self.wrap
			.find(".quiznext")
			.off("click")
			.on("click", function () {
				if (!$(this).hasClass("dis")) self.nextQuiz();
			});

		self.wrap
			.find(".quizprev")
			.off("click")
			.on("click", function () {
				if (!$(this).hasClass("dis")) self.prevQuiz();
			});
	};

	this.nextQuiz = function () {
		effectAdo('click');
		if (!self.quizCom) {
			clearInterval(self.timer);
			// makeMask();
			self.wrap.find(".game").append('<div class="btn alert"></div>');

			self.wrap.find(".game .alert").on("click", function () {
				$(this).remove();
				// removeMask();
				effectAdo('click');

				var c = Number(self.wrap.find(".count span").html());
				self.timer = setInterval(function () {
					c -= 1;
					if (c < 10) {
						n = "0" + c;
					} else {
						n = c;
					}
					self.wrap.find(".count").html("<span>" + n + "</span>");
					if (c == 0) {
						clearInterval(self.timer);
						effectAdo('wrong_b');
						self.quizCom = true;
					}
				}, 1000);
			});
			return false;
		} else {
			self.setGame();
		}
	};

	this.prevQuiz = function () {
		effectAdo('click');
		clearInterval(self.timer);
		var n = self.currentCount - 2;
		var nl = self.currentQuizList;
		self.setGame(nl[n]);
	};

	this.cho_hangul = function (str) {
		cho = [
			"ㄱ",
			"ㄲ",
			"ㄴ",
			"ㄷ",
			"ㄸ",
			"ㄹ",
			"ㅁ",
			"ㅂ",
			"ㅃ",
			"ㅅ",
			"ㅆ",
			"ㅇ",
			"ㅈ",
			"ㅉ",
			"ㅊ",
			"ㅋ",
			"ㅌ",
			"ㅍ",
			"ㅎ",
		];
		result = "";
		for (i = 0; i < str.length; i++) {
			code = str.charCodeAt(i) - 44032;
			if (code > -1 && code < 11172) result += cho[Math.floor(code / 588)];
			else result += str.charAt(i);
		}
		return result;
	};

	this.reGame = function () {
		self.currentCount = 0;
		self.currentQuiz = 1;
		self.currentQuizList = [];
		self.setGame();
	};
};