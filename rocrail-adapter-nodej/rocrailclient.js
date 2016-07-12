var net = require('net');
var util = require('util');
var formatter = require('./commandFormatter.js');
var EventEmitter = require('events').EventEmitter;


function RocRailClient() {
    EventEmitter.call(this);
    
};

util.inherits(RocRailClient, EventEmitter);

RocRailClient.prototype.client = net.Socket;
RocRailClient.prototype.connect = function () {
    client = net.Socket();
    var self = this;
    client.connect(8051, 'localhost', function () {
        console.log("Connected");
        self.emit("connected");
    });
    client.on('data', function (data) {
        console.log(data.toString());
    });
};

RocRailClient.prototype.send = function (content) {
    client.write(formatter.getPackage(content));
    console.log(formatter.getPackage(content));
};



module.exports = new RocRailClient();