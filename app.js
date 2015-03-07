var express = require('express');
var passport = require('passport');
var passportLocal = require('passport-local');
var app = express();
var server = require('http').createServer(app);
var bodyParser =require('body-parser');
var cookieParser =require('cookie-parser');
var expressSession= require('express-session');
var ecstatic = require('ecstatic');
var io = require('socket.io')(server);
var socket = require('./socket.js');


// mongoose stuff 
var mongoose = require('mongoose');
mongoose.connect('mongodb://per:123@ds048537.mongolab.com:48537/passport');
var Schema = mongoose.Schema;
var memberSchema = new Schema({
	username: String,
	password: String,
	notes: String
});
var Member = mongoose.model('Member', memberSchema);


//socket io

io.on('connection', socket);
/*
io.on('connection', function (socket) {
	console.log('connected to socket io');
   

    socket.on('message', function (msg) {
        console.log('Message Received: ', msg);
        socket.broadcast.emit('message', msg);
    });

});
*/
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false}));
app.use(cookieParser());
app.use(expressSession({ 
	secret: process.env.SESSION_SECRET || 'secret',
	resave: false,
	saveUninitialized: false }));

app.use(passport.initialize());
app.use(passport.session());

passport.use('login', new passportLocal.Strategy( function (username, password, done){
	console.log("passport.use login triggered");
	Member.findOne({ username: username } , function(err, user){
		console.log("looking for member");
		if (err){
			console.log('error');
			return done(err);
		}
		else if ( user.password === password ) {
			console.log('done! correct password')
			done( null, {   id: username, name: username })
		} else {
			done(null, null)
		}
	});


}));

/*
app.get('mynotes', function (req,res){
	res.render
});
*/


passport.use('signup', new passportLocal.Strategy( function(username,password,done){
	
	console.log('passport use signup triggered')
	

	Member.findOne({username:username}, function(err, user){
		if (err){
			console.log('error');
			return done(err);
		} 
		if (user) {
			console.log('user already exists');
			return done(null, false);
		} else {
			var new_member = new Member();
			new_member.username = username;
			new_member.password = password;

			new_member.save( function(err){
				if (err){
					console.log('error when saving new member');
					throw error;
				}
				console.log('registration successful');
				return done(null, {  id: username, name: username });
			});

		}
	});

}));


passport.serializeUser(function(user, done){
	done(null, user.id);
});

passport.deserializeUser( function(id, done){
	// Query the database of cache here!
	done(null, {id: id, name: id});
});






app.get('/', function (req,res){
	console.log('req.user: ',req.user)
	console.log('req.body.name: ', req.body.username);

	if (req.user) {
	Member.findOne({username: req.user.name}, function(err,member){
		if (err){
			console.log('err',err);
		}

		res.render('asim', {
			member: member,
			user: req.user,
			isAuthenticated: req.isAuthenticated()
		});
	});
		} 
		else {
		res.redirect('login');
	}
});

app.post('/',  function (req,res){
	console.log("POST from / : ");
	console.log('req.user: ',req.user)

	Member.findOneAndUpdate({ username: req.user.name}, { $set :{ notes: req.body.notes }}, function(err, member){
		console.log('req.user.username: ', req.user.username)
		console.log('looking for member to update');
		console.log('member: ',member);
		res.render('asim', {
			member: member,
			user: req.user,
			isAuthenticated: req.isAuthenticated()
		});
	});
});


app.post('/notes', function (req,res){
	console.log("POST from /notes: ");
	console.log('req.user: ',req.user)


	Member.findOneAndUpdate({ username: req.user.name}, { $set :{ notes: req.body.notes }}, function(err, member){
		console.log('req.user.username: ', req.user.username)
		console.log('looking for member to update');
		console.log('member: ',member);
		res.render('notes', {
			member: member,
			user: req.user,
			isAuthenticated: req.isAuthenticated()
		});
	});
});


app.get('/notes', function (req,res){
	console.log(req.user);
	
	res.render('notes', {
		user: req.user,
		isAuthenticated: req.isAuthenticated(),
	});
});



app.get('/signup', function (req,res){
	res.render('signup');
});

app.post('/signup', passport.authenticate('signup'), function (req,res){
	res.redirect('/');
});

app.get('/login', function (req,res){
	res.render('login');
});

app.post('/login', passport.authenticate('login'), function (req, res){
	console.log("POST from /login: ");
	console.log('req.user: ',req.user)
	res.redirect('/');

});


app.get('/test', function (req,res){
	res.render('test');
});

app.get('/logout', function (req,res){
	req.logout();
	res.redirect('/');
})


var port = process.env.PORT || 3000;

server.listen(port, function(){
	console.log('listening')
});



