// controllers/reviewController.js
const { selectReviews, insertReview } = require('../models/reviewsModel');

exports.getReviews = async (req, res) => {
  const { restaurantId, limit } = req.query;

  const queryLimit = limit ? parseInt(limit, 10) : 50;
  
  try {
    const rows = await selectReviews( restaurantId, limit );

    res.json({ reviews: rows });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: 'Erro interno no servidor.' });
  }
};

exports.submitReview = async (req, res) => {
  const { restaurantId, reviewerName, rating, reviewText } = req.body;

  try {
    await insertReview( restaurantId, reviewerName, rating, reviewText );
    
    res
      .status(201)
      .json({ message: 'Avaliação salva com sucesso!' });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: 'Erro interno no servidor.' });
  }
};
