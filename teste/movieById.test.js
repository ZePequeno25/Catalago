const request = require('supertest');
const { MongoClient, ObjectId } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('Testes da Rota /api/filmes/:id', () => {
  let mongoServer;
  let connection;
  let db;
  let server;
  let app;
  let insertedMovieId;

  beforeAll(async () => {
    try {
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      
      process.env.mongoURI = mongoUri;
      console.log('✅ MongoDB em memória iniciado');

      connection = await MongoClient.connect(mongoUri);
      db = connection.db("dsw");

      app = require('../src/config/app');
      server = app.listen(4002);
      console.log('✅ Servidor iniciado na porta 4002');
    } catch (error) {
      console.error('❌ Erro no beforeAll:', error);
      throw error;
    }
  }, 30000); // Aumenta o timeout para 30 segundos

  afterAll(async () => {
    console.log('🧹 Limpando recursos...');
    
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    if (connection) {
      await connection.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
    
    delete require.cache[require.resolve('../src/config/app')];
    console.log('✅ Cleanup completo');
  });

  beforeEach(async () => {
    if (db) {
      // Limpa a coleção e insere apenas UM filme para teste
      await db.collection('movies').deleteMany({});
      
      const result = await db.collection('movies').insertOne({
        title: 'Filme Teste Individual',
        director: 'Diretor Teste', 
        year: 2023,
        genre: ['Ação', 'Aventura'],
        rating: 8.5
      });
      
      insertedMovieId = result.insertedId.toString();
      console.log(`🎬 Filme de teste inserido com ID: ${insertedMovieId}`);
    }
  });

  test('DEVE retornar um filme individual quando o ID existe', async () => {
    const response = await request(app)
      .get(`/api/filmes/${insertedMovieId}`)
      .expect(200);

    expect(response.body).toEqual({
      status: 'success',
      data: {
        _id: insertedMovieId,
        title: 'Filme Teste Individual',
        director: 'Diretor Teste',
        year: 2023,
        genre: ['Ação', 'Aventura'],
        rating: 8.5
      }
    });
  });

  test('DEVE retornar 404 quando o filme não existe', async () => {
    const nonExistentId = new ObjectId().toString(); // Gera um ID que não existe
    
    const response = await request(app)
      .get(`/api/filmes/${nonExistentId}`)
      .expect(404);

    expect(response.body).toEqual({
      status: 'error',
      message: 'Filme não encontrado.'
    });
  });
});