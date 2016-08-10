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
    server.on('message', function (msg, rinfo) {
        try {
            var message = packagerFactory.depackage(msg);
            console.log(message);
            if (message.Action.Group === packagerFactory.Groups.Host && message.Action.Code === packagerFactory.Codes.Host.PingReq) {
                self.emit("ping");
            }
        } catch (e) { 
            console.log(e);
        }

    });
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

Rocnet.prototype.ping = function() {
    var pack = packager.Package(
        {
            Type: packagerFactory.Types.Event,
            Group: 0,
            Code: packagerFactory.Codes.Host.PingRep,
            Data: []
        });
    this.send(pack)
}

Rocnet.prototype.send = function (content) {
    server.send(Buffer.from(content), 0, content.length, 4321, "224.0.0.1", function (err) {
        console.log(err);
    })
};

module.exports = new Rocnet();