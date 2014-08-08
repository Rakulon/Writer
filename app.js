console.log("server begin");
var express = require("express"),
db = require("./models/index.js"),
 bodyParser = require("body-parser"),
  passport = require("passport"),
  passportLocal = require("passport-local"),
  cookieParser = require("cookie-parser"),
  cookieSession = require("cookie-session"),
  flash = require('connect-flash'),
  Flickr = require("flickrapi"),
  app = express();

    flickrOptions = {
      api_key: process.env.FLICKR_API_KEY,
      secret: process.env.FLICKR_API_SECRET_KEY,
    };



app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: false}) );



app.use(cookieSession( {
  secret: 'thisismysecretkey',
  name: 'session with cookie data',
  // this is in milliseconds
  maxage: 360000
  })
);

passport.use(new passportLocal.Strategy({
      usernameField: 'name',
      passwordField: 'password',
      passReqToCallback : true
    },

    function(req, name, password, done) {
      // find a user in the DB
      db.author.find({
          where: {
            name: name
          }
        })
        // when that's done, 
        .done(function(error, author){
          if(error){
            console.log(error);
            return done (err, req.flash('loginMessage', 'Oops! Something went wrong.'));
          }
          if (author === null){
            return done (null, false, req.flash('loginMessage', 'Author name does not exist.'));
          }
          if ((db.author.comparePass(password, author.password)) !== true){
            return done (null, false, req.flash('loginMessage', 'Invalid Password'));
          }
          done(null, author); 
        });
    }));


passport.serializeUser(function(author, done){
  console.log("SERIALIZED JUST RAN!");
  done(null, author.id);
});

passport.deserializeUser(function(id, done){
  console.log("DESERIALIZED JUST RAN!");
  db.author.find({
      where: {
        id: id
      }
    })
    .done(function(error,author){ 
      done(error, author);
    });
});

// get passport started
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());



app.get('/', function(req,res){
  // check if the author is logged in
  if(!req.author) {
    res.render("index");
  }
  else{
    res.redirect('/home');
  }
});

app.get('/signup', function(req,res){
  if(!req.author) {
    res.render("signup", {name: ""});
  }
  else{
    res.redirect('/home');
  }
});

app.get('/login', function(req,res){
  // check if the author is logged in
  if(!req.author) {
    res.render("login", {message: req.flash('loginMessage'), name: ""});
  }
  else{
    res.redirect('/home');
  }
});

app.get('/home', function(req,res){
  res.render("home", {
  //runs a function to see if the author is authenticated - returns true or false
  isAuthenticated: req.isAuthenticated(),
  //this is our data from the DB which we get from deserializing
  author: req.user
  });
});

// on submit, create a new authors using form values
app.post('/submit', function(req,res){  
  
  db.author.createNewAuthor(req.body.name, req.body.password, 
  function(err){
    res.render("signup", {message: err.message, name: req.body.name});
  }, 
  function(success){
    res.render("index", {message: success.message});
  });
});

app.post('/createpost', function(req,res){ 
	db.post.create({name: req.body.title, text: req.body.content, authorId: req.user.dataValues.id}).success(function(post) {
  		res.redirect('/post/' + post.dataValues.id);
	});
}); 
  

// authenticate authors when logging in - no need for req,res passport does this for us
app.post('/login', passport.authenticate('local', {
  successRedirect: '/home', 
  failureRedirect: '/login', 
  failureFlash: true
}));

app.get('/logout', function(req,res){
  //req.logout added by passport - delete the author id/session
  req.logout();
  res.redirect('/');
});

app.get("/post/:id", function(req, res) {
	db.post.find(req.params.id).success(function(post){
		Flickr.tokenOnly(flickrOptions, function(error, flickr) {
			flickr.photos.search({text: post.name, per_page: 5},
	  			function(err, result) {
	  				if(err) { throw new Error(err); }
	  				console.log(result.photos.photo[0]);
	  // do something with result
					res.render("post", {title: post.name, content: post.text, images: result.photos.photo})
			})
  // we can now use "flickr" as our API object,
  // but we can only call public methods and access public data
		});  
	})
});

// catch-all for 404 errors 
app.get('*', function(req,res){
  res.status(404);
  res.render('404');
});

// <link rel="stylesheet" href="http://netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">
// 	<link rel="stylesheet" href="http://netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap-theme.min.css">


// app.get("/:id", function(req, res) {
// 	db.author.find(req.params.id).success(function(author){
// 		db.post.findAll({ where: {authorId: author.id} }).success(function(posts) {
// 			res.render("index", {author: author, posts: posts})
// 		})
// 	})
// })

app.listen(3000, function(){
	console.log("server listening on port 3000")
})


