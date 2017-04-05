module.exports = function() {

    module.showCalendar = function(req, res, next) {
        res.render('calendar', { title: 'WG Kalendar' });
    };

	return module;
}