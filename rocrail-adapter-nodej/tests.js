var assert = require('assert');
var formatter = require('./commandFormatter.js');

describe('Header handling', function () {
    var command = '<lc dir="false" addr="3" V_raw="30"/>';

    it('Counts Length', function () {        
        var length = formatter.countLength(command)
        assert.equal(length, 37)
    });

    it('finds lc-command', function () {
        var commandElement = formatter.getCommand(command)
        assert.equal(commandElement, "lc");
    });

    it('formats a header', function () {
        var header = formatter.getHeader(command);
        assert.equal(header, '<?xml version="1.0" encoding="UTF-8"?><xmlh><xml size="37" name="lc"/></xmlh>')
    })

    it('formats a package', function () {
        var toFormat = '<fb state="true" addr="3"/>';
        var pack = formatter.getPackage(toFormat);
        assert.equal(pack, '<?xml version="1.0" encoding="UTF-8"?><xmlh><xml size="27" name="fb"/></xmlh><fb state="true" addr="3"/>');
    })
})
