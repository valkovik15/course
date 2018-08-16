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
    }, {charset: 'utf8',
        collate: 'utf8_general_ci'});
    User.associate = function(models) {
        User.hasMany(models.Posts);
        User.hasMany(models.Grades);
        User.hasMany(models.Likes);
        // associations can be defined here
    };
    return User;
};
