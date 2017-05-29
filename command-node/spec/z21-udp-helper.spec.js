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

    it("gets from collection by property", () => {
        const input = [{
                id: 5,
                title: "5"
            },
            {
                id: 10,
                title: "10"
            },
            {
                id: 20,
                title: "20"
            }
        ]
        const expected = {
            id: 10,
            title: "10"
        };
        const actual = helper.getByProperty("10", "title", input);
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
    it('fails if wrong length', () => {
        const package = Buffer.from([
            0x08, 0x00,
            0x40, 0x00,
            0x43, 0x00, 0x00, 0x02,
            0x43
        ]);
        const actual = helper.parsePackage(package);
        expect(actual.type).toEqual("error");
    })
    describe("loco", () => {


        it("parses a loco package", () => {
            const package = Buffer.from([0x0e, 0x00, 0x40, 0x00, 0xef, 0x00, 0x03, 0x04, 0xca, 0x10, 0x00, 0x00, 0x00, 0x78]);
            const actual = helper.parsePackage(package);
            const expected = {
                type: "loco",
                address: 3,
                direction: "forward",
                speed: 74,
                speedSteps: 128,
                functions: {
                    "lights": true,
                }

            }
            expect(actual).toEqual(expected);
        });
        describe("drive", () => {
            it("creates a loco drive package forward", () => {
                let input = {
                    type: "loco_drive",
                    address: 3,
                    direction: "forward",
                    speed: 74,
                    speedSteps: 128
                }
                const actual = helper.createPackage(input);
                let expected = Buffer.from([0x0a, 0x00, 0x40, 0x00, 0xe4, 0x13, 0x00, 0x03, 0xca, 0x3e])
                expect(actual).toEqual(expected);
                input.direction = "backwards";
                input.speed = 30;
                const actualReverse = helper.createPackage(input);
                expected = Buffer.from([0x0a, 0x00, 0x40, 0x00, 0xe4, 0x13, 0x00, 0x03, 30, 0xea])
                expect(actualReverse).toEqual(expected);
            });
            it("creates a loco drive package backwards", () => {
                let input = {
                    type: "loco_drive",
                    address: 3,
                    direction: "backwards",
                    speed: 30,
                    speedSteps: 128
                }
                const actualReverse = helper.createPackage(input);
                let expected = Buffer.from([0x0a, 0x00, 0x40, 0x00, 0xe4, 0x13, 0x00, 0x03, 30, 0xea])
                expect(actualReverse).toEqual(expected);
            })
            it("creates a query package", () => {
                let input = {
                    type: "get_loco",
                    address: 3
                };
                const actual = helper.createPackage(input);
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
                expect(actual).toEqual(expected);
            })
        })
        describe("function", () => {
            it("creates a loco function ON package", () => {
                let input = {
                    type: "loco_function",
                    address: 3,
                    function: "lights",
                    value: "on"
                }
                const actual = helper.createPackage(input);
                let expected = Buffer.from([0x0a, 0x00, 0x40, 0x00, 0xe4, 0xf8, 0x00, 0x03, 0b01000000, 0x5f]);
                expect(actual).toEqual(expected);
            });
            it("creates a loco function OFF package", () => {
                let input = {
                    type: "loco_function",
                    address: 3,
                    function: "lights",
                    value: "off"
                }
                const actual = helper.createPackage(input);
                let expected = Buffer.from([0x0a, 0x00, 0x40, 0x00, 0xe4, 0xf8, 0x00, 0x03, 0b00000000, 0x1f]);
                expect(actual).toEqual(expected);
            });

        })
    });
    /*
        <Buffer 09 00 40 00 43 00 01 01 43> Höger turn
        <Buffer 09 00 40 00 43 00 01 02 40> Höger straight
        <Buffer 09 00 40 00 43 00 00 01 42> Vänster turn
        <Buffer 09 00 40 00 43 00 00 02 41> Vänster straigt
    */
    describe("turnout", () => {
        it("parses the turnout TURN package", () => {
            const package = Buffer.from([
                0x09, 0x00,
                0x40, 0x00,
                0x43, 0x00, 0x01, 0x01,
                0x43
            ]);
            const actual = helper.parsePackage(package);
            const expected = {
                type: "turnout",
                address: 1,
                position: "turn",
            };
            expect(actual).toEqual(expected);
        })
        it("parses the turnout STRAIGHT package", () => {
            const package = Buffer.from([
                0x09, 0x00,
                0x40, 0x00,
                0x43, 0x00, 0x00, 0x02,
                0x43
            ]);
            const actual = helper.parsePackage(package);
            const expected = {
                type: "turnout",
                address: 0,
                position: "straight",
            };
            expect(actual).toEqual(expected);
        })
        //"10101000"
        it("creates a turnout package", () => {
            const input = {
                type: "turnout",
                address: 0,
                position: "straight"
            };
            const expected = Buffer.from([
                0x09, 0x00,
                0x40, 0x00,
                0x53, 0x00, 0x00, 0b10101001,
                0xfa
            ]);
            const actual = helper.createPackage(input);
            expect(actual).toEqual(expected);
        })
    })


});