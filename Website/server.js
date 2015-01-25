var dbconfig = require("./config.json").dbconnection;
var httpConfig = require("./config.json").http;

var mongodb   = require('mongodb');
var DbServer  = mongodb.Server;
var Db        = mongodb.Db;
var dbServer  = new DbServer(dbconfig.host, dbconfig.port);
var db        = new Db(dbconfig.dbName, dbServer, { safe:true });


var express = require('express');
var app = express();
app.engine('jade', require('jade').__express);




var countRecords = function(callback) {
    
    db.open(function(err) {
        if (err) throw err;

        db.collection("readings", function(err, collection) {
            if (err) throw err;


            collection.count(function(err, numberOfRecords) {
                if (err) throw err;

                console.log("Readings count is %d", numberOfRecords);
                db.close();
                callback(numberOfRecords);
               
            });
        });

    });
};


app.get('/', function(req, res) {
        countRecords(function(numberOfRecords) {
            res.render('index.jade', { count: numberOfRecords });
        });
});

console.log("Starting...");
app.listen(httpConfig.listenPort);