const express = require('express');
const router = express.Router();
const Users = require('../controllers/usersController');
const Auth = require('../utils/auth');
const MoviesController = require('../controllers/moviesController');

// === ROTAS DE USUÁRIOS ===
router.post('/api/users', Users.addUser);                    // cadastro
router.post('/api/users/auth', Users.authUser);              // login
router.get('/api/users', Auth, Users.getUsers);              // listagem protegida
router.get('/api/users-all', Users.getUsers);                // listagem pública (apagar depois)
router.delete('/api/users/:id', Auth, Users.deleteUser);     // DELETAR USUÁRIO (protegido por token)

// === ROTAS DE FILMES ===
router.get('/api/filme/date', MoviesController.getMoviesByDate);
router.get('/api/filmes', MoviesController.getMovies);
router.get('/api/filmes/:id', MoviesController.getMovieById);
router.post('/api/filmes', MoviesController.postMovie);

module.exports = router;