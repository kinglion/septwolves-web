/**
 * Title: Mi One Scroll
 * Author: Sivan
 * Date: 14-09-01 12:00
 * Credit: Another one page scroll plugin based on Onepage Scroll
 */

(function($, window, undefined) {
    var defaults = {
        sectionSelector: '.section',
        easing: 'ease',
        duration: 1000,
        quietPeriod: 800,
        direction: 'vertical',
        loop: false,
        pagination: true,
        keyboard: true,
        updateURL: false,
        onLoad: null,
        beforeMove: null,
        afterMove: null
    };

    // Detect CSS transition support
    var supportsTransitions = (function() {
        var s = document.createElement('p').style, // 's' for style. better to create an element if body yet to exist
            v = ['ms', 'O', 'Moz', 'Webkit']; // 'v' for vendor

        if (s.transition === '') {
            return true;
        }
        // check first for prefeixed-free support
        while (v.length) { // now go over the list of vendor prefixes and check support until one is found
            if (v.pop() + 'Transition' in s) {
                return true;
            }
            return false;
        }
    })();

    // Touch Events
    $.fn.swipeEvents = function() {
        return this.each(function() {
            var startX,
                startY,
                $this = $(this);

            $this.on('touchstart', touchstart);

            function touchstart(e) {
                var touches = e.originalEvent.touches;
                if (touches && touches.length) {
                    startX = touches[0].pageX;
                    startY = touches[0].pageY;
                    $this.on('touchmove', touchmove);
                }
            }

            function touchmove(e) {
                var touches = e.originalEvent.touches;
                if (touches && touches.length) {
                    var deltaX = startX - touches[0].pageX;
                    var deltaY = startY - touches[0].pageY;

                    if (deltaX >= 50) {
                        $this.trigger('swipeLeft');
                    }
                    if (deltaX <= -50) {
                        $this.trigger('swipeRight');
                    }
                    if (deltaY >= 50) {
                        $this.trigger('swipeUp');
                    }
                    if (deltaY <= -50) {
                        $this.trigger('swipeDown');
                    }
                    if (Math.abs(deltaX) >= 50 || Math.abs(deltaY) >= 50) {
                        $this.unbind('touchmove', touchmove);
                    }
                }
            }
        });
    };

    $.fn.miOneScroll = function(option) {
        var plugin = this,
            $elm = $(this),
            $elmWrapper,
            options = $.extend({}, defaults, option),
            $sections = $(options.sectionSelector),
            curIndex = 0,
            lastAnimation = 0,
            resizeTimer = null,
            windowWidth = $(window).width(),
            windowHeight = $(window).height(),
            paginationList = '',
            anchorArr = [],
            targetIndex;

        // Hash Control: type 设为 'get' 获取分析路径中的锚点定位，'set' 用于更新路径
        function hashCtrl(type, index) {
            var target = 0,
                hash = '';

            if (type === 'get') {
                if (window.location.hash !== '') {
                    hash = window.location.hash.split('#')[1];

                    for(var i = 0, len = anchorArr.length; i < len; i += 1) {
                        if (hash === anchorArr[i]) {
                            target = i;
                            break;
                        }
                    }
                }
            }
            else {
                var anchor = typeof $sections.eq(index).data('anchor') !== 'undefined' ? $sections.eq(index).data('anchor') : 'section' + (index + 1);

                if (history.replaceState) {
                    history.pushState({}, document.title, '#' + anchor);
                }
                else {
                    location.hash = anchor;
                }
            }

            return target;
        }

        // Transform Page: 翻滚页面
        function transformPage(target, direction) {
            var pageSize = (options.direction === 'horizontal') ? windowWidth : windowHeight,
                targetPos = -target * pageSize + 'px';

            $sections.removeClass('section-active section-finish').eq(target).addClass('section-active');

            if (supportsTransitions) {
                $elm.css({
                    'transform': (options.direction === 'horizontal') ? 'translate3d(' + targetPos + ', 0, 0)' : 'translate3d(0, ' + targetPos + ', 0)'
                });
            }
            else {
                if (options.direction === 'horizontal') {
                    $elm.animate({
                        'left': targetPos
                    }, options.duration);
                }
                else {
                    $elm.animate({
                        'top': targetPos
                    }, options.duration);
                }
            }

            if (options.pagination && direction !== 0) {
                $('.mi1scroll-pagination').children('li').removeClass('active').eq(target).addClass('active');
            }

            if (options.updateURL && direction !== 0) {
                hashCtrl('set', target);
            }

            $elm.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function() {
                $sections.eq(target).addClass('section-finish section-done');

                if (typeof options.afterMove === 'function') options.afterMove(target, direction);
            });
        }

        plugin.moveDown = function() {
            if (curIndex < $sections.length - 1) {
                if (typeof options.beforeMove === 'function' && options.beforeMove(curIndex + 1, 'down') === false) return false; // 如果回调函数返回 false 则阻止翻页动作

                curIndex += 1;

                transformPage(curIndex, 'down');
            }
            else if (options.loop) {
                if (typeof options.beforeMove === 'function' && options.beforeMove(0, 'down') === false) return false;

                curIndex = 0;
                transformPage(curIndex, 'down');
            }
            else {
                if (typeof options.beforeMove === 'function' && options.beforeMove(curIndex + 1, 'down') === false) return false;
            }

            return curIndex;
        };

        plugin.moveUp = function() {
            if (curIndex > 0) {
                if (typeof options.beforeMove === 'function' && options.beforeMove(curIndex - 1, 'up') === false) return false;

                curIndex -= 1;
                transformPage(curIndex, 'up');
            }
            else if (options.loop) {
                if (typeof options.beforeMove === 'function' && options.beforeMove($sections.length - 1, 'up') === false) return false;

                curIndex = $sections.length - 1;
                transformPage(curIndex, 'up');
            }
            else {
                if (typeof options.beforeMove === 'function' && options.beforeMove(curIndex - 1, 'up') === false) return false;
            }

            return curIndex;
        };

        plugin.moveTo = function(index) {
            var startIndex = curIndex;

            console.log(index);

            if (typeof options.beforeMove === 'function' && options.beforeMove(curIndex, index - curIndex) === false) return false;

            curIndex = (index > $sections.length - 1 || index < 0) ? 0 : index;
            transformPage(curIndex, index - startIndex);

            return curIndex;
        };

        // Scroll control: 控制鼠标滚动事件
        function initScroll(delta) {
            var timeNow = new Date().getTime();

            // 如果跟上次动画的时间差小于停滞时间
            if (timeNow - lastAnimation < options.quietPeriod + options.duration) {
                return;
            }

            if (delta < 0) {
                plugin.moveDown();
            }
            else {
                plugin.moveUp();
            }

            lastAnimation = timeNow;
        }

        // Responsive: 窗口缩放后刷新状态
        function refresh() {
            windowWidth = $(window).width();
            windowHeight = $(window).height();

            $elmWrapper.css({
                'width': windowWidth,
                'height': windowHeight
            });
            $sections.css({
                'width': windowWidth,
                'height': windowHeight
            });

            if (options.direction === 'horizontal') {
                $elm.css('width', windowWidth * $sections.length);
            }

            plugin.moveTo(curIndex);
        }

        // Init Start: 状态初始化
        $('html, body').addClass('mi1scroll-container').css({
            'margin': 0,
            'height': '100%',
            'overflow': 'hidden'
        });
        $elm.addClass('mi1scroll').wrap($('<div class="mi1scroll-wrapper" />'));
        $elmWrapper = $('.mi1scroll-wrapper');

        if (supportsTransitions) {
            $elm.addClass('mi1scroll').css({
                'transition': 'all ' + options.duration + 'ms ' + options.easing
            });
        }
        else {
            $elmWrapper.css({'position': 'relative'});
            $elm.addClass('mi1scroll').css({
                'position': 'absolute',
                'left': '0',
                'top': '0'
            });
        }

        $elmWrapper.css({
            'width': windowWidth,
            'height': windowHeight
        });
        $sections.css({
            'width': windowWidth,
            'height': windowHeight
        });

        if (options.direction === 'horizontal') {
            $elm.css('width', windowWidth * $sections.length);
            $sections.css('float', 'left');
        }

        $sections.each(function(index) {
            var i = index + 1,
                anchor = typeof $(this).data('anchor') !== 'undefined' ? $(this).data('anchor') : 'section' + i;

            $(this).attr({
                'data-index': i
            });

            anchorArr.push(anchor);

            if (typeof $(this).attr('data-title') !== 'undefined') {
                paginationList += '<li><a href="#' + anchor + '" data-index="' + i + '" data-title="' + $(this).attr('data-title') + '"><span class="dot">' + i + '</span><span class="title">' + $(this).attr('data-title') + '</span></a></li>';
            }
            else {
                paginationList += '<li><a href="#' + anchor + '" data-index="' + i + '"><span class="dot">' + i +'</span></a></li>';
            }
        });

        // build Pagination DOM: 构造翻页指示器 DOM 结构，绑定事件
        if (options.pagination && $sections.length > 1) {
            $('<ol class="mi1scroll-pagination"></ol>').html(paginationList).appendTo($elmWrapper);

            $('.mi1scroll-pagination').find('a').on('click', function(e) {
                e.preventDefault();
                plugin.moveTo($(this).data('index') - 1);
            });
        }

        if (typeof options.onLoad === 'function') options.onLoad();

        // Check start page: 检查起始页面
        targetIndex = hashCtrl('get');
        if (options.updateURL && 0 < targetIndex && targetIndex < $sections.length) {
            plugin.moveTo(targetIndex);
        }
        else {
            $sections.eq(0).addClass('section-finish section-done');

            if (options.pagination && $sections.length > 1) {
                $('.mi1scroll-pagination li').first().addClass('active');
            }
        }

        // Bind events: mousewheel, touch, resize, keydown etc.
        $(document).on('mousewheel DOMMouseScroll MozMousePixelScroll', function(e) {
            var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;

            e.preventDefault();
            initScroll(delta);
        });

        $elm.swipeEvents().on({
            'swipeDown': function() {
                plugin.moveUp();
            },
            'swipeUp': function() {
                plugin.moveDown();
            }
        });

        $(window).on('resize focus', function() {
            if (resizeTimer) window.clearTimeout(resizeTimer);

            resizeTimer = window.setTimeout(function() {
                refresh();
            }, 300);
        });

        if (options.keyboard === true) {
            $(document).on('keydown', function(e) {
                var tag = e.target.tagName.toLowerCase();

                switch (e.which) {
                    case 38:
                        if (tag !== 'input' && tag !== 'textarea') plugin.moveUp();
                        break;
                    case 40:
                        if (tag !== 'input' && tag !== 'textarea') plugin.moveDown();
                        break;
                    case 32: // Space
                        if (tag !== 'input' && tag !== 'textarea') plugin.moveDown();
                        break;
                    case 33: // Page Up
                        if (tag !== 'input' && tag !== 'textarea') plugin.moveUp();
                        break;
                    case 34: // Page Down
                        if (tag !== 'input' && tag !== 'textarea') plugin.moveDown();
                        break;
                    case 36: // Home
                        plugin.moveTo(1);
                        break;
                    case 35: // End
                        plugin.moveTo($sections.length);
                        break;
                    default:
                        return;
                }
            });
        }
        
        if (typeof options.onLoad === 'function') options.onLoad();

        return this;
    };
}(jQuery, window));