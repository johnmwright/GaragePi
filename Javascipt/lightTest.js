#!/usr/bin/nodejs
var gpio = require('rpi-gpio');
var async = require('async');

console.log("starting");

var myPins = {
    PHOTO: 17
};


var MAX_LIGHT_WHEN_LIGHT_IS_ON = 300;
var SAMPLE_SPEED = 5000; //microseconds


gpio.setMode(gpio.MODE_BCM);


var photocellControler = {
    pin: 0,
	timestart: 0,
	totalTime: 0,
	timeout: 1000,
	
	
	init: function(pin, callback) {
		console.log("Initializing Photocell on pin %d", pin)	
		photocellControler.pin = pin;
		callback();
	},
	
	resistanceTime: function(finalCallback) {
		
		console.log("    Reading photocell");
		
		photocellControler.totalTime = 0;
		
		var waitForPin = function() {
			gpio.setup(photocellControler.pin, gpio.DIR_IN, function(err) {
			    if (err) throw err;
		
				var checkLoop = setInterval(function checkValue() {
				
					var timestamp = Date.now();
				
					if ( timestamp - photocellControler.timestart > photocellControler.timeout) {
						photocellControler.totalTime = photocellControler.timeout;
					}
						
					gpio.read(photocellControler.pin,  function(err, value) {
						if (err) throw err;
						
						if (value == true) {
							photocellControler.totalTime = timestamp - photocellControler.timestart;
						}
					
						if (photocellControler.totalTime != 0) {
							clearInterval(checkLoop);
							console.log("    Light Reading: %d", photocellControler.totalTime);
							
							if (finalCallback) {
								finalCallback(photocellControler.totalTime);
							} else {
								console.log("FINAL CALLBACK is undefined");
							}
							
						}
					});
					
					
					
				}, 5);
			});
			
		};

		gpio.setup(photocellControler.pin, gpio.DIR_OUT, function(err) {
		     if (err) throw err;
			 gpio.write(photocellControler.pin, false, function(err) {
			    if (err) throw err;
				setTimeout(function() {
					photocellControler.timestart = Date.now();
					waitForPin();					
				}, 100);	
			 });
		});            
		
	},
			
}

photocellControler.init(myPins.PHOTO, function() {		
	console.log('Pins set up');
	setInterval(run, SAMPLE_SPEED);
});	


function checkLight(callback) {
	photocellControler.resistanceTime(function(reading) {
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
	var timestamp = Date.now();
	console.log("Beginning Sensor Checks %s", timestamp.toString());
    
	var lightIsOn = checkLight(function(lightIsOn) {
		console.log("lightIsOn: " + lightIsOn);
	});

}


process.on('SIGINT', function() {
	console.log("\nShutting down");
        gpio.destroy(function() {	
		console.log("exiting");
		return process.exit(0);
	});
});
