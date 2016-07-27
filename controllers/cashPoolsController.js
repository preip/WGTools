module.exports = function(dataPath) {
    
    const _dataPath = dataPath;
    
    var _data = null;
    
    module.showCashPoolsIndex = function(req, res, next) {
        console.log("Index");
        if (_data === null)
            loadData();
        res.render('cashPools/cashPoolsIndex', { title: 'Cash Pools Index',
            cashPoolsData: _data});
    };
    
    module.showCashPool = function(req, res, next) {
        if (_data === null)
            loadData();
        if (req.params.id != null) {
            console.log("Pool:" + req.params.id);
            var pool = _data.filter(function(value) {
                return value.id == req.params.id;
            })[0] || null;
            
            if (pool != null) {
                res.render('cashPools/cashPoolsPool', {
                    title: "Cash Pool" + pool.id,
                    cashPoolData: pool
                });
            }  
        }
        res.render('cashPools/cashPoolsIndex', { title: 'Cash Pools Index',
            cashPoolsData: _data});
    }
    
    module.addNewEntry = function(req, res, next) {
        var name = req.body.name;
        var description = req.body.description;
        var date = req.body.date
        var value = req.body.value;
        _data.push({ "username" : name, "description" : description, "date" : date,
            "value" : value });
        _data.sort(compareEntries);
        saveData();
        res.writeHead(301, {Location: '/cash/'});
        res.end();
    }
    
    function getCurrentDateString() {
        var date = new Date();
        var datestring = ''
        if (date.getDate() < 10)
            datestring += '0';
        datestring += String(date.getDate()) + '.';
        if (date.getMonth() < 9)
            datestring += '0';
        datestring +=  String(date.getMonth() + 1) + '.' + String(date.getFullYear());
        return datestring;
    }
    
    function compareEntries(entry1, entry2) {
        date1 = entry1.date.split('.');
        date2 = entry2.date.split('.');
        yearDiff = parseInt(date1[2]) - parseInt(date2[2])
        if (yearDiff != 0)
            return yearDiff
        monthDiff = parseInt(date1[1]) - parseInt(date2[1])
        if (monthDiff != 0)
            return monthDiff
        return parseInt(date1[0]) - parseInt(date2[0])
    }
    
    function saveData() {
        var fs = require('fs');
        var raw = JSON.stringify(_data, null, 4);
        var path = require('path');
        fs.writeFileSync(path.join(_dataPath, 'cashPools.json'), raw, 'utf8');
    }
    
    function loadData() {
        var fs = require('fs');
        var path = require('path');
        var raw = fs.readFileSync(path.join(_dataPath, 'cashPools.json'), 'utf8');
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