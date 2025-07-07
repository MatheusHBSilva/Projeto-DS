// server/controllers/favoriteController.js
const { db } = require('../models/db');
const logger = require('../utils/logger'); // Importa o logger

exports.getFavoriteRestaurants = (req, res) => {
  const clientId = req.cookies.clientId;

  if (!clientId) {
      logger.warn('Tentativa de obter favoritos sem clientId.'); // Log de aviso
      return res.status(401).json({ error: 'Não autenticado.' });
  }

  logger.info(`Buscando restaurantes favoritos para cliente ID: ${clientId}`); // Log de início

  const query = `
    SELECT r.id,
           r.restaurant_name,
           COALESCE(AVG(rev.rating), 0) AS average_rating,
           COUNT(rev.rating)          AS review_count
    FROM restaurants r
    LEFT JOIN reviews rev
      ON r.id = rev.restaurant_id
    INNER JOIN favoritos f
      ON r.id = f.restaurant_id
    WHERE f.client_id = ?
    GROUP BY r.id, r.restaurant_name
  `;

  db.all(query, [clientId], (err, rows) => {
    if (err) {
      logger.error(`Erro ao buscar restaurantes favoritos para o cliente ${clientId}: ${err.message}`, { stack: err.stack }); // Log de erro
      return res.status(500).json({ error: 'Erro interno no servidor.' });
    }

    const restaurants = rows.map(row => ({
      id:              row.id,
      restaurant_name: row.restaurant_name,
      average_rating:  parseFloat(row.average_rating.toFixed(1)),
      review_count:    row.review_count
    }));

    logger.info(`Retornados ${restaurants.length} restaurantes favoritos para o cliente ${clientId}.`); // Log de sucesso
    res.json({ restaurants });
  });
};

exports.getFavoriteIds = (req, res) => {
  const clientId = req.cookies.clientId;

  if (!clientId) {
      logger.warn('Tentativa de obter IDs de favoritos sem clientId.'); // Log de aviso
      return res.status(401).json({ error: 'Não autenticado.' });
  }

  logger.info(`Buscando IDs de restaurantes favoritos para cliente ID: ${clientId}`); // Log de início

  db.all(
    'SELECT restaurant_id FROM favoritos WHERE client_id = ?',
    [clientId],
    (err, rows) => {
      if (err) {
        logger.error(`Erro ao buscar IDs de favoritos para o cliente ${clientId}: ${err.message}`, { stack: err.stack }); // Log de erro
        return res.status(500).json({ error: 'Erro interno no servidor.' });
      }
      logger.info(`Retornados ${rows.length} IDs de favoritos para o cliente ${clientId}.`); // Log de sucesso
      res.json({ favorites: rows.map(r => r.restaurant_id) });
    }
  );
};

exports.toggleFavorite = async (req, res) => {
  const clientId    = req.cookies.clientId;
  const { restaurantId, action } = req.body;

  logger.info(`Tentativa de ${action} favorito para restaurante ID: ${restaurantId}, cliente ID: ${clientId}`); // Log de início

  if (!clientId) {
    logger.warn(`Toggle favorito falhou: Cliente não autenticado para restaurante ID ${restaurantId}.`); // Log de validação
    return res.status(401).json({ error: 'Não autenticado.' });
  }
  if (!restaurantId || !action) {
    logger.warn(`Toggle favorito falhou: ID do restaurante ou ação ausente para cliente ID ${clientId}.`); // Log de validação
    return res
      .status(400)
      .json({ error: 'ID do restaurante e ação são obrigatórios.' });
  }

  try {
    if (action === 'add') {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO favoritos
             (client_id, restaurant_id, created_at)
           VALUES (?, ?, ?)`,
          [clientId, restaurantId, new Date().toISOString()],
          err => (err ? reject(err) : resolve())
        );
      });
      logger.info(`Restaurante ${restaurantId} adicionado aos favoritos do cliente ${clientId}.`); // Log de sucesso
      return res
        .status(201)
        .json({ message: 'Restaurante adicionado aos favoritos!' });
    }

    if (action === 'remove') {
      await new Promise((resolve, reject) => {
        db.run(
          `DELETE FROM favoritos
           WHERE client_id = ?
             AND restaurant_id = ?`,
          [clientId, restaurantId],
          err => (err ? reject(err) : resolve())
        );
      });
      logger.info(`Restaurante ${restaurantId} removido dos favoritos do cliente ${clientId}.`); // Log de sucesso
      return res
        .status(200)
        .json({ message: 'Restaurante removido dos favoritos!' });
    }

    logger.warn(`Toggle favorito falhou: Ação inválida '${action}' para restaurante ID ${restaurantId}, cliente ID ${clientId}.`); // Log de validação
    res.status(400).json({ error: 'Ação inválida.' });
  } catch (error) {
    logger.error(`Erro ao ${action} favorito para restaurante ID ${restaurantId}, cliente ID ${clientId}: ${error.message}`, { stack: error.stack }); // Log de erro detalhado
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};