var dragContents;

/*
// 드래그, 드롭 생성 정보값 예시
// 기본
var dragItems_ex1 = {
	drop: [
		['drag1'], ['drag2'], ['drag3'], ['drag4'], ['drag5'], ['drag5'],
	],
    drag: ['drag1', 'drag2', 'drag3', 'drag4', 'drag5', 'drag5'],
};
// 분류
var dragItems_ex2 = {
	drop: [
		['drag1', 'drag2', 'drag3'],
		['drag4', 'drag5', 'drag6']
	],
    drag: ['drag1', 'drag2', 'drag3', 'drag4', 'drag5', 'drag6'],
};
*/

dragContents = function dragContents(wrap, set) {
	var self = this;
	this.wrap = wrap;						// .dragWrap
	this.set = set;							// drag, drop 생성 정보값
	this.dragObj = self.set.drag;			// drag 생성값
	this.dropObj = self.set.drop;			// drop 생성값

	this.dragArea, this.dropArea;			// .dragArea, .dropArea
	this.dragItem, this.dropItem;			// .dragItem, .dropItem

	this.isRec = null;						// 현재 drag중인 .dragItem

	this.ansbtn;							// 정답 ↔ 리셋버튼

	this.quizType = wrap.attr('data-quiz-type');

	var zIndex = 10;						// .dragItem의 z_index;
	this.ansCount = 0;						// ansCount
	this.kbComplete = false;				// 정답 완료 확인용
	this.ansLeng = 0;						// 정답 개수

	this.onCorrect = null;					// 정답일 경우
	this.onWrong = null;					// 오답일 경우
	this.onDrag = null;						// drag시작할때
	this.endDrag = null;					// drag끝났을때
	this.onDrop = null;						// drop되었을때
	this.onShowAns = null;				// 정답보기
	this.onReset = null;				// 다시하기

	this.setEnabledDrag = function (pbIsEnable, pnIdx) {
		var kjDrag = isNaN(pnIdx) ? self.dragItem : self.dragItem.eq(pnIdx);
		if (pbIsEnable == true) {
			kjDrag.draggable('enable');
		}
		else {
			kjDrag.draggable('disable');
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
		self.wrap[0].addEventListener('touchmove', function (event) {
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

		self.ansCount = 0;
		self.ansLeng = 0;
		for (i = 0; i < self.dropObj.length; i++) {
			self.ansLeng += self.dropObj[i].length;
		}
		self.kbComplete = false;

		self.addDrag();
		self.addDrop();

		self.ansbtn.on('click', function () {
			// 정답보기
			if (!$(this).hasClass('re')) {
				self.showAns();
			}
			// 다시하기
			else {
				self.resetAns();
			}
		});
	};

	this.makeArea = function () {
		var html = '';
		html += '<div class="dropArea"></div>';
		html += '<div class="dragArea"></div>';

		self.wrap.addClass('dragContents');
		self.wrap.append(html);
		self.dragArea = self.wrap.find('.dragArea');
		self.dropArea = self.wrap.find('.dropArea');
	};

	this.makeObj = function () {
		for (var a = 0; a < self.dragObj.length; a++) {
			var dragDiv = '<div class="dragItem ' + 'drag' + a + '"><p class="txt">' + self.dragObj[a] + '</p></div>';
			self.dragArea.append(dragDiv);
		}

		for (var b = 0; b < self.dropObj.length; b++) {
			var dropDiv = '<div class="dropItem ' + 'drop' + b + '"></div>';
			self.dropArea.append(dropDiv);
		}

		self.dragItem = self.dragArea.find('.dragItem');
		self.dropItem = self.dropArea.find('.dropItem');

		//* 2024-08-27 13:07:06 - JGY
		self.dragItem.each(function (idx, el) {
			$(this).attr('data-drag-value', self.dragObj[idx]);
		});
	};

	this.makeBtn = function () {
		var html = '<div class="ansbtn"></div>';
		self.wrap.append(html);

		self.ansbtn = self.wrap.find('.ansbtn');
	};

	this.showAns = function () {
		self.ansbtn.addClass('re');
		self.setEnabledDrag(false, self.dragItem);

		const dragIdxInfo = [];
		const dropIdxInfo = [];

		if (self.kbComplete !== true) {
			// 바로 정답 체크
			if (self.wrap.attr('data-chk-drop-ans') !== 'false') {
				self.dropItem.each(function (i) {
					var $this = $(this);
					self.dragItem.each(function (j) {
						var drag_ans = $(this).find('.txt').html();
						var dragIdx = $(this).attr('data-idx');
						if (self.dropObj[i].indexOf(drag_ans) > -1) {
							if ($this.find('.drag' + dragIdx).length > 0) {
								return;
							} else {
								var cloneRec = $(this).clone();
								$this.append(cloneRec);
								cloneRec.removeAttr('style');
							}
						}
					});
				});
			}
			// 바로 정답 체크 X
			else {
				// .dragItem 이 드롭된 .dragItem에서의 .dropItem의 idx값(배치안됐으면 undefined)
				self.dragItem.each(function (idx, ele) {
					const $drag = $(this);
					const dragIdx = parseInt($drag.attr('data-idx'), 10);

					if ($drag.hasClass('match') && $drag.is('[data-drop]')) {
						dragIdxInfo[dragIdx] = parseInt($drag.attr('data-drop'), 10);
					}
					else {
						dragIdxInfo[dragIdx] = undefined;
					}
				});
				// console.log('dragIdxInfo: ', dragIdxInfo);

				// .dragItem이 드롭된 .dropItem에서의 .dragItem의 idx값(배치안됐으면 undefined)
				self.dropItem.each(function (idx, el) {
					const $drop = $(this);
					const dropIdx = parseInt($drop.attr('data-idx'), 10);

					if ($drop.is('[data-drag]')) {
						dropIdxInfo[dropIdx] =  parseInt($drop.attr('data-drag'), 10);
					}
					else {
						dropIdxInfo[dropIdx] = undefined;
					}
				});
				// console.log('dropIdxInfo: ', dropIdxInfo);

				switch (self.quizType) {
					// 기존것 되돌리기
					case 'drag_modify':
						break;
					// 드래그드롭된 곳에 드래그가능, 드롭한 것 이동 가능)
					case 'drag_modify_all':
						break;
					default:
						self.showAnsCreate();
						break;
				}
			}
		}

		self.dragItem.addClass('match ans');
		if (self.onShowAns) {
			self.onShowAns(dragIdxInfo, dropIdxInfo);
		}
	};

	// 정답에 맞는 .dragItem을 .dropItem에 생성해서 채우기
	this.showAnsCreate = function () {
		self.dropItem.each(function (i) {
			const $drop = $(this); // .dropItem
			self.dragItem.each(function (j) {
				const $drag = $(this);
				var drag_ans = $drag.find('.txt').html();
				var dragIdx = $drag.attr('data-idx');
				if (self.dropObj[i].indexOf(drag_ans) > -1) {
					if ($drop.find('.drag' + dragIdx).length > 0) {
						return;
					}
					else {
						$drag.attr('data-drop', i);
						$drop.attr('data-drag', j);

						var cloneRec = $drag.clone();
						$drop.append(cloneRec);
						cloneRec.removeClass('match');
						cloneRec.removeAttr('style');
					}
				} else {
					if ($drop.find('.drag' + dragIdx).length > 0) {
						$drop.find('.drag' + dragIdx).remove();
					}
				}
			});
		});

	};

	this.resetAns = function () {
		self.init();
		if (self.onReset) {
			self.onReset();
		}
	};

	this.addDrag = function () {
		self.dragItem.each(function (index) {
			var $this = $(this);
			$this.attr('data-start-pos', pxToInt($this.css('left')) + ' ' + pxToInt($this.css('top')));

			$(this).attr('data-idx', index);
		});

		self.dragItem.draggable({
			cursor: 'pointer',
			scroll: false,
			helper: 'original',
			revert: 'invalid',
			/*
			revert: true,   	// 항상 되돌림
			revert: 'invalid', 	// 드래그 가능 항목이 드롭 가능 항목에 드롭되지 않은 경우(invalid)에만 되돌리기가 발생
			revert: 'valid', 	// 드래그 가능 항목이 드롭 가능 항목에 드롭되지 않아도 되돌리기 발생 안함(valid)
			*/
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

				self.isRec.addClass('ing');

				self.wrap.parents('#wrap').addClass('dragging');
				$('body').addClass('dragging');
				$('body').attr('ondragstart', 'return false');
				$('body').attr('onselectstart', 'return false');

				if (self.onDrag) {
					self.onDrag($(this), e, obj);
				}
			},
			drag: function (e, obj) {
				var factor = FORTEACHERCD.responsive.baseContainerSize.zoom;
				obj.position.top = Math.round(obj.position.top / factor);
				obj.position.left = Math.round(obj.position.left / factor);
			},
			stop: function (e, obj) {
				var $item = $(obj.helper);
				var $this = $(this);

				zIndex++;
				self.isRec.css('z-index', zIndex);
				self.isRec.removeClass('ing');

				self.wrap.parents('#wrap').removeClass('dragging');
				$('body').css('cursor', 'auto');
				$('body').removeClass('dragging');
				$('body').removeAttr('ondragstart');
				$('body').removeAttr('onselectstart');

				if (self.endDrag) {
					self.endDrag($(this), e, obj);
				}
			}
		});
	};

	this.addDrop = function () {
		self.dropItem.each(function (index) {
			$(this).attr('data-idx', index);
		});

		self.dropItem.droppable({
			accept: self.wrap.find('.dragItem'),
			tolerance: 'pointer',
			over: function (e, obj) {
				var $item = $(obj);
				var $this = $(this);
			},
			drop: function (e, obj) {
				var factor = FORTEACHERCD.responsive.baseContainerSize.zoom;
				obj.position.top = Math.round(obj.position.top / factor);
				obj.position.left = Math.round(obj.position.left / factor);

				var $item = $(obj);
				var $this = $(this);

				var dragIdx = parseInt(self.isRec.attr('data-idx'), 10);
				var dropIdx = parseInt($this.attr('data-idx'), 10);

				var drag_ans = self.isRec.find('.txt').html();
				var drop_ans = self.dropObj[dropIdx];

				var kbAns = false;
				self.kbComplete = false;

				// 바로 정답 체크
				if (self.wrap.attr('data-chk-drop-ans') !== 'false') {
					// 정답
					if (drop_ans.indexOf(drag_ans) > -1) {
						self.isRec.draggable({
							revert: 'invalid'
						});
						self.isRec.attr('data-drop', dropIdx).addClass('match');

						if ($this.find('.drag' + dragIdx).length > 0) {
							return;
						} else {
							self.ansCount++;
							var cloneRec = self.isRec.clone();
							$this.append(cloneRec);
							cloneRec.removeAttr('style');
						}

						kbAns = true;
						// self.ansbtn.addClass('re');

						if (typeof (self.onCorrect) !== 'undefined') {
							self.onCorrect();
						}
					}
					// 오답
					else {
						self.isRec.draggable({
							revert: true
						});
						kbAns = false;
						self.setEnabledDrag(true, self.dragItem);

						if (typeof (self.onWrong) !== 'undefined') {
							self.onWrong();
						}
					}

					if (self.ansCount == self.ansLeng) {
						self.kbComplete = true;
					} else {
						self.kbComplete = false;
					}

					if (self.kbComplete == true) {
						self.setEnabledDrag(false, self.dragItem);
						self.ansbtn.addClass('re');
						self.dragItem.addClass('ans');

						if ($('#wrap').hasClass('math quiz') && $('.setContent > li:last-child').hasClass('on')) {
							$('.finish_btn').addClass('on');
						}
					}
				}
				// 바로 정답 체크 X
				else {
					switch (self.quizType) {
						// 드래그(드롭된 곳에 드래그가능, 드롭한 것 이동 불가능)
						case 'drag_modify':
							// 기존것 되돌리기
							const dragIdxMatch = $this.attr('data-drag');
							if (typeof (dragIdxMatch) !== 'undefined') {
								$this.empty();

								const dragItemMatch = self.dragItem.filter(`[data-idx="${dragIdxMatch}"]`);
								dragItemMatch.removeClass('match');
								dragItemMatch.removeAttr('style');
								dragItemMatch.removeAttr('data-drop');
							}
							$this.attr('data-drag', dragIdx);

							// drop-idx값 부여
							self.isRec.attr('data-drop', dropIdx);

							// 복제
							var cloneRec = self.isRec.clone();
							$this.append(cloneRec);
							cloneRec.removeAttr('style');

							// 매칭
							self.isRec.addClass('match');

							// 원래 위치로 이동
							self.isRec.removeAttr('style');
							break;
           				// 드래그드롭된 곳에 드래그가능, 드롭한 것 이동 가능)
						case 'drag_modify_all':
							// 정답
							/* if (drop_ans.indexOf(drag_ans) > -1) {
								if ($this.find('.drag' + dragIdx).length > 0) {
									return;
								} else {
									self.ansCount++;
								}
							}
							var cloneRec = self.isRec.clone();
							$this.append(cloneRec);
							cloneRec.removeAttr('style');
							self.isRec.attr('data-drop', dropIdx).addClass('match');

							if (self.ansCount == self.ansLeng) {
								self.kbComplete = true;
							} else {
								self.kbComplete = false;
							} */
							break;
						default:
							// 정답
							if (drop_ans.indexOf(drag_ans) > -1) {
								if ($this.find('.drag' + dragIdx).length > 0) {
									return;
								} else {
									self.ansCount++;
								}
							}
							var cloneRec = self.isRec.clone();
							$this.append(cloneRec);
							cloneRec.removeAttr('style');
							self.isRec.attr('data-drop', dropIdx).addClass('match');

							if (self.ansCount == self.ansLeng) {
								self.kbComplete = true;
							} else {
								self.kbComplete = false;
							}
							break;
					}
				}

				if (self.onDrop) {
					self.onDrop(
						dragIdx,     // dragIdx
						dropIdx,     // dropIdx
						kbAns,       // is ans
						self.kbComplete,  // is complete
						self.isRec,
						e,
						obj
					);
				}
			}
		});
	};
};
