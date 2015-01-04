#
# This script is a quick way to test the LED circuit and logic. It will
# turn on each of the RGB colors for 1 second.
#

import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
LED_RED = 12
LED_GREEN = 26
LED_BLUE = 13


GPIO.setup(LED_RED, GPIO.OUT)
GPIO.setup(LED_GREEN, GPIO.OUT)
GPIO.setup(LED_BLUE, GPIO.OUT)

print "LED Red On"
GPIO.output(LED_RED, True)
time.sleep(1)
GPIO.output(LED_RED, False)

print "LED Green On"
GPIO.output(LED_GREEN, True)
time.sleep(1)
GPIO.output(LED_GREEN, False)

print "LED Blue On"
GPIO.output(LED_BLUE, True)
time.sleep(1)
GPIO.output(LED_BLUE, False)


GPIO.cleanup()
