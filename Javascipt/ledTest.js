#!/usr/bin/nodejs
var gpio = require('rpi-gpio');
var async = require('async');

console.log("starting");

var myPins = {
	LED_RED: 12,
	LED_GREEN: 26,
	LED_BLUE: 13,
};

gpio.setMode(gpio.MODE_BCM);

async.parallel([
    function(callback) {
		gpio.setup(myPins.LED_RED, gpio.DIR_OUT, callback);
	},
    function(callback) {
		gpio.setup(myPins.LED_GREEN, gpio.DIR_OUT, callback);
	},
    function(callback) {
		gpio.setup(myPins.LED_BLUE, gpio.DIR_OUT, callback);
	}
], function(err, results) {
		console.log('Pins set up');
		run();
});	

function run() {
 async.series([
        function(callback) {
            turnOn(myPins.LED_RED, "Red", callback)
        },
		function(callback) {
            turnOn(myPins.LED_BLUE, "Blue", callback)
        },
		function(callback) {
            turnOn(myPins.LED_GREEN, "Green", callback)
        },
	], function(err, results) {
        console.log('Writes complete, pause then unexport pins');
        setTimeout(function() {
            gpio.destroy(function() {
                console.log('Closed pins, now exit');
                return process.exit(0);
            });
        }, 500);
    });
}



function turnOn(pin, color, callback) {
	console.log("LED " + color + " On");
	gpio.write(pin, true, function(err) {
		if (err) throw err;
		setTimeout(function() {
			console.log("LED " + color + " Off");
			gpio.write(pin, false, callback);
		}, 1000)
	});
}
