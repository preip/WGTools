module.exports = function() {
    
    module.getCurrentDateString = function() {
        var date = new Date();
        var datestring = ''
        if (date.getDate() < 10)
            datestring += '0';
        datestring += String(date.getDate()) + '.';
        if (date.getMonth() < 9)
            datestring += '0';
        datestring +=  String(date.getMonth() + 1) + '.' + String(date.getFullYear());
        return datestring;
    }
    
    return module;
};