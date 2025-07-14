const { db } = require('./db');

function selectFavorites( clientId ) {
  return new Promise((resolve, reject) => {
    db.all(`
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
  `, [clientId], (err, rows) => (err ? reject(err) : resolve(rows))
    );
  });
};

function getFavoriteIdsModel( clientId ) {
  return new Promise((resolve, reject) => {
    db.all(
    'SELECT restaurant_id FROM favoritos WHERE client_id = ?',
    [clientId],
    (err, rows) => (err ? reject(err) : resolve(rows))
    );
  });
};

function insertFavorites( clientId, restaurantId ) {
    return new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO favoritos 
             (client_id, restaurant_id, created_at) 
           VALUES (?, ?, ?)`,
          [clientId, restaurantId, new Date().toISOString()],
          err => (err ? reject(err) : resolve())
        );
      });
};

function deleteFavorites( clientId, restaurantId ) {
    return new Promise((resolve, reject) => {
        db.run(
          `DELETE FROM favoritos 
           WHERE client_id = ? 
             AND restaurant_id = ?`,
          [clientId, restaurantId],
          err => (err ? reject(err) : resolve())
        );
    });
};

module.exports = { selectFavorites, getFavoriteIdsModel, insertFavorites, deleteFavorites};