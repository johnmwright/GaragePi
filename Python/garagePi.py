#!/usr/bin/python
import RPi.GPIO as GPIO
import time
import SonicController as Sonic
import LedController as LED

GPIO.setmode(GPIO.BCM)



DISTANCE_TO_CLOSED_DOOR = 70 #cm  - is actually about 60 but get readings up to 68 sometimes
SAMPLE_SPEED = 5 #seconds

# GPIO pin numbers
TRIG = 23
ECHO = 24
LED_OPEN = 12
LED_RUN = 25

ledRun = LED.LedController(LED_RUN, "Running Indicator")
ledRun.turnOn()

ledDoor = LED.LedController(LED_OPEN, "Door Open")
sensor = Sonic.SonicController(TRIG, ECHO)


try:
  while True:
    distance = sensor.readDistance()
    if distance < DISTANCE_TO_CLOSED_DOOR:
      print "    Door open"
      ledDoor.turnOn()
    else:
      print "    Door closed"
      ledDoor.turnOff()
    
    time.sleep(SAMPLE_SPEED)
except KeyboardInterrupt:
    print "keyboard interrupt caught"
finally:
  sensor.teardown()
  ledDoor.teardown()
  ledRun.teardown();

  GPIO.cleanup()
  print "exiting"

	
