

#include "DHT.h"

#define DHTPIN 2  
#define trigPin 13
#define echoPin 12
#define photoresistorPin 0
#define redLED 7
#define greenLED 8

#define CLOSED_DOOR_DISTANCE 70 
#define LIGHT_THRESHOLD 300

// Initialize DHT sensor.
DHT dht(DHTPIN, DHT11);


void setup() {
    Serial.begin (9600);
    setupLEDs();
    setupDistanceSensor();
    dht.begin();
}

void setupLEDs() {
    pinMode(redLED, OUTPUT);
    pinMode(greenLED, OUTPUT);
    digitalWrite(redLED, LOW);
    digitalWrite(greenLED, LOW);  
}

void setupDistanceSensor() {
    pinMode(trigPin, OUTPUT);
    pinMode(echoPin, INPUT);  
}

void loop() {

  long distance = readDistance();
 
  int lightLevel = readLightLevel();

  if (distance <= CLOSED_DOOR_DISTANCE) {
    digitalWrite(greenLED, LOW);
    digitalWrite(redLED, HIGH);
  } else {
    digitalWrite(redLED, LOW);

    if (lightLevel > LIGHT_THRESHOLD) {
      digitalWrite(greenLED, HIGH);
    } else {
      digitalWrite(greenLED, LOW);
    }
        
  }

  float tempF = dht.readTemperature(true);
  float humidity = dht.readHumidity();
  float heatIndex = dht.computeHeatIndex(tempF, humidity);


  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  Serial.print("Light: ");
  Serial.println(lightLevel);
  
  Serial.print("Temperature: ");
  Serial.print(tempF);
  Serial.print(" *F\t");
  
  Serial.print("Humidity: ");
  Serial.print(humidity);
  Serial.print(" %\t");
  
  Serial.print("Heat index: ");
  Serial.print(heatIndex);
  Serial.println(" *F");
 
  delay(2000);
  
}

long readDistance() {
  
  digitalWrite(trigPin, LOW);  
  delayMicroseconds(2); 
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10); 
  digitalWrite(trigPin, LOW);
  long duration = pulseIn(echoPin, HIGH);
  long distance = (duration/2) / 29.1;
  return distance;
}

int readLightLevel() {
  int lightLevel = analogRead(photoresistorPin);
  return lightLevel;
}



