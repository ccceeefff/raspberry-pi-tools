void setup() {
  // put your setup code here, to run once:
  pinMode(5, OUTPUT);
}

void loop() {
  // put your main code here, to run repeatedly:
  digitalWrite(5, true);
  delay(10);

  
  digitalWrite(5, false);   
  delay(10);

}
