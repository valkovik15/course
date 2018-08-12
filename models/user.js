'use strict'
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
        password:DataTypes.STRING,
        pic: DataTypes.STRING
    }, {});
    User.associate = function(models) {
        User.hasMany(models.Posts);
        // associations can be defined here
    };
    return User;
};