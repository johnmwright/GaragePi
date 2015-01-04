#!/usr/bin/python

#
# For details, see the following blog posts:
#     GaragePi – My Raspberry Pi Playground : http://www.wrightfully.com/garagepi-my-raspberry-pi-playground/
#     GaragePi v2: Temperature and Light : http://www.wrightfully.com/garagepi-v2-temperature-and-light/

import RPi.GPIO as GPIO
import time
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

try:
  ledRun.turnOn()

  while True:
    print("Beginning Sensor Checks {}".format( time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())))

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

