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

module.exports = {
    prependCount : prependCount,
    getXorPackage:  getXorPackage
}