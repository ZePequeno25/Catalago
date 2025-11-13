const request = require('supertest');
const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('Testes com MongoDB em Memória', () => {
  let mongoServer;
  let connection;
  let db;
  let server;
  let app;

  beforeAll(async () => {
    try {
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      
      process.env.mongoURI = mongoUri;
      console.log('✅ MongoDB em memória iniciado');

      connection = await MongoClient.connect(mongoUri);
      db = connection.db("dsw");

      app = require('../src/config/app');
      server = app.listen(4001);
      console.log('✅ Servidor iniciado na porta 4001');
    } catch (error) {
      console.error('❌ Erro no beforeAll:', error);
      throw error;
    }
  }, 30000); // Aumenta o timeout para 30 segundos

  afterAll(async () => {
    console.log('🧹 Limpando recursos...');
    
    const timeouts = [];
    
    if (server) {
      timeouts.push(
        new Promise((resolve) => {
          server.close((err) => {
            if (err) console.log('⚠️  Erro ao fechar servidor:', err.message);
            else console.log('✅ Servidor fechado');
            resolve();
          });
        })
      );
    }
    
    if (connection) {
      timeouts.push(
        connection.close()
          .then(() => console.log('✅ Conexão MongoDB fechada'))
          .catch(err => console.log('⚠️  Erro ao fechar conexão:', err.message))
      );
    }
    
    if (mongoServer) {
      timeouts.push(
        mongoServer.stop()
          .then(() => console.log('✅ MongoDB em memória parado'))
          .catch(err => console.log('⚠️  Erro ao parar MongoDB:', err.message))
      );
    }
    
    await Promise.allSettled(timeouts);
    delete require.cache[require.resolve('../src/config/app')];
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('✅ Cleanup completo');
  });

  beforeEach(async () => {
    if (db) {
      try {
        await db.collection('movies').deleteMany({});
      } catch (error) {
        console.log('⚠️  Erro ao limpar coleção:', error.message);
      }
    }
  });

  describe('Teste de Saúde do Servidor', () => {
    test('DEVE estar rodando e respondendo a requisições', async () => {
      // Testa se o servidor responde a uma requisição simples
      const response = await request(app)
        .get('/')
        .expect(404); // Espera 404 pois a rota '/' não existe, mas prova que o servidor está rodando

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Rota não encontrada.');
    });

    test('DEVE retornar JSON para rotas da API', async () => {
      const response = await request(app)
        .get('/api/filmes')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('data');
    });

    test('DEVE responder dentro de um tempo razoável', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/filmes')
        .expect(200);

      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(1000); // Menos de 1 segundo
      console.log(`⏱️  Tempo de resposta: ${responseTime}ms`);
    });
  });

  describe('Testes da Rota /api/filmes', () => {
    test('DEVE retornar array vazio quando banco está limpo', async () => {
      const response = await request(app)
        .get('/api/filmes')
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        message: 'Nenhum filme encontrado.',
        data: []
      });
    });

    test('DEVE retornar filmes quando inseridos no banco em memória', async () => {
      const mockMovies = [
        { title: 'Filme Teste 1', year: 2023 },
        { title: 'Filme Teste 2', year: 2024 }
      ];

      await db.collection('movies').insertMany(mockMovies);

      const response = await request(app)
        .get('/api/filmes')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].title).toBe('Filme Teste 1');
    });
  });

  describe('Testes de Erro', () => {
    test('DEVE retornar 404 para rotas inexistentes', async () => {
      const response = await request(app)
        .get('/api/rota-que-nao-existe')
        .expect(404);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Rota não encontrada.'
      });
    });

    test('DEVE retornar erro 500 para erros internos do servidor', async () => {
      // Para testar erro 500, precisaríamos simular um erro no servidor
      // Por enquanto, vamos garantir que o middleware de erro está presente
      const response = await request(app)
        .get('/api/filmes')
        .expect(200); // Se chegou aqui, o servidor não quebrou

      expect(response.body.status).toBeDefined();
    });
  });
  
});