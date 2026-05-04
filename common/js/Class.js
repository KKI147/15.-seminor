const Class = function Class(wrap, data) {
    let self = this;
    this.wrap = wrap;
    this.root = undefined;

    let value = data.value || 0;

	const defaults = {
        value: 0,
    };
    data = $.extend(true, {}, defaults, data);

    this.elements = {
    };

    const timeoutId = {};

    const intervalId = {};

    this.init = function () {
        self.makeUI();

        self.reset();
        addEvent();
    };

    this.makeUI = function () {
        self.wrap.empty();
        let html = `
        `;
        self.wrap.append(html);
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
};
