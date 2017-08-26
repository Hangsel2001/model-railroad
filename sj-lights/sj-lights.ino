#include <NmraDcc.h>

// This Example shows how to use the library as a DCC Accessory Decoder or a DCC Signalling Decoder
// It responds to both the normal DCC Turnout Control packets and the newer DCC Signal Aspect packets 
// You can also print every DCC packet by uncommenting the "#define NOTIFY_DCC_MSG" line below

NmraDcc  Dcc ;
DCC_MSG  Packet ;

struct CVPair
{
  uint16_t  CV;
  uint8_t   Value;
};

CVPair FactoryDefaultCVs [] =
{
  {CV_ACCESSORY_DECODER_ADDRESS_LSB, 1},
  {CV_ACCESSORY_DECODER_ADDRESS_MSB, 0},
};

uint8_t FactoryDefaultCVIndex = 0;

void notifyCVResetFactoryDefault()
{
  // Make FactoryDefaultCVIndex non-zero and equal to num CV's to be reset 
  // to flag to the loop() function that a reset to Factory Defaults needs to be done
  FactoryDefaultCVIndex = sizeof(FactoryDefaultCVs)/sizeof(CVPair);
};

const int DccAckPin = 3 ;


// SJ Lights Pins

const int count = 2;
uint8_t pins[count][2] = { {9, 10},{11,255} };
uint8_t states[count] = { 0,0 };
uint8_t requirements[count][2] = { {255,255}, {0, 1} };
const int ROOT_ADDRESS = 93;


// This function is called whenever a normal DCC Turnout Packet is received
void notifyDccAccTurnoutOutput( uint16_t Addr, uint8_t Direction, uint8_t OutputPower )
{
  Serial.print("Lightstate: ") ;
  Serial.print(Addr - ROOT_ADDRESS) ;
  Serial.print(',');
  Serial.println(Direction) ;
  if (Addr >= ROOT_ADDRESS && Addr <= ROOT_ADDRESS + 4) {
	  states[Addr - ROOT_ADDRESS] = Direction;
  }

}

// This function is called whenever a DCC Signal Aspect Packet is received
//void notifyDccSigState( uint16_t Addr, uint8_t OutputIndex, uint8_t State)
//{
//  Serial.print("notifyDccSigState: ") ;
//  Serial.print(Addr,DEC) ;
//  Serial.print(',');
//  Serial.print(OutputIndex,DEC) ;
//  Serial.print(',');
//  Serial.println(State, HEX) ;
//}

void setup()
{
  Serial.begin(115200);
  
  // Configure the DCC CV Programing ACK pin for an output
  pinMode( DccAckPin, OUTPUT );
  for (int i = 0; i < count; i++) {
	  for (int j = 0; j < 2; j++) {
		  uint8_t pin = pins[i][j];
		  if (pin != 255) {
			  pinMode(pin, OUTPUT);
		  }
	  }
	  
  }

  Serial.println("NMRA DCC Example 1");
  
  // Setup which External Interrupt, the Pin it's associated with that we're using and enable the Pull-Up 
  Dcc.pin(0, 2, 1);
  
  // Call the main DCC Init function to enable the DCC Receiver
  Dcc.init( MAN_ID_DIY, 10, CV29_ACCESSORY_DECODER | CV29_OUTPUT_ADDRESS_MODE, 0 );

  Serial.println("Init Done");
}

void setIfExists(int pin, uint8_t state) {
	if (pin != 255) {
		digitalWrite(pin, state);
		Serial.print(pin);
		Serial.print(", ");
		Serial.println(state);
	}
}

void setLights() {
	for (int i = 0; i < count; i++) {
		Serial.print("Set:");
		Serial.print(i);
		Serial.print(" ");
		Serial.println(states[i]);
		uint8_t reqpin = requirements[i][0];
		uint8_t reqstate = requirements[i][1];
		bool requirementsMet = true;
		if (reqpin != 255) {
			requirementsMet = states[reqpin] == reqstate;
		}
		if (states[i] == 1 && requirementsMet ) {
			
			setIfExists(pins[i][1], LOW);
			setIfExists(pins[i][0], HIGH);
		}
		else {
			setIfExists(pins[i][1], HIGH);
			setIfExists(pins[i][0], LOW);
		}
	}
}

void loop()
{
  // You MUST call the NmraDcc.process() method frequently from the Arduino loop() function for correct library operation
  Dcc.process();
  setLights();
  
  if( FactoryDefaultCVIndex && Dcc.isSetCVReady())
  {
    FactoryDefaultCVIndex--; // Decrement first as initially it is the size of the array 
    Serial.println();
    Dcc.setCV( FactoryDefaultCVs[FactoryDefaultCVIndex].CV, FactoryDefaultCVs[FactoryDefaultCVIndex].Value);
  }
}


