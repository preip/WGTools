module.exports = function(cashPoolData) {
    
    const _cashPoolData = cashPoolData;
    
    module.showCashPoolsIndex = function(req, res, next) {
        res.render('cashPools/cashPoolsIndex', {
            title: 'Cash Pools Index',
            cashPoolsData: _cashPoolData.getPools(),
            usernames: accountData.getUsernames()
            });
    };

    module.showCashPool = function(req, res, next) {
        if (req.params.id != null) {
            var pool = _cashPoolData.getPool(req.params.id);
        
            if (pool !== undefined) {
                res.render('cashPools/cashPoolsPool', {
                    title: pool.name,
                    sumData: pool.calcSums(),
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
        setPoolState("open", req.params.id, res);
    }
    
    module.closePool = function(req, res, next) {
        setPoolState("close", req.params.id, res);
    }
    
    module.settelPool = function(req, res, next) {
        setPoolState("settled", req.params.id, res);
    }
   
    
    module.addNewPool = function(req, res, next) {
        //TODO: validation
        //TODO: id management
        _cashPoolData.addNewPool(
            req.body.name,
            [req.body.owner],
            req.body.participants,
            req.body.startDate,
            req.body.endDate,
            req.body.enforceTimeBounds == 'on'
        );
        res.writeHead(301, {Location: '/cashPools'});
        res.end();
    }
    
    module.addNewEntryToPool = function(req, res, next) {  
        if (req.params.id != null) {
            var pool = _cashPoolData.getPool(req.params.id);
            
            if (pool === undefined) {
                res.status(404);
                res.send("Pool not found");
                return;
            }
            
            if (pool.status != 'open') {
                res.status(403);
                res.send("The pool is not open");
                return;
            }
            
            var entry = {
                "username" : req.body.username,
                "description" : req.body.description,
                "date" : req.body.date,
                "value" : req.body.value
                }
                
            if (!pool.addNewEntry(entry)) {
                res.status(400);
                res.send("new entry is invalid");
                return;
            }
            
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
    
    function setPoolState(status, id, res) {
        pool = _cashPoolData.getPool(id);
        if (pool === undefined) {
            res.status(404);
            res.send("Pool not found.");
            return;
        }
        if (!pool.setState(status)) {
            res.status(403);
            res.send("Not a valid status");
            return;
        }
        res.writeHead(301, {Location: '/cashPools'});
        res.end();
    }
    
    return module;
};