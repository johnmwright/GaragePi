var express = require('express');
var router = express.Router();



/* GET home page. */
router.get('/', function(req, res) {


    var recordsSince = function(db, dataSinceDate, callback) {

        db.open(function(err) {
            if (err) throw err;

            db.collection("readings", function(err, collection) {
                if (err) throw err;

                collection
                    .find({ "timestamp": { "$gt": dataSinceDate } })
                    .sort({ "timestamp": -1 })
                    .toArray(function(err, results) {
                        if (err) throw err;                        
                        db.close();
                        callback(results);
                    });

            });

        });
    };


    var numDaysToShow = 2;
    var currentDate = new Date();
    var dataSinceDate = new Date(currentDate.setDate(currentDate.getDate() - numDaysToShow));

    recordsSince(req.db, dataSinceDate, function(records) {

        var tempReadings = records;
        var mostRecent = records[0];

        res.render('index', {
            reading: mostRecent,
            readings: tempReadings,
            showRecords: false
        });
    });


});

module.exports = router;
