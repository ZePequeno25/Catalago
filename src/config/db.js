const dotenv = require('dotenv');
const {MongoClient} = require('mongodb');
const path = require('path');

dotenv.config({path: path.join(__dirname, '..','..', '.env')});
console.log('Variável de ambiente mongoURI:', process.env.mongoURI);

const client = new MongoClient(process.env.mongoURI);

let conn = null;

async function connectToDatabase() {
    if(conn){
        return conn;
    }
    try{

        await client.connect();
        console.log('Conectado ao banco de dados MongoDB');

        conn = client.db('CMPDWE2');

        return conn;
        
    }catch (error) {

        console.error('Não foi Possivel se conectar ao banco de dados:', error);    
        throw error;
    }
   
}

module.exports = connectToDatabase;