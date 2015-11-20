#include <SPI.h>
#include <NewPing.h>
#include "RF24.h"

RF24 radio(9,10);
NewPing sonar(7, 6, 200);

uint64_t gatewayAddress = 0xF0F0F0F0D2LL;
uint64_t localAddress = 0xE7E7E7E7E8LL;

int16_t lastDistance = -1;
uint16_t interval = 0x01;

int my_putc(char c, FILE *t) {
  Serial.write(c);
}

void setup() {
  Serial.begin(115200);

  fdevopen(&my_putc, 0);

  radio.begin();
  radio.setPALevel(RF24_PA_MAX);
  
  if (radio.setDataRate(RF24_1MBPS)) {
    Serial.println("Data rate set");
  } else {
    Serial.println("Failed to set data rate");
  }

  radio.setChannel(0x4c);
  radio.setCRCLength(RF24_CRC_16);
  radio.printDetails();
  radio.setAutoAck(true);
  radio.enableDynamicPayloads();
  //radio.setPayloadSize(PACKET_SIZE);

  assignRandomLocalAddress();
  
  radio.openWritingPipe(gatewayAddress);
  radio.openReadingPipe(1, localAddress);
  
  radio.startListening();

  sendJoinRequest();
}

void assignRandomLocalAddress() {
  randomSeed(analogRead(0));
  
  localAddress =  ((uint64_t)random(128, 255) << 32)
                      | ((uint64_t)random(128, 255) << 24)
                      | ((uint64_t)random(128, 255) << 16)
                      | ((uint64_t)random(128, 255) << 8)
                      | ((uint64_t)random(128, 255));
}

void sendSensorData() {
  uint16_t distance = sonar.ping() / US_ROUNDTRIP_CM;
  Serial.print("Ping: ");
  Serial.println(distance);

  if (distance == lastDistance) {
    Serial.println("Distance did not change. Skipping sending part.");
    return;
  }

  lastDistance = distance;

  radio.stopListening();
    
  uint8_t data_packet[] = {
    0x01,
    (distance >> 8) & 0xFF,
    distance & 0xFF,
    (localAddress >> 32) & 0xFF,
    (localAddress >> 24) & 0xFF,
    (localAddress >> 16) & 0xFF,
    (localAddress >> 8) & 0xFF,
    localAddress & 0xFF
  };
  
  if (!radio.write(data_packet, sizeof(data_packet))) {
    Serial.println(F("Sending failed."));
  }
  
  radio.startListening();
}

void sendJoinRequest() {
  if (radio.testRPD()) {
    Serial.println(F("Carrier detected. Someone is using the line."));
  } else {
    Serial.println(F("Line clear. Now sending..."));
    
    radio.stopListening();
    
    uint8_t join_packet[] = {
      0x00,
      (localAddress >> 32) & 0xFF,
      (localAddress >> 24) & 0xFF,
      (localAddress >> 16) & 0xFF,
      (localAddress >> 8) & 0xFF,
      localAddress & 0xFF
    };
    
    if (!radio.write(join_packet, sizeof(join_packet))) {
      Serial.println(F("Sending failed."));
    }
    
    radio.startListening();

    uint32_t started_waiting_at = micros();
    boolean timeout = false;
    
    while (!radio.available()) {
      if (micros() - started_waiting_at > 1000000) {
        timeout = true;
        break;
      }
    }
    
    if (timeout) {
      Serial.println(F("Failed to get response in time."));
    } else {
      uint8_t receive_buf[2];
      radio.read(&receive_buf, sizeof(receive_buf));

      interval = (receive_buf[0] << 8)
                 | receive_buf[1];

      Serial.print(F("Got a response. Interval: "));
      Serial.print(interval);
      Serial.println(F("."));

//      radio.closeReadingPipe(1);
//      radio.openReadingPipe(1, localAddress);
    }
  }
}

void loop() {
  //while (Serial.read() == -1);
  
  sendSensorData();
  delay(interval * 100);
}
