'use strict';

const input = new (require("./user-input"))();
const cs = new (require("./z21"))();
const sensors = new (require("./sensors"))();
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

input.on("space", ()=> {
    cs.locoStop();
})
input.on("up", () => {
    cs.turnoutStraight();
});
input.on("down", () => {
    cs.turnoutTurn();
});

let power = false;
input.on("return", ()=>{
    power = !power;
    if (power) {
        cs.powerOff();    
    } else {
        cs.powerOn();
    }
})

// sensors.on("change",(info)=> {
//     console.log(info);
//     if (info.address === 1) {
//         cs.locoRight();
//     } else if (info.address === 8) {
//         cs.locoLeft();
//     }
// });
