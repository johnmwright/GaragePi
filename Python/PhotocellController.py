import RPi.GPIO as GPIO
import time
import os

#
# Based, in part, on https://learn.adafruit.com/basic-resistor-sensor-reading-on-raspberry-pi/basic-photocell-reading
#

class PhotocellController:

    def __init__(self, pin):
        self.pin = pin
        print("Initializing Photocell")

    def resistanceTime(self):
        print("    Reading photocell")
        timeout = 3000
        reading = 0
        GPIO.setup(self.pin, GPIO.OUT)
        GPIO.output(self.pin, GPIO.LOW)
        time.sleep(0.1)

        GPIO.setup(self.pin, GPIO.IN)
        # This takes about 1 millisecond per loop cycle
        while (GPIO.input(self.pin) == GPIO.LOW):
            reading += 1
            if reading > timeout:
                break
        print("    Light Reading: {}".format(reading))
        return reading


    def teardown(self):
        pass