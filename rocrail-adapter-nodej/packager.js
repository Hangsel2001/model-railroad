

module.exports.Groups = { "Sensor": 8 };
module.exports.Codes = { Sensor : { "Report": 1 } };

function Packager(options) {
    var checkSum = function (data) {
        var chksum = 0xff;
        var i;
        for (i = 0; i < data.length; i++) {
            chksum ^= data[i];
        }
        return chksum;
    }
    
    var pack = function (opt) {
        var array = [0, 0, 0];
        array.push(options.addrHigh || 0, options.addrLow || 0, opt.Group, opt.Code);
        array.push(opt.Data.length);
        array = array.concat(opt.Data);
        array.push(checkSum(opt.Data));
        return array;
    }
    return {
        Package: pack
    }
};

module.exports.Packager = Packager;