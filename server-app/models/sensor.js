"use strict";

module.exports = function(sequelize, DataTypes) {
  var Sensor = sequelize.define("Sensor", {
    nodeId: DataTypes.STRING,
    pipeAddress: DataTypes.STRING,
    pollInterval: DataTypes.INTEGER,
    lastValue: DataTypes.INTEGER,
    lastTransmission: DataTypes.INTEGER
  });

  return Sensor;
};
