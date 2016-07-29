var net = require('net');
var util = require('util');
var formatter = require('./commandFormatter.js');
var EventEmitter = require('events').EventEmitter;
var Loco = require('./loco.js');


function RocrailClient() {
    EventEmitter.call(this);
    
};

util.inherits(RocrailClient, EventEmitter);

RocrailClient.prototype.client = net.Socket;
RocrailClient.prototype.connect = function () {
    client = net.Socket();
    var self = this;
    client.connect(8051, '192.168.0.102', function () {
        console.log("Connected");
        self.emit("connected");
    });
    client.on('data', function (data) {
        //if (data.toString().indexOf("<bk") !== -1 ||data.toString().indexOf("<lc") !== -1) {
            console.log(data.toString());
        //};
    });
};

RocrailClient.prototype.activateSensor = function (id) {
    this.send('<fb id="' + id + '" state="true" />'); 
}
RocrailClient.prototype.deactivateSensor = function (id) {
   this.send('<fb id="' + id + '" state="false" />'); 
}

RocrailClient.prototype.send = function (content) {
    client.write(formatter.getPackage(content));
 //   console.log(formatter.getPackage(content));
};

RocrailClient.prototype.getLoco = function (locoId) { 
    return new Loco(this, locoId);
}


module.exports = new RocrailClient();