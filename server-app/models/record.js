module.exports = function(sequelize, DataTypes) {
  var Record = sequelize.define('Record', {
    address: DataTypes.STRING,
    value: DataTypes.INTEGER,
    submitted: DataTypes.INTEGER,
  });

  return Record;
};
