module.exports = function(dataPath) {
    const DEFAULT_LANG_TAG = "en";

    var _fs = require('fs');
    
    var _contentList = { };
    
    var _dataPath = dataPath;
    module.getDataPath = function() {
        return _dataPath;
    };
    module.setDataPath = function(dataPath) {
        _dataPath = dataPath;
    };
    
    var contentDictGet = function(fieldName, langTag) {
        if (this.dict === undefined) {
            return 'no ' + fieldName + 'available';
            console.log('ERROR: content object \'' + this.title + '\' contains no dict');
        }
        var langObj = this.dict[langTag];
        if (langObj === undefined) {
            console.log('ERROR: content object \'' + this.title + '\' contains no dict entry for the language tag\'' + langTag + '\'');
            langObj = this.dict[DEFAULT_LANG_TAG];
        }
        if (langObj === undefined) {
            return 'no ' + fieldName + 'available';
            console.log('ERROR: content object \'' + this.title + '\' contains no default dict entry');
        }
            
        return langObj[fieldName];
    }
    
    module.get = function(uri) {
        if (uri in _contentList)
            return _contentList[uri];
        
        var content = loadContentFile(uri);
        if (content === undefined) {
            console.log('ERROR: failed to load content file \'' + uri + '\'');
            return;
        }
        _contentList[uri] = content;
        return content;
    };
    
    function loadContentFile(fileName) {
        try {
            var raw = _fs.readFileSync(_dataPath + fileName + '.json', 'utf8');
            var content = JSON.parse(raw);
            content.get = contentDictGet;
            content.name = fileName;
            return content;
        }
        catch(err) {
            console.log(err);
        }
    };
    
    return module;
}