'use strict';

module.exports = (sequelize, DataTypes) => {
  var Posts = sequelize.define('Posts', {
    title: DataTypes.STRING,
    body: DataTypes.TEXT
  }, {charset: 'utf8',
      collate: 'utf8_general_ci'});
    Posts.associate = function(models) {
        Posts.belongsToMany(models.Tags,{
        through: 'PostsTags',
            foreignKey: 'tagId'
    });
        Posts.belongsTo(models.user);
        // associations can be defined here
    };


      // associations can be defined her
  return Posts;
};
