module.exports = function(dataPath) {

    const _dataPath = dataPath;
    var _events;

    function saveData() {
        var fs = require('fs');
        var raw = JSON.stringify(_events, null, 4);
        var path = require('path');
        fs.writeFileSync(path.join(_dataPath, 'calendar.json'), raw, 'utf8');
    }
    
    function loadData() {
        var fs = require('fs');
        var path = require('path');
        var raw = fs.readFileSync(path.join(_dataPath, 'calendar.json'), 'utf8');
        var events = JSON.parse(raw);
        _events = events;
    }
    
    module.showCalendar = function(req, res, next) {
        loadData();
        res.render('calendar', { title: 'WG Kalender', events: _events });
    };
    
    module.saveEvents = function(req, res, next) {
        _events = JSON.parse(req.body.events);
        saveData();
        res.writeHead(301, {Location: '/calendar/'});
        res.end();
    }

	return module;
}