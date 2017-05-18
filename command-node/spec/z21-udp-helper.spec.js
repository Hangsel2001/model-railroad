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

    xit("parses a loco package",()=>{
        const package = null;
        helper.parsePackage(package);
        const expected = {
            type: "loco",
            address: 3,
            direction: "forward",
            speed: 50,
            speedSteps: 120,
            functions: {
                "lights" : true,
                "raw": {"0": true}
            }

        }
    });
});