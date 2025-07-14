const { db } = require('./db');

function selectRestaurant( email ) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM restaurants WHERE email = ?',
        [email],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });
};

function selectRestaurantTags( restaurantId ) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT tags FROM restaurants WHERE id = ?',
        [restaurantId],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });
};

function selectEmailRestaurant( email ) {
  return new Promise((resolve, reject) => {
      db.get(
        'SELECT email FROM restaurants WHERE email = ?',
        [email],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });
};

function insertRestaurant( restaurantName, cnpj, email, hashedPassword, tags ) {
  return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO restaurants 
          (restaurant_name, cnpj, email, password, tags, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          restaurantName,
          cnpj,
          email,
          hashedPassword,
          tags || '',
          new Date().toISOString()
        ],
        err => (err ? reject(err) : resolve())
      );
    });
};

function getCurrentRestaurantModel( restaurantId ) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT id, restaurant_name, tags FROM restaurants WHERE id = ?',
      [restaurantId],
      (err, row) => (err ? reject(err) : resolve(row))
    );
  });
};

function getRestaurantsModel( query, params ) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
};

module.exports = { selectRestaurant, selectRestaurantTags, selectEmailRestaurant, insertRestaurant, getCurrentRestaurantModel, getRestaurantsModel };