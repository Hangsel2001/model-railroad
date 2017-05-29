'use strict';

const input = new (require("./user-input"))();
const cs = new (require("./z21"))();
const sensors = new (require("./sensors"))();
const loco = new(require("./loco"))(cs, 3);
const Route = require("./route-handler");
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

sensors.on("change",(data)=>{
    console.log(data);
})

input.on("r", ()=>{
        let route = new Route(cs, sensors, loco, {
            name: "Route 1",
            passing: [6,0],
            enter: 1,
            stop: 3,
            direction: "backwards",
            turnouts: [{
                "1": "straight"
            }]
        });
        route.on("error",()=>{
            cs.powerOff();
        })
        route.go();
})
