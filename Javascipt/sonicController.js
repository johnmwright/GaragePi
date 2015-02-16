var sonic = require('r-pi-usonic');

//
// Sonic controller
//
function sonicController() {
	var sonicSensor;

	this.init = function(echoPin, triggerPin, callback) {
		sonicSensor = sonic.createSensor(echoPin, triggerPin);
		callback();
	};

	this.readDistance = function() {

		//
		// Take multiple readings in order to counter the affects of
		// bad data due to non-realtime OS.  Take a bunch of readings,
		// throw out the min and max, then average the rest.
		// 
		var numReadingsToTake = 8
		console.log("    Taking %d Distance Measurements", numReadingsToTake)
		
        var measurements = [];
		for(var i = 0; i < numReadingsToTake; i++) {		
			thisReading = _readDistanceOnce();
			measurements.push(thisReading);
		}
		
		var minReading = Math.min.apply(null, measurements);
		var maxReading = Math.max.apply(null, measurements);
		
		var idx = measurements.indexOf(minReading);
		measurements.splice(idx, 1);
		
		id = measurements.indexOf(maxReading);
		measurements.splice(maxReading);
		
		
		var sum = 0;

		for(var i = 0; i < measurements.length; i++) {
			sum += measurements[i];
		}

		var average = sum / measurements.length;

		console.log("    Average Distance: %d cm", average);
		return average;

	};
	
	function _readDistanceOnce() {
		var one_way_distance = sonicSensor()
		console.log("    Distance: %d cm", one_way_distance)
		return one_way_distance;
	};
}


module.exports = new sonicController;