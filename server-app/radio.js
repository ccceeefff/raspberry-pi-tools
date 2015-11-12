var NRF24 = require('nrf');
var buffertools = require('buffertools');
var model = require('./models');

var spiDev = '/dev/spidev0.0';
var cePin = 24;
var irqPin = 25;
var localAddress = 0xF0F0F0F0D2;
var interval = 100;

var radio = NRF24.connect(spiDev, cePin, irqPin);

function processSensorData(sensorData, remoteAddress) {
  var distance = (sensorData[0] << 8) | sensorData[1];
  console.log('Distance: ', distance);

  var remoteAddressHex = remoteAddress.toString('hex');
  console.log('Remote Address: ', remoteAddressHex);

  model.Record.create({
    address: remoteAddressHex,
    value: distance,
    submitted: 0
  }).then(function(record) {
    console.log('New record created.');
    console.log('address: ', record.address);
    console.log('value: ', record.value);
    console.log('submitted: ', record.submitted);
  });
}

function replyJoinRequest(remoteAddress) {
  console.log('Got a join request from:', remoteAddress);
  var remoteAddressHex = remoteAddress.toString('hex');

  model.Sensor.findOne({
    where: {address: remoteAddressHex}
  }).then(function(sensor) {
    console.log(sensor);

    if (!sensor) {
      console.log(!sensor);

      var tx = radio.openPipe('tx', remoteAddress);

      setTimeout(function() {
        var replyPacket = new Buffer(2);
        replyPacket[0] = (interval >> 8) & 0xFF; // Interval high byte
        replyPacket[1] = interval & 0xFF; // Interval low byte
        buffertools.reverse(replyPacket);

        console.log('Replying join request...');

        tx.write(replyPacket, function() {

          model.Sensor.create({
            address: remoteAddressHex,
            pollInterval: interval
          }).then(function(sensor) {
            console.log('New sensor created.');
            console.log('address: ', sensor.address);
            console.log('pollInterval: ', sensor.pollInterval);
          });

          tx.close();
        });
      }, 100);
    }
  });


}

function processIncomingData(data) {
  var command = data[0];

  switch (command) {
    case 0x00: // Join request
      var remoteAddress = data.slice(1);
      replyJoinRequest(remoteAddress);
      break;
    case 0x01: // Sensor data
      var sensorData = data.slice(1, 3);
      var remoteAddress = data.slice(3);
      processSensorData(sensorData, remoteAddress);
      break;
  }
}

(function() {
  radio
    .channel(0x4c)
    .transmitPower('PA_MAX')
    .dataRate('1Mbps')
    .crcBytes(2)
    .autoRetransmit({
      count: 15,
      delay: 4000
    })
    .begin(function() {
      console.log('Initializing radio...');

      var rx = radio.openPipe('rx', localAddress);

      rx.on('ready', function() {
        radio.printDetails();

        rx.on('data', function(data) {
          buffertools.reverse(data);
          console.log('Got data', data);

          processIncomingData(data);
        });
      });
    });
})();
