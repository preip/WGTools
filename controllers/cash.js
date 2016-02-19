module.exports = function(dataPath) {
    
    const _dataPath = dataPath;
    
    var _data = null;
    
    module.showCashPage = function(req, res, next) {
        if (_data === null)
            loadData();
        res.render('cash', { title: 'WG Cash Overview', cashData: _data, sumData: calcSums()});
    };
    
    module.addNewEntry = function(req, res, next) {
        var name = req.body.name;
        var description = req.body.description;
        var value = req.body.value;
        _data.push({ "username" : name, "description" : description, "value" : value });
        saveData();
        res.render('cash', { title: 'WG Cash Overview', cashData: _data, sumData: calcSums()});
    }
    
    function saveData() {
        var fs = require('fs');
        var raw = JSON.stringify(_data, null, 4);
        var path = require('path');
        fs.writeFileSync(path.join(_dataPath, 'cash.json'), raw, 'utf8');
    }
    
    function loadData() {
        var fs = require('fs');
        var path = require('path');
        var raw = fs.readFileSync(path.join(_dataPath, 'cash.json'), 'utf8');
        var data = JSON.parse(raw);
        _data = data;
    }
    
    function calcSums() {
        var sums = {};
        var total = 0.0;
        for (var i = 0; i < _data.length; i++) {
            var curData = _data[i];
            if (sums[curData.username] === undefined)
                sums[curData.username] = 0.0;
            var val = parseFloat(curData.value);
            sums[curData.username] += val;
            total += val;
        }
        var number = Object.keys(sums).length;
        var slice = total / number;
        for (var username in sums) {
            sums[username] = slice - sums[username];
        }
        return sums;
    }
    
    return module;
};