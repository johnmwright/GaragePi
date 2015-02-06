using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Raspberry.IO;
using Raspberry.IO.GeneralPurpose;

namespace GaragePi
{
    class PhotocellController: IDisposable
    {
        private readonly GpioInputOutputBinaryPin _pin;

        public PhotocellController(ConnectorPin pin)
        {
            Console.WriteLine("Initializing Photocell on pin {0}", pin);
            
            IGpioConnectionDriver driver = GpioConnectionSettings.DefaultDriver;           
            _pin = driver.InOut(pin);
        }


        public int ResistanceTime()
        {
            Console.WriteLine("\tReading photocell");
            const int timeout = 1000;
            
            _pin.Write(false);
            Thread.Sleep(1);

            decimal reading;
            try
            {
                reading = _pin.Time(false, phase2Timeout: timeout);
            }
            catch (TimeoutException)
            {
                reading = timeout;
            }

            //var stopwatch = Stopwatch.StartNew();
            //while (_pin.Read() == false && stopwatch.ElapsedMilliseconds < timeout)
            //{
            //    Thread.Sleep(1);
            //}
            //var reading = stopwatch.ElapsedMilliseconds;


            Console.WriteLine("\tLight Reading: {0}", reading);
            return Convert.ToInt32(reading);
        }

        public void Dispose()
        {
            Console.WriteLine("Tearing down Photocell");
            _pin.Dispose();            
        }
    }
}
