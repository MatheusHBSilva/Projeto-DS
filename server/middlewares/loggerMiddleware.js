
const logger = require('../utils/logger'); 

function loggerMiddleware(req, res, next) {
  logger.info(`Requisição: ${req.method} ${req.originalUrl}`, {
    body: req.body,
    params: req.params,
    query: req.query,
  });
  next(); 
}

module.exports = loggerMiddleware;
