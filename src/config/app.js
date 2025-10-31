const express = require('express');
const app = express();
const moviesRoutes = require('../routes/routes');

// Parse incoming request bodies before registering routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register routes after body parsing middleware
app.use('/', moviesRoutes);

module.exports = app;