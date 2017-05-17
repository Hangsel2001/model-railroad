'use strict';

const input = new (require("./user-input"))();
const cs = new (require("./z21"))();
cs.init();

cs.on("message", (message) => {
    console.log(message);
});

input.on("left", () => {
    cs.locoLeft();
    console.log("left");
});
input.on("right", () => {
    cs.locoRight();
    console.log("right");
});
input.on("up", () => {
    cs.locoRun();
});
input.on("down", () => {
    cs.locoStop();
});
//input.on("space", () => {
//    cs.locoToggleDir();
//});
