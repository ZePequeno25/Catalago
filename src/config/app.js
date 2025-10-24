const express = require('express');
const app = express();
const moviesRoutes = require('../routes/routes');

app.use('/', moviesRoutes);

app.use(express.json());

module.exports = app;