#define SENSOR_COUNT  10

//#include <Wire.h>

int sensors[SENSOR_COUNT] = { 4,5,6,7,8,9,14,15,16,10 };
int prevs[SENSOR_COUNT] = { 0,0,0,0,0,0,0,0,0,0 };

//uint8_t output[2] = { 0,0 };

//volatile bool shouldClear = false;

void setup() {

	//Wire.begin(0x08);                // join i2c bus with address #8
	//Wire.onRequest(requestEvent);

	for (int i = 0; i < SENSOR_COUNT; i++) {
		pinMode(sensors[i], INPUT_PULLUP);
	}

	Serial.begin(9600);
	Serial.println("RocRail Hall Sensor Firmware 0.1");
}

void loop() {
	for (int i = 0; i < SENSOR_COUNT; i++) {
		int value = digitalRead(sensors[i]);
		if (value != prevs[i]) {
				prevs[i] = value;
				Serial.print("S");
				Serial.print(i);
				int sendValue = value == 0 ? 1 : 0;
				String sendHex = String(sendValue, HEX);
				Serial.println(sendHex);
			}

		}
	//prepareWireData();
}

//void prepareWireData() {
//	uint8_t bytes[] = { 0,0 };
//	uint8_t currentByte = 1;
//
//	for (int i = SENSOR_COUNT; i >= 0; i--) {
//		if (i == 7) {
//			currentByte--;
//		}
//		uint8_t prev = prevs[i] == 0 ? 1 : 0;
//		bytes[currentByte] = bytes[currentByte] << 1;
//		bytes[currentByte] = bytes[currentByte] | prev;
//	}
//	if (shouldClear) {
//		output[0] = bytes[0];
//		output[1] = bytes[1];
//		shouldClear = false;
//	}
//	else {
//		output[0] = output[0] | bytes[0];
//		output[1] = output[1] | bytes[1];
//	}
//}

//void requestEvent() {
//	Wire.write(output, 2);
//	shouldClear = true;
//}

