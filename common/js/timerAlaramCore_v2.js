// js = package folder

var TimerAlarmCoreV2;

(function () {
    //---------------------------------------------------
    //
    // TimerAlarmCore
    //
    //---------------------------------------------------
    // = birdry\core\TimerAlarmCoreV2.as
    // + activityHelper/commonTimer.js
    /**
     *
    */
    TimerAlarmCoreV2 = function (pjContainer) {

        //DisplayComponent.call(this, pjContainer);

        var self = this;

        var bIsActive = false;      // 동작중인지 여부
        var bIsStopped = true;     // 정지중인지 여부

        var nDuration = 0;          // 총 시간
        var elapsed = 0;            // 경과시간
        var lastFrameTime = new Date().getTime();
        var nTimerId;               // 시간 변수

        var currentFrameTime;
        var deltaTime;

        //---------------------------------------------------
        // getter / setter
        //---------------------------------------------------
        this.getTimeLeft = function () {
            var knTime = nDuration - elapsed;
            return Math.max(0, knTime);
        };
        this.getTimeLeftInt = function () {
            var knTime = nDuration - elapsed;
            return Math.max(0, Math.round(knTime));
        };
        this.getIsStopped = function () {
            return bIsStopped;
        };
        this.getIsActive = function () {
            return bIsActive;
        };
        //---------------------------------------------------
        // public
        //---------------------------------------------------
        this.setDuration = function (pnSecond) {
            cancelAnimationFrame(nTimerId);
            lastFrameTime = new Date().getTime();
            nDuration = pnSecond;
            elapsed = 0;
            bIsActive = false;
            bIsStopped = true;

            //self.view().trigger(TimerAlarmCoreV2.TIME_UPDATE, [{sec: self.getTimeLeft()}]);
        };
        // = resume
        this.start = function () {
            bIsActive = true;
            bIsStopped = false;
            lastFrameTime = new Date().getTime();

            tick();
        };
        this.pause = function () {
            bIsActive = false;
        };
        // = reset
        this.stop = function () {
            cancelAnimationFrame(nTimerId);
            nDuration = 0;
            elapsed = 0;
            bIsActive = false;
            bIsStopped = true;

            $(window).trigger(TimerAlarmCoreV2.TIME_UPDATE, [{ sec: self.getTimeLeftInt(), time: self.getTimeLeft() }]);
        };
        //---------------------------------------------------
        // private
        //---------------------------------------------------
        var tick = function () {
            currentFrameTime = new Date().getTime();
            deltaTime = currentFrameTime - lastFrameTime;
            lastFrameTime = currentFrameTime;

            if (bIsActive === true) {
                elapsed += deltaTime / 1000;
                //console.log(self.view());
                $(window).trigger(TimerAlarmCoreV2.TIME_UPDATE, [{ sec: self.getTimeLeftInt(), time: self.getTimeLeft() }]);

                if (self.getTimeLeft() <= 0) {
                    cancelAnimationFrame(nTimerId);
                    self.pause();
                    $(window).trigger(TimerAlarmCoreV2.TIME_END, [{ sec: self.getTimeLeftInt(), time: self.getTimeLeft() }]);
                }
            }
            nTimerId = window.requestAnimationFrame(tick.bind(self));
        };
    };
    //TimerAlarmCoreV2.prototype.constructor = TimerAlarmCoreV2;
    TimerAlarmCoreV2.TIME_UPDATE = 'TimerAlarmCoreV2_timeUpdate';
    TimerAlarmCoreV2.TIME_END = 'TimerAlarmCoreV2_end';
})();