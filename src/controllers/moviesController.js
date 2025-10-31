const MoviesModel = require('../models/moviesModel');
const Joi = require('joi');

const schema = Joi.object().keys({
    _id: Joi.any(),
    name: Joi.string().required().min(1).max(50),
    director: Joi.string().required().min(1).max(50),
    link: Joi.string().required().max(150),
    created_at: Joi.string().required()
})

const getMovies = async (req, res) =>{
    //controla busca e retorna os dados
    console.log('[MovieController]');
    try{

        const movies = await MoviesModel.getMovies();
        return res.status(200).json({
            status: 'success',
            data: movies,
            code: 200
        });

    }catch (error) {
        console.error('Erro ao buscar filmes:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Ocorreu um erro ao buscar os filmes',
            code: 500
        });
    }
}

const getMovieById = async (req, res) => {
    try{
        const movieId = req.params.id;
        console.log(`[MoviesController] Buscando filme com ID: ${movieId}`);
        const movie = await MoviesModel.getMovieById(movieId);
        if(!movie){
            return res.status(404).json({
                status: 'error',
                message: 'Filme não encontrado.'
            });
        }

        return res.status(200).json(movie);

    }catch (error) {
        console.error('Erro ao buscar filme por ID:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Ocorreu um erro ao buscar o filme',
            code: 500
        });
    }
}

const postMovie = async (req, res) => {
    const movieData = req.body;
    console.log('[MoviesController] Adicionando novo filme:', req.body);
    
    const { error, value } = schema.validate(movieData);
    if(error){
        const validationMessage = `Erro de validação: campo "${error.details[0].context.key}" é obrigatorio.`;
        return res.status(400).json({
            status: 'error',
            code: 400,
            message: validationMessage
        });
    }

    try{
        const newMovie = await MoviesModel.postMovie(value);
        if(!newMovie){
            return res.status(400).json({
                status: 'error',
                message: 'Dados do filme inválidos',
                code: 400
            });
        }
        return res.status(201).json({
            status: 'success',
            data: newMovie,
            code: 201,
            message: 'Filme adicionado com sucesso'
        });

    }catch (error) {
        console.error('Erro ao adicionar novo filme:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Ocorreu um erro ao adicionar o filme',
            code: 500,
            error: error.message
        });
    }
}

const getMoviesByDate = async (req, res) => {
    
    const {date} = req.body;
    console.log(`[MoviesController] Buscando filmes pela data: ${date}`);

    const { error, value } = schema2.validate(date);
    if(error){
        const validationMessage = `Erro de validação: campo "${error.details[0].context.key}" é obrigatorio.`;
        return res.status(400).json({
            status: 'error',
            code: 400,
            message: validationMessage
        });
    }
    console.log('Data validada:', value);
    try{
        
        const movies = await MoviesModel.MoviesByDate(value);

        if(movies == null || movies.length === 0){
            return res.status(404).json({
                status: 'error',
                message: 'Nenhum filme encontrado para a data especificada.',
                code: 404
            });
        } else {
            return res.status(200).json(movies);
        }

    } catch (error) {
        console.error('Erro ao buscar filmes por data:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Ocorreu um erro ao buscar os filmes pela data',
            code: 500
        });
    }
}

module.exports = {
    getMovies,
    getMovieById,
    postMovie,
    getMoviesByDate
};