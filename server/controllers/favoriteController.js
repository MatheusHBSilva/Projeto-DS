const { selectFavorites, getFavoriteIdsModel, insertFavorites, deleteFavorites } = require('../models/favoritesModels');

exports.getFavoriteRestaurants = async (req, res) => {
  const clientId = req.cookies.clientId;

  try {
    const rows = await selectFavorites(clientId);

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

exports.getFavoriteIds = async (req, res) => {
  const clientId = req.cookies.clientId;

  try {
    const rows = await getFavoriteIdsModel(clientId);

    res.json({ favorites: rows.map(r => r.restaurant_id) });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

exports.toggleFavorite = async (req, res) => {
  const clientId    = req.cookies.clientId;
  const { restaurantId, action } = req.body;

  if (!clientId) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }
  if (!restaurantId || !action) {
    return res
      .status(400)
      .json({ error: 'ID do restaurante e ação são obrigatórios.' });
  }

  try {
    if (action === 'add') {
      await insertFavorites( clientId, restaurantId );
      return res
        .status(201)
        .json({ message: 'Restaurante adicionado aos favoritos!' });
    }

    if (action === 'remove') {
      await deleteFavorites( clientId, restaurantId );
      return res
        .status(200)
        .json({ message: 'Restaurante removido dos favoritos!' });
    }

    res.status(400).json({ error: 'Ação inválida.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};