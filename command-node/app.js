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

input.on("1", ()=>{
        if (route) {
        route.abort();
    }
        let route = new Route(cs, sensors, loco, {
            name: "Route 1",
            passing: [6,0,1],
            enter: 3,
            stop: 4,
            direction: "backwards",
            turnouts: [{
                "1": "straight"
            }]
        });
        route.on("warning",()=>{
            cs.powerOff();
        })
        route.on("done",()=>{
            console.log("Done!");
        });
        route.go();
})

let route;

input.on("2", ()=>{
    if (route) {
        route.abort();
    }
        route = new Route(cs, sensors, loco, {
            name: "Route 2",
            passing: [3,1,0],
            enter: 6,
            stop: 8,
            direction: "forward",
            turnouts: [{
                "1": "straight"
            }]
        });
        route.on("warning",()=>{
            cs.powerOff();
        })
        route.on("done",()=>{
            console.log("Done!");
            route = null;
        });
        route.go();
})
