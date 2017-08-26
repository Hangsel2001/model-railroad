(function () {
    var socket = io();
    var state = {};    
    socket.on('block', function (data) {
        state[data.name]  = data;
        $('#data').html("");
        for (prop in state) {
        $("#data").append("<h3>" + prop + "</h3><pre>" +  JSON.stringify(state[prop]) + "</pre>");
        }        
    });
    socket.on('destination', function (data) {       
        $('#destination').html("");        
        $("#destination").append("<pre>" +  JSON.stringify(data) + "</pre>");        
    });
    socket.on('queue', function (data) {       
        $('#queue').html("");        
        $("#queue").append("<pre>" +  JSON.stringify(data) + "</pre>");        
    });
    socket.on('route', function (data) {       
        $('#route').html("");        
        $("#route").append("<pre>" +  JSON.stringify(data) + "</pre>");        
    });
    socket.on('loco', function (data) {       
        $('#loco').html("");        
        $("#loco").append("<pre>" +  JSON.stringify(data) + "</pre>");        
    });
})();