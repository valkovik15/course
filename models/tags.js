'use strict';
module.exports = (sequelize, DataTypes) => {
  var Tags = sequelize.define('Tags', {
    name: DataTypes.STRING
  }, {charset: 'utf8',
      collate: 'utf8_general_ci'});
    Tags.associate = function(models) {
        Tags.belongsToMany(models.Posts,{
            through: 'PostsTags',
            foreignKey: 'postId'
        });
        // associations can be defined here
    };
  return Tags;
};
