const connectToDatabase = require('../config/db');

const getMovies = async () => {
    console.log('[MoviesModel] Buscando filmes no banco de dados');
    const db = await connectToDatabase();

    const movies = await db.collection('movies').find({}).toArray();

    return movies;
}

const getMovieById = async (id) => {
    console.log(`[MoviesModel] Buscando filme com ID: ${id} no banco de dados`);
    const db = await connectToDatabase();

    const movie = await db.collection('movies').findOne({ _id: id });

    return movie;
}

const postMovie = async (movieData) => {
    console.log('[MoviesModel] Adicionando novo filme ao banco de dados:', movieData);
    const db = await connectToDatabase();

    const result = await db.collection('movies').insertOne(movieData);

    return result.ops[0];
}

module.exports = {
    getMovies,
    getMovieById,
    postMovie
};