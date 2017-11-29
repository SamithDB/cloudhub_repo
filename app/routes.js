// app/routes.js
	
	var dbconfig = require('../config/database');
	var mysql = require('mysql');
	var connection = mysql.createConnection(dbconfig.connection);
	var cookieParser = require('cookie-parser');
	const fileUpload = require('express-fileupload');
		
	connection.query('USE ' + dbconfig.database);

	var JSAlert = require("js-alert");

module.exports = function(app, passport) {


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
            successRedirect : '/home', // redirect to the secure home section
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
		
		successRedirect : '/profile', // redirect to the secure home section
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
						user : rows[0], //  pass to template

					});

        });

		
	});

	// =====================================
	// VIEW SECTION ========================
	app.post('/viewprofile', function(req, res) {

		var newview = new Object();
		newview.mail = req.body.searchmail;

		connection.query("SELECT * FROM employee WHERE employee.username = ?",[newview.mail], function(err, view) {
                    if (err){
                         console.log(err);
                         
                         
                     }else{

	                    connection.query("SELECT * FROM employee WHERE login_idlogin = ?",[req.user.idlogin], function(err1, rows) {
	                    if (err1)
	                         console.log(err1);

	                     	if(view.length!=0){
	                     		res.render('profileview.ejs', {
								user : rows[0], //  pass to template
								view : view[0]
								});
	                     	}else{
	                     		res.render('profile.ejs', {
								user : rows[0], //  pass to template
								message: "flash"
								});
	                     	}
	                     	
	                     	


                    });
	                }
                    
        });

		
	});

	// =====================================
	// =====================================
	// EDIT USER POST ACTION

	app.post('/updating', function(req, res, next) {

		
			connection.query('UPDATE employee SET fname = ?, lname = ?, EPF = ?, nic = ?, birthday = ?, address= ?, contact = ?, designation = ?, description = ?  WHERE login_idlogin = ?',[req.body.fname2, req.body.lname2, req.body.epf2, req.body.nic2, req.body.birthday2, req.body.address2, req.body.contact2, req.body.designation2, req.body.description2, req.user.idlogin], function(err, result) {
				if (err) {
					console.log(err);
					res.redirect('/profile');
					
				} else {
					console.log('Data updated successfully!');
					res.redirect('/profile'); 
					
				}
			})
		

	});


	// =====================================
	// =====================================
	// UPLOAD PROFILE PIC

	app.use(fileUpload());

	app.post('/profilepic', function(req, res) {

		  if (!req.files)
		    res.redirect('/profile'); 
		 
		  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
		  let sampleFile = req.files.sampleFile;
		 
		  // Use the mv() method to place the file somewhere on your server
		  sampleFile.mv('propics/'+req.user.idlogin+'propic.jpg', function(err) {
		    if (err){
		      return res.status(500).send(err);
		    }else{
		    	connection.query('UPDATE employee SET image = ? WHERE login_idlogin = ?',['pics/'+req.user.idlogin+'propic.jpg', req.user.idlogin], function(err, result) {
				if (err) 
					console.log(err);

				console.log('pic uploaded!');
				res.redirect('/profile'); 

				});


		    }
		 
		    
		  });

		});



	// =====================================
	// Home SECTION =========================
	// =====================================

	app.get('/home', function(req, res) {


					connection.query("SELECT * FROM employee WHERE login_idlogin = ? ",[req.user.idlogin], function(err1, rows) {
                    if (err1)
                         console.log(err1);;

                     		var query = connection.query('SELECT * FROM posts ORDER BY idposts DESC',function(err2,post){
			        		if(err2)
			        			console.log(err2);;

			        			var query = connection.query('SELECT * FROM employee',function(err3,rowlist){
				        		if(err3)
				        			console.log(err3);; 

				        			var query = connection.query('SELECT * FROM announcements',function(err4,anns){
				        			if(err4)
				        				console.log(err4);;

				        				res.render('home.ejs', {
										employeelist : rowlist,
										user : rows[0],							//  pass to template
										data : post,
										ann : anns
									
										});

			        				});
			        			});
			        		});
                   
        			});
			});
	

	// =====================================
	// Posting news =========================
	// =====================================

	app.post('/posting', function(req, res) {

										connection.query("SELECT * FROM employee WHERE login_idlogin = ?",[req.user.idlogin], function(err, rows) {
						                if (err)
						                    console.log(err);
						                    // if there is no user with that username
						                    // create the user
						                        var newPost = new Object();
						                        newPost.when = req.body.datetime;
						                        newPost.post = req.body.postnews;
						                        newPost.type = req.body.msgtype;
						                        newPost.employee_idemployee = rows[0].idemployee;
						                        newPost.department_iddepartment = req.body.depid;
						                        newPost.url = req.body.url;
						                        
						                        console.log("Connected!");
						                        var insertQuery = "INSERT INTO posts (posts.post, posts.when, posts.type, posts.employee_idemployee,posts.department_iddepartment,posts.url) values (?,?,?,?,?,?)";
							                        connection.query(insertQuery,[ newPost.post, newPost.when,newPost.type,newPost.employee_idemployee,newPost.department_iddepartment,newPost.url],function(err, rows) {
							                        if (err){
							                        	console.log(err);;
							                        }else{
							                        	console.log("Posting Done");
							                        }

							                        
						                    });
							            res.redirect('/home'); 
						            });

			});

	// =====================================
	// G Drive SECTION =====================
	// =====================================
	app.get('/gdrive', function(req, res) {

                    res.render('gdrive.ejs', {
                    	
					});

        });



	// =====================================
	// del post news =========================
	// =====================================

	app.post('/delpost', function(req, res) {

										connection.query("DELETE FROM posts WHERE idposts = ?",[req.body.delid], function(err, rows) {
						                if (err)
						                    console.log(err);

						                console.log("Post deleted");
						                res.redirect('/home'); 
						                    
						                        
						            });

			});


	// =====================================
	// Dashboard ===========================
	// =====================================
	app.get('/dash', function(req, res) {
		

		connection.query("SELECT * FROM employee WHERE login_idlogin = ? ",[req.user.idlogin], function(err1, rows) {
                    if (err1)
                         console.log(err1);;

			        			var query = connection.query('SELECT * FROM employee',function(err3,rowlist){
				        		if(err3)
				        			console.log(err3);;

				        			var query = connection.query('SELECT * FROM login',function(err4,usrlist){
				        			if(err3)
				        				console.log(err4);;

				        				res.render('dashboard.ejs', {
										employeelist : rowlist,
										user : rows[0],		//  pass to template
										allusrs : usrlist
									
										});

			        			  	});
			        			});
                   
        	});


	});


	// =====================================
	// =====================================
	// EDIT Announcements

	app.post('/ann', function(req, res, next) {

		
			var newann = new Object();
			newann.annid = req.body.annnum;
			newann.post = req.body.postann;
			newann.when = req.body.datetime;
			newann.employee_idemployee = req.body.usr;

			var insertQuery = "UPDATE announcements SET announcements.post = ?, announcements.when = ?, announcements.employee_idemployee = ? WHERE announcements.idannouncements = ?";
			connection.query(insertQuery,[ newann.post, newann.when,newann.employee_idemployee,newann.annid],function(err, rows) {
				 if (err) {
					console.log(err);
				
					
					
				} else {
					console.log('Data updated successfully!');
					res.redirect('/home'); 
					
				}
			})
		

	});

	// =====================================
	// =====================================
	// EDIT Announcements

	app.post('/apprv', function(req, res, next) {

		
			var newusr = new Object();
			newusr.usrid = req.body.usrid;
			newusr.level = req.body.level;
			newusr.status = "B";

			var insertQuery = "UPDATE login SET login.level = ?, login.status = ? WHERE login.idlogin = ?";
			connection.query(insertQuery,[ newusr.level, newusr.status,newusr.usrid ],function(err, rows) {
				 if (err) {
					console.log(err);
				
				} else {
					console.log('Permition Granted');
					res.redirect('/home'); 
					
				}
			})
		

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
					successRedirect : '/home',
                    failureRedirect : '/signup'
					
            }));


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////Arhive
	/*			    
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

*/
	
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


