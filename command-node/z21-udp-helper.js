    const LAN_X = 0x40;
    const LOCO_INFO = 0xEF;
    function prependCount(buf) {
        let newBuffer = Buffer.from([buf.length + 2, 0x00]);
        let dgram = Buffer.concat([newBuffer, buf]);
        return dgram;
    };
    function getXorPackage(input) {
        let xor = 0;
        for (let i = 0; i < input.data.length; i++) {
            xor = xor ^ input.data[i];
        }
        let output = prependCount(Buffer.concat([input.command, input.data, Buffer.from([xor]) ]));
        return output;
    };

    function getType(buffer) {
        if (buffer[2]=== LAN_X && buffer[4]===LOCO_INFO ) {
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
         } else if (steps= 0b10) {
             parsed.speedSteps = 28;
         } else {
             parsed.speedSteps = 14;
         }
         parsed.functions = {
             lights : (buffer[9] & 0b00010000) > 0
         };
         
        
    }
    function parsePackage(buffer) {
        let parsed =  {}    ;
        parsed.type = getType(buffer);
        if (parsed.type === "loco") {
            getLocoInfo(buffer, parsed);
        }
        return parsed;
    }
    

module.exports = {
    prependCount : prependCount,
    getXorPackage:  getXorPackage,
    parsePackage: parsePackage
}