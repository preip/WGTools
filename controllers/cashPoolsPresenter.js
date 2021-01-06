module.exports = function(cashPoolData, settlementData) {
    
    const _cashPoolData = cashPoolData;
    
    module.showCashPoolsIndex = function(req, res, next) {
        var pools = _cashPoolData.getPools(); 


        res.render('cashPools/cashPoolsIndex', {
            title: 'Cash Pools Index',
            cashPoolsData: pools,
            usernames: accountData.getUsernames(),
            requiresActionOfUser: requiresActionOfUserMap(req.session.username, pools)
        });
    };

    module.showCashPool = function(req, res, next) {
        if (req.params.id != null) {
            var pool = _cashPoolData.getPool(req.params.id);
        
            if (pool !== undefined) {
                res.render('cashPools/cashPoolsPool', {
                    title: pool.name,
                    sumData: pool.calcSums(),
                    dateString: utils.getCurrentDateString(),
                    pool: pool
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
    
    // TODO: check given username with session name or just ignore username altogether
    module.toggleUserState = function(req, res, next) {
        togglePoolUserState(req.session.username, req.query.state, req.params.id, res);
    }
    
    module.setFactor = function(req, res, next) {
        setFactorForUser(req.session.username, req.query.factor, req.params.id, res);
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

    /* Checks for all pools if a user action is required */
    function requiresActionOfUserMap(username, pools) {
        var obj = {};
        for(var pool in pools) {
            obj[pool] = requiresActionOfUser(username, pools[pool].participants);
        }
        return obj;
    }

    /* Sets the state of the pool for the current user */
    function requiresActionOfUser(username, participants) {
        if (!(username in participants)) {
            return false;
        }

        var close = false, settle = false;
        //Does anyone want to change the status of the pool?
        for(var name in participants) {
            close = close || participants[name].closed;
            settle = settle || participants[name].settled;
        }

        //Has the user not checked the field?
        var requiresActionOfUser = close && !participants[username].closed
            || settle  && !participants[username].settled;

        return requiresActionOfUser;
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
    
    function setFactorForUser(username, factor, id, res) {
        pool = _cashPoolData.getPool(id);
        if (pool === undefined) {
            res.status(404);
            res.send("Pool not found");
            return;
        }
        if (!pool.setFactorForUser(username, factor)) {
            res.status(403);
            res.send("invalid username or factor.");
            return;
        }
        res.writeHead(301, {Location: '/cashPools/' + id});
        res.end();
    }
    
    return module;
};