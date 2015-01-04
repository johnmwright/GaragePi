import RPi.GPIO as GPIO

class LedController:

  def __init__(self, pinNum, name):
    self.pin = pinNum
    self.name = name

    print("Initializing LED for {} on pin {}".format(self.name, self.pin))
    GPIO.setup(self.pin, GPIO.OUT)
    GPIO.output(self.pin, False)

  def turnOn(self):
    print( "    Turning {} LED on".format( self.name))
    GPIO.output(self.pin, True)

  def turnOff(self):
    print("    Turning {} LED off".format( self.name))
    GPIO.output(self.pin, False)#

  def teardown(self):
    print("Tearing down {} LED".format( self.name))
    self.turnOff()
