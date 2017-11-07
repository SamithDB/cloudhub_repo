// app/routes.js
module.exports = function(app, passport) {

	
	var dbconfig = require('../config/database');
	var mysql = require('mysql');
	var connection = mysql.createConnection(dbconfig.connection);
	var cookieParser = require('cookie-parser');
		
	connection.query('USE ' + dbconfig.database);
	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		res.render('index.ejs'); // load the index.ejs file
	});

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
            console.log("hello");

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages

	}));

	// =====================================
	// PROFILE SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res) {

		 connection.query("SELECT * FROM employee WHERE login_idlogin = ?",[req.user.idlogin], function(err, rows) {
                    if (err)
                         console.log(err);;

                    res.render('profile.ejs', {
						user : rows[0] //  pass to template
					});

        });

		
	});
	
	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

    // =====================================
    // GOOGLE ROUTES =======================
    // =====================================
    // send to google to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
            passport.authenticate('google', {
                    failureFlash : true,
					successRedirect : '/profile',
                    failureRedirect : '/signup'
					
            }));
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////Arhive
				    
					'use strict';

					const process = require('process'); // Required to mock environment variables

					// [START app]
					const format = require('util').format;
					const express = require('express');
					const Multer = require('multer');
					const bodyParser = require('body-parser');
					const Storage = require('@google-cloud/storage');
					const storage = Storage();


					// [START config]
					// Multer is required to process file uploads and make them available via
					// req.files.
					const multer = Multer({
					  storage: Multer.memoryStorage(),
					  limits: {
					    fileSize: 5 * 1024 * 1024 // no larger than 5mb, you can change as needed.
					  }
					});

					// A bucket is a container for objects (files).
					const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);
					// [END config]



				    // Employee File Archive
					app.get('/archive', function(req, res) {
						res.render('archive.ejs'); // load the index.ejs file
					});

					// [START process]
					// Process the file upload and upload to Google Cloud Storage.
					app.post('/archive', multer.single('file'), (req, res, next) => {
					  if (!req.file) {
					    res.status(400).send('No file uploaded.');
					    return;
					  }

					  // Create a new blob in the bucket and upload the file data.
					  const blob = bucket.file(req.file.originalname);
					  const blobStream = blob.createWriteStream();

					  blobStream.on('error', (err) => {
					    next(err);
					  });

					  blobStream.on('finish', () => {
					    // The public URL can be used to directly access the file via HTTP.
					    const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
					    res.status(200).send(publicUrl);
					  });

					  blobStream.end(req.file.buffer);
					});
					// [END process]


	
}

// route middleware to make sure
function isLoggedIn(req, res, next) {


	// if user is authenticated in the session, carry on
	if (req.isAuthenticated()){
		return next();
	}

	// if they aren't redirect them to the home page
	res.redirect('/');
}


