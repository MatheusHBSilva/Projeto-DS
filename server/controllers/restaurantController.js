const bcrypt = require('bcrypt');
const { db } = require('../models/db');

exports.registerRestaurant = async (req, res) => {
  const { restaurantName, cnpj, endereco, telefone, email, password, tags } = req.body;

  try {
    // Verifica email existente
    const existingUser = await new Promise((resolve, reject) => {
      db.get(
        'SELECT email FROM restaurants WHERE email = ?',
        [email],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Este email já está registrado.' });
    }

    // Verifica se o restaurante digitou o número mínimo de tags
    const tagsArray = tags
      ? tags.split(',').map(tag => tag.trim())
      : [];

    if (tagsArray.length < 5) {
      return res
        .status(400)
        .json({ error: 'É necessário informar no mínimo 2 tags.'});
    }
    
    // Cria hash da senha e insere no BD
    const hashedPassword = await bcrypt.hash(password, 10);
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO restaurants 
          (restaurant_name, cnpj, endereco, telefone, email, password, tags, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          restaurantName,
          cnpj,
          endereco,
          telefone,
          email,
          hashedPassword,
          tags || '',
          new Date().toISOString()
        ],
        err => (err ? reject(err) : resolve())
      );
    });

    res.status(201).json({ message: 'Registro salvo com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

exports.getCurrentRestaurant = (req, res) => {
  const restaurantId = req.cookies.restaurantId;

  db.get(
    'SELECT id, restaurant_name, email, telefone, tags FROM restaurants WHERE id = ?',
    [restaurantId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Erro interno no servidor.' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Restaurante não encontrado.' });
      }

      res.json({
        restaurantId:   row.id,
        restaurantName: row.restaurant_name,
        restaurantEmail: row.email,
        restaurantPhone: row.telefone,
        tags:           row.tags
                           ? row.tags.split(',').map(tag => tag.trim())
                           : []
      });
    }
  );
};

exports.getRestaurants = (req, res) => {
  const { id, limit, random, search } = req.query;

  let query = `
    SELECT r.id,
           r.telefone,
           r.endereco,
           r.restaurant_name,
           COALESCE(AVG(rev.rating), 0)    AS average_rating,
           COUNT(rev.rating)               AS review_count
    FROM restaurants r
    LEFT JOIN reviews rev
      ON r.id = rev.restaurant_id
  `;
  const params = [];

  if (id) {
    query += ' WHERE r.id = ?';
    params.push(id);
  } else if (search) {
    query += ' WHERE r.restaurant_name LIKE ?';
    params.push(`%${search}%`);
  }

  query += ' GROUP BY r.id, r.restaurant_name';

  if (random && !search) {
    query += ' ORDER BY RANDOM()';
  }

  if (limit) {
    query += ' LIMIT ?';
    params.push(parseInt(limit, 10));
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro interno no servidor.' });
    }

    if (rows.length === 0 && id) {
      return res.status(404).json({ error: 'Restaurante não encontrado.' });
    }

    const restaurants = rows.map(row => ({
      id:              row.id,
      telefone:        row.telefone,
      endereco:        row.endereco,
      restaurant_name: row.restaurant_name,
      average_rating:  parseFloat(row.average_rating.toFixed(1)),
      review_count:    row.review_count
    }));

    res.json({ restaurants });
  });
};

exports.getRestaurantTags = (req, res) => {
  const { id } = req.query;

  db.get(
    'SELECT tags FROM restaurants WHERE id = ?',
    [id],
    (err, row) => {
      if (err) {
        return res
          .status(500)
          .json({ error: 'Erro interno no servidor.' });
      }
      if (!row) {
        return res
          .status(404)
          .json({ error: 'Restaurante não encontrado.' });
      }

      const tags = row.tags
        ? row.tags.split(',').map(tag => tag.trim())
        : [];

      res.json({ tags });
    }
  );
};