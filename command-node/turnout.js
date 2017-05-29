let events = require("events");
// let merge = require("merge");

class Turnout extends events.EventEmitter {
    constructor(z21, address) {
        super();
           this.z21 = z21;
        this.address = address;
        z21.on("message", (message) => {
            if (message.type === "turnout" && message.address === this.address) {
                this.position = message.position;
                this.emit("message", message);
            }
        })
    }
    setPosition(pos) {
        this.z21.send({
            type : "turnout",
            address: this.address,
            position: pos
        })
    }
}

module.exports = Turnout;