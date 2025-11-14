const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const UsersModel = require('../models/usersModel');

const saltRounds = 10;

// Regex: mínimo 5 caracteres, pelo menos 1 número e 1 símbolo
const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*()_+={}\[\]:;"'<,>.?/|~`]).{5,}$/;

const schema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    'string.email': 'O e-mail fornecido não é válido.',
    'any.required': 'O e-mail é obrigatório.',
  }),
  password: Joi.string().min(5).required().regex(passwordRegex).messages({
    'string.min': 'A senha deve ter no mínimo 5 caracteres.',
    'any.required': 'A senha é obrigatória.',
    'string.pattern.base': 'A senha deve conter pelo menos um número e um símbolo.',
  }),
});

const authSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  password: Joi.string().min(5).required(),
});

// LISTAR USUÁRIOS
const getUsers = async (req, res) => {
  try {
    const users = await UsersModel.getUsers();
    return res.status(200).json({
      status: 'success',
      data: users.map(u => ({ ...u, password: undefined })), // nunca mostra a senha
    });
  } catch (error) {
    console.error('[getUsers Error]', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar usuários.',
    });
  }
};

// CADASTRAR USUÁRIO
const addUser = async (req, res) => {
  console.log('[addUser] Requisição recebida');

  const { error, value } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const messages = error.details.map(d => d.message);
    return res.status(400).json({
      status: 'error',
      code: 400,
      message: 'Dados inválidos',
      errors: messages,
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(value.password, saltRounds);

    const userToSave = {
      email: value.email.toLowerCase().trim(),
      password: hashedPassword,
      date: new Date(),
    };

    const addedUser = await UsersModel.addUser(userToSave);

    // Remove a senha antes de devolver
    const { password, ...userResponse } = addedUser;

    return res.status(201).json({
      status: 'success',
      code: 201,
      message: 'Usuário cadastrado com sucesso.',
      data: userResponse,
    });
  } catch (err) {
    console.error('[addUser Error]', err);
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Erro interno ao cadastrar usuário.',
      error: err.message,
    });
  }
};

// DELETAR USUÁRIO
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Validação do ID (deve ter 24 caracteres hex)
    if (!userId || !/^[0-9a-fA-F]{24}$/.test(userId)) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'ID do usuário inválido.',
      });
    }

    // IMPORTANTE: usar "new" com ObjectId
    const { ObjectId } = require('mongodb');

    // Opcional: permitir só o próprio usuário deletar (recomendado)
    if (req.user.id !== userId) {
      return res.status(403).json({
        status: 'error',
        code: 403,
        message: 'Você só pode deletar sua própria conta.',
      });
    }

    const db = await require('../config/db')();
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(userId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        status: 'error',
        code: 404,
        message: 'Usuário não encontrado.',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Usuário deletado com sucesso!',
    });

  } catch (err) {
    console.error('[deleteUser Error]', err);
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Erro ao deletar usuário.',
      error: err.message,
    });
  }
};

// LOGIN
const authUser = async (req, res) => {
  const { error, value } = authSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: 'error',
      code: 400,
      message: 'E-mail ou senha em formato inválido.',
    });
  }

  try {
    const user = await UsersModel.findByEmail(value.email.toLowerCase().trim());

    if (!user || !(await bcrypt.compare(value.password, user.password))) {
      return res.status(401).json({
        status: 'error',
        code: 401,
        message: 'E-mail ou senha incorretos.',
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password, ...userInfo } = user;

    return res.status(200).json({
      status: 'success',
      message: 'Login realizado com sucesso!',
      token,
      user: userInfo,
    });
  } catch (err) {
    console.error('[authUser Error]', err);
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Erro interno no login.',
    });
  }
};

module.exports = {
  getUsers,
  addUser,
  authUser,
  deleteUser,
};