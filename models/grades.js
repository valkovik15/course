'use strict';
module.exports = (sequelize, DataTypes) => {
  var Grades = sequelize.define('Grades', {
    num: DataTypes.INTEGER
  }, {});
  Grades.associate = function(models) {
    Grades.belongsTo(models.user);
    Grades.belongsTo(models.Posts);


    // associations can be defined here
  };
  return Grades;
};
