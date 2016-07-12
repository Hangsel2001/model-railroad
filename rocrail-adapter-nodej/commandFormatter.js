var countLength = function(content) { 
    return content.length;
}

var getCommand = function (content) {
    var command = content.substring(1, content.indexOf(" "));
    return command;
}

var getHeader = function (content) {
    var length = countLength(content);
    var command = getCommand(content);
    return '<?xml version="1.0" encoding="UTF-8"?><xmlh><xml size="' + length + '" name="' + command + '"/></xmlh>';
}

var getPackage = function (content) { 
    return getHeader(content) + content;
}

module.exports = {
    countLength : countLength,
    getCommand : getCommand,
    getHeader: getHeader,
    getPackage : getPackage
};