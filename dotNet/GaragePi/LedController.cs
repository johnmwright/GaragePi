using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Raspberry.IO;
using Raspberry.IO.GeneralPurpose;

namespace GaragePi
{
    class LedController: IDisposable
    {
        private readonly string _name;
        private readonly GpioOutputBinaryPin _ledPin;
   

        public LedController(ConnectorPin pin, string name)
        {
            _name = name;
            Console.WriteLine("Initializing LED for {0} on pin {1}", name, pin);
            
            IGpioConnectionDriver driver = GpioConnectionSettings.DefaultDriver;
            _ledPin = driver.Out(pin);
            TurnOff();
        }

       
        public void TurnOn()
        {
            Console.WriteLine("\tTurning {0} LED on", _name);            
            _ledPin.Write(true);
        }


        public void TurnOff()
        {
            Console.WriteLine("\tTurning {0} LED off", _name);
            _ledPin.Write(false);
        }

        public void Dispose()
        {
            Console.WriteLine("Tearing down {0} LED", _name);
            TurnOff();           
            _ledPin.Dispose();
            
        }
    }
}
