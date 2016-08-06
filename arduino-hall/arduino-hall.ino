#define SENSOR_COUNT  10
#define BTN_COUNT 5
#define VELOCITY_PIN A5
#define DIR_PIN 11
#define LIGHTS_PIN 12

#include <Wire.h>

int sensors[SENSOR_COUNT] = {2,4,5,6,7,8,A0,A1,A2,A3};
int prevs[SENSOR_COUNT] ;

int btns[BTN_COUNT] = {A4,10,9,3,13};
int btns_prev[BTN_COUNT];
int btns_val[BTN_COUNT];
int vel=0;
int velPrev=0;
int lights=0;
int lightsBtn = 1;
int dir=0;
int dirBtn = 1;
void setup() {

	Wire.begin(0x08);                // join i2c bus with address #8
	Wire.onReceive(receiveEvent);
	Wire.onRequest(requestEvent);
 
  for (int i=0; i<SENSOR_COUNT; i++) {
    pinMode(sensors[i], INPUT_PULLUP);
  }
    for (int i=0; i<BTN_COUNT; i++) {
    pinMode(btns[i], INPUT_PULLUP);
  }
  pinMode(LIGHTS_PIN, INPUT_PULLUP);
  pinMode(DIR_PIN, INPUT_PULLUP);
  pinMode(VELOCITY_PIN, INPUT);
  Serial.begin(9600);
}

void loop() {
  for (int i=0; i<SENSOR_COUNT; i++) {
    int value = digitalRead(sensors[i]);
    if (value != prevs[i]) {
      prevs[i] = value;
      int sensorOut = i+1;
      if (sensorOut == 10) {
        sensorOut=  0;
        }
        Serial.print("S");
  	  Serial.print(sensorOut);
      int out = value == HIGH ? LOW : HIGH;
  	  Serial.println(out);
    }
  
  }
   for (int i=0; i<BTN_COUNT; i++) {
    int btns_val = digitalRead(btns[i]);
    if (btns_val != btns_prev[i]) {
      btns_prev[i] = btns_val;
      if (btns_val == LOW) {
        int sensorOut = i+1;
        Serial.print("B");
        Serial.println(sensorOut);        
      }
    }
  
  }  

  //checkLocoControls();
}

void checkLocoControls() {
  int lightsVal = digitalRead(LIGHTS_PIN); 
  if (lightsVal != lightsBtn) {
      lightsBtn = lightsVal;
      if (lightsVal == LOW) {
        lights = toggle(lights);
        Serial.print("L");
        Serial.println(lights);
      }
    } 
  int dirVal = digitalRead(DIR_PIN); 
  if (dirVal != dirBtn ) {
      dirBtn = dirVal;
      if (dirVal == LOW) {
        dir = toggle(dir);
        Serial.print("D");
        Serial.println(dir);
      }
    } 
  int velVal = map(constrain(analogRead(VELOCITY_PIN), 50, 1000), 50, 1000,100, 0);
  if (velVal - velPrev > 3 || velVal- velPrev < -3 ) {
      velPrev = velVal;
      Serial.print("V");
      Serial.println(velVal);
    } 

    
};

int toggle(int val){
  return val==1?0:1;  
}

void requestEvent() {
	Serial.print("Request: ");
	if (whatToSend == 18) {

		Serial.println("Sent data");
		Wire.write(myPin);
	}
	else
	{
		byte data[] = { 0,0 };
		Wire.write(data, 2);
		Serial.println("Sent empty");
	}

}

void receiveEvent(int howMany) {
	Serial.print("Receive: ");
	Serial.println(howMany);
	while (0 < Wire.available()) { // loop through all but the last
		int c = Wire.read(); // receive byte as a character
		Serial.println(c);         // print the character
		whatToSend = (byte)c;
	}
}
