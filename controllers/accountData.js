/**
 * Responsible for handling all account data operations like getting and setting user data,
 * validating passwords, etc.
 *
 * @class account
 * @constructor
 */
module.exports = function(dataPath) {
	// TODO: Reimplement password encryption with OAuth
    
    //----------------------------------------------------------------------------------------------
    // Data Fields
    //----------------------------------------------------------------------------------------------
    
    /**
     * Specifies the path at which the 'accounts.json' data file is located.
     *
     * @property _dataPath
     * @type string
     * @final
     */
    const _dataPath = dataPath;
    /**
     * Constant string that determines the algorithm which is used to hash plain-text passwords.
     *
     * @property _hashAlgorithm
     * @type string
     * @final
     */
    const _hashAlgorithm = config.hashAlgorithm;
    /**
     * Constant string that determines the string encoding which is used for hashes.
     *
     * @property _hashEncoding
     * @type string
     * @final
     */
    const _hashEncoding = config.hashEncoding;
    /**
     * The array of the account data of all users.
     *
     * @property _accountData
     * @type array
     */
    var _accountData = null;
    
    //----------------------------------------------------------------------------------------------
    // Public Methods
    //----------------------------------------------------------------------------------------------
    
    /**
     * Gets the account data for the specified username out of the database.
     *
     * @method getAccountData
     * @param (string) [username] The name of the user which data should be got.
     */
    module.getUser = function(username) {
        if (_accountData === null) {
            loadAccountData();
        }
        for (var i = 0; i < _accountData.length; i++) {
            if (_accountData[i].username === username)
                return _accountData[i];
        }
        return null;
    };
    /**
     * Sets the account data for the specified user to the specified data and saves the account
     * data to file.
     *
     * @method setAccountData
     * @param (string) [username] The name of the user which account data should be deleted.
     * @param (object) [data] The new data for the specified account name.
     */
    module.setUser = function(username, data) {
        for (var i = 0; i < _accountData.length; i++) {
            if (_accountData[i].username === username) {
                _accountData[i] = data;
                saveAccountData();
                return;
            }
        }
        _accountData.push(data);
        saveAccountData();
    }
    /**
     * Deletes the account data for the specified user and saves the account data to file.
     *
     * @method deleteAccountData
     * @param (string) [username] The name of the user which account data should be deleted.
     */
    module.deleteUser = function(username) {
        var accountIndex = -1;
        for (var i = 0; i < _accountData.length; i++) {
            if (_accountData[i].username === username) {
                accountIndex = i;
                break;
            }
        }
        if (accountIndex !== -1) {
            _accountData.splice(accountIndex, 1);
            saveAccountData();
        }
    }
    /**
     * Gets the names of all registered accounts.
     *
     * @method getUsernames
     * @return (array) The list of all currently registered accounts
     */
    module.getUsernames = function() {
        var accountNames = [];
        if (_accountData === null)
            loadAccountData();
        for (var i = 0; i < _accountData.length; i++) {
            accountNames.push(_accountData[i].username);
        }
        return accountNames;
    }
    /**
     * Checks if the given string of a password hash is valid by matching it against a set of rules.
     *
     * @method isPasswordHashValid
     * @param (string) [hash] The password hash which should be validated.
     * @return (boolean) true is the hash was valid, otherwise false.
     */
    module.isPasswordHashValid = function(hash) {
        // check if the hash is of the expected length
        // example: a sha512 hash is 512 bit long, a string containing a hexadecimal number
        //          encodes 4 bit into a character, therefore the hash has to be 128 chars long
        if (_hashAlgorithm === 'sha512' && hash.length !== 128)
            return false;
        // check if the hash is a valid hexadecimal number, e.g. contains only the numbers '1' to
        // '9' and the characters 'a' to 'f'
        if (res = RegExp('^([a-f]|[0-9])+$').test(hash) === false)
            return false;
        return true;
    }
    
    //----------------------------------------------------------------------------------------------
    // Private Methods
    //----------------------------------------------------------------------------------------------
    
    /**
     * Saves the account data to file. This should be done every time the data changes to provide
     * a consistent state in case of application crashes.
     */
    function saveAccountData() {
        var fs = require('fs');
        var raw = JSON.stringify(_accountData, null, 4);
        var path = require('path');
        fs.writeFileSync(path.join(_dataPath, 'accounts.json'), raw, 'utf8');
    }
    /**
     * Loads the account data from file.
     */
    function loadAccountData() {
        var fs = require('fs');
        var path = require('path');
        var raw = fs.readFileSync(path.join(_dataPath, 'accounts.json'), 'utf8');
        var data = JSON.parse(raw);
        _accountData = data;
    }
        
    return module;
};