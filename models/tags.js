'use strict';
module.exports = (sequelize, DataTypes) => {
  var Tags = sequelize.define('Tags', {
    name: DataTypes.STRING
  }, {});
    Tags.associate = function(models) {
        Tags.belongsToMany(models.Posts,{
            through: 'PostsTags',
            foreignKey: 'postId'
        });
        // associations can be defined here
    };
  return Tags;
};
