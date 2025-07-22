const { db } = require('./db');

function selectReviews( id, limit ) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT reviewer_name, rating, review_text, created_at
         FROM reviews
         WHERE restaurant_id = ?
         ORDER BY created_at DESC
         LIMIT ?`,
        [id, limit],
        (err, rows) => (err ? reject(err) : resolve(rows))
      );
    });
};

function insertReview( restaurantId, reviewerName, rating, reviewText ) {
  return new Promise((resolve, reject) => {
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
};

module.exports = { selectReviews, insertReview };