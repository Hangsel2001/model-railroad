var client = require('./RocrailClient.js');
var packagerFactory = require('./packager.js');
var wiremaster = require('./wire-master.js');    
var rocnet = require('./rocnet.js');
var Serial = require('serialport');
var config = require('./config.json');
var dgram = require('dgram');
var readline = require('readline');



var packager = packagerFactory.Packager({ addrHigh: 0, addrLow: 3 });
var server = dgram.createSocket({ type: 'udp4', reuseAddr : true });

var loco;
var destinationMap = { "1": "OE", "2": "IE", "3": "Center", "4": "NW", "5": "SW" };

var stdin = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

stdin.on('line', function (input) {
    if (input === "s") { 
        var pack = packager.Package(
            {
                Group: packagerFactory.Groups.Stationary,
                Code: packagerFactory.Codes.Stationary.Show
            });
        rocnet.send(pack)
    } else {
        loco.goTo(input);
    }
});


if (config.UseI2C === true) {
   
    wiremaster.on("change", function (data) {
        console.log(data);
    });
}

rocnet.on('connected', function () {
    console.log("Rocnet connected");
});
rocnet.on('ping', function () { 
    rocnet.ping();
});

client.on("connected", function () {
    console.log("connected");
    var id1active = false;
    loco = client.getLoco("RC5");
    client.on("data", function (data) { 
        console.log(data);
    });

});

if (config.COM) {
    var port = new Serial(config.COM, {
        parser: Serial.parsers.readline('\n')
    });

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

//client.connect();
rocnet.connect();
