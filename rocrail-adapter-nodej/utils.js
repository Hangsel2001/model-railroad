var getBitStateForByte = function (byte) {
    var results = [];
    for (var i = 0; i < 8; i++) {
        results.push(byte & 1);
        byte = byte >> 1;
    }
    return results;
}

var getBitStates = function (data) {
    if (data.length) {
        var all = [];
        for (var i = 0; i < data.length; i++) { 
            var bits = getBitStateForByte(data[i]);
            all = all.concat(bits);
        }
        return all;
    } else { 
        return getBitStateForByte(data);
    }
};

module.exports = {
    getBitStates :getBitStates
}