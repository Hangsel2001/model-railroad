var assert = require('assert');
var formatter = require('./commandFormatter.js');
var packager = require('./packager.js');

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

describe('packge tests', function () {
    it('creates sensor package', function () {
        var pack = packager.Packager({ addrHigh: 0, addrLow: 3 });
        var actual = pack.Package({
            Group: packager.Groups.Sensor,
            Code: packager.Codes.Sensor.Report,
            Data: [0, 0, 1, 1]
        });
        assert.deepEqual(actual, [0, 0, 0, 0, 3, 8, 1, 4, 0, 0, 1, 1, 255]);
    })
    it('decodes array', function () {
        var obj = packager.depackage([0, 0, 0, 0, 3, 8, 1, 4, 0, 0, 1, 1, 255]);
        assert.deepEqual(obj.Data, [0, 0, 1, 1]);
        assert.equal(obj.Sender, 3);
    });
    it('marks event', function () {
        var obj = packager.depackage([0, 0, 0, 0, 3, 0, 35, 0]);
        assert.equal(obj.Action.Type, 1);
        assert.equal(obj.Action.Code, 3);
    })
    it('formats as event', function () { 
        var pack = packager.Packager({ addrHigh: 0, addrLow: 3 });
        var actual = pack.Package({
            Type: packager.Types.Event,
            Group: packager.Groups.Host,
            Code: packager.Codes.Host.PingRep,
            Data: []
        });
        assert.deepEqual(actual, [0, 0, 0, 0, 3, 0, 35, 0]); 
    })

 
})
