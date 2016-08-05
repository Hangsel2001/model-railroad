var dgram = require('dgram');
var server = dgram.createSocket({ type: 'udp4', reuseAddr : true });
var packagerFactory = require('./packager.js');
var packager = packagerFactory.Packager({ addrHigh: 0, addrLow: 3 });
var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Rocnet() {
    EventEmitter.call(this);
    
};

util.inherits(Rocnet, EventEmitter);

//server.on('error', function (err) {
//    console.log('server error:\n' + err.stack);
//    server.close();
//});

//server.on('message', function (msg, rinfo) {
//    var outMsg = "";
//    for (var i = 0; i < msg.length; i++) {
//        outMsg += msg[i].toString(16) + " ";
//    }
//    console.log('server got: ' + outMsg + " from " + rinfo.address + ":" + rinfo.port);
    
//});

//server.on('listening', function () {
//    var address = server.address();
//    console.log('server listening ' + address.address + ":" + address.port);
//});

Rocnet.prototype.connect = function () {
    var self = this;
    server.bind(4321, function () {
        server.setBroadcast(true);
        server.addMembership('224.0.0.1');
        self.emit("connected");
    });
    
    console.log("Bound");
};

var getSensorPackage = function (options) {
    var array = packager.Package({
        Group: packagerFactory.Groups.Sensor,
        Code: packagerFactory.Codes.Sensor.Report,
        Data: [0, 0, options.State, parseInt(options.Port)]
    });
    return array;
}

Rocnet.prototype.activateSensor = function (id) {
    this.send(getSensorPackage({ State : 1, Port: id }));
}
Rocnet.prototype.deactivateSensor = function (id) {
    this.send(getSensorPackage({ State : 0, Port: id }) )   ;
}

Rocnet.prototype.send = function (content) {
    server.send(Buffer.from(content), 0, 12, 4321, "224.0.0.1", function (err) {
        console.log(err);
    })
};

module.exports = new Rocnet();