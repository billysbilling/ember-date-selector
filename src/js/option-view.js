module.exports = Ember.View.extend({
    template: require('../templates/option'),

    classNameBindings: [':cell', 'day.isOtherMonth:other-month', 'day.isToday:today', 'isHighlighted'],

    day: null,

    dateSelector: null, //Injected through template as a binding

    isHighlighted: function() {
        var highlightedDate = this.get('dateSelector.highlightedDate');
        return (highlightedDate && highlightedDate.format('YYYY-MM-DD') === this.get('day.date').format('YYYY-MM-DD'));
    }.property('dateSelector.highlightedDate'),

    didInsertElement: function() {
        var self = this;
        this.$().on('mouseenter', function(e) {
            self.set('dateSelector.highlightedDate', self.get('day.date'));
        });
    },

    click: function() {
        this.get('dateSelector').didClickDate(this.get('day.date'));
    }
});