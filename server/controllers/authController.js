// server/controllers/authController.js
const bcrypt = require('bcrypt');
const { db } = require('../models/db');
const logger = require('../utils/logger'); // Importa o logger

exports.login = async (req, res) => {
  const { email, password } = req.body;

  logger.info(`Tentativa de login para o email: ${email}`); // Log de início da operação

  try {
    // Validação de entrada
    if (!email || !password) {
        logger.warn(`Login falhou: Email ou senha ausentes para ${email}`); // Log de validação
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    // Verifica restaurante
    let user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM restaurants WHERE email = ?',
        [email],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });

    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        res.cookie('restaurantId', user.id, {
          httpOnly: true,
          sameSite: 'Lax',
          maxAge: 24 * 60 * 60 * 1000
        });
        logger.info(`Login de restaurante bem-sucedido para: ${email} (ID: ${user.id})`); // Log de sucesso
        return res
          .status(200)
          .json({
            message: 'Login realizado com sucesso!',
            userType: 'restaurant',
            redirect: '/dashboard.html'
          });
      }
    }

    // Verifica cliente
    user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM clients WHERE email = ?',
        [email],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });

    if (user) {
      const match = await bcrypt.compare(password, user.senha);
      if (match) {
        res.cookie('clientId', user.id, {
          httpOnly: true,
          sameSite: 'Lax',
          maxAge: 24 * 60 * 60 * 1000
        });
        logger.info(`Login de cliente bem-sucedido para: ${email} (ID: ${user.id})`); // Log de sucesso
        return res
          .status(200)
          .json({
            message: 'Login realizado com sucesso!',
            userType: 'client',
            redirect: '/client_dashboard.html'
          });
      }
    }

    logger.warn(`Tentativa de login falhou: Email ou senha incorretos para ${email}`); // Log de aviso
    return res
      .status(401)
      .json({ error: 'Email ou senha incorretos.' });
  } catch (error) {
    logger.error(`Erro no processo de login para ${email}: ${error.message}`, { stack: error.stack }); // Log de erro detalhado
    res
      .status(500)
      .json({ error: 'Erro interno no servidor.' });
  }
};

exports.logout = (req, res) => {
  const clientId = req.cookies.clientId;
  const restaurantId = req.cookies.restaurantId;

  res.clearCookie('clientId');
  res.clearCookie('restaurantId');

  if (clientId) {
      logger.info(`Logout realizado para cliente com ID: ${clientId}`); // Log de sucesso
  } else if (restaurantId) {
      logger.info(`Logout realizado para restaurante com ID: ${restaurantId}`); // Log de sucesso
  } else {
      logger.info('Logout realizado para usuário desconhecido (nenhum cookie de ID encontrado).'); // Log de sucesso
  }

  res.status(200).json({ message: 'Logout realizado com sucesso!' });
};