var Temperature = require('ds18b20');

//
// Temp Controller
//
function tempController() {
	this.readTemp = function(callback) {
		Temperature.sensors(function(err, ids) {
			Temperature.temperature(ids, function(err, tempCelcius) {
			    if (err) throw error;
				
				var tempFahrenheit = tempCelcius * 9 / 5 + 32;
				console.log("    Temp Reading: %d C, %d F", tempCelcius, tempFahrenheit);
				callback(tempFahrenheit);
			});
		});
	};
}; 

module.exports = new tempController;