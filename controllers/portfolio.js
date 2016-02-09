module.exports = function() {
    const DEFAULT_LANG_TAG = "en";

    var _fs = require('fs');
    
    var _projects = { };
    
    var _dataPath = '/data/portfolio';
    module.getDataPath = function() {
        return _dataPath;
    };
    module.setDataPath = function(dataPath) {
        _dataPath = dataPath;
    };
    
    var projectGet = function(fieldName, langTag) {
        if (this.dict === undefined) {
            return 'no ' + fieldName + 'available';
            console.log('ERROR: project object \'' + this.title + '\' contains no dict');
        }
        var langObj = this.dict[langTag];
        if (langObj === undefined) {
            console.log('ERROR: project object \'' + this.title + '\' contains no dict entry for the language tag\'' + langTag + '\'');
            langObj = this.dict[DEFAULT_LANG_TAG];
        }
        if (langObj === undefined) {
            return 'no ' + fieldName + 'available';
            console.log('ERROR: project object \'' + this.title + '\' contains no default dict entry');
        }
            
        return langObj[fieldName];
    }
    
    module.init = function() {
        var files = _fs.readdirSync(__dirname + '/..' + _dataPath);
        
        for (var i = 0; i < files.length; i++) {
            if (files[i].charAt(0) === '_' || files[i].split('.').pop() !== 'json')
                continue
            var project = createPortfolioProject(files[i]);
            if (project === undefined)
                console.log("ERROR: Invalid JSON Project File \"" + files[i] + "\"")
            
            _projects[project.name] = project;
        }
    };
    
    module.projectDispatcher = function(req, res, next) {
        var project = _projects[req.params.projectName];
        res.render('portfolio/project', { title: 'Portfolio', project: project });
    };
    
    module.tagDispatcher = function(req, res, next) {
        
        var tmpProjects = [];
        for (var projectName in _projects) {
            var project = _projects[projectName];
            if (project.visible != 'false' && (req.params.tagName === undefined
                || project.tags.indexOf(req.params.tagName) != -1)) {
                tmpProjects.push(_projects[projectName]);           
            }
        }
        tmpProjects.sort(function(a, b) {
            return (parseInt(a.dateStart) - parseInt(b.dateStart)) * -1;
        });
        res.render('portfolio/overview', { title: 'Portfolio', projects: tmpProjects});
    };
    
    function createPortfolioProject(fileName) {
        try {        
            var raw = _fs.readFileSync(__dirname + '/..' + _dataPath + '/' + fileName, 'utf8');
            var project = JSON.parse(raw);
            project.get = projectGet;
            project.name = fileName.split('.')[0];
            return project;
        }
        catch(err) {
        }
    };

    return module;
}