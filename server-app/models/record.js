"use strict";

module.exports = function(sequelize, DataTypes) {
  var Record = sequelize.define("Record", {
    nodeId: DataTypes.STRING,
    value: DataTypes.INTEGER,
    timestamp: DataTypes.INTEGER,
    submitted: DataTypes.INTEGER,
  });

  return Record;
};
