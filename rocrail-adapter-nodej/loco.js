var EventEmitter = require('events').EventEmitter;
var util = require('util');

function Loco(rocrailClient, locoId) {
    EventEmitter.call(this);
    this.client = rocrailClient;
    this.locoId = locoId;
};

util.inherits(Loco, EventEmitter);


Loco.prototype.goTo = function (blockId) {
    this.client.send('<lc id="' + this.locoId + '" cmd="gotoblock" blockid="' + blockId + '"/>');
    this.client.send('<lc id="' + this.locoId + '" cmd="go"/>');
};

Loco.prototype.set = function (values) { 

}


// Train back and forth
//function comm() {
//    if (dir === "true") {
//        dir = "false"
//    } else {
//        dir = "true"
//    };


//    client.send('<lc id="RC5" dir="' + dir + '" V="31"/>');

//    setTimeout(comm, 10000);
//}

module.exports = Loco