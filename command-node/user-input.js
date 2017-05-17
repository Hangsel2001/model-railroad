"use strict";
const EventEmitter = require('events').EventEmitter;
var keypress = require('keypress');

class UserInput extends EventEmitter {

    constructor() {
        super();


        // make `process.stdin` begin emitting "keypress" events 
        keypress(process.stdin);

        // listen for the "keypress" event 
        process.stdin.on('keypress', (ch, key) => {
            console.log('got "keypress"', key);
            if (key && key.ctrl && key.name == 'c') {
                process.exit();
            } else {
                this.emit(key.name);
            }
            //if (key.name == "left") {
            //    this.emit("left");
            //} else if (key.name == "right") {
            //    this.emit("right");
            //}
        });

        process.stdin.setRawMode(true);
        process.stdin.resume();
    }
};
module.exports = UserInput;