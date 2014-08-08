function Post(sequelize, DataTypes){
  return sequelize.define('post', {
    name: DataTypes.STRING,
    text: DataTypes.TEXT
  });
};


module.exports = Post;