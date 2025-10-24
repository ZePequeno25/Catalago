const MoviesModel = require('../models/moviesModel');

const getMovies = async (req, res) =>{
    //controla busca e retorna os dados
    console.log('[MovieController]');
    try{

        const movies = await MoviesModel.getMovies();
        res.status(200).json({
            status: 'sucess',
            data: movies
        });

        


    }catch (error) {
        console.error('Erro ao buscar filmes:', error);
        res.status(500).json({
            status: 'error',
            message: 'Ocorreu um erro ao buscar os filmes'
        });
    }
}

const getMovieById = async (req, res) => {
    const movieId = req.params.id;
    console.log(`[MoviesController] Buscando filme com ID: ${movieId}`);
    try{
        const movie = await MoviesModel.getMovieById(movieId);
        if(movie){
            res.status(200).json({
                status: 'success',
                data: movie
            });
        }else{
            res.status(404).json({
                status: 'error',
                message: 'Filme não encontrado'
            });
        }

    }catch (error) {
        console.error('Erro ao buscar filme por ID:', error);
        res.status(500).json({
            status: 'error',
            message: 'Ocorreu um erro ao buscar o filme'
        });
    }
}

const postMovie = async (req, res) => {
    const movieData = req.body;
    console.log('[MoviesController] Adicionando novo filme:', movieData);
    try{
        const newMovie = await MoviesModel.postMovie(movieData);
        if(!newMovie){
            return res.status(400).json({
                status: 'error',
                message: 'Dados do filme inválidos'
            });
        }
        res.status(201).json({
            status: 'success',
            data: newMovie
        });

    }catch (error) {
        console.error('Erro ao adicionar novo filme:', error);
        res.status(500).json({
            status: 'error',
            message: 'Ocorreu um erro ao adicionar o filme'
        });
    }
}

module.exports = {
    getMovies,
    getMovieById,
    postMovie
};