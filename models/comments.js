'use strict';
module.exports = (sequelize, DataTypes) => {
  var Comments = sequelize.define('Comments', {
    text: DataTypes.STRING
  }, {charset: 'utf8',
        collate: 'utf8_general_ci',indexes: [
          // add a FULLTEXT index
          { type: 'FULLTEXT', name: 'com_idx', fields: ['text'] }
      ]});
  Comments.associate = function(models) {
    Comments.belongsTo(models.user);
      Comments.belongsTo(models.Posts);
      Comments.hasMany(models.Likes);
    // associations can be defined here
  };
  return Comments;
};
