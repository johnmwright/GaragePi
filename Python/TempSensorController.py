import os
import glob
import time
#
# Based, in large part, on https://learn.adafruit.com/adafruits-raspberry-pi-lesson-11-ds18b20-temperature-sensing?view=all
#

class TempSensorController:


    def __init__(self, sensorIndex):
        self.sensorIndex = sensorIndex
        print("Initializing Temperature Sensor")

        os.system('modprobe w1-gpio')
        os.system('modprobe w1-therm')

        base_dir = '/sys/bus/w1/devices/'
        device_folder = glob.glob(base_dir + '28*')[self.sensorIndex]
        self.device_file = device_folder + '/w1_slave'



    def _readTempRaw(self):
        f = open(self.device_file, 'r')
        lines = f.readlines()
        f.close()
        return lines

    def readTemp(self):
        lines = self._readTempRaw()
        while lines[0].strip()[-3:] != 'YES':
            time.sleep(0.2)
            lines = self._readTempRaw()

        equals_pos = lines[1].find('t=')
        if equals_pos == -1:
            raise Exception("invalid temp reading")
        else:
            temp_string = lines[1][equals_pos+2:]
            temp_c = float(temp_string) / 1000.0
            temp_f = temp_c * 9.0 / 5.0 + 32.0
            print("    Temp Reading: {}C, {}F".format(temp_c, temp_f))
            return temp_c, temp_f


    def teardown(self):
        pass