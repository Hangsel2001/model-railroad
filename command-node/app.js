"use strict";

const input = new(require("./user-input"))();
const cs = new(require("./z21"))();
const sensors = new(require("./sensors"))();
const loco = new(require("./loco"))(cs, 3);
const Route = require("./route");
const blocks = new(require("./block-manager"))(sensors, [loco], require("./spec/helpers/blocks").getBlocks(), cs);
const inventory = require("./inventory");
const planner = new(require("./travel-planner"))(loco, blocks, inventory.getRouteDefs());

var express = require('express')

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
app.use(express.static('app'))

app.get(8080, function () {
    console.log('Example app listening');
})

server.listen(8080, () => {
    console.log('listening to 8080');
});
cs.init();

cs.on("message", (message) => {
    // console.log(message);
});

input.on("left", () => {
    cs.locoLeft();
    console.log("left");
});
input.on("right", () => {
    cs.locoRight();
    console.log("right");
});

input.on("space", () => {
    cs.locoStop();
})
// input.on("q", () => {
//     cs.turnoutStraight(0);
// });
// input.on("w", () => {
//     cs.turnoutTurn(0);
// });
// input.on("e", () => {
//     cs.turnoutStraight(1);
// });
// input.on("r", () => {
//     cs.turnoutTurn(1);
// });

let power = false;
input.on("return", () => {
    togglePower();
})


sensors.on("change", (data) => {
    console.log("-- Sensor" + data.address + ": " + data.active + " --");
})

let hasSet = false;

function togglePower() {
    power = !power;
    if (!power) {
        cs.powerOff();
    }
    else {
        cs.powerOn();
    }
}

function setPosOrDest(name) {
    if (!hasSet) {
        setInit(name);
    } else {
        try {
            planner.addDestination(name);
            notify("New destination added: " + name);
        } catch (ex) {
            console.log(ex);
        }
    }
}

function setInit(name) {
    blocks.setLocoPosition(loco, name, "cw");
    hasSet = true;
    notify("Current Position is set to " + name);
}

input.on("z", () => {
    setPosOrDest("InnerLeft");
});
input.on("a", () => {
    setPosOrDest("OuterLeft");
});
input.on("s", () => {
    setPosOrDest("Middle");
});
input.on("v", () => {
    setPosOrDest("OuterRight");
});
input.on("c", () => {
    setPosOrDest("InnerRight");
});
input.on("x", () => {
    planner.clearDestinations();
    stop = true;
});

input.on("number", (number)=> {
    sensors.emit("change", {address:number, active:true});
    sensors.emit("change", {address:number, active:false});
});

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}
let stop = true;

function setRandom() {
    let blocks = ["OuterLeft", "OuterRight", "Middle", "InnerLeft", "InnerRight"];    
    let notSet = true;
    do {
        try {
            let next = blocks[getRandomIntInclusive(0,4)];
            planner.addDestination(next);
             notify("New destination added: " + next);
            notSet = false;
        } catch (ex) {
        }
    } while (notSet)
}

planner.on("destination", (data)=>{
    if (!stop) {
        setRandom();
    }
    if (data) {
        const toSend = Object.assign({}, data);
        data.loco = data.loco ? data.loco.getInfo() : undefined;
    }
    io.emit("destination", data );
})
planner.on("queue", (queue) => { 
    io.emit("queue", queue)});
planner.on("route", (route) => { 
    io.emit("route", route)});

input.on("d", ()=>{
    stop = false;
    setRandom();
})

input.on("escape", ()=>{
  clearAll();
});

function clearAll() {
    console.log("Force clear all!!!")
    planner.clearDestinations(true);
    hasSet=  false;
    cs.locoStop();
    cs.powerOn();
}

io.on("connection", (socket)=> {
    console.log("new connection");
    
    socket.on("destination", (data) => {
        console.log(data);
        try {
            planner.addDestination(data)
        } catch (ex) {
            console.log(ex);
        }
    });

    socket.on("clear", ()=> {
        clearAll();
    })

    socket.on("init", (data)=> {
        setInit(data);
    })

    
    socket.on("power",(data)=> {
        console.log(data);
        if (data === "on") {
            power = false;
        } else if (data === "off" ) {
                power = true;
        };
        togglePower();
    })
})

blocks.on("info", (info) => {
    console.log(info);
    io.emit("block", info);
});

loco.on("change", (data)=>{
    io.emit("loco", data);
});

blocks.on("status", (status) => {
 
    notify(status);
    if (status.status === "unexpected") {
        cs.powerOff();
        power = false;
    }
})

function notify(message) {
    console.log("----------------------------------");
    console.log(message);
    console.log("----------------------------------");
}

process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
    cs.powerOff();
    setTimeout(()=> {process.exit()}, 300);    
});