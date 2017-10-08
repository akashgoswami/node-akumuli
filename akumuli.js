var request = require('request');
var net = require('net');
var moment = require ('moment');

var es = require('event-stream');


var Akumuli = function(params){
    var client = new net.Socket();
    var self = this;
    
    self.endpoint = 'http://'+params.host+':'+params.port;
    
    client.connect(params.port, params.host, function() {
	    var now = moment().utc().format("YYYYMMDDTHHmmss.SSSSSSSSS")
	    console.log('Connected with Akumuli at', now);	
	    //client.write("+temp tag=123\r\n+"+now+"\r\n:311\r\n");
	    self._connected = false;	    
	    
    });

    client.on('data', function(data) {
    	console.log('Received: ' + data);
    });

    client.on('close', function() {
	    console.log('Connection closed');
	    self._connected = false;
	    self.client = undefined;	    
    });
    
    client.on('error', function() {
	    console.log('Connection error');
	    self._connected = false;
	    self.client = undefined;
    });
    self.client = client;
};

Akumuli.prototype.ListSeries = function (cb) {
    
    var self = this;
    var series = [];
    
    request({url:self.endpoint+'/api/query', method: 'POST',  body: '{"select": "meta:names"}'}).pipe(es.split())
    .pipe(es.mapSync(function(line){
        //console.log(line);
        if (line.length == 0) return;
        var name = line.substring(1).split(" ")[0];
        if (series.indexOf(name) === -1) {
            // element doesn't exist in array
            series.push(name);
        }

        // process line here and call s.resume() when rdy
        // function below was for logging memory usage
    })
    .on('error', function(err){
        console.log('Error while reading data.', err);
        cb(err);
    })
    .on('end', function(){
        //console.log('returning ', series)
        cb(null, series);
    })
    );
};


function parseLine(line)
{
    var obj = {};
    if (line.length == 0) return null;
    
    var items = line.split(",");
    if (items.length > 4)
    {
        console.log("Invalid response ", line);
        return obj;
    }
    var tokens = items[0].split(" ");
    obj.series = tokens[0];
    obj.tags = {};
    for (var i = 1; i < tokens.length; i++){
        var kv = tokens[i].split("=");
        obj.tags[kv[0]] = !isNaN(kv[1]) ? Number(kv[1]) : kv[1];
    }
    if (items.length > 1 )
    {
        obj.ts = Number(items[1].split("=")[1]);
    }
    if (items.length == 3 )
    {
        obj.val = !isNaN(items[2]) ? Number(items[2]) : items[2];
    }
    else {
        obj.val = items.slice(2).map(function(x){
            return !isNaN(x) ? Number(x) : x;
        });
    }
    return obj;
}

Akumuli.prototype.ExecQuery = function (query, cb) {
    
    var self = this;

    request({url:self.endpoint+'/api/query', method: 'POST',  body: query, json: true}).pipe(es.split())
    .pipe(es.mapSync(function(line){
        //console.log(line);
        var obj = parseLine(line);
        if (obj) cb(null, obj);
    })
    .on('error', function(err){
        console.log('Error while reading data.', err);
        cb(err);
    })
    .on('end', function(){
        //console.log('returning ', series)
        cb(null, null);
    })
    );
};

module.exports = Akumuli;