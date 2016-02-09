module.exports = function() {
    
    var _fs = require('fs');
    
    module.buildRoutes = function(app, routeFile) {
        console.log(routeFile);
        var raw = _fs.readFileSync(routeFile)
        var routes = JSON.parse(raw);
        for (var routeName in routes) {
            var route = routes[routeName];
            app.get(route.uri, createCallback(route));
        }
    }
    
    function createCallback(route) {
        return function(req, res, next) {
            var c = conCtrl.get(route.data);
            res.render(route.template, { title: route.data, content: c });
        };
    }
    
    return module;
}