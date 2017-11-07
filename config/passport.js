// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;//Oauth


// load up the user model
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('./database');
var cookieParser = require('cookie-parser');
var connection = mysql.createConnection(dbconfig.connection);

//var User       = require('../app/models/user'); //Oauth

// load the auth variables
var configAuth = require('./auth');

connection.query('USE ' + dbconfig.database);
// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
            done(null, user.idlogin);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        connection.query("SELECT * FROM login WHERE idlogin = ? ",[id], function(err, rows){
            done(err, rows[0]);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-signup',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            connection.query("SELECT * FROM login WHERE username = ?",[username], function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                } else if(password == req.body.password2){
                    // if there is no user with that username
                    // create the user
                    var newUserMysql = new Object();
                        newUserMysql.username = username;
                        newUserMysql.password = bcrypt.hashSync(password, null, null);  // use the generateHash function in our user model
                        
                        console.log("Connected!");
                        var insertQuery = "INSERT INTO login ( username, password ) values (?,?)";
                        connection.query(insertQuery,[newUserMysql.username, newUserMysql.password],function(err, rows) {
                        if (err) throw err;
                        console.log("1 record inserted to login");
                        newUserMysql.idlogin = rows.insertId;
						
							var insertQuery = "INSERT INTO employee ( fname, lname, login_idlogin, username ) values (?,?,?,?)";
							connection.query(insertQuery,[req.body.fname, req.body.lname, newUserMysql.idlogin,newUserMysql.username],function(err, rows) {
								if (err) throw err;
								console.log("1 record inserted employee");
							});
							
                        console.log(req.body.fname);
                        return done(null, newUserMysql);



                    });
                }else{return done(null, false, req.flash('signupMessage', 'Passwords not matched.'));}
            });
        })
    );

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) { // callback with email and password from our form
            connection.query("SELECT * FROM login WHERE username = ?",[username], function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
                }

                // if the user is found but the password is wrong
                if (!bcrypt.compareSync(password, rows[0].password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                console.log("user found");
                // all is well, return successful user
                return done(null, rows[0]);
            });
        })
    );






    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,

    },
    function(token, refreshToken, profile, done) {

        // make the code asynchronous
        process.nextTick(function() {

            // try to find the user based on their email
            connection.query("SELECT * FROM login WHERE username = ?",[profile.emails[0].value], function(err, user){
                
				if (err)
					return done(err);

                if (user) {

                    return done(null, user[0]);

                } else {
                    
					return done(null, false, req.flash('loginMessage', 'You are not authorized. Please signup first')); 
					
                }
            });
        });

    }));

};
