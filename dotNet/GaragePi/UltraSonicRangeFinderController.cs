using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Raspberry.IO.GeneralPurpose;
using Raspberry.IO.Components.Sensors.Distance.HcSr04;
using Raspberry.IO.GeneralPurpose;
using Raspberry.Timers;

namespace GaragePi
{
    class UltraSonicRangeFinderController: IDisposable
    {
        private readonly HcSr04Connection _connection;

        public UltraSonicRangeFinderController(ConnectorPin triggerPin, ConnectorPin echoPin)
        {
            
            Console.WriteLine("Initializing Ultrasonic Range Finder");

            var driver = GpioConnectionSettings.DefaultDriver;

            _connection = new HcSr04Connection(
                driver.Out(triggerPin.ToProcessor()),
                driver.In(echoPin.ToProcessor(), PinResistor.PullDown));

        }

        public int ReadDistance()
        {

            //
            // Take multiple readings in order to counter the affects of
            // bad data due to non-realtime OS.  Take a bunch of readings,
            // throw out the min and max, then average the rest.
            //

            var numReadingsToTake = 8;
            Console.WriteLine("    Taking {0} Distance Measurements", numReadingsToTake);

            var measurements = new List<int>();
            for (int i = 0; i < numReadingsToTake; i++)
            {
                var thisReading = ReadDistanceOnce();
                measurements.Add(thisReading);
            }

            var maxReading = measurements.Max();
            var minReading = measurements.Min();
            measurements.Remove(maxReading);
            measurements.Remove(minReading);

            var average = Convert.ToInt32(measurements.Average());

            Console.WriteLine("\tAverage Distance: {0}cm", average);
            return average;
        }

        private int ReadDistanceOnce()
        {

            Console.WriteLine("\tDistance Measurement In Progress");

            var distanceInMeters = _connection.GetDistance();
            var distanceInCm = Convert.ToInt32(distanceInMeters * 100);
            Console.WriteLine("\tDistance: {0}cm", distanceInCm);
            return distanceInCm;
            
        }

        public void Dispose()
        {
            Console.WriteLine("Tearing down Ultrasonic Range Finder");
            if (_connection != null)
            {
               ((IDisposable) _connection).Dispose();
            }
            
        }
    }
}
