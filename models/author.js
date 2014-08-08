var bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(10);

function Author(sequelize, Datatype) {
	var Author = sequelize.define('author', {
		name: {
			type: Datatype.STRING,
			unique: true,
			validate: {
				len: [6, 30]
			}
		},
		password: {
			type: Datatype.STRING,
			validate: {
				notEmpty: true
			}
		}
	}, {
	classMethods: {
		encryptPass: function(password) {
			var hash = bcrypt.hashSync(password, salt)
			return hash;
		},
		comparePass: function(authorpass, dbpass) {
			return bcrypt.compareSync(authorpass,dbpass)
		},
		createNewAuthor: function(name, password, err, success) {
			if(password.length < 6) {
				err({message: "Password should be longer than 6 chars"})
			} else {
				Author.create({
					name: name,
					password: Author.encryptPass(password)
				}).error(function(error){
						
							console.log(error);
						if(error.name) {
							err({message: "name needs to be at least 6 chars" + error})
						} else {({message: "account name taken"})}
					}
				).success(function(author) {
					success({message: "Account created please log in now"})
				});
			}
		},

		
		authorize: function(name, password, err, success) {
			Author.find({
				where: {
					name: name
				}
			})
			.done(function(error,author){
				if(error) {
					console.log(error);
					err({message: "Opps somthing went wrong!"})
				}
				else if (author === null){
					err({message: "author not found"})
				}
				else if ((Author.comparePass(password, author.password)) === true) {
					success();
				}
				else {
					err({message: "Invalid password"})
				}
			})
		}
	}
});
return Author;
};
module.exports = Author;