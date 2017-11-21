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
            // console.log(ch);
            // console.log('got "keypress"', key);
            if (key && key.ctrl && key.name == 'c') {
                process.exit();
            } else {
                
                const ascii = (ch || " ").charCodeAt();
                if(ascii>=48 && ascii<=57) {
                    this.emit("number", ascii-48);
                } else {
                    this.emit(key? key.name : ch);
                }
            }
           
        });
        if (typeof process.stdin.setRawMode === "function")  {
            process.stdin.setRawMode(true);
            process.stdin.resume();
        }                
    }
};
module.exports = UserInput;