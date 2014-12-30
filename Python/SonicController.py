import RPi.GPIO as GPIO
import time

class SonicController:

  SPEED_OF_SOUND = 34000 #cm/s

  def __init__(self, triggerPin, echoPin):
    self.triggerPin = triggerPin
    self.echoPin = echoPin

    print "Initializing Ultrasonic Range Finder"

    GPIO.setup(self.triggerPin, GPIO.OUT, pull_up_down = GPIO.PUD_DOWN)
    GPIO.setup(self.echoPin, GPIO.IN, pull_up_down = GPIO.PUD_DOWN)

    GPIO.output(self.triggerPin, False)
    print "Waiting For Sensor To Settle"
    time.sleep(2)

  def readDistance(self):

    print "Distance Measurement In Progress " + time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())

    GPIO.output(self.triggerPin, True)
    time.sleep(0.00001)
    GPIO.output(self.triggerPin, False)


    pulse_start = time.time()
    while GPIO.input(self.echoPin)==0:
      pulse_start = time.time()


    while GPIO.input(self.echoPin)==1:
      pulse_end = time.time()


    pulse_duration = pulse_end - pulse_start
    roundtrip_duration = pulse_duration * self.SPEED_OF_SOUND
    one_way_distance = roundtrip_duration/2
    print "    Distance: %.2f cm" %one_way_distance
    return one_way_distance


  def teardown(self):
    print "Tearing down Ultrasonic Range Finder"
    GPIO.output(self.triggerPin, False)

