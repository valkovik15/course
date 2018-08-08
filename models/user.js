'use strict';
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('user', {
      id: {
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER
      },
    name: DataTypes.STRING,
    email: {type:DataTypes.STRING,
        validate: {
            isEmail: true
        }
  },
    password: {type:DataTypes.STRING,
        allowNull: false
  },
    pic: DataTypes.STRING
  }, {});
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};