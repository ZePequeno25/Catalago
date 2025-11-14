const { ObjectId } = require('mongodb');
const connectToDatabase = require('../config/db');

const getUsers = async () => {
  const db = await connectToDatabase();
  return await db.collection('users').find().toArray();
};

const addUser = async (data) => {
  const db = await connectToDatabase();
  const result = await db.collection('users').insertOne(data);

  // Busca o usuário recém-criado para devolver completo
  const insertedUser = await db
    .collection('users')
    .findOne({ _id: result.insertedId });

  return insertedUser;
};

const findByEmail = async (email) => {
  const db = await connectToDatabase();
  return await db.collection('users').findOne({ email: email });
};

module.exports = {
  getUsers,
  addUser,
  findByEmail,
};