const { db } = require('../models/db');

/**
 * Busca restaurantes com base na compatibilidade de tags com o cliente logado.
 * ESTA VERSÃO UTILIZA COOKIES EM VEZ DE SESSÕES.
 */
const getDiscoveryFeed = async (req, res) => {
  // -> MUDANÇA 1: A verificação de identidade agora olha para req.cookies.
  if (!req.cookies || !req.cookies.clientId) {
    return res.status(401).json({ error: 'Cliente não autenticado.' });
  }
  
  // -> MUDANÇA 2: A variável clientId é pega diretamente de req.cookies.
  const clientId = req.cookies.clientId;

  try {
    // A partir daqui, o resto da função é exatamente igual.
    const client = await new Promise((resolve, reject) => {
      db.get('SELECT tags FROM clients WHERE id = ?', [clientId], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    if (!client || !client.tags) {
      return res.json({ restaurants: [] });
    }

    const clientTagsSet = new Set(client.tags.split(',').map(tag => tag.trim()));

    const allRestaurants = await new Promise((resolve, reject) => {
      const query = `
        SELECT 
          r.id, r.restaurant_name, r.tags,
          COALESCE(AVG(rev.rating), 0) as average_rating,
          COUNT(rev.id) as review_count
        FROM restaurants r
        LEFT JOIN reviews rev ON r.id = rev.restaurant_id
        GROUP BY r.id
      `;
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    const feedRestaurants = allRestaurants.filter(restaurant => {
      if (!restaurant.tags) return false;
      const restaurantTags = restaurant.tags.split(',').map(tag => tag.trim());
      let commonTagsCount = 0;
      for (const tag of restaurantTags) {
        if (clientTagsSet.has(tag)) {
          commonTagsCount++;
        }
      }
      return commonTagsCount >= 2;
    });

    res.json({ restaurants: feedRestaurants });

  } catch (error) {
    console.error('Erro ao buscar feed de descoberta:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = {
  getDiscoveryFeed,
};