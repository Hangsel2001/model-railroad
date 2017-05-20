    const LAN_X = 0x40;
    const LOCO_INFO = 0xEF;

    const speedSteps = [{
        bit: "0b1",
        steps: 14,
        setBit: "0b0"
    }, {
        bit: "0b10",
        steps: 28,
        setBit: "0b1"        

    }, {
        bit: "0b100",
        steps: 128,
        setBit: "0b11"
    }];

    // const directions = [{name:"forward", mask: 0b10000000},]

    function getByProperty(value, prop, coll) {        
        for (let i = 0; i < coll.length; i++) {
            if (coll[i][prop] === value) {
                return coll[i];
            }
        }
        return null;
    }

    function prependCount(buf) {
        let newBuffer = Buffer.from([buf.length + 2, 0x00]);
        let dgram = Buffer.concat([newBuffer, buf]);
        return dgram;
    };

    function getXorPackage(input) {
        let command = input.command.length !== undefined ? input.command : [input.command, 0x00]
        let xor = 0;
        for (let i = 0; i < input.data.length; i++) {
            xor = xor ^ input.data[i];
        }
        let output = prependCount(Buffer.concat([Buffer.from(command), Buffer.from(input.data), Buffer.from([xor])]));
        return output;
    };

    function getType(buffer) {
        if (buffer[2] === LAN_X && buffer[4] === LOCO_INFO) {
            return "loco";
        } else {
            return "unkown";
        }
    }

    function getLocoInfo(buffer, parsed) {
        parsed.address = buffer[6];
        parsed.direction = (buffer[8] & 0b10000000) > 0 ? "forward" : "backwards";
        parsed.speed = buffer[8] & 0b01111111;
        let steps = buffer[7] & 0b00000111;
        if (steps = 0b100) {
            parsed.speedSteps = 128;
        } else if (steps = 0b10) {
            parsed.speedSteps = 28;
        } else {
            parsed.speedSteps = 14;
        }
        parsed.functions = {
            lights: (buffer[9] & 0b00010000) > 0
        };


    }

    function parsePackage(buffer) {
        let parsed = {};
        parsed.type = getType(buffer);
        if (parsed.type === "loco") {
            getLocoInfo(buffer, parsed);
        }
        return parsed;
    }

    function createPackage(input) {
        let intermediate = {};
        if (input.type === "loco_drive") {
            intermediate.command = Buffer.from([0x40, 0x00]);
            intermediate.data = Buffer.from([
                0xe4, 
                0x10 | getByProperty(input.speedSteps,"steps",speedSteps)["setBit"],
                0x00,
                input.address,
                input.speed | (input.direction === "forward" ? 0b10000000: 0b0)
                ])

        } else if(input.type === "loco_function") {
            let value;
            if (typeof input.function === "number") {
                value = input.function;
            } else {
                if (input.function = "lights") {
                    value = 0
                }
            }            
            if (input.value === "on") {
                value = value | 0b01000000;
            } 

            intermediate.command = LAN_X;
            intermediate.data = [0xe4,0xf8,0x00, input.address,value];
        }
        return getXorPackage(intermediate);        
    }


    module.exports = {
        prependCount: prependCount,
        getXorPackage: getXorPackage,
        parsePackage: parsePackage,
        createPackage: createPackage,
        getByProperty: getByProperty
    }