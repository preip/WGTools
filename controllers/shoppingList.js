module.exports = function(dataPath) {
	
	const _dataPath = dataPath;
    
    var _data = null;
    var _idCounter = 0;

    module.showShoppingListPage = function(req, res, next) {
        if (_data === null)
            loadData();
        res.render('shoppingList', { title: 'WG Einkaufsliste', shoppingData: _data});
    };

     module.addNewEntry = function(req, res, next) {
        loadData();
        var name = req.body.name;
        var amount = req.body.amount;
        _data.push({ "id" : _idCounter, "name" : name, "amount" : amount, isClaimed: false});
        _idCounter++;
        saveData();
        res.writeHead(301, {Location: '/shoppingList/'});
        res.end();
    }

    module.deleteEntry = function(req, res, next) {
        var i = parseInt(req.query.Id);
        var k = _data.map(function(x) { return x.id; }).indexOf(i);
        
        if (k > -1)
            _data.splice(k, 1);

        saveData();
        res.writeHead(301, {Location: '/shoppingList/'});
        res.end();
    }

    module.updateEntry = function(req, res, next) {
        var i = parseInt(req.query.Id); 
        var k = _data.map(function(x) { return x.id; }).indexOf(i);

        if(_data[k])
            _data[k].isClaimed = !_data[k].isClaimed;

        saveData();
        res.writeHead(301, {Location: '/shoppingList/'});
        res.end();
    }

    module.getAll = function(req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(_data, null, 4));
    }
    
    function saveData() {
        var fs = require('fs');
        var raw = JSON.stringify(_data, null, 4);
        var path = require('path');
        fs.writeFileSync(path.join(_dataPath, 'shoppingList.json'), raw, 'utf8');
    }
    
    function loadData() {
        var fs = require('fs');
        var path = require('path');
        var raw = fs.readFileSync(path.join(_dataPath, 'shoppingList.json'), 'utf8');
        var data = JSON.parse(raw);
        _data = data;
        _idCounter = maxId(data);
    }

    function maxId(array) {
        if (array.length === 0)
            return 0;
        var max = array[0].id;
        for(i in array) {
            if (array[i].id > max)
                max = array[i].id;
        }
        return max + 1;
    }

	return module;
}