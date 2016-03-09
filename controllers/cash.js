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
        _data.push({ "name" : name, "description" : description, "value" : value });
        saveData();
        res.writeHead(301, {Location: '/cash/'});
        res.end();
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
            if (sums[curData.name] === undefined)
                sums[curData.name] = 0.0;
            var val = parseFloat(curData.value);
            sums[curData.name] += val;
            total += val;
        }
        var number = Object.keys(sums).length;
        var slice = total / number;
        for (var name in sums) {
            sums[name] = slice - sums[name];
        }
        return sums;
    }
    
    return module;
};