'use strict';
module.exports = (sequelize, DataTypes) => {
  var Likes = sequelize.define('Likes', {}, {});
  Likes.associate = function(models) {
      Likes.belongsTo(models.user);
      Likes.belongsTo(models.Comments);
      Likes.belongsTo(models.Posts);
    // associations can be defined here
  };
  return Likes;
};
