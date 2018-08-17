'use strict';
module.exports = (sequelize, DataTypes) => {
  var Comments = sequelize.define('Comments', {
    text: DataTypes.STRING
  }, {charset: 'utf8',
        collate: 'utf8_general_ci'});
  Comments.associate = function(models) {
    Comments.belongsTo(models.user);
      Comments.belongsTo(models.Posts);
      Comments.hasMany(models.Likes);
    // associations can be defined here
  };
  return Comments;
};
