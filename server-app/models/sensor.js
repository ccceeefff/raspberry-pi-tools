"use strict";

module.exports = function(sequelize, DataTypes) {
  var Sensor = sequelize.define("Sensor", {
    nodeId: DataTypes.STRING,
    pollInterval: DataTypes.INTEGER,
    lastValue: DataTypes.INTEGER
  });

  return Sensor;
};
