const connectToDatabase = require('../config/db');
//const { ObjectId } = require('mongodb');

const getMovies = async () => {
    console.log('[MoviesModel] Buscando filmes no banco de dados');
    const db = await connectToDatabase();

    const movies = await db.collection('movies').find({}).toArray();

    return movies;
}

/**
 * pega o filme pelo id
*/
const getMovieById = async (id) => {
    console.log(`[MoviesModel] Buscando filme com ID: ${id} no banco de dados`);
    const db = await connectToDatabase();

    //id = new ObjectId(id);

    const movie = await db.collection('movies').findOne({ _id: id });

    console.log('[MoviesModel] Filme encontrado:', movie);

    return movie;
}

const postMovie = async (movieData) => {
    console.log('[MoviesModel] Adicionando novo filme ao banco de dados:', movieData);

    const db = await connectToDatabase();

    const result = await db.collection('movies').insertOne(movieData);
    
    // Retorna o documento inserido com seu ID
    return { ...movieData, _id: result.insertedId };
}

const getMoviesByDate = async (dateString) => {
    console.log(`[MoviesModel] Buscando filmes com data: ${dateString}`);
    const db = await connectToDatabase();

    // Assumindo que created_at é string no formato 'YYYY-MM-DD'
    const movies = await db.collection('movies')
        .find({ created_at: dateString })
        .toArray();

    return movies;
};

module.exports = {
    getMovies,
    getMovieById,
    postMovie,
    getMoviesByDate
};