#!/usr/bin/nodejs
var gpio = require('rpi-gpio');
var async = require('async');
var MongoClient = require('mongodb').MongoClient;

var ledController = require("./ledController.js");
var tempController = require("./temperatureController.js");
var sonicController = require("./sonicController.js");
var photocellController = require("./photocellController.js");

console.log("starting");

var myPins = {
	LED_RED: 12,
	LED_GREEN: 26,
	LED_BLUE: 13,
    TRIG: 23,
    ECHO: 24,
    LED_RUN: 25,
    PHOTO: 17,
};


var DISTANCE_TO_CLOSED_DOOR = 70; //cm  - is actually about 60 but get readings up to 68 sometimes
var MAX_LIGHT_WHEN_LIGHT_IS_ON = 30;
var SAMPLE_SPEED =  10000 ///5000; //microseconds

var lastRecord = null;

var LedRun = {
	Pin: myPins.LED_RUN,
	Name: "Running Indicator"
};

var LedDoor = {
	Pin: myPins.LED_RED,
	Name: "Door Open"
};

var LedLight = {
	Pin: myPins.LED_GREEN,
	Name: "Light On"
};

// this is just to make sure the led is initialized to off
var LedBlue = {
	Pin: myPins.LED_BLUE,
	Name: "blue - unused"
}


gpio.setMode(gpio.MODE_BCM);


async.parallel([
    function(callback) {
		ledController.init(LedRun, callback);
	},
    function(callback) {
		ledController.init(LedDoor, callback);
	},
    function(callback) {
		ledController.init(LedLight, callback);
	},
	function(callback) {
		ledController.init(LedBlue, callback);
	},	
    function(callback) {
		photocellController.init(myPins.PHOTO, callback);
	},
	function(callback) {
		sonicController.init(myPins.ECHO, myPins.TRIG, callback);
	}
], function(err, results) {
		console.log('Pins set up');
		ledController.turnOn(LedRun, function() {
			setInterval(run, SAMPLE_SPEED);
		});
});	

function checkGarageDoor() {
  var distance = sonicController.readDistance()

  if (distance < DISTANCE_TO_CLOSED_DOOR) {
    console.log("  - Door open");
    return true;
  } else {
    console.log("  - Door closed");
    return false;
  }
}


function checkLight(callback) {
	photocellController.resistanceTime(function(reading) {
	if (reading < MAX_LIGHT_WHEN_LIGHT_IS_ON) {
		console.log("  - Light is on")
		callback(true)
	} else {
		console.log("  - Light is off")
		callback(false)
	}
  })
}

function run() {

  try {

	var timestamp = Date.now();
	console.log("Beginning Sensor Checks %s", timestamp.toString());

	var record = {
		timestamp: new Date(timestamp),
		sourceLanguage: "javascript"
	};

	async.series([
			function(callback) {
				var garageDoorIsOpen = checkGarageDoor();		
				record.doorOpen = garageDoorIsOpen;

				if (garageDoorIsOpen) {
				  ledController.turnOn(LedDoor);
				} else {
				  ledController.turnOff(LedDoor);
				}
				
				callback();
			},
			function(callback) {
				checkLight(function(lightIsOn) {									
					record.lightOn = lightIsOn;
					if (!record.doorOpen && lightIsOn) {
						ledController.turnOn(LedLight)
					} else {
						ledController.turnOff(LedLight)
					}
					callback();
				});			
			},
			function(callback) {
				tempController.readTemp(function(tempReading) {
					record.temp_F = tempReading;
					callback();
				});			
			}
		],
		function(err, results) {

			if (err) throw err;
			
			var shouldSaveRecord = false;
			if (lastRecord == null) {
				console.log("       + lastRecord is null")
			    shouldSaveRecord = true
			} else {
			  
			  if (record.doorOpen || record.doorOpen != lastRecord.doorOpen) {
				console.log("       + garageDoorIsOpen differs from lastRecord ", lastRecord.doorOpen)
				shouldSaveRecord = true
			  }
			  
			  if (record.lightOn || record.lightOn != lastRecord.lightOn) {
				console.log("       + lightIsOn differs from lastRecord ", lastRecord.lightOn)
				shouldSaveRecord = true
			  }
			  
			  alreadyRecordedForThisMinute = (record.timestamp.getMinutes() == lastRecord.timestamp.getMinutes());
			  if (!alreadyRecordedForThisMinute && 
				(record.timestamp.getMinutes() == 0 || record.timestamp.getMinutes() == 15 || record.timestamp.getMinutes() == 30 || record.timestamp.getMinutes() == 45)) {
				console.log("       + recording due to 15 minute period")
				shouldSaveRecord = true
			  }
			}

			if (shouldSaveRecord) {

				MongoClient.connect('mongodb://127.0.0.1:27017/garagePi_database', function(err, db) {
					if(err) throw err;
				 
					var collection = db.collection('readings');
					collection.insert(record, function(err, docs) {
						if (err) {
							console.log("Error writing to db: ", err);
						} else {
							var readingId = docs[0]._id;
							console.log("    readings posted to db with id ", readingId)
						}
						db.close();				  
					});
				});			

			}
			
			lastRecord = record
		   
		}
	);
    
  } catch(err) {
		console.log("EXCEPTION: ", err);
  }  

}


process.on('SIGINT', function() {
	console.log("\nShutting down");
    async.series([
	    function(callback) {
           ledController.teardown(LedDoor, callback);
        },
		function(callback) {
           ledController.teardown(LedLight, callback); 
        },
		function(callback) {
           ledController.teardown(LedRun, callback); 
        },
		function(callback) {
           ledController.teardown(LedRun, callback); 
        },
		function(callback) {
			ledController.teardown(LedBlue, callback);
		},	
		function(callback) {
			photocellController.teardown(callback);
		}	
	], function (err, results) {		   
		gpio.destroy(function() {
			console.log("exiting");
				return process.exit(0);
		});        
	});
});
