module.exports = function(dataPath) {
	
	const _dataPath = dataPath;
    
    var _data = [];

    module.showShoppingListPage = function(req, res, next) {
        if (_data === null)
            loadData();
        res.render('shoppingList', { title: 'WG Einkaufsliste', shoppingData: _data});
    };

     module.addNewEntry = function(req, res, next) {
        var name = req.body.name;
        var isClaimed = req.body.isClaimed;
        var amount = req.body.amount;
        _data.push({ "name" : name, "amount" : amount, isClaimed: isClaimed});
        saveData();
        res.render('shoppingList', { title: 'WG Einkaufsliste', shoppingData: _data});
    }
    
    function saveData() {
        var fs = require('fs');
        var raw = JSON.stringify(_data, null, 4);
        var path = require('path');
        fs.writeFileSync(path.join(_dataPath, 'shoppingList.json'), raw, 'utf8');
    }
    
    function loadData() {
        debugger;
        var fs = require('fs');
        var path = require('path');
        var raw = fs.readFileSync(path.join(_dataPath, 'shoppingList.json'), 'utf8');
        var data = JSON.parse(raw);
        _data = data;
    }

	return module;
}