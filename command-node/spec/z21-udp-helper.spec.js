describe("z21-udp-helper", () => {
    var helper = require("../z21-udp-helper");
    it("adds size to start", () => {
        let buffer = Buffer.from([0x51, 0x00]);
        const expected = Buffer.from([0x04, 0x00, 0x51, 0x00]);
        const actual = helper.prependCount(buffer);
        expect(actual).toEqual(expected);
    })

    it("xors data bytes", () => {
        let expected = Buffer.from([
            0x09,
            0x00,
            0x40,
            0x00,
            0xE3,
            0xF0,
            0x00,
            3,
            0xE3 ^ 0xf0 ^ 0x00 ^ 3
        ]);
        let input = {
            command: Buffer.from([0x40, 0x00]),
            data: Buffer.from([0xE3,
                0xF0,
                0x00,
                3
            ])
        };
        const actual = helper.getXorPackage(input);
        expect(actual).toEqual(expected);
    });
/*
<Buffer 0e 00 40 00 ef 00 03 04 47 10 00 00 00 bf>
<Buffer 0e 00 40 00 ef 00 03 04 00 10 00 00 00 f8>
<Buffer 0e 00 40 00 ef 00 03 04 80 10 00 00 00 78>
<Buffer 0e 00 40 00 ef 00 03 04 ca 10 00 00 00 32>
<Buffer 0e 00 length
        40 00 X
        ef Lokinfo
        00 03 address
        04 Busy + steps (128)
        80 1 010000
        10 00 00 00 78>
POWER ON  <Buffer 07 00 40 00 61 01 60 06 00 a1 00 83 7c>
POWER OFF <Buffer 07 00 40 00 61 00 61 06 00 a1 00 82 7d>
*/
    it("parses a loco package",()=>{
        const package = Buffer.from([0x0e,0x00,0x40,0x00,0xef,0x00,0x03,0x04,0xca,0x10,0x00,0x00,0x00,0x78]);
        const actual = helper.parsePackage(package);
        const expected = {
            type: "loco",
            address: 3,
            direction: "forward",
            speed: 74,
            speedSteps: 128,
            functions: {
                "lights" : true,
            }

        }
        expect(actual).toEqual(expected);
    });
});