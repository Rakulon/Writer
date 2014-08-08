var fs        = require('fs')
  , path      = require('path')
  , Sequelize = require('sequelize')
  , lodash    = require('lodash')
  , env       = process.env.NODE_ENV || 'development'
  , config    = require(__dirname + '/../config/config.json')[env]
  , sequelize = new Sequelize(config.database, config.username, config.password, config)
  , db        = {}


console.log("Index top");
fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js')
  })
  .forEach(function(file) {
    console.log(__dirname,file);
    var model = sequelize.import(path.join(__dirname, file))
    console.log(model);
    db[model.name] = model
  })
Object.keys(db).forEach(function(modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db)
  }
})


// Associations

db.author.hasMany(db.post);
db.post.belongsTo(db.author);

module.exports = lodash.extend({
  sequelize: sequelize,
  Sequelize: Sequelize
}, db)

// db.author.create({name: "William"}).success(function(author) {
//   // author.addPost(db.post.build({name: "I write the stuff"}));
// });

// working


// db.author.findOrCreate({name: "William"}).success(function(author) {
//   db.post.create({name: "I write the stuff@@@"}).success(function(post) {
//     author.addPost(post)
//   });
// });


// db.author.findOrCreate({name: "William"}).success(function(author, created) {
//   console.log(author);
//   // console.log(created);
//     a = db.post.build({name: "I write the stuff"});
//     console.log(a);
//   // author.addPost(a);
// });

// db.post.create({name: "I write the stuff"})
//   .success(function(post){
//     db.author.find({where: {name: "William"}}).success(function(author){
//       console.log(author)
//       // author.addPost(post)
//       author.setPosts([post])
//         .success(function(author){
//          console.log(author)
//       })
//     });
// });