#include <SPI.h>
#include "RF24.h"

RF24 radio(9,10);

uint64_t gatewayAddress = 0xF0F0F0F0D2LL;
uint64_t localAddress = 0xE7E7E7E7E8LL;

int16_t lastDistance = -1;
uint16_t interval = 0x01;

int my_putc(char c, FILE *t) {
  Serial.write(c);
}

void setup() {
  // put your setup code here, to run once:

  Serial.begin(115200);

  fdevopen(&my_putc, 0);

  pinMode(5, OUTPUT);

radio.begin();
  radio.setPALevel(RF24_PA_MAX);
  
  if (radio.setDataRate(RF24_1MBPS)) {
    Serial.println("Data rate set");
  } else {
    Serial.println("Failed to set data rate");
  }

  radio.setChannel(0x4c);
  radio.setCRCLength(RF24_CRC_16);
  radio.setAutoAck(false);
  radio.enableDynamicPayloads();
  

  radio.openWritingPipe(gatewayAddress);
  radio.openReadingPipe(1, localAddress);

  radio.printDetails();
}

void loop() {
  digitalWrite(5, true);
  radio.startListening();
  delay(10);

  digitalWrite(5, false);
  radio.stopListening();
  delay(10);
}
