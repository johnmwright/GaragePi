using System;
using System.CodeDom.Compiler;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Raspberry.IO.GeneralPurpose;
using Raspberry.Timers;
using MongoDB.Bson;
using MongoDB.Driver;

namespace GaragePi
{
    class Program
    {


        private const int DISTANCE_TO_CLOSED_DOOR = 70; // cm  - is actually about 60 but get readings up to 68 sometimes
        private const int MAX_LIGHT_WHEN_LIGHT_IS_ON = 300;

        private const int SecondsBetweenScans = 5;
        private static readonly int ScanInterval = Convert.ToInt32(TimeSpan.FromSeconds(SecondsBetweenScans).TotalMilliseconds);

        
        //# GPIO pin numbers
        private const ConnectorPin LED_RED = ConnectorPin.GPIO12;
        private const ConnectorPin LED_GREEN = ConnectorPin.GPIO26;
        private const ConnectorPin LED_BLUE = ConnectorPin.GPIO13;

        private const ConnectorPin TRIG = ConnectorPin.GPIO23;
        private const ConnectorPin ECHO = ConnectorPin.GPIO24;
        private const ConnectorPin LED_OPEN = LED_RED;
        private const ConnectorPin LED_RUN = ConnectorPin.GPIO25;
        private const ConnectorPin PHOTO = ConnectorPin.GPIO17;
        private const ConnectorPin LED_LIGHT = LED_GREEN;


        static void Main(string[] args)
        {
            var program = new Program();
            program.RunDetectionLoop();
        }

        private void RunDetectionLoop()
        {
            using( var ledRun = new LedController(LED_RUN, "Running Indicator"))
            using(var ledDoor = new LedController(LED_OPEN, "Door Open"))
            using(var ledLight = new LedController(LED_LIGHT, "Light On"))
            using(var sonic = new UltraSonicRangeFinderController(TRIG, ECHO))
            using (var lux = new PhotocellController(PHOTO))
            using(var tempSensor = new TempSensorController(0))
            using (var ledBlue = new LedController(LED_BLUE, "blue - unused"))     // this is just to make sure the led is initialized to off
            {
            
    
                    Console.WriteLine("Running Loop....");


                    ledRun.TurnOn();



                    MongoClient client = new MongoClient(); // connect to localhost
                    MongoServer server = client.GetServer();
                    MongoDatabase db = server.GetDatabase("garagePi_database");
          

                    bool exitRequested = false;

                    Console.CancelKeyPress += delegate
                    {
                        Console.WriteLine("Exiting...");
                        ledRun.Dispose();
                        ledDoor.Dispose();
                        ledLight.Dispose();
                        sonic.Dispose();
                        lux.Dispose();
                        ledBlue.Dispose();
                        tempSensor.Dispose();

                        exitRequested = true;
                    };


                    BsonDocument lastRecord = null;

                    while (!exitRequested)
                    {
                        var timestamp = DateTime.UtcNow;
                        Console.WriteLine("Beginning Sensor Checks {0}", timestamp);

                        var garageDoorIsOpen = CheckGarageDoor(sonic);
                        var lightIsOn = CheckLight(lux);
                        var tempF = tempSensor.ReadTemp();


                        if (garageDoorIsOpen)
                        {
                            ledDoor.TurnOn();
                        }
                        else
                        {
                            ledDoor.TurnOff();
                        }

                        if (!garageDoorIsOpen && lightIsOn)
                        {
                            ledLight.TurnOn();
                        }
                        else
                        {
                            ledLight.TurnOff();
                        }


                        var record = new BsonDocument()
                            .Add("doorOpen", garageDoorIsOpen)
                            .Add("lightOn", lightIsOn)
                            .Add("temp_F", tempF)
                            .Add("timestamp", timestamp)
                            .Add("sourceLanguage", "dotNet");

                        var shouldSaveRecord = false;
                        if (lastRecord == null)
                        {
                            Console.WriteLine("       + lastRecord is null");
                            shouldSaveRecord = true;
                        }
                        else
                        {
                            if (garageDoorIsOpen || garageDoorIsOpen != lastRecord["doorOpen"].AsBoolean)
                            {
                                Console.WriteLine("       + garageDoorIsOpen differs from lastRecord {0}", lastRecord["doorOpen"].AsBoolean);
                                shouldSaveRecord = true;
                            }

                            if (lightIsOn || lightIsOn != lastRecord["lightOn"].AsBoolean)
                            {
                                Console.WriteLine("       + lightIsOn differs from lastRecord {0}", lastRecord["lightOn"].AsBoolean);
                                shouldSaveRecord = true;
                            }

                            var alreadyRecordedForThisMinute = timestamp.Minute == lastRecord["timestamp"].AsBsonDateTime.ToUniversalTime().Minute;

                            if (! alreadyRecordedForThisMinute &&
                                (timestamp.Minute == 0 || timestamp.Minute == 15 || timestamp.Minute == 30 ||
                                 timestamp.Minute == 45))
                            {
                                Console.WriteLine("       + recording due to 15 minute period");
                                shouldSaveRecord = true;
                            }
                        }

                        if (shouldSaveRecord)
                        {
                            var readings = db.GetCollection("readings");
                            readings.Insert(record);                            
                            Console.WriteLine("\treadings posted to db with id {0}", record["_id"]);
                        }

                        lastRecord = record;


                        Timer.Sleep(ScanInterval);
                    }
                }

            
        }

        private static bool CheckLight(PhotocellController lux)
        {
            var lightLevel = lux.ResistanceTime();
            if (lightLevel < MAX_LIGHT_WHEN_LIGHT_IS_ON)
            {
                Console.WriteLine("    - Light is on");
                return true;
            }
            else
            {
                Console.WriteLine("    - Light is off");
                return false;
            }
        }

        private static bool CheckGarageDoor(UltraSonicRangeFinderController sonic)
        {
            var distance = sonic.ReadDistance();
            if (distance < DISTANCE_TO_CLOSED_DOOR)
            {
                Console.WriteLine("    - Door open");
                return true;
            }
            else
            {
                Console.WriteLine("    - Door closed");
                return false;
            }
        }

    }
}
