#!/usr/bin/python

#
# This script is a quick way to test the temperature sensor logic and circuit.
# It will loop and attempt to read the temperature values every second.
#
import RPi.GPIO as GPIO
import time
import TempSensorController as TempSensor

GPIO.setmode(GPIO.BCM)

tempSensor0 = TempSensor.TempSensorController(0)
tempSensor1 = TempSensor.TempSensorController(1)

while True:
    deg_c0, deg_f0 = tempSensor0.readTemp()
    deg_c1, deg_f1 = tempSensor1.readTemp()
    print("Sensor0: {} *F Sensor1: {} *F".format(deg_f0, deg_f1))

    time.sleep(1)