/* global db */
'use strict';
const createError = require('http-errors');
const express = require('express');
const {body, validationResult} = require('express-validator');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const compression = require('compression');
const cors = require('cors');
const http = require('http');

global.db = require('../database/mysql');

const indexRouter = require('../routes/index');
const coursesRouter = require('../routes/courses');

const app = express();

// View engine setup
app.set('views', path.join(__dirname, '../resources/views'));
app.set('view engine', 'twig');

app.use(logger('dev'));
app.use(express.json());

const helmet = require('helmet');
app.use(helmet({
	contentSecurityPolicy: false,
	crossOriginEmbedderPolicy: false,
}));

app.use(compression());

app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));
app.use(cors());

app.use(async (req, res, next) => {
	// Look for an authorization header or auth_token in the cookies
	const token = req.cookies.auth_token || req.headers.authorization;

	// If a token is found we will try to find it's associated user
	// If there is one, we attach it to the req object so any
	// following middleware or routing logic will have access to
	// the authenticated user.
	if (token) {
		// Look for an auth token that matches the cookie or header
		const authToken = await db.AuthToken.findOne(
			{where: {token}, include: db.User},
		);

		// If there is an auth token found, we attach it's associated
		// user to the req object so we can use it in our routes
		if (authToken) {
			req.user = authToken.User;
			res.locals.auth = true;
		}
	}

	next();
});

// Routes
app.use('/', indexRouter);
app.use('/courses', coursesRouter);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
	next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
	// Set locals, only providing error in development
	const error = req.app.get('env') === 'development' ? err : {};
	const status = {
		number: err.status || 500,
		text: err.statusText || 'Internal Server Error',
	};
	// Render the error page
	res.status(status.number);
	res.render('error', {message: err.message, status, error});
});

module.exports = app;
