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

    module.getSettlement = function(id) {
        //TODO: Check if id exist
        if (_settlementData === null)
            loadData();
        
        for(var poolId in _settlementData[id].pools) {
            //Calc summary.    
        }
        
        return _settlementData[id];
    }

    module.setSettlement = function(settlement) {
        if (settlement == undefined || settlement.id == undefined)
            return;
        _settlementData[settlement.id] = settlement;
        saveSettlements();
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

        //TODO: Check if pools exist
        
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
        return;
    }
    
    //----------------------------------------------------------------------------------------------
    // Pool specific methods
    //----------------------------------------------------------------------------------------------
    
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
    
    function pool_calcSums() {
        var sums = {};
        for (var name in this.participants) {
            sums[name] = 0.0;
        }

        var total = 0.0;
        for (var i = 0; i < this.items.length; i++) {
            var curData = this.items[i];
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
}