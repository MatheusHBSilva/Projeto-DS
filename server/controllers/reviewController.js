const { db } = require('../models/db');

exports.getReviews = (req, res) => {
  const { restaurantId, limit } = req.query;
  if (!restaurantId) {
    return res
      .status(400)
      .json({ error: 'ID do restaurante é obrigatório.' });
  }

  const queryLimit = limit ? parseInt(limit, 10) : 50;
  const sql = `
    SELECT
      reviewer_name,
      rating,
      review_text,
      created_at
    FROM reviews
    WHERE restaurant_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `;

  db.all(sql, [restaurantId, queryLimit], (err, rows) => {
    if (err) {
      return res
        .status(500)
        .json({ error: 'Erro interno no servidor.' });
    }
    res.json({ reviews: rows });
  });
};
