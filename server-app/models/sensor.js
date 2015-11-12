module.exports = function(sequelize, DataTypes) {
  var Sensor = sequelize.define('Sensor', {
    address: DataTypes.STRING,
    pollInterval: DataTypes.INTEGER,
    lastValue: DataTypes.INTEGER,
    lastTransmission: DataTypes.INTEGER
  });

  return Sensor;
};
