module.exports = function(dataPath, cashPoolData) {
    //----------------------------------------------------------------------------------------------
    // Data Fields
    //----------------------------------------------------------------------------------------------
    
    /**
     * Specifies the path at which cash pools are stored.
     *
     * @property _dataPath
     * @type string
     * @final
     */
    const _dataPath = dataPath;

    const _cashPoolData = cashPoolData;
    
    var _nextId = 0;

     /**
     * The array of all settlements.
     *
     * @property _accountData
     * @type array
     */
    var _billingData = null;

    
    //----------------------------------------------------------------------------------------------
    // Public Methods
    //----------------------------------------------------------------------------------------------

    module.getBills = function() {
        if (_billingData === null)
            loadData();    
        return _billingData;
    }

    module.getBill = function(id, username) {
        if (_billingData === null)
            loadData();
        var bill = _billingData[id];
        if(bill === null || bill === undefined)
            return undefined;

        var pools = _billingData[id].pools;
        var poolData = [];
        bill.items = [];
        for(var i = 0; i < pools.length; ++i) {
            var pool = _cashPoolData.getPool(pools[i]);
            var sums = pool.calcSums();
            poolData.push({
                id: pool.id,
                name: pool.name,
                sums: sums
            });
            bill.items.push({
                "username": username,
                "description": pool.name,
                "date": pool.endDate,
                "id": pool.id,
                "value": sums[username] || 0
            });
        }
        
        bill.poolData = poolData;

        return bill;
    }

    module.setBill = function(bill) {
        if (_billingData === null)
            loadData();
        if (bill == undefined || bill.id == undefined)
            return;
        _billingData[bill.id] = bill;
        saveData();
    }

    module.addNewBill = function(name, pools) {
        if (_billingData === null)
            loadData();
        var participantsWithState = {};
        for(var i = 0; i < pools.length; ++i) {
            var pool = _cashPoolData.getPool(pools[i]);
            var participants = pool.participants;
            for(var participant in participants) {
                participantsWithState[participant] = {
                    "settled": false
                };
            }
        }
        
        var bill = {
            id: _nextId,
            name: name,
            pools: pools,
            participants: participantsWithState,
            status: "open"
        };
        attachSettlementMethods(bill);
        
        _billingData[_nextId] = bill;
        saveData();
        return _nextId++;
    }
    
    module.getBillCandidatePools = function() {
        if (_billingData === null)
            loadData();
        var result = [];
        var pools = _cashPoolData.getPools();
        for(var pool in pools){
            //pools[pool].setRequiresActionOfUser(req.session.username);
            if (pools[pool].status === "closed" && !isPoolInBill(pool))
                result.push({id: pools[pool].id, name: pools[pool].name});
        }
        return result;
    }

    //----------------------------------------------------------------------------------------------
    // Private Methods
    //----------------------------------------------------------------------------------------------
    
    function isPoolInBill(id) {
        if (_billingData === null)
            loadData();
        var pools = _cashPoolData.getPools();
        for(var bill in _billingData) {
            var pools = _billingData[bill].pools;
            for(var i = 0; i < pools.length; ++i) {
                if(pools[i] === id)
                    return true;
            }
        }
        return false;
    }
    
    //----------------------------------------------------------------------------------------------
    // File system related methods
    //----------------------------------------------------------------------------------------------
    
    
    function saveData() {
        var fs = require('fs'); 
        var path = require('path');
        
        if (!fs.existsSync(_dataPath))
            fs.mkdirSync(_dataPath);

        for(var id in _billingData) {
            delete _billingData[id].poolData;
            delete _billingData[id].requiresActionOfUser;
            delete _billingData[id].items;
        }
        
        var raw = JSON.stringify(_billingData, null, 4);
        fs.writeFileSync(path.join(_dataPath, "billing.json"), raw, 'utf8'); 
    }
    
    function loadData() {
        var fs = require('fs');
        var path = require('path');
        var maxId = 0;

        var raw = fs.readFileSync(path.join(_dataPath, "billing.json"), 'utf8');
        var billingData = JSON.parse(raw);
        for(var bill in billingData) {
            attachBillMethods(billingData[bill]);

            if (billingData[bill].id > maxId)
                maxId = billingData[bill].id;
        }

        _billingData = billingData;
        _nextId = maxId + 1;
    }

    function attachBillMethods(bill) {
        bill.setRequiresActionOfUser = bill_setRequiresActionOfUser;
        bill.calcSums = bill_calcSums;
        bill.toggleStateForUser = bill_toggleStateForUser;
    }
    
    //----------------------------------------------------------------------------------------------
    // Bill specific methods
    //----------------------------------------------------------------------------------------------
    
    function bill_setRequiresActionOfUser(username) {
        //Is the user part of this bill?
        if (!(username in this.participants)) {
            this.requiresActionOfUser = false;
            return false;
        }

        var settle = false;

        //Does anyone want to change the status of the pool?
        for(var name in this.participants) {
            settle = settle || this.participants[name].settled;
        }

        //Has the use not checked the field?
        this.requiresActionOfUser = settle && !this.participants[username].settled;
    }
    
    function bill_calcSums() {
        var sums = {};
        for (var name in this.participants) {
            sums[name] = 0.0;
        }

        for(var i = 0; i < this.poolData.length; ++i) {
            for(var participant in this.poolData[i].sums) {
                sums[participant] += this.poolData[i].sums[participant] || 0;
            }
        }

        return sums;
    }

    function bill_toggleStateForUser(username, status) {
        if (!(username in this.participants))
            return false;
        if (status === "settled" && this.status != "settled") {
            this.participants[username].settled = !this.participants[username].settled;
            // if every participant has marked the bill as settled, the bill itself and all pools
            // will be settled automatically
            var count = 0;
            for (var name in this.participants)
                if (this.participants[name].settled === true)
                    count++;
            if (count === Object.keys(this.participants).length) {
                this.status = "settled"
                for(var i = 0; i < this.pools.length; ++i) {
                    _cashPoolData.getPool(this.pools[i]).setState("settled");
                }
            }
        }
        else
            return false;
        
        saveData();
        return true;
    }
    
    return module;
};
