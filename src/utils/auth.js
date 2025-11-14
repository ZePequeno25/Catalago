const jwt = require('jsonwebtoken');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const Auth = (req, res, next) => {
  const header = req.headers['authorization'];

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      code: 401,
      message: 'Token não fornecido ou formato inválido.',
    });
  }

  const token = header.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        status: 'error',
        code: 403,
        message: 'Token inválido ou expirado.',
      });
    }
    req.user = decoded;
    next();
  });
};

module.exports = Auth;