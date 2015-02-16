var gpio = require('rpi-gpio');


//
// LED Controller
//
function ledController() {
	this.init = function (led, callback) {
		var self = this;
		console.log("Initializing LED for %s on pin %d", led.Name, led.Pin);
		gpio.setup(led.Pin, gpio.DIR_OUT, function() {
			self.turnOff(led, callback);
		});
	};

	this.turnOn = function (led, callback) {
		console.log( "    Turning %s LED on", led.Name);
		gpio.write(led.Pin, true, callback);
	};

	this.turnOff = function (led, callback) {
		console.log( "    Turning %s LED off", led.Name);
		gpio.write(led.Pin, false, callback);
	};

	this.teardown = function (led, callback){
		var self = this;
		console.log("Tearing down %s LED", led.Name);
		self.turnOff(led, callback);
	};
};

module.exports = new ledController;