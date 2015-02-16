var gpio = require('rpi-gpio');

//
// Photocell Controller
//
function photocellControler() {
    var pin = 0;
	var timestart = 0;
	var totalTime = 0;
	var timeout = 1000;
	var isRunning = false;
	
	
	this.init = function(pin, callback) {
		console.log("Initializing Photocell on pin %d", pin)	
		this.pin = pin;
		callback();
	};
	
	this.resistanceTime = function(finalCallback) {
		var self = this;
		
		console.log("    Reading photocell");
		self.isRunning = true;
		
		self.totalTime = 0;
		
		var waitForPin = function() {
			gpio.setup(self.pin, gpio.DIR_IN, function(err) {
			    if (err) throw err;
		
				var checkLoop = setInterval(function checkValue() {
				
					//check if we should have stopped already
					if (!self.isRunning) 
						return;
						
					var timestamp = Date.now();
				
					if ( timestamp - self.timestart > self.timeout) {
						self.totalTime = self.timeout;
					}
						
					gpio.read(self.pin,  function(err, value) {
						if (err) throw err;
						
						//check if we should have stopped already
						if (!self.isRunning) 
							return;
										
					
						if (value == true) {
							self.totalTime = timestamp - self.timestart;
						}
					
						if (self.totalTime != 0) {
							clearInterval(checkLoop);
							console.log("    Light Reading: %d", self.totalTime);
					
							//check if we should have stopped already
							if (!self.isRunning) 
								return;
					
							if (finalCallback) {
								self.isRunning = false;
								finalCallback(self.totalTime);
							} else {
								console.log("FINAL CALLBACK is undefined");
							}
							
						}
					});
					
				}, 5);
			});
			
		};

		gpio.setup(self.pin, gpio.DIR_OUT, function(err) {
		     if (err) throw err;
			 
			 gpio.write(self.pin, false, function(err) {
			    if (err) throw err;
				
				self.timestart = Date.now();
				waitForPin();					
				
			 });
		});            
		
	};
	
	this.teardown = function(callback) { callback() };
}

module.exports = new photocellControler;