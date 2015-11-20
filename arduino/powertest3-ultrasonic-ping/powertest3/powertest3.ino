#include <NewPing.h>

NewPing sonar(7, 6, 200);

void setup() {
  // put your setup code here, to run once:
  pinMode(5, OUTPUT);
}

void loop() {
  digitalWrite(5, true);

  uint16_t distance = sonar.ping() / US_ROUNDTRIP_CM;
  
  digitalWrite(5, false);

  delay(10);
}
