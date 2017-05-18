'use strict';
var dgram = require('dgram');
var EventEmitter = require('events').EventEmitter;


var getflags = new Buffer([

    0x04,
    0x00,
    0x51,
    0x00
]
);

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

var poweron = new Buffer([
    0x07,
    0x00,
    0x40,
    0x00,
    0x21,
    0x81,
    0xa0
]);

var poweroff = new Buffer([
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
        this.server = dgram.createSocket({ type: 'udp4' });
        this.server.on("message", (message, remote) => {
            if (message[2] != 0x84) {
                this.emit("message", message);
            } else {
                // emit status
            }
            
        });
        this.server.bind(35542);
        this.index = 0;
        //setInterval(() => {
        //    let buf = new Buffer(rocrailstart.length);
        //    this.send(new 
        //})
    }
    send(buf) {
        this.server.send(buf, 0, buf.length, 21105, "192.168.0.111");
    }

    locoLeft() {
        this.send(new Buffer([
            0x0A,
            0x00,
            0x40,
            0x00,
            0xE4,
            0x13,
            0x00,
            0x03,
            0b00000000,
            0xE4 ^ 0x13 ^ 0x00 ^ 0x03 ^ 0b00000000
        ]));
    }

    locoRight() {
        this.send(new Buffer([
            0x0A,
            0x00,
            0x40,
            0x00,
            0xE4,
            0x13,
            0x00,
            0x03,
            0b10000000,
            0xE4 ^ 0x13 ^ 0x00 ^ 0x03 ^ 0b10000000
        ]));
    }

    locoRun() {

    }
    locoStop() {

    }

    init() {
        this.send(setflags);
        setTimeout(() => {
            this.send(listenloco02);
        }, 5000);
    }
}

module.exports = z21