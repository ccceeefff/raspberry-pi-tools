module.exports = function(sequelize, DataTypes) {
  var Setting = sequelize.define('Setting', {
  	name: DataTypes.STRING,
  	cloud_server_address: DataTypes.STRING,
  	cloud_server_port: DataTypes.INTEGER,
  	poll_interval: DataTypes.INTEGER,
  	submission_interval: DataTypes.INTEGER,
  	locLat: DataTypes.FLOAT,
  	locLong: DataTypes.FLOAT
  });

  return Setting;
};
