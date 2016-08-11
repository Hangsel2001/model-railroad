

module.exports.Groups = { "Host": 0, "Stationary": 3, "Sensor": 8 };
module.exports.Codes = {
    Host: { "PingReq": 2 , "PingRep": 3},
    Sensor : { "Report": 1 },
    Stationary: {"Show" : 11 }
};
module.exports.Types = { "Request": 0, "Event": 1, "Response": 2 };

var checkSum = function (data) {
    var chksum = 0xff;
    var i;
    for (i = 0; i < data.length; i++) {
        chksum ^= data[i];
    }
    return chksum;
}
    

function Packager(options) {

    var pack = function (opt) {
        opt.Data = opt.Data || []
        var type = opt.Type || 0;
        var array = [0, 0, 0];
        array.push(options.addrHigh || 0, options.addrLow || 0, opt.Group, 
            opt.Code | type << 5);
        array.push(opt.Data.length);
        if (opt.Data.length > 0) {
            array = array.concat(opt.Data);
            array.push(checkSum(opt.Data));
        }
        return array;
    }
    return {
        Package: pack
    }
};

function depackage(pack) {
    var obj = {
        Network: pack[0],
        Recipient: pack[1] << 8 | pack[2] ,
        Sender: pack[3] << 8 | pack[4],
        Action: {
            Group: pack[5],
            Code: pack[6] & 31,
            Type: (pack[6] & 96) >> 5
        },
    };
    var dataLength = pack[7];
    if (dataLength > 0) {
        var last = 8 + dataLength;
        var data = pack.slice(8, last);
        if (pack.length > last) {
            var checksum = checkSum(data);
            if (checksum !== pack[last]) {
                throw { "Error": "Checksum Error" };
            }
        }
        obj.Data = data;
    }
    return obj;
}

module.exports.Packager = Packager;
module.exports.depackage = depackage;