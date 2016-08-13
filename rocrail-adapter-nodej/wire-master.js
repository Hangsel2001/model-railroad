var EventEmitter = require('events').EventEmitter;
var util = require('util');

function WireMaster() {
    var that = this;
    var i2c = require('i2c');
    this.address = 0x08;
    this.wire = new i2c(this.address, { device: '/dev/i2c-1' }); // point to your i2c address, debug provides REPL interface    
    this.Cancel = false;
    EventEmitter.call(this);
    var prevRes = [-1, -1];

    var reader = function () {
        that.wire.read(2, function (err, res) {
            if (err) {
                console.log(err);
                that.emit('error', err);
            } else {
                that.emit("data", res);
                if (res[0] != prevRes[0] || res[1] != prevRes[1]) {
                    that.emit("change", res);
                    prevRes = res;
                } 
            }
        });
        if (that.Cancel !== true) {
            setTimeout(reader, 50);
        };
    };

    setTimeout(reader, 50);
}

util.inherits(WireMaster, EventEmitter);

module.exports = new WireMaster();