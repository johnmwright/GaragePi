using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Raspberry.IO;
using Raspberry.IO.GeneralPurpose;
using Raspberry.IO.Components.Sensors.Temperature.Ds18b20;
namespace GaragePi
{
    class TempSensorController: IDisposable
    {
        private Ds18b20Connection _driver;

        public TempSensorController(int sensorIndex = 0)
        {
            Console.WriteLine("Initializing Temperature Sensor");
            _driver = new Ds18b20Connection(sensorIndex);
        }


        public double ReadTemp()
        {
            Console.WriteLine("\tReading temperature");

            var tempF = _driver.GetTemperatureFahrenheit();

            Console.WriteLine("\tTemp Reading: {0}F", tempF);
         
            return tempF;
        }

        public void Dispose()
        {
            Console.WriteLine("Tearing down Temperature Sensor");
            ((IDisposable)_driver).Dispose();            
        }
    }
}
