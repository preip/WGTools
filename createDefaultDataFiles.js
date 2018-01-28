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
    
    var version;
    try {
        version = fs.readFileSync('./.version', 'utf8');;
    } catch(err) {
        console.log("Could not read version file. Program will now terminate...");
        process.exit();
    }
    
    /**
     * Configuration File
     */
    console.log('> Creating config file...');
    var config = {
        "version" : version,
        "port" : "63357",
        "dataPath" : "exampleData",
        "sessionSeed" : "secret",
        "hashAlgorithm" : "sha512",
        "hashEncoding" : "utf-8"
    };
    var configRaw = JSON.stringify(config, null, 4);
    fs.writeFileSync(path.join(__dirname, 'config.json'), configRaw, 'utf8');
    var _dataPath = path.join(__dirname, config.dataPath);
    //fs.accessSync(_dataPath, fs.F_OK | fs.R_OK);
    if (fs.existsSync(_dataPath) == false)
        fs.mkdirSync(_dataPath);
    var _hashAlgorithm = config.hashAlgorithm;
    var _hashEncoding = config.hashEncoding;
    
    /**
     * Accounts
     */
     console.log('> Creating accounts...');
    var crypto = require('crypto');
    var hash1 = crypto.createHash(_hashAlgorithm);
    hash1.update('password1', _hashEncoding);
    var pwd1 = hash1.digest('hex').toString(_hashEncoding);
    var hash2 = crypto.createHash(_hashAlgorithm);
    hash2.update('password2', _hashEncoding);
    var pwd2 = hash2.digest('hex').toString(_hashEncoding);
    var hash3 = crypto.createHash(_hashAlgorithm);
    hash3.update('password3', _hashEncoding);
    var pwd3 = hash3.digest('hex').toString(_hashEncoding);
    
    var accountData = [
        { "username" : "inhabitant_1", 'password' : pwd1 },
        { "username" : "inhabitant_2", 'password' : pwd2 },
        { "username" : "inhabitant_3", 'password' : pwd3 }
    ];
    var accountDataRaw = JSON.stringify(accountData, null, 4);
    fs.writeFileSync(path.join(_dataPath, 'accounts.json'), accountDataRaw, 'utf8');
    
    /**
     * Shopping List
     */
    console.log('> Creating shoppingList file...');
    var shoppingListData = [
        {
            "id": 0,
            "name": "Brot",
            "amount": "2",
            "isClaimed": false
        },
        {
            "id": 1,
            "name": "Met",
            "amount": "4",
            "isClaimed": false
        },
        {
            "id": 2,
            "name": "Kekse ",
            "amount": "3",
            "isClaimed": false
        }
    ];
    var shoppingListDataRaw = JSON.stringify(shoppingListData, null, 4);
    fs.writeFileSync(path.join(_dataPath, 'shoppingList.json'), shoppingListDataRaw, 'utf8');

    /**
     * Settlements
     */
    console.log('> Creating Settlements file...');
    var settlementsData = [

    ];
    var settlementsDataRaw = JSON.stringify(settlementsData, null, 4);
    fs.writeFileSync(path.join(_dataPath, 'settlements.json'), settlementsDataRaw, 'utf8');
    
    /**
     * Calendar
     */
    console.log('> Creating calendar file...');
    var calendarData = [
        {
            "title": "Patrick Bad",
            "start": "2017-04-08",
            "end": "2017-04-09",
            "allDay": true,
            "_id": "_fc1",
            "className": [],
            "_allDay": true,
            "_start": "2017-04-08",
            "_end": "2017-04-09",
            "source": null
        },
        {
            "title": "Simon Bad",
            "start": "2017-04-15",
            "end": "2017-04-16",
            "allDay": true,
            "_id": "_fc2",
            "className": [],
            "_allDay": true,
            "_start": "2017-04-15",
            "_end": "2017-04-16",
            "source": null
        },
        {
            "title": "Katja Flur",
            "start": "2017-04-22",
            "end": "2017-04-23",
            "allDay": true,
            "_id": "_fc3",
            "className": [],
            "_allDay": true,
            "_start": "2017-04-22",
            "_end": "2017-04-23",
            "source": null
        },
        {
            "title": "Philipp Bad",
            "start": "2017-04-29",
            "end": "2017-04-30",
            "allDay": true,
            "_id": "_fc4",
            "className": [],
            "_allDay": true,
            "_start": "2017-04-29",
            "_end": "2017-04-30",
            "source": null
        }
    ]
    var calendarDataRaw = JSON.stringify(calendarData, null, 4);
    fs.writeFileSync(path.join(_dataPath, 'calendar.json'), calendarDataRaw, 'utf8');
    
    /**
     * Cash Pools
     */
    console.log('> Creating cashPools file...');
    var cashPool1Data = {
        id: 10,
        name: "Pool 1",
        owner: [
            "inhabitant_2"
        ],
        participants: {
            "inhabitant_1" : {
                "closed": false,
                "settled": false
            },
            "inhabitant_2" : {
                "closed": false,
                "settled": false
            }
        },
        startDate: "01.07.2016",
        endDate: "31.07.2016",
        enforceTimeBounds: true,
        status: "settled",
        items: [
            {
                username: "inhabitant_1",
                description: "payment_1",
                date: "01.01.2000",
                value: "10.56"
            },
            {
                username: "inhabitant_2",
                description: "payment_2",
                date: "02.01.2000",
                value: "4.05"
            },
            {
                username: "inhabitant_1",
                description: "payment_3",
                date: "01.02.2000",
                value: "17.75"
            },
            {
                username: "inhabitant_3",
                description: "payment_1",
                date: "01.01.2001",
                value: "25.39"
            },
            {
                username: "inhabitant_1",
                description: "test",
                date: "27.07.2016",
                value: "10.12"
            }
        ]
    };
        
    var cashPool2Data = {
        id: 12,
        name: "Pool 2",
        owner: [  
                "inhabitant_1"
        ],
        participants: {
            "inhabitant_1" : {
                "closed": false,
                "settled": false
            },
            "inhabitant_2": {
                "closed": false,
                "settled": false
            },
            "inhabitant_3" : {
                "closed": false,
                "settled": false
            }
        },
        startDate: "01.07.2016",
        endDate: "31.07.2016",
        enforceTimeBounds: true,
        status: "open",
        items: [
            {
                username: "inhabitant_1",
                description: "payment_1",
                date: "01.01.2000",
                value: "10.56"
            },
            {
                username: "inhabitant_2",
                description: "payment_2",
                date: "02.01.2000",
                value: "4.05"
            },
            {
                username: "inhabitant_1",
                description: "payment_3",
                date: "01.02.2000",
                value: "17.75"
            },
            {
                username: "inhabitant_3",
                description: "payment_1",
                date: "01.01.2001",
                value: "25.39"
            },
            {
                username: "inhabitant_1",
                description: "test",
                date: "27.07.2016",
                value: "10.12"
            }
        ]
    };
    
    var cashPoolDataRaw = JSON.stringify(cashPool1Data, null, 4);
    if (!fs.existsSync(path.join(_dataPath, 'cashPools')))
        fs.mkdirSync(path.join(_dataPath, 'cashPools'));
    fs.writeFileSync(path.join(_dataPath, 'cashPools/10.json'), cashPoolDataRaw, 'utf8');
    
    cashPoolDataRaw = JSON.stringify(cashPool2Data, null, 4);
    fs.writeFileSync(path.join(_dataPath, 'cashPools/12.json'), cashPoolDataRaw, 'utf8');

    console.log('> Finished creating all default data files!');
});
