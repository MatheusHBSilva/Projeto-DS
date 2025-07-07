// server/controllers/reviewController.js
const { db } = require('../models/db');
const logger = require('../utils/logger'); // Importa o logger

exports.getReviews = (req, res) => {
  const { restaurantId, limit } = req.query;

  if (!restaurantId) {
      logger.warn('Tentativa de obter avaliações sem restaurantId.'); // Log de aviso
      return res.status(400).json({ error: 'ID do restaurante é obrigatório.' });
  }

  logger.info(`Buscando avaliações para restaurante ID: ${restaurantId}, Limite: ${limit || 'padrão'}`); // Log de início

  const queryLimit = limit ? parseInt(limit, 10) : 50;
  const sql = `
    SELECT reviewer_name, rating, review_text, created_at
      FROM reviews
     WHERE restaurant_id = ?
     ORDER BY created_at DESC
     LIMIT ?
  `;

  db.all(sql, [restaurantId, queryLimit], (err, rows) => {
    if (err) {
      logger.error(`Erro ao buscar avaliações para o restaurante ${restaurantId}: ${err.message}`, { stack: err.stack }); // Log de erro
      return res
        .status(500)
        .json({ error: 'Erro interno no servidor.' });
    }
    logger.info(`Retornadas ${rows.length} avaliações para o restaurante ${restaurantId}.`); // Log de sucesso
    res.json({ reviews: rows });
  });
};

exports.submitReview = async (req, res) => {
  const { restaurantId, reviewerName, rating, reviewText } = req.body;

  logger.info(`Tentativa de submeter avaliação para restaurante ID: ${restaurantId} por ${reviewerName}`); // Log de início

  if (!restaurantId || !reviewerName || !rating) {
      logger.warn(`Submissão de avaliação falhou: Dados obrigatórios ausentes para restaurante ID ${restaurantId}, reviewer: ${reviewerName}`); // Log de validação
      return res.status(400).json({ error: 'ID do restaurante, nome do avaliador e nota são obrigatórios.' });
  }

  try {
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO reviews
           (restaurant_id, reviewer_name, rating, review_text, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [
          restaurantId,
          reviewerName,
          rating,
          reviewText || '',
          new Date().toISOString()
        ],
        err => (err ? reject(err) : resolve())
      );
    });

    logger.info(`Avaliação submetida com sucesso para restaurante ID: ${restaurantId} por ${reviewerName} (Nota: ${rating})`); // Log de sucesso
    res
      .status(201)
      .json({ message: 'Avaliação salva com sucesso!' });
  } catch (error) {
    logger.error(`Erro ao submeter avaliação para restaurante ID ${restaurantId} por ${reviewerName}: ${error.message}`, { stack: error.stack }); // Log de erro
    res
      .status(500)
      .json({ error: 'Erro interno no servidor.' });
  }
};