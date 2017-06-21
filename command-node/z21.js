'use strict';
var dgram = require('dgram');
var EventEmitter = require('events').EventEmitter;
var helper = require('./z21-udp-helper');

var getflags = new Buffer([

    0x04,
    0x00,
    0x51,
    0x00
]);

var setflags = new Buffer([
    0x08,
    0x00,
    0x50,
    0x00,
    0x00,
    0x01,
    0x01,
    0x01
]);

var powerOn = new Buffer([
    0x07,
    0x00,
    0x40,
    0x00,
    0x21,
    0x81,
    0xa0
]);

var powerOff = new Buffer([
    0x07,
    0x00,
    0x40,
    0x00,
    0x21,
    0x80,
    0xa1
]);

var listenloco02 = new Buffer([
    0x09,
    0x00,
    0x40,
    0x00,
    0xE3,
    0xF0,
    0x00,
    3,
    0xE3 ^ 0xf0 ^ 0x00 ^ 3
]);


//for (let i = 0; i < 50; i++) {
//    setTimeout(() => {
//        send(listenloco02);
//    }, i * 1000);
//}



//setInterval(() => {
//    send(poweroff);
//}, 2000);

//setTimeout(() => {
//    setInterval(() => {
//        send(poweron)
//    }, 2000)
//}, 1000);


class z21 extends EventEmitter {
    constructor() {
        super();
        this.server = dgram.createSocket({
            type: 'udp4'
        });
        this.server.on("message", (message, remote) => {
            let parsed = helper.parsePackage(message);
            if (parsed.type !== "unknown") {
                this.emit("message", parsed);
            }

        });
        this.server.bind(35542);
        this.currentDir = "forward";
    }
    send(data) {
        let buf;
        if (data instanceof Buffer) {
            buf = data;
        } else {
            buf = helper.createPackage(data);
        }
        // console.log(buf);
        this.server.send(buf, 0, buf.length, 21105, "192.168.0.111");
    }

    

    locoLeft() {
        this.currentDir = "backwards";
        this.send(helper.createPackage({
            type: "loco_drive",
            address: 3,
            speed: 50,
            speedSteps: 128,
            direction: "backwards"
        }));
    }

    locoRight() {
        this.currentDir = "forward";
        this.send(helper.createPackage({
            type: "loco_drive",
            address: 3,
            speed: 50,
            speedSteps: 128,
            direction: "forward"
        }));
    }

    locoStop() {
        this.send(helper.createPackage({
            type: "loco_drive",
            address: 3,
            speed: 0,
            speedSteps: 128,
            direction: this.currentDir
        }));
    }

    turnoutStraight() {
        this.send(helper.createPackage({
            type: "turnout",
            address: 1,
            position: "straight"
        }));
    }
    turnoutTurn() {
        this.send(helper.createPackage({
            type: "turnout",
            address: 1,
            position: "turn"
        }));
    }

    powerOff() {
        this.send(powerOff);
    }
    powerOn() {
        this.send(powerOn);
    }

    init() {
        this.send(setflags);
        setTimeout(() => {
            this.send(listenloco02);
        }, 5000);
    }
}

module.exports = z21