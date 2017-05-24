let events = require("events");

class loco extends events.EventEmitter {
    constructor(z21, address) {        
        super();
        this.z21 = z21;    
        this.address = address;
        z21.on("message", (message)=> {
            if (message.type === "loco" && message.address === this.address) {
                this.emit("message", message);
            }
        })
    }

}

module.exports = loco;