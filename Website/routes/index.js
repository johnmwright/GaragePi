var express = require('express');
var router = express.Router();



var countRecords = function(db, callback) {

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

var topRecords = function(db, numRecords, callback) {

    db.open(function (err) {
        if (err) throw err;

        db.collection("readings", function (err, collection) {
            if (err) throw err;
            
           
            collection.find().sort({ _id: -1 }).limit(numRecords).toArray(function(err, results) {
                if (err) throw err;
                console.log("Found %d records", results.length);
                db.close();
                callback(results);
            });
         
        });

    });
};



var lastRecord = function (db, callback) {

    topRecords(db, 1, function(results) {
        callback(results[0]);
    });
};

/* GET home page. */
router.get('/', function (req, res) {
    //countRecords(req.db, function (numberOfRecords) {
    //        res.render('index', { count: numberOfRecords });
    //    });
    //topRecords(req.db, 10, function(records) {
    //    res.render('index', { records: records });
    //});
    lastRecord(req.db, function (record) {
        console.log("XXX");
        console.log(record);
        res.render('index', { reading: record });
    });

});

module.exports = router;
