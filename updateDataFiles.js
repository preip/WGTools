var fs = require('fs');
var path = require('path');
var readline = require('readline');


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('> This script will try to update all data files to the current version.');
console.log('  To prevent any loss of data, you should first backup your data files');
console.log('  in a different location.');

rl.question('> Do you want to continue? (yes/no):', function(answer) {
    if (answer !== 'yes' && answer !== 'y') {
        console.log('> Aborted! The program will now terminate.');
        rl.close();
        process.exit();
    }
    rl.close();
    
    var targetVersionString;
    try {
        targetVersionString = fs.readFileSync('./.version', 'utf8');
    } catch(err) {
        console.log("Could not read version file. Program will now terminate...");
        process.exit();
    }
    var targetVersion = parseInt(targetVersionString);
    var previousVersion;
    
    var config;
    try {
        var raw = fs.readFileSync('./config.json', 'utf8');
        config = JSON.parse(raw);
    } catch(err) {
        console.log('> ERROR: Config file can\'t be parsed correctly.');
        console.log('  Please make sure that "config.json" is a valid json-file.');
        process.exit();
    }
    var previousVersion = config.version;
    if (previousVersion === undefined)
        previousVersion = 0;
    else
        previousVersion = parseInt(previousVersion);
    
    console.log("> Current version of data files is \'" + previousVersion + "\', target version is \'" + targetVersion + "\'.");
    if (previousVersion === parseInt(targetVersion)) {
        console.log("> All files are already up to date!");
        process.exit();
    }
    
    console.log("> Getting cash pool file list ... ");
    var cashPoolPath = "./" + config.dataPath + "/cashPools/";
    var cashPoolFiles = fs.readdirSync(cashPoolPath);
    console.log(">\t" + cashPoolFiles.length + " files found.");
    
    var previousVersion = parseInt(previousVersion);
    var currStep = previousVersion;
    
    //----------------------------------------------------------------------------------------------
    // Version 00000000 to 00000100
    if (previousVersion < 100) {
        console.log("> Updating from 00000000 to 00000100:");
        for (var i = 0; i < cashPoolFiles.length; i++) {
            console.log("\t" + cashPoolFiles[i]);
            var raw = fs.readFileSync(path.join(cashPoolPath, cashPoolFiles[i]), 'utf8');
            var pool = JSON.parse(raw);
            
            var updatedParticipants = {};
            for (var j = 0; j < pool.participants.length; j++) {
                updatedParticipants[pool.participants[j]] = {
                    "closed": (pool.status !== "open") ? true : false,
                    "settled": (pool.status === "settled") ? true : false
                };
            }
            pool.participants = updatedParticipants;
            
            var raw = JSON.stringify(pool, null, 4);
            fs.writeFileSync(path.join(cashPoolPath, cashPoolFiles[i]), raw, 'utf8');
        }
        currStep = 00000100;
    }
    //----------------------------------------------------------------------------------------------
    // Version 00000100 to 00000200
    if (previousVersion < 200) {
        console.log("> Updating from 00000100 to 00000200");
        for (var i = 0; i < cashPoolFiles.length; i++) {
            console.log("\t" + cashPoolFiles[i]);
            var raw = fs.readFileSync(path.join(cashPoolPath, cashPoolFiles[i]), 'utf8');
            var pool = JSON.parse(raw);
            
            for (user in pool.participants) {
                pool.participants[user].factor = 1.0;
            }
            var raw = JSON.stringify(pool, null, 4);
            fs.writeFileSync(path.join(cashPoolPath, cashPoolFiles[i]), raw, 'utf8');
        }
    }
    //----------------------------------------------------------------------------------------------
    // Version 00000200 to 00000200
    if (previousVersion < 300) {
        console.log("> Updating from 00000200 to 00000300");
        for (var i = 0; i < cashPoolFiles.length; i++) {
            console.log("\t" + cashPoolFiles[i]);
            var raw = fs.readFileSync(path.join(cashPoolPath, cashPoolFiles[i]), 'utf8');
            var pool = JSON.parse(raw);
            // convert time bounds
            var oldStart = pool.startDate.split('.');
            pool.startDate = oldStart[2] + '-' + oldStart[1] + '-' + oldStart[0];
            var oldEnd = pool.endDate.split('.');
            pool.endDate = oldEnd[2] + '-' + oldEnd[1] + '-' + oldEnd[0];
            // convert entry dates
            for (var j = 0; j < pool.items.length; j++) {
                var oldDate = pool.items[j].date.split('.');
                pool.items[j].date = oldDate[2] + '-' + oldDate[1] + '-' + oldDate[0];
            }
            var raw = JSON.stringify(pool, null, 4);
            fs.writeFileSync(path.join(cashPoolPath, cashPoolFiles[i]), raw, 'utf8');
        }
    }
        
    console.log("> All data files have been successfully upgraded to version \'" + targetVersion + "\'!");
    
    config.version = targetVersionString;
    var configRaw = JSON.stringify(config, null, 4);
    fs.writeFileSync(path.join(__dirname, 'config.json'), configRaw, 'utf8');
    console.log("> Version of config file has also been updated.");
});