/*
 * 移动端touch事件库,只包含项目中常用到的tap、swipe、swipeLeft、swipeRight、swipeDown、swipeUp
 * by cataway
 */
var touch = (function () {
    var touch = {};

    //柯理化函数绑定方法改变this指向
    var bind = function (context, fn) {
        var outerArg = Array.prototype.slice.call(arguments, 2);
        return function () {
            var innerArg = Array.prototype.slice.call(arguments, 0);
            var arg = innerArg.concat(outerArg);
            fn.apply(context, arg);
        }
    };

    //判断是否支持touch事件
    var isTouch = "ontouchstart" in window, endEvent = isTouch ? "touchend" : "click";

    //计算是否发生滑动(偏移30px以上认为是发生了滑动)
    var isSwipe = function () {
        var arg = arguments, strX = arg[0], endX = arg[1], strY = arg[2], endY = arg[3];
        return Math.abs(strX - endX) > 30 || Math.abs(strY - endY) > 30;
    };

    //计算滑动的方向
    var swipeDirection = function () {
        var arg = arguments, strX = arg[0], endX = arg[1], strY = arg[2], endY = arg[3];
        return Math.abs(strX - endX) >= Math.abs(strY - endY) ? (strX - endX > 0 ? "Left" : "Right") : (strY - endY > 0 ? "Up" : "Down");
    };

    //触摸开始:只需要记住当前起始位置的坐标
    var touchStart = function (e, evenName) {
        var touchPoint = e.touches[0];
        this["strX" + evenName] = touchPoint.pageX;
        this["strY" + evenName] = touchPoint.pageY;
    };

    //触摸移动:随时记录最新的位置信息
    var touchMove = function (e, evenName) {
        var touchPoint = e.touches[0];
        this["endX" + evenName] = touchPoint.pageX;
        this["endY" + evenName] = touchPoint.pageY;
        this["isSwipe" + evenName] = isSwipe(this["strX" + evenName], this["endX" + evenName], this["strY" + evenName], this["endY" + evenName]);
    };

    //触摸结束：把所有的自定义属性值清空
    var touchCancel = function (e, evenName) {
        this["strX" + evenName] = null;
        this["strY" + evenName] = null;
        this["endX" + evenName] = null;
        this["endY" + evenName] = null;
        this["isSwipe" + evenName] = null;
    };

    //触摸结束:判断事件的类型，如果是移动判断出移动的方向，然后执行对应的操作
    var touchEnd = function (e, fn, evenName) {
        if (evenName === "tap") {
            if (!this["isSwipe" + evenName]) {
                fn.call(this, e);
            }
        } else {
            if (this["isSwipe" + evenName]) {
                if (evenName === "swipe") {
                    fn.call(this, e);
                } else {
                    var curSwipeDir = swipeDirection(this["strX" + evenName], this["endX" + evenName], this["strY" + evenName], this["endY" + evenName]);
                    if (evenName === ("swipe" + curSwipeDir)) {
                        fn.call(this, e);
                    }
                }
            }
        }

        touchCancel.call(this, e, evenName);
    };

    //完成touch事件整体模型
    touch.init = function (evenName) {
        return function (curEle, callback) {
            if (isTouch) {
                curEle.addEventListener("touchstart", bind(curEle, touchStart, evenName), false);
                curEle.addEventListener("touchmove", bind(curEle, touchMove, evenName), false);
                curEle.addEventListener("touchcancel", bind(curEle, touchCancel, evenName), false);
            }
            curEle.addEventListener(endEvent, bind(curEle, touchEnd, callback, evenName), false);
        }
    };

    //给touch对象增加对应的事件
    ['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'tap'].forEach(function (evenName) {
        touch[evenName] = touch.init(evenName);
    });

    return touch;
})();
