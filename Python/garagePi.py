#!/usr/bin/python
import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)


SPEED_OF_SOUND = 34000 #cm/s    
DISTANCE_TO_CLOSED_DOOR = 70 #cm  - is actually about 60 but get readings up to 68 sometimes
SAMPLE_SPEED = 5 #seconds

# GPIO pin numbers
TRIG = 23
ECHO = 24
LED_OPEN = 12
LED_RUN = 25

class SonicController:
  def readDistance(self):

    print "Distance Measurement In Progress " + time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())    


    GPIO.output(TRIG, True)
    time.sleep(0.00001)
    GPIO.output(TRIG, False)
    

    pulse_start = time.time()
    while GPIO.input(ECHO)==0:
      pulse_start = time.time()
      

    while GPIO.input(ECHO)==1:
      pulse_end = time.time()      


    pulse_duration = pulse_end - pulse_start
    roundtrip_duration = pulse_duration * SPEED_OF_SOUND
    one_way_distance = roundtrip_duration/2
    print "    Distance: %.2f cm" %one_way_distance
    return one_way_distance

  def init(self):
    
    print "Initializing Ultrasonic Range Finder"
    
    GPIO.setup(TRIG, GPIO.OUT, pull_up_down = GPIO.PUD_DOWN)
    GPIO.setup(ECHO, GPIO.IN, pull_up_down = GPIO.PUD_DOWN)
    

    GPIO.output(TRIG, False)
    print "Waiting For Sensor To Settle"
    time.sleep(2)

  def teardown(self):
    print "Tearing down Ultrasonic Range Finder"
    GPIO.output(TRIG, False)


class LedController:
  def init(self):
    print "Initializing LED"
    GPIO.setup(LED_OPEN, GPIO.OUT)
    GPIO.setup(LED_RUN, GPIO.OUT)
    GPIO.output(LED_RUN, True)
  
  def turnOnDoorLed(self):
    print "    Turning LED on"
    GPIO.output(LED_OPEN, True)
  
  def turnOffDoorLed(self):
    print "    Turning LED off"
    GPIO.output(LED_OPEN, False)

  def teardown(self):
    print "Tearing down LED"
    self.turnOffDoorLed()
    GPIO.output(LED_RUN, False)


led = LedController()
led.init()

sensor = SonicController()
sensor.init()

try:
  while True:
    distance = sensor.readDistance()
    if distance < DISTANCE_TO_CLOSED_DOOR:
      print "    Door open"
      led.turnOnDoorLed()
    else:
      print "    Door closed"
      led.turnOffDoorLed()
    
    time.sleep(SAMPLE_SPEED)
except KeyboardInterrupt:
    print "keyboard interrupt caught"
finally:
  sensor.teardown()
  led.teardown()

  GPIO.cleanup()
  print "exiting"

	
