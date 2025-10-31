const express = require('express');
const router = express.Router();

const MoviesController = require('../controllers/moviesController');

router.get('/api/filmes', MoviesController.getMovies);
router.get('/api/filmes/:id', MoviesController.getMovieById);
router.post('/api/filmes', MoviesController.postMovie);
router.post('/api/filmes/date', MoviesController.getMoviesByDate);

module.exports = router;