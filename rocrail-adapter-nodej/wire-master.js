var EventEmitter = require('events').EventEmitter;

function WireMaster() {
    var that = this;
    this.i2c = require('i2c');
    this.address = 0x08;
    this.wire = new i2c(address, { device: '/dev/i2c-1' }); // point to your i2c address, debug provides REPL interface    
    this.Cancel = false;
    EventEmitter.call(this);
    
    var reader = function () {
        wire.read(2, function (err, res) {
            that.emit("data", res);
            console.log(res.charAt(0));
            console.log(res.charAt(1));
        });
        if (that.Cancel !== true) {
            setTimeout(reader, 100);
        };
    };

    setTimeout(reader, 100);
}

util.inherits(RocrailClient, EventEmitter);

module.exports = new WireMaster();