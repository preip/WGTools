module.exports = function(dataPath) {
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
 
    var _nextId = 0;
    
    /**
     * The array of all cash pools.
     *
     * @property _accountData
     * @type array
     */
    var _poolData = null;
  
    //----------------------------------------------------------------------------------------------
    // Public Methods
    //----------------------------------------------------------------------------------------------
    
    module.getPools = function() {
        if (_poolData === null)
            loadData();
        return _poolData;
    }

    module.getPool = function(id) {
        if (_poolData === null) {
            loadData();
        }
        return _poolData[id];
    }

    module.setPool = function(pool) {
        if (pool == undefined || pool.id == undefined)
            return;
        _poolData[pool.id] = pool;
        savePool(pool);
    }
    
    module.addNewPool = function(name, owner, participants, startDate, endDate, enforceTimeBounds) {
        var participantsWithState = {};
        for (var i = 0; i < participants.length; i++)
            participantsWithState[participants[i]] = {
                "closed" : false,
                "settled" : false
            };
        
        pool = {
            id: _nextId,
            name: name,
            owner: owner,
            participants: participantsWithState,
            startDate: startDate,
            endDate: endDate,
            enforceTimeBounds: enforceTimeBounds,
            status: "open",
            items: []
        };
        attachPoolMethods(pool);
        
        _poolData[_nextId] = pool;
        savePool(pool);
        return _nextId++;
    }
   
    //----------------------------------------------------------------------------------------------
    // File system related methods
    //----------------------------------------------------------------------------------------------
    
    function savePool(pool) {
        var fs = require('fs'); 
        var path = require('path');
        
        if (!fs.existsSync(_dataPath))
            fs.mkdirSync(_dataPath);
        
        var raw = JSON.stringify(pool, null, 4);
        fs.writeFileSync(path.join(_dataPath, pool.id.toString() + ".json"), raw, 'utf8');
    }
   
    function saveData() {
        for (var id in _poolData)
            savePool(_poolData[id]);
    }
    
    function loadData() {
        var fs = require('fs');
        var path = require('path');
        var files = fs.readdirSync(_dataPath);
        var data = {};
        var maxId = 0;
        
        for (var i = 0; i < files.length; i++) {
            var raw = fs.readFileSync(path.join(_dataPath, files[i]), 'utf8');
            var pool = JSON.parse(raw);
            if (pool.id > maxId)
                maxId = pool.id;
            attachPoolMethods(pool);
            data[pool.id] = pool;
        }
        _poolData = data;
        _nextId = maxId + 1;
    }
   
    function attachPoolMethods(pool) {
        pool.addNewEntry = pool_addNewEntry;
        pool.isEntryValid = pool_isEntryValid;
        pool.compareEntries = pool_compareEntries;
        pool.calcSums = pool_calcSums;
        pool.setState = pool_setState;
        //pool.setRequiresActionOfUser = pool_setRequiresActionOfUser;
        //pool.resetClosedState = pool_resetClosedState;
        pool.toggleStateForUser = pool_toggleStateForUser;
    }
    
    //----------------------------------------------------------------------------------------------
    // Pool specific methods
    //----------------------------------------------------------------------------------------------
    


    function pool_addNewEntry(entry) {
        if (this.status !== 'open' || !this.isEntryValid(entry))
            return false;
        this.items.push(entry);
        this.items.sort(this.compareEntries);
        
        //this.resetClosedState();
        
        savePool(this);
        return true;
    }
    
    function pool_isEntryValid(entry) {
        if (entry.username == null)
            return false;
        
        if (this.enforceTimeBounds && (entry.date < this.startDate || entry.date > this.endDate))
            return false;
        
        if (!(entry.username in this.participants))
            return false;
        
        return true;
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
    
    function pool_setState(status) {        
        if (status !== "open" && status !== "closed" && status !== "settled")
            return false;
        this.status = status;
        savePool(this);
        return true;
    }
    
    /*
    function pool_resetClosedState() {
        for (var username in this.participants) {
            this.participants[username].closed = false;
        }
    }
    */
    
    function pool_toggleStateForUser(username, status) {
        if (!(username in this.participants))
            return false;
        if (status === "closed") {
            this.participants[username].closed = !this.participants[username].closed;
            // if every participant has marked to pool as closed, it will be closed automatically
            var count = 0;
            for (var name in this.participants)
                if (this.participants[name].closed === true)
                    count++;
            if (count === Object.keys(this.participants).length)
                this.status = "closed"
        }
        else if (status === "settled") {
            this.participants[username].settled = !this.participants[username].settled;
            // if every participant has marked to pool as settled, it will be settled automatically
            var count = 0;
            for (var name in this.participants)
                if (this.participants[name].settled === true)
                    count++;
            if (count === Object.keys(this.participants).length)
                this.status = "settled"
        }
        else
            return false;
        
        savePool(this);
        return true;
    }
    
    return module;
}