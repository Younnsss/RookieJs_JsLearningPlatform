/* global db */
'use strict';
const express = require('express');
const fs = require('fs');
const router = express.Router();
const bcrypt = require('bcrypt');

const MailazyClient = require('mailazy-node');
let client;
if (process.env.MAIL_SECRET && process.env.MAIL_CLIENT) {
	client = new MailazyClient({accessKey: process.env.MAIL_CLIENT, accessSecret: process.env.MAIL_SECRET});
}

/* GET home page. */
router.get('/', (req, res) => {
	res.render('index', {title: 'Accueil'});
});

router.post('/contact', async (req, res) => {
	const {name, email, subject, message} = req.body;
	try {
		const html = fs.readFileSync(__dirname + '/../resources/mails/contact.html', 'utf8', (err, text) => {
			if (err) {
				console.error(err);
			}

			return text;
		});

		client.send({
			to: process.env.EMAIL_ADDRESS_CONTACT,
			from: process.env.EMAIL_ADDRESS,
			subject: 'Contact - Site PE P22',
			text: message,
			html: html.replace('{{name}}', name).replaceAll('{{email}}', email).replace('{{subject}}', subject).replace('{{message}}', message),
		});

		res.redirect('/');
	} catch (e) {
		console.log('error: ' + e);
	}
});

/* Register Route
========================================================= */
router.get('/register', (req, res) => {
	if (req.user !== undefined) {
		res.redirect('/me');
	}

	res.render('register', {title: 'Inscription'});
});

router.post('/register', async (req, res) => {
	if (req.user !== undefined) {
		res.redirect('/me');
	}

	// Hash the password provided by the user with bcrypt so that
	// we are never storing plain text passwords. This is crucial
	// for keeping your db clean of sensitive data
	const hash = bcrypt.hashSync(req.body.password, 10);

	// Create a new user with the password hash from bcrypt
	const user = await db.User.create(Object.assign(req.body, {password: hash}));
	// Data will be an object with the user and it's authToken
	const data = await user.authorize();
	// Send back the new user and auth token to the
	// client { user, authToken }

	return res.redirect('/login');
});

/* Login Route
  ========================================================= */

router.get('/login', (req, res) => {
	if (req.user !== undefined) {
		res.redirect('/me');
	}

	res.render('login', {title: 'Connexion'});
});

router.post('/login', async (req, res) => {
	if (req.user !== undefined) {
		res.redirect('/me');
	}

	const {userName, password} = req.body;

	// If the username / password is missing, we use status code 400
	// indicating a bad request was made and send back a message
	if (!userName || !password) {
		return res.status(400).send('Missing username or password');
	}

	try {
		const user = await db.User.authenticate(userName, password);

		res.cookie('auth_token', user.authToken.token, {
			maxAge: 3600 * 24 * 30,
			httpOnly: true,
		});
		return res.redirect('/me');
	} catch (err) {
		return res.render('error', {message: 'Unauthorized', status: {number: 401, text: 'Invalid Login Creditentials'}});
	}
});

/* Logout Route
  ========================================================= */
router.get('/logout', async (req, res) => {
	// Because the logout request needs to be send with
	// authorization we should have access to the user
	// on the req object, so we will try to find it and
	// call the model method logout
	const {
		user,
		cookies: {auth_token: authToken},
	} = req;

	// We only want to attempt a logout if the user is
	// present in the req object, meaning it already
	// passed the authentication middleware. There is no reason
	// the authToken should be missing at this point, check anyway
	if (user && authToken) {
		await req.user.logout(authToken);
		return res.redirect('/');
	}

	// If the user missing, the user is not logged in, hence we
	// use status code 400 indicating a bad request was made
	// and send back a message
	return res.render('error', {message: 'Already Logged Out', status: {number: 401, text: 'Bad Request'}});
});

/* Me Route - get the currently logged in user
  ========================================================= */
router.get('/me', (req, res) => {
	if (req.user) {
		return res.render('account', {user: req.user});
	}

	res.status(404).send({errors: [{message: 'missing auth token'}]});
});

router.get('/health', (req, res) => {
	res.send('OK');
});

router.get('/game', (req, res) => {
	fs.readFile(__dirname + '/../card_game/index.html', 'utf8', (err, text) => {
		res.send(text);
	});
});

module.exports = router;
