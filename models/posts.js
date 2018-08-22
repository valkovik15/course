'use strict';

module.exports = (sequelize, DataTypes) => {
  var Posts = sequelize.define('Posts', {
    title: DataTypes.STRING,
    body: DataTypes.TEXT,
      description: DataTypes.STRING,
      topic: DataTypes.STRING,
      pic: DataTypes.STRING
  }, {charset: 'utf8',
      collate: 'utf8_general_ci'});
    Posts.associate = function(models) {
        Posts.belongsToMany(models.Tags,{
        through: 'PostsTags',
            foreignKey: 'tagId'
    });
        Posts.belongsTo(models.user);
        Posts.hasMany(models.Grades);
        Posts.hasMany(models.Likes);
        Posts.hasMany(models.Comments);
        // associations can be defined here
    };


      // associations can be defined her
  return Posts;
};
