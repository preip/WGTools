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
    var _settlementData = null;

    
    //----------------------------------------------------------------------------------------------
    // Public Methods
    //----------------------------------------------------------------------------------------------

    module.getSettlements = function() {
        if (_settlementData === null)
            loadData();    
        return _settlementData;
    }

    module.getSettlement = function(id, username) {
        if (_settlementData === null)
            loadData();

        var settlement = _settlementData[id];
        if(settlement == null)
            return null;

        var pools = _settlementData[id].pools;
        var poolData = [];
        settlement.items = [];
        for(var i = 0; i < pools.length; ++i) {
            var pool = _cashPoolData.getPool(pools[i]);
            var sums = pool.calcSums();
            poolData.push({
                id: pool.id,
                name: pool.name,
                sums: sums
            });
            settlement.items.push({
                "username": username,
                "description": pool.name,
                "date": pool.endDate,
                "id": pool.id,
                "value": sums[username] || 0
            });
        }
        
        settlement.poolData = poolData;

        return settlement;
    }

    module.setSettlement = function(settlement) {
        if (settlement == undefined || settlement.id == undefined)
            return;
        _settlementData[settlement.id] = settlement;
        saveData();
    }

    module.addNewSettlement = function(name, pools) {
        if (_settlementData === null)
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
        
        var settlement = {
            id: _nextId,
            name: name,
            pools: pools,
            participants: participantsWithState,
            status: "open"
        };
        attachSettlementMethods(settlement);
        
        _settlementData[_nextId] = settlement;
        saveData();
        return _nextId++;
    }

    //Returns if the Pool is in an existing settlement.
    module.isPoolInSettlement = function(id) {
        if (_settlementData === null)
            loadData();
 
        for(var settlement in _settlementData) {
            var pools = _settlementData[settlement].pools;
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

        for(var id in _settlementData) {
            delete _settlementData[id].poolData;
            delete _settlementData[id].requiresActionOfUser;
            delete _settlementData[id].items;
        }
        
        var raw = JSON.stringify(_settlementData, null, 4);
        fs.writeFileSync(path.join(_dataPath, "settlements.json"), raw, 'utf8'); 
    }
    
    function loadData() {
        var fs = require('fs');
        var path = require('path');
        var maxId = 0;

        //Settlements
        var raw = fs.readFileSync(path.join(_dataPath, "settlements.json"), 'utf8');
        var settlements = JSON.parse(raw);
        for(var settlement in settlements) {
            attachSettlementMethods(settlements[settlement]);

            if (settlements[settlement].id > maxId)
                maxId = settlements[settlement].id;
        }

        _settlementData = settlements;
        _nextId = maxId + 1;
    }

    function attachSettlementMethods(settlement) {
        settlement.setRequiresActionOfUser = settlement_setRequiresActionOfUser;
        settlement.calcSums =settlement_calcSums;
        settlement.toggleStateForUser = settlement_toggleStateForUser;
    }
    
    //----------------------------------------------------------------------------------------------
    // Settlement specific methods
    //----------------------------------------------------------------------------------------------
    
    /* Sets the state of the pool for the current user */
    function settlement_setRequiresActionOfUser(username) {
        //Is the user part of this settlement?
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

    function pool_compareEntries(entry1, entry2) {
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
    
    function settlement_calcSums() {
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

    function settlement_toggleStateForUser(username, status) {
        if (!(username in this.participants))
            return false;
        if (status === "settled" && this.status != "settled") {
            this.participants[username].settled = !this.participants[username].settled;
            // if every participant has marked to pool as closed, it will be closed automatically
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
}