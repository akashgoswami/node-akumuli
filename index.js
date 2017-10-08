var Akumuli = require('./akumuli');
var moment = require('moment');
var express = require('express');
var bodyParser = require('body-parser');
var app = express()
var server = require('http').Server(app);
var _ = require('underscore');
var async = require('async');

app.use(bodyParser.json());

var sockets = [];

function setCORSHeaders(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST");
    res.setHeader("Access-Control-Allow-Headers", "accept, content-type");
}

var akumuli = new Akumuli({ host: 'localhost', port: 8181 });

app.all('/search', function(req, res) {
    setCORSHeaders(res);
    console.log(req.url);
    console.log(req.body);
    akumuli.ListSeries(function(err, names) {
        res.json(names);
        res.end();
    });

});

app.all('/', function(req, res) {
    setCORSHeaders(res);
    res.send('Welcome!');
    res.end();
});


// Convert Dates from Graphana format to Akumuli
function TS_GR_TO_AK(obj) {
    return moment(obj).utc().format("YYYYMMDDTHHmmss.SSSSSSSSS");
}

function TS_AK_TO_GR(obj) {
    return Math.floor(obj / 1000000);
}


app.post('/query', function(req, res) {

    var group_ag = {
        "group-aggregate": {
            metric: "temperature",
            step: "1s",
            func: ["mean"]
        },
        range: {
            from: "20171001T000000.001",
            to: moment().utc().format("YYYYMMDDTHHmmss.SSSSSSSSS")
        },
        output: { "format": "csv", "timestamp": "raw" }
    };

    var tsResult = [];

    async.each(req.body.targets,
        function(target, next) {

            if (target.type === 'table') {
                //tsResult.push(table);
            }
            else if (target.type === 'timeserie') {
                var agg = "mean";
                var result = {
                    "target": target.target, // The field being queried for
                    "datapoints": []
                };
                if (target.target.indexOf(":") !== -1) {
                    var token = target.target.split(":");
                    result.target = token[0];
                    agg = token[1];
                }

                group_ag["group-aggregate"].metric = result.target;
                group_ag["group-aggregate"].step = req.body.interval;
                group_ag["group-aggregate"].func = [agg];

                group_ag.range.from = TS_GR_TO_AK(req.body.range.from);
                group_ag.range.to = TS_GR_TO_AK(req.body.range.to);

                //console.log(group_ag);
                akumuli.ExecQuery(group_ag, function(err, item) {

                    // indicates the last item
                    if (item === null) {
                        tsResult.push(result);
                        next();
                    }
                    else {
                        //console.log(JSON.stringify(item));
                        result.datapoints.push([item.val, TS_AK_TO_GR(item.ts)])
                    }
                });


            }
        },
        function(err) {
            setCORSHeaders(res);
            res.json(tsResult);
            res.end();
        });
});

var port = 8888;
var host = "0.0.0.0";

console.log("Graphana Simple JSON datasource for Akumuli running at http://" + host + ":" + port);
server.listen(port, host);
