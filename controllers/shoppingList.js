module.exports = function(dataPath) {
	
	const _dataPath = dataPath;
    
    var _data = null;

    module.showShoppingListPage = function(req, res, next) {
        if (_data === null)
            loadData();
        res.render('shoppingList', { title: 'WG Einkaufsliste', shoppingData: _data});
    };

     module.addNewEntry = function(req, res, next) {
        var name = req.body.name;
        var amount = req.body.amount;
        _data.push({ "name" : name, "amount" : amount, isClaimed: false});
        saveData();
        res.render('shoppingList', { title: 'WG Einkaufsliste', shoppingData: _data});
    }

    module.updateEntry = function(req, res, next) {
        var data = req.body; 
        for(var i in _data) {
            if (_data[i].name == data.name)
            {
                debugger;
                _data[i].isClaimed = data.isClaimed;
            }
        }
        saveData();
        res.send(data);
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
    }

	return module;
}