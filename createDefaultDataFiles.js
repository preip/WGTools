var fs = require('fs');
var path = require('path');
var readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('> This script will overwrite any present \'config.json\' with the default values');
console.log('  and may also revert any changes you made to the default data files.');

rl.question('> Do you want to continue? (yes/no):', function(answer) {
    if (answer !== 'yes') {
        console.log('> Aborted! The program will now terminate.');
        rl.close();
        process.exit();
    }
    rl.close();
    
    /**
     * Configuration File
     */
    console.log('> Creating config file...');
    var config = {
        "port" : "63357",
        "dataPath" : "exampleData",
        "sessionSeed" : "secret"
    };
    var configRaw = JSON.stringify(config, null, 4);
    fs.writeFileSync(path.join(__dirname, 'config.json'), configRaw, 'utf8');
    var _dataPath = path.join(__dirname, config.dataPath);
    //fs.accessSync(_dataPath, fs.F_OK | fs.R_OK);
    if (fs.existsSync(_dataPath) == false)
        fs.mkdirSync(_dataPath);
    /**
     * Cash Data File
     */
    console.log('> Creating cash file...');
    var cashData = [
        { "name" : "inhabitant_1", "description" : "payment_1", "value" : "10.56" },
        { "name" : "inhabitant_2", "description" : "payment_2", "value" : "4.05" },
        { "name" : "inhabitant_1", "description" : "payment_3", "value" : "17.75" },
        { "name" : "inhabitant_3", "description" : "payment_1", "value" : "25.39" },
    ];
    var cashDataRaw = JSON.stringify(cashData, null, 4);
    fs.writeFileSync(path.join(_dataPath, 'cash.json'), cashDataRaw, 'utf8');

    console.log('> Creating shoppingList file...');
    var ShoppingListData = [
        { "name": "Klopapier", "amount": "10", "isChecked": true},
        { "name": "Klopapier", "amount": "10", "isChecked": false},
        { "name": "Brot", "amount": "1", "isChecked": true},
    ];
    var shoppingListDataRaw = JSON.stringify(cashData, null, 4);
    fs.writeFileSync(path.join(_dataPath, 'shoppingList.json'), shoppingListDataRaw, 'utf8');

    console.log('> Finished creating all default data files!');
});
