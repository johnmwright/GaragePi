import RPi.GPIO as GPIO
import time

class SonicController:

  SPEED_OF_SOUND = 34000 #cm/s

  def __init__(self, triggerPin, echoPin):
    self.triggerPin = triggerPin
    self.echoPin = echoPin

    print("Initializing Ultrasonic Range Finder")

    GPIO.setup(self.triggerPin, GPIO.OUT, pull_up_down = GPIO.PUD_DOWN)
    GPIO.setup(self.echoPin, GPIO.IN, pull_up_down = GPIO.PUD_DOWN)

    GPIO.output(self.triggerPin, False)
    print("Waiting For Sensor To Settle")
    time.sleep(2)

  def _readDistanceOnce(self):

    print("    Distance Measurement In Progress")
    READING_TIMEOUT = 2 #sec
    maxTime = time.time() + READING_TIMEOUT

    GPIO.output(self.triggerPin, True)
    time.sleep(0.00001)
    GPIO.output(self.triggerPin, False)


    pulse_start = time.time()
    while GPIO.input(self.echoPin)==0 and pulse_start < maxTime:
      pulse_start = time.time()

    pulse_end = time.time()
    while GPIO.input(self.echoPin)==1 and pulse_end < maxTime:
      pulse_end = time.time()

    if pulse_end > maxTime:
      print("  PULSE READ TIMED OUT")

    pulse_duration = pulse_end - pulse_start
    roundtrip_duration = pulse_duration * self.SPEED_OF_SOUND
    one_way_distance = roundtrip_duration/2
    print("    Distance: {0:0.2f} cm".format(one_way_distance))
    return one_way_distance

  def readDistance(self):

    #
    # Take multiple readings in order to counter the affects of
    # bad data due to non-realtime OS.  Take a bunch of readings,
    # throw out the min and max, then average the rest.
    # 
    numReadingsToTake = 8
    print("    Taking {} Distance Measurements".format(numReadingsToTake))
    measurements = []
    for x in range(0, numReadingsToTake):
      thisReading = self._readDistanceOnce()
      measurements.append(thisReading)

    maxReading = max(measurements)
    minReading = min(measurements)
    measurements.remove(maxReading)
    measurements.remove(minReading)

    average = sum(measurements)/len(measurements)

    print("    Average Distance: {0:0.2f} cm".format(average))
    return average

  def teardown(self):
    print("Tearing down Ultrasonic Range Finder")
    GPIO.output(self.triggerPin, False)

