/**
 * @file 时间选择器
 * @author XiaoBin Li(lixiaobin01@baidu.com)
 */

define(function (require, exports) {

    'use strict';

    /**
     * constructor
     * 时间选择器
     */
    function TimePicker(options) {
        this.options = options || {};
        this.hour = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
        this.minute = ['00', '30'];
        this.week = ['日', '一', '二', '三', '四', '五', '六'];

        this.htmlStr = '' 
            + '<div id="time-picker" class="clearfix">'
            +   '<div class="filter"></div>' 
            +   '<ul name="u" class="date"></ul>'
            +   '<ul name="u"></ul>'
            +   '<ul class="u"><li>:</li><li class="light">:</li><li>:</li></ul>' 
            +   '<ul name="u"></ul>'
            + '</div>';

        this.init.apply(this, arguments);
    }

    /**
     * 时间字符串转为时间格式
     * @param {string} dateStr
     */
    function parseDateString(dateStr) {
        return new Date(dateStr.replace(/-/g, '/'));
    }

    /**
     * 个位数补零
     */
    function fixTwo(n) {
        return n < 10 ? '0' + n : n;
    }
        
    /**
     * 填充日期
     */
    TimePicker.prototype.renderDate = function () {
        var start = new Date();
        var dateStr = '';
        var options = this.options;

        if (options.startTime) {
            start = parseDateString(options.startTime);
            dateStr += '<li data-value="' + start.toLocaleDateString() + '">' + (start.getMonth() + 1) + '月' + start.getDate() + '日' + this.getWeekStr(start) + '</li>';
        } else {
            for (var i = 0; i < 60; i++) {
                var weekStr = this.getWeekStr(start);
                dateStr += '<li data-value="' + start.toLocaleDateString() + '">' + (start.getMonth() + 1) + '月' + start.getDate() + '日' + weekStr + '</li>';
                start = new Date(start.setDate(start.getDate() + 1));
            }
        }

        this.dateWrapper.html(dateStr);
    };
        
    /**
     * 填充小时
     */
    TimePicker.prototype.renderHour = function (currentTime) {

        var now = new Date();
        var hourStr = '';
        var currentHour = now.getHours() + 1;
        var currentMinute =  now.getMinutes();
        var hourOptions = [];

        if (!currentTime || currentTime == now.toLocaleDateString()) {
            var index = this.hour.indexOf('' + fixTwo(currentHour));
            hourOptions = this.hour.slice(index);
           
        } else {
            hourOptions = this.hour;
        }

        for (var i = 0, l = hourOptions.length; i < l; i++) {
            hourStr += '<li>' + hourOptions[i] + '</li>';
        }
        this.hourWrapper.html(hourStr);
        var hourIndex = hourOptions.indexOf('' + fixTwo(currentHour));
        this.hourWrapper
            .css('top', -(hourIndex -1) * this.filterH + 'px')
            .find('li').eq(hourIndex).addClass('light');
    };

    /**
     * 绑定事件
     */
    TimePicker.prototype.bindEvent = function () {

        var self = this;

        this.timePicker
            .on('touchstart', function (event) {
                event.preventDefault();
            })
            .on('touchstart', 'ul[name="u"]', function(event) {
                self.touchStart(event); 
            }).
            on('touchmove', 'ul[name="u"]', function(event) {
                self.touchMove(event); 
            })
            .on('touchend', 'ul[name="u"]', function(event) {
                self.touchEnd(event);
            });
    };

    /**
     * 初始化
     */
    TimePicker.prototype.init = function () {
        this.options.element.append(this.htmlStr);
        this.timePicker = $('#time-picker');
        this.filterH = this.timePicker.find('.filter').height();
        var ulList = this.timePicker.find('ul');
        this.dateWrapper = ulList.eq(0);
        this.hourWrapper = ulList.eq(1);
        this.minuteWrapper = ulList.eq(3);

        var minuteStr = '';
        for (var i = 0; i < this.minute.length; i++) {
            minuteStr += '<li>' + this.minute[i] + '</li>';
        }

        this.renderDate();
        this.renderHour();
        this.minuteWrapper.html(minuteStr);

        var self = this;
        var minute = '00';
       
        var minuteIndex = this.minute.indexOf(minute);
        var filterH = this.filterH;

        self.bindEvent();

        self.dateWrapper
            .css('top', filterH + 'px')
            .find('li').eq(0).addClass('light');


        self.minuteWrapper
            .css('top', -(minuteIndex - 1) * filterH + 'px')
            .find('li').eq(minuteIndex).addClass('light');
    };

    /**
     * 获取星期n文本
     * @param {Date} date
     */
    TimePicker.prototype.getWeekStr = function (date) {
        var now = new Date();
        var weekStr = '周' + this.week[date.getDay()];
        var dateLocaleDateString = date.toLocaleDateString();
        var nowLocaleDateString = now.toLocaleDateString();
        var tomorrowLocalDateString = new Date(now.setDate(now.getDate() + 1)).toLocaleDateString();
        var afterTomorrowLocalDateString = new Date(now.setDate(now.getDate() + 1)).toLocaleDateString();

        if (dateLocaleDateString == nowLocaleDateString) {
            weekStr = '今天';
        } else if (dateLocaleDateString == tomorrowLocalDateString) {
            weekStr = '明天';
        } else if (dateLocaleDateString == afterTomorrowLocalDateString) {
            weekStr = '后天';
        }
        return weekStr;
    };

    /**
     * 滚动开始
     */
    TimePicker.prototype.touchStart = function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.startY = e.touches[0].pageY;
        this.startTop = $(e.currentTarget).css('top').replace('px', ''); 
    };

    /**
     * 滚动中
     */
    TimePicker.prototype.touchMove = function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.startY !== 0) {
            var ul = $(e.currentTarget);
            var y = e.touches[0].pageY;
            var move = parseInt(y - this.startY, 10) + parseInt(this.startTop, 10);
        
            ul.css('top', move + 'px');
            ul.find('li').removeClass('light');
        }
    };

    /**
     * 滑动结束
     */
    TimePicker.prototype.touchEnd = function (e) {
        e.preventDefault();
        e.stopPropagation();
        var ul = $(e.currentTarget);
        if (this.startY !== 0) {
            var top = ul.css('top').replace('px', '');
            var yu = top % this.filterH;
            var zheng = parseInt(top / this.filterH, 10);
            var length = ul.find('li').length;

            if (top > 0) {
                ul
                .css('top', this.filterH + 'px')
                .find('li').eq(0).addClass('light');
            } else if (Math.abs(zheng) >= length -2) {
                ul
                .css('top', -(length -2) * this.filterH + 'px')
                .find('li').eq(length-1).addClass('light');
            } else if (yu <= -(this.filterH / 2)) {
                ul
                .css('top', (zheng - 1) * this.filterH + 'px')
                .find('li').eq(Math.abs(zheng) + 2).addClass('light');
            } else {
                ul
                .css('top', zheng * this.filterH + 'px')
                .find('li').eq(Math.abs(zheng) + 1).addClass('light');
            }
        }
        this.startY = 0;
        this.startTop = 0;

        if (ul.hasClass('date')) {
            this.renderHour(this.dateWrapper.find('li.light').data('value'));
        }
    };

    /**
     * 获取选择的时间
     */
    TimePicker.prototype.getValue = function () {
        var date =  this.dateWrapper.find('li.light').data('value');
        var hour = this.hourWrapper.find('li.light').text();
        var minute =  this.minuteWrapper.find('li.light').text();
        return date + ' ' + hour + ':' + minute;
    };

    return TimePicker;
});
