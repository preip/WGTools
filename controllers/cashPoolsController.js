module.exports = function(dataPath) {
    
    const _dataPath = dataPath;
    
    var _data = null;
    
    module.showCashPoolsIndex = function(req, res, next) {
        if (_data === null)
            loadData();
        res.render('cashPools/cashPoolsIndex', { title: 'Cash Pools Index',
            cashPoolsData: _data, usernames: accountData.getUsernames()});
    };

    module.showCashPool = function(req, res, next) {
        if (_data === null)
            loadData();
        if (req.params.id != null) {
            var pool = findPool(req.params.id); 
        
            if (pool != null) {
                res.render('cashPools/cashPoolsPool', {
                    title: pool.name,
                    sumData: calcSums(pool),
                    dateString: getCurrentDateString(),
                    pool: pool
                });
            } else {
                res.writeHead(301, {Location: '/cashPools'});
                res.end(); 
            }
        } 
    }
    
    module.openPool = function(req, res, next) {
        setPoolStatus("open", req.params.id, res);
    }
    
    module.closePool = function(req, res, next) {
        setPoolStatus("close", req.params.id, res);
    }
    
    module.settelPool = function(req, res, next) {
        setPoolStatus("settled", req.params.id, res);
    }
   
    
    module.addNewPool = function(req, res, next) {
        //TODO: validation
        //TODO: id management
        
        if (_data == null)
            loadData();
        _data.push({
            id: Math.random(),
            name: req.body.name,
            owner: [req.body.owner],
            participants: req.body.participants,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            enforceTimeBounds: req.body.enforceTimeBounds == 'on',
            status: "open",
            items: [] 
        });
        saveData();
        res.writeHead(301, {Location: '/cashPools'});
        res.end();
    }
    
    module.addNewEntry = function(req, res, next) {  
        if (req.params.id != null) {
            var pool = findPool(req.params.id);
            
            if (pool == null) {
                res.status(404);
                res.send("Pool not found");
                return;
            }
            
            if (pool.status != "open") {
                res.status(403);
                res.send("The pool is not open");
                return;
            }
            
            var tmp =  isEntryInvalid(req.body, pool);
            if (tmp) {
                res.status(400);
                res.send(tmp);
                return;
            }
            
            var username = req.body.username;
            var description = req.body.description;
            var date = req.body.date
            var value = req.body.value;
            
            pool.items.push({ "username" : username, "description" : description, "date" : date,
                "value" : value });
            pool.items.sort(compareEntries);
            saveData();
            
            res.writeHead(301, {Location: '/cashPools/' + req.params.id});
            res.end();
        } 
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
    
    function calcSums(pool) {
        var sums = {};
        
        pool.participants.forEach(function(value){
          sums[value] = 0.0;  
        });
            
        var total = 0.0;
        for (var i = 0; i < pool.items.length; i++) {
            var curData = pool.items[i];
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
    
    function findPool(id) {
        return _data.filter(function(value) {
                return value.id == id;
            })[0] || null;
    }
    
    function isEntryInvalid(entry, pool) {
        //TODO: NUll values checken.
        if (entry.username == null)
            return "The username is missing.";
            
        if (pool.enforceTimeBounds && 
            (entry.date < pool.startDate || entry.date > pool.endDate))
            return "The date of the entry is not in the pool range.";
        
        var tmp = pool.participants.find(function(value) {
            return value === entry.username; 
        })
        if (tmp == null)
            return "The user is not part of the pool"; 
        
        return false;
    }
    
    function setPoolStatus(status, id, res) {
        if (_data == null)
            loadData();  
            
        if(!(status == "close" ||
            status == "open" ||
            status == "settled")) {
                res.status(403);
                res.send("Not a valid status");
                return;
        }
            
        var pool = findPool(id);
        
        if (pool != null) {
            pool.status = status;
            saveData();
            res.writeHead(301, {Location: '/cashPools'});
            res.end(); 
        } else {
            res.status(404);
            res.send("Pool not found.");
        }
    }
    
    return module;
};