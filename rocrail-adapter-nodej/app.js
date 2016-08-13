var client = require('./rocrailclient.js');
var rocnet = require('./rocnet.js');

var Serial = require('serialport');
var config = require('./config.json');
var port = config.COM !== undefined ? new Serial(config.COM, {
    parser: Serial.parsers.readline('\n')
}) : undefined;
var wiremaster = config.UseI2C ? require('./wire-master.js') : undefined;
var dgram = require('dgram');
var server = dgram.createSocket({ type: 'udp4', reuseAddr : true });


var readline = require('readline');
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
var loco;
var destinationMap = { "1": "OE", "2": "IE", "3": "Center", "4": "NW", "5": "SW" };

rl.on('line', function (input) {
    loco.goTo(input);
});

rocnet.on('connected', function () {
    console.log("Rocnet connected");   
});
var prev = [0,0];
if (wiremaster !== undefined) {
    wiremaster.on("change", function (data) {
        console.log(data);        
    });
}


client.on("connected", function () {
    console.log("connected");
    var id1active = false;
    loco = client.getLoco("RC5");
    client.on("data", function (data) { 
        console.log(data);
    });

   
});

if (port !== undefined) {
    port.on('data', function (data) {
        var type = data[0];
        var id = data[1];
        if (type === "S") {
            var state = data[2];
            if (state === "1") {
                rocnet.activateSensor(id);
                
            } else {
                rocnet.deactivateSensor(id);
            }
        } else if (type === "B") {
            loco.goTo(destinationMap[data[1]]);
        }

    });
};
client.connect();
rocnet.connect();
