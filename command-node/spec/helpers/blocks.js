    function blocks() { 
        return [{
            name: "OuterRight",
            ccw: {
                enter: 8,
                in: 6
            }
        }, {
            name: "Middle",
            ccw: {
                enter: 0,
                in: 1
            }
        }, {
            name: "OuterLeft",
            ccw: {
                enter: 3,
                in: 4
            }
        }];
    }
    module.exports = {getBlocks:blocks};