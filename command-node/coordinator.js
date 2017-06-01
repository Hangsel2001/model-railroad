let EventEmitter = require("events").EventEmitter;

class Coordinator extends EventEmitter {    
    dispatch(config) {        
        this.loco.setSpeed(this.route.CRUISE);
    }
}

module.exports = Coordinator;