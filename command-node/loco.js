let events = require("events");
let merge = require("merge");

class loco extends events.EventEmitter {
    constructor(z21, address, name) {
        super();
        this.speed = null;
        this.direction = null;
        this.z21 = z21;
        this.address = address;
        this.name = name || address.toString();
        this.orientation = "cw"
        z21.on("message", (message) => {
            if (message.type === "loco" && message.address === this.address) {
                this.speed = message.speed;
                this.direction = message.direction;
                this.functions = merge(this.functions, message.functions);
                this.speedSteps = message.speedSteps;
                this.emit("message", message);
                this.notify();
            }
        })
        z21.send({type:"get_loco", address : this.address});

    }
    setSpeed(val) {
        this.speed=  val;
       this.z21.send({
                type: "loco_drive",
                address: this.address,
                direction: this.direction,
                speed: val,
                speedSteps: this.speedSteps
            }

        );
        this.notify();
    }
    setDirection(dir) {
        this.direction = dir;
        this.z21.send({
                type: "loco_drive",
                address: this.address,
                direction: dir,
                speed: this.speed,
                speedSteps: this.speedSteps
            });
            this.notify();
    }
    notify() {
        this.emit("change", this.getInfo() );
    }
    getInfo() {
        return  {
            name: this.name,
            address: this.address,
            direction: this.direction,
            orientation: this.orientation,
            functions: this.functions,
            speedSteps: this.speedSteps,
            speed: this.speed
        };
    }

}

module.exports = loco;