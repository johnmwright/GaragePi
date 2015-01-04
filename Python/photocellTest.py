#!/usr/bin/python

#
# This script is a quick way to get light sensor values in a loop
# and verify the sensor logic
#
import RPi.GPIO as GPIO
import time
import PhotocellController as Lux

GPIO.setmode(GPIO.BCM)

LUX_PIN = 17

lux = Lux.PhotocellController(LUX_PIN)

while True:
    print lux.resistanceTime()