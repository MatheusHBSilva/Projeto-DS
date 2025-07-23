const bcrypt = require('bcrypt');
const{ selectEmailRestaurant, insertRestaurant, getCurrentRestaurantModel, getRestaurantsModel, selectRestaurantTags } = require('../models/restaurantModels');

exports.registerRestaurant = async (req, res) => {
  const { restaurantName, cnpj, endereco, telefone, email, password, tags } = req.body;

  try {
    // Verifica email existente
    const existingUser = await selectEmailRestaurant( email );

    if (existingUser) {
      return res.status(400).json({ error: 'Este email já está registrado.' });
    }

    // Verifica se o restaurante digitou o número mínimo de tags
    const tagsArray = tags
      ? tags.split(',').map(tag => tag.trim())
      : [];

    if (tagsArray.length < 2) {
      return res
        .status(400)
        .json({ error: 'É necessário informar no mínimo 2 tags.'});
    }
    
    // Cria hash da senha e insere no BD
    const hashedPassword = await bcrypt.hash(password, 10);

    await insertRestaurant( restaurantName, cnpj, endereco, telefone, email, hashedPassword, tags );

    res.status(201).json({ message: 'Registro salvo com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

exports.getCurrentRestaurant = async (req, res) => {
  const restaurantId = req.cookies.restaurantId;

  try {
    const row = await getCurrentRestaurantModel( restaurantId );

    if (!row) {
        return res.status(404).json({ error: 'Restaurante não encontrado.' });
    }

    res.json({
        restaurantId:   row.id,
        restaurantName: row.restaurant_name,
        tags:           row.tags
                           ? row.tags.split(',').map(tag => tag.trim())
                           : []
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

exports.getRestaurants = async (req, res) => {
  const { id, limit, random, search } = req.query;

  let query = `
    SELECT r.id,
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

  try {
    const rows = await getRestaurantsModel( query, params );

    if (rows.length === 0 && id) {
      return res.status(404).json({ error: 'Restaurante não encontrado.' });
    }

    const restaurants = rows.map(row => ({
      id:              row.id,
      restaurant_name: row.restaurant_name,
      average_rating:  parseFloat(row.average_rating.toFixed(1)),
      review_count:    row.review_count
    }));

    res.json({ restaurants });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

exports.getRestaurantTags = async (req, res) => {
  const { id } = req.query;

  try {
    const row = await selectRestaurantTags( id );

    if (!row) {
      return res
        .status(404)
        .json({ error: 'Restaurante não encontrado.' });
    }

    const tags = row.tags
      ? row.tags.split(',').map(tag => tag.trim())
      : [];

    res.json({ tags });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: 'Erro interno no servidor.' });
  }
};