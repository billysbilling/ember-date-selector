var functionProxy = require('function-proxy'),
    Popover = require('ember-popover');

module.exports = Popover.extend({
    layout: Popover.proto().layout,

    template: require('../templates/date-selector'),

    classNames: ['date-selector'],

    optionView: require('./option-view'),

    matchWidth: false,

    minWidth: 26*7+2*5,

    maxWidth: 26*7+2*5,

    value: null,

    monthDate: null,

    highlightedDate: null,

    didInit: function() {
        this.set('monthDate', moment());
        this.set('highlightedDate', moment());
    }.on('init'),

    valueDidChange: function() {
        var value = this.get('value');
        this.set('monthDate', value);
        this.set('highlightedDate', value);
    }.observes('value'),

    didInsertElement: function() {
        this._super();
        var keyEl = this.get('keyEl') || this.$();
        keyEl.on('keydown', functionProxy(this.keyDown, this));

        //Prevent defocus when clicking option
        this.$().on('mousedown', functionProxy(this._preventDefaultEvent, this));
    },

    willDestroyElement: function() {
        this._super();
        var keyEl = this.get('keyEl') || this.$();
        keyEl.off('keydown', functionProxy(this.keyDown, this));
        this.$().off('mousedown', functionProxy(this._preventDefaultEvent, this));
    },

    _preventDefaultEvent: function(e) {
        e.preventDefault();
    },

    keyDown: function(e) {
        var d = this.get('highlightedDate'),
            weekIndex = Math.floor((1*moment(d).startOf('month').format('e') + 1*d.format('D') - 1) / 7),
            newD = false;
        switch (e.which) {
            case $.keyCode.UP:
                newD = moment(d).subtract('week', 1);
                break;
            case $.keyCode.DOWN:
                newD = moment(d).add('week', 1);
                break;
            case $.keyCode.LEFT:
                if (d.format('e') === '0') {
                    newD = moment(d).subtract('month', 1).startOf('month').add('week', weekIndex).startOf('week').add('day', 6);
                    if (newD.format('YYYY-MM') !== moment(d).subtract('month', 1).format('YYYY-MM')) {
                        newD = moment(d).subtract('month', 1).endOf('month');
                    }
                } else {
                    newD = moment(d).subtract('day', 1);
                }
                break;
            case $.keyCode.RIGHT:
                if (d.format('e') === '6') {
                    newD = moment(d).add('month', 1).startOf('month').add('week', weekIndex).startOf('week');
                    if (newD.format('YYYY-MM') !== moment(d).add('month', 1).format('YYYY-MM')) {
                        newD = moment(d).add('month', 1).startOf('month');
                    }
                } else {
                    newD = moment(d).add('day', 1);
                }
                break;
            case $.keyCode.ENTER:
                this.trigger('select', d);
                break;
            default:
                return;
        }
        if (newD) {
            e.preventDefault();
            this.set('highlightedDate', newD);
            var monthDate = this.get('monthDate');
            if (newD.format('YYYY-MM') !== monthDate.format('YYYY-MM')) {
                this.set('monthDate', newD);
            }
        }
    },

    isFirstDayOfWeek: function(d) {
        return moment.langData()._week.dow === d;
    },

    isLastDayOfWeek: function(d) {
        return (7 + moment.langData()._week.dow - 1) % 7 === d;
    },

    monthName: function() {
        return this.get('monthDate').format('MMMM');
    }.property('monthDate'),

    year: function() {
        return this.get('monthDate').format('YYYY');
    }.property('monthDate'),

    weekdays: function() {
        var d = moment(),
            weekdays = Em.A();
        d.subtract('day', d.format('e'));
        for (var i = 0; i < 7; i++) {
            weekdays.push(d.format('dddd').charAt(0));
            d.add('day', 1);
        }
        return weekdays;
    }.property(),

    monthDays: function() {
        var days = Em.A(),
            monthDate = this.get('monthDate'),
            currentMonth = monthDate.format('M'),
            date = moment(monthDate).startOf('month'),
            firstWeekDay = Number(date.format('e')),
            totalDays = Math.ceil((firstWeekDay + date.daysInMonth()) / 7) * 7,
            todayYmd = moment().format('YYYY-MM-DD');
        date.subtract('d', firstWeekDay);
        for (var i = 0; i < totalDays; i++) {
            var dateYmd = date.format('YYYY-MM-DD');
            days.pushObject(Ember.Object.create({
                label: date.format('D'),
                isOtherMonth: date.format('M') !== currentMonth,
                isToday: dateYmd === todayYmd,
                date: date.clone()
            }));
            date.add('d', 1);
        }
        return days;
    }.property('monthDate'),

    move: function(unit, delta) {
        var self = this;
        ['monthDate', 'highlightedDate'].forEach(function(name) {
            self.set(name, moment(self.get(name)).add(unit, delta));
        });
    },

    actions: {
        prevMonth: function() {
            this.move('month', -1);
        },

        nextMonth: function() {
            this.move('month', 1);
        },

        prevYear: function() {
            this.move('year', -1);
        },

        nextYear: function() {
            this.move('year', 1);
        }
    },

    didClickDate: function(date) {
        this.trigger('select', date);
    }
});
