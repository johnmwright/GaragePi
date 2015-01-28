#!/usr/bin/python

#
# For details, see the following blog posts:
#     GaragePi - My Raspberry Pi Playground : http://www.wrightfully.com/garagepi-my-raspberry-pi-playground/
#     GaragePi v2: Temperature and Light : http://www.wrightfully.com/garagepi-v2-temperature-and-light/

import RPi.GPIO as GPIO
import time
from datetime import datetime, timedelta
from pymongo import MongoClient
import SonicController as Sonic
import LedController as LED
import PhotocellController as Lux
import TempSensorController as Temperature

GPIO.setmode(GPIO.BCM)

DISTANCE_TO_CLOSED_DOOR = 70 #cm  - is actually about 60 but get readings up to 68 sometimes
MAX_LIGHT_WHEN_LIGHT_IS_ON = 300
SAMPLE_SPEED = 5 #seconds

# GPIO pin numbers
LED_RED = 12
LED_GREEN = 26
LED_BLUE = 13

TRIG = 23
ECHO = 24
LED_OPEN = LED_RED
LED_RUN = 25
PHOTO = 17
LED_LIGHT = LED_GREEN


def checkGarageDoor():
  distance = sensor.readDistance()
  if distance < DISTANCE_TO_CLOSED_DOOR:
    print("  - Door open")
    return True
  else:
    print("  - Door closed")
    return False

def checkLight():
  lightLevel = lux.resistanceTime()
  if lightLevel < MAX_LIGHT_WHEN_LIGHT_IS_ON:
    print("  - Light is on")
    return True
  else:
    print("  - Light is off")
    return False


ledRun = LED.LedController(LED_RUN, "Running Indicator")
ledDoor = LED.LedController(LED_OPEN, "Door Open")
ledLight = LED.LedController(LED_LIGHT, "Light On")
sensor = Sonic.SonicController(TRIG, ECHO)
lux = Lux.PhotocellController(PHOTO)
tempSensor = Temperature.TempSensorController(0)

# this is just to make sure the led is initialized to off
ledBlue = LED.LedController(LED_BLUE, "blue - unused")

lastRecord = None

try:
  ledRun.turnOn()

  dbclient = MongoClient()
  db = dbclient.garagePi_database

  while True:
    timestamp = datetime.now()
    print("Beginning Sensor Checks {}".format( timestamp))

    garageDoorIsOpen = checkGarageDoor()
    lightIsOn = checkLight()
    temp_c, temp_f = tempSensor.readTemp()

    if (garageDoorIsOpen):
      ledDoor.turnOn()
    else:
      ledDoor.turnOff()

    if (not garageDoorIsOpen) and lightIsOn:
        ledLight.turnOn()
    else:
        ledLight.turnOff()

    record = { "doorOpen" : garageDoorIsOpen,
               "lightOn"  : lightIsOn,
               "temp_F"   : temp_f,
               "timestamp": timestamp,
               "sourceLanguage": "python"
    }

    if (lastRecord is None):
      print("       + lastRecord is None")
    else:
      if (garageDoorIsOpen != lastRecord["doorOpen"]):
        print("       + garageDoorIsOpen differs from lastRecord {}".format(lastRecord["doorOpen"]))
      if (lightIsOn != lastRecord["lightOn"]):
        print("       + lightIsOn differs from lastRecord {}".format(lastRecord["lightOn"]))
      if (timestamp.hour != lastRecord["timestamp"].hour):
        print("       + timestamp.hour {} differs from lastRecord {}".format(timestamp.hour, lastRecord["timestamp"].hour))


    if (lastRecord is None or garageDoorIsOpen != lastRecord["doorOpen"] or lightIsOn != lastRecord["lightOn"] or timestamp.hour != lastRecord["timestamp"].hour):

      readings = db.readings
      readingId = readings.insert(record)
      print("    readings posted to db with id {}".format(readingId))

    lastRecord = record
    time.sleep(SAMPLE_SPEED)

except KeyboardInterrupt:
    print("keyboard interrupt caught")

finally:
  sensor.teardown()
  lux.teardown()
  ledDoor.teardown()
  ledLight.teardown()
  ledRun.teardown()


  GPIO.cleanup()
  print("exiting")

