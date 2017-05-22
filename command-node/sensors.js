"use strict";
const EventEmitter = require('events').EventEmitter;
const Serial = require('serialport');

class Sensors extends EventEmitter {
    constructor() {
        super();
        let port = "COM5";
        this.port = new Serial(port, {
            parser: Serial.parsers.readline('\n')
        });

        this.port.on('data', (data) => {
            var type = data[0];
            var id = data[1];
            if (type === "S") {
                var state = data[2];
                this.emit("change", {
                    address: parseInt(id),
                    active: state === "1"
                });
            };

        });

    }
};

module.exports = Sensors;