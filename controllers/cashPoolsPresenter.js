module.exports = function(cashPoolData, settlementData) {
    
    const _cashPoolData = cashPoolData;
    const _settlementData = settlementData;
    
    module.showCashPoolsIndex = function(req, res, next) {
        var pools = _cashPoolData.getPools();
        var settlements = _settlementData.getSettlements();

        var settlementPools = [];
        //TODO: Move to settlementData
        //Adds the requires action attribute for the requesting user
        //and gets all pools that can be used for settlements
        for(var pool in pools){
            pools[pool].setRequiresActionOfUser(req.session.username);
            if (pools[pool].status === "closed" 
                && !_settlementData.isPoolInSettlement(pool))
                settlementPools.push({id: pools[pool].id, name: pools[pool].name});
        }

        for(var settlement in settlements) {
            settlements[settlement].setRequiresActionOfUser(req.session.username);
        }

        res.render('cashPools/cashPoolsIndex', {
            title: 'Cash Pools Index',
            cashPoolsData: pools,
            settlementData: settlements,
            settlementPools: settlementPools,
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

    module.showSettlement = function(req, res, next) {
        if (req.params.id != null) {
            var settlement = _settlementData.getSettlement(req.params.id, req.session.username);
        
            if (settlement !== undefined) {
                res.render('settlements/settlements', {
                    title: settlement.name,
                    sumData: settlement.calcSums(),
                    dateString: getCurrentDateString(),
                    pool: settlement
                });
            } else {
                res.writeHead(301, {Location: '/cashPools'});
                res.end(); 
            }
        } 
    }
    
    module.setState = function(req, res, next) {
        setPoolState(req.query.state, req.params.id, res);
    }
    
    module.toggleUserState = function(req, res, next) {
        togglePoolUserState(req.session.username, req.query.state, req.params.id, res);
    }

    module.toggleSettlementUserState = function(req, res, next) {
        toggleSettlementUserState(req.session.username, req.query.state, req.params.id, res);
    }
   
    module.addNewPool = function(req, res, next) {
        //TODO: validation
        //In the case that no participants are selected.
        if (req.body.participants == null) {
                res.status(401);
                res.send("You have to select at least one participant");
                return;
        }
        //In the case that there is only one participant.
        if (typeof req.body.participants == 'string')
            req.body.participants = [req.body.participants];
        
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

    module.addNewSettlement = function(req, res, next) {
        //TODO: Check if all pools and users exist.

        //In the case that no pools are selected.
        if (req.body.pools == null) {
            res.status(401);
            res.send("You have to select at least one pool");
            return;
        }

        //In the case that there is only one participant.
        if (typeof req.body.pools == 'string')
        req.body.pools = [req.body.pools];
        
        _settlementData.addNewSettlement(
            req.body.name,
            req.body.pools
        );

        res.writeHead(301, {Location: '/cashPools'});
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
    
    function togglePoolUserState(username, status, id, res) {
        pool = _cashPoolData.getPool(id);
        if (pool === undefined) {
            res.status(404);
            res.send("Pool not found.");
            return;
        }
        if (!pool.toggleStateForUser(username, status)) {
            res.status(403);
            res.send("invalid username or state.");
            return;
        }
        
        res.writeHead(301, {Location: '/cashPools/' + id});
        res.end();
    }

    function toggleSettlementUserState(username, status, id, res) {
        settlement = _settlementData.getSettlement(id);
        if (settlement === undefined) {
            res.status(404);
            res.send("Settlement not found.");
            return;
        }
        if (!settlement.toggleStateForUser(username, status)) {
            res.status(403);
            res.send("invalid username or state.");
            return;
        }
        
        res.writeHead(301, {Location: '/settlements/' + id});
        res.end();
    }
    
    return module;
};