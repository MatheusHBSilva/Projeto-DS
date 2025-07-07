// server/controllers/recommendationController.js
const { db } = require('../models/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const PDFDocument = require('pdfkit');
const logger = require('../utils/logger'); // Importa o logger

exports.clientRecommendation = async (req, res) => {
  const { restaurantId, format } = req.body;
  const clientId = req.cookies.clientId;

  logger.info(`Tentativa de gerar recomendação para restaurante ID: ${restaurantId}, cliente ID: ${clientId}, formato: ${format}`); // Log de início

  if (!clientId) {
      logger.warn('Geração de recomendação falhou: Cliente não autenticado.'); // Log de validação
      return res.status(401).json({ error: 'Não autenticado.' });
  }
  if (!restaurantId) {
      logger.warn(`Geração de recomendação falhou: ID do restaurante ausente para cliente ID ${clientId}.`); // Log de validação
      return res.status(400).json({ error: 'ID do restaurante é obrigatório.' });
  }

  try {
    // 1. Buscar até 100 avaliações recentes
    const reviews = await new Promise((resolve, reject) => {
      db.all(
        `SELECT reviewer_name, rating, review_text
         FROM reviews
         WHERE restaurant_id = ?
         ORDER BY created_at DESC
         LIMIT 100`,
        [restaurantId],
        (err, rows) => (err ? reject(err) : resolve(rows))
      );
    });
    logger.debug(`Recuperadas ${reviews.length} avaliações para o restaurante ${restaurantId}.`); // Log detalhado

    // 2. Tags do restaurante e do cliente
    const restaurant = await new Promise((resolve, reject) => {
      db.get(
        'SELECT tags FROM restaurants WHERE id = ?',
        [restaurantId],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });
    if (!restaurant) {
        logger.warn(`Geração de recomendação falhou: Restaurante não encontrado para ID ${restaurantId}.`); // Log de validação
        return res.status(404).json({ error: 'Restaurante não encontrado.' });
    }
    const restaurantTags = restaurant?.tags
      ? restaurant.tags.split(',').map(t => t.trim())
      : [];
    logger.debug(`Tags do restaurante ${restaurantId}: [${restaurantTags.join(', ')}]`); // Log detalhado


    const client = await new Promise((resolve, reject) => {
      db.get(
        'SELECT tags FROM clients WHERE id = ?',
        [clientId],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });
    if (!client) {
        logger.warn(`Geração de recomendação falhou: Cliente não encontrado para ID ${clientId}.`); // Log de validação
        return res.status(404).json({ error: 'Cliente não encontrado.' });
    }
    const clientTags = client?.tags
      ? client.tags.split(',').map(t => t.trim())
      : [];
    logger.debug(`Tags do cliente ${clientId}: [${clientTags.join(', ')}]`); // Log detalhado


    // 3. Montar prompt
    const reviewTexts = reviews
      .map(
        r =>
          `${r.reviewer_name} (${r.rating} estrelas): "${
            r.review_text || 'Sem comentário'
          }"`
      )
      .join('\n');

    const prompt = `
Analise as seguintes avaliações de um restaurante, incluindo texto e nota (1–5), junto com as tags do restaurante (${restaurantTags.join(
      ', '
    )}) e do cliente (${clientTags.join(
      ', '
    )}). Forneça:
1. Recomendação (sim/não) e justificativa.
2. Resumo de pontos fortes e fracos.
3. Até 5 linhas no total.
4. Se não houver avaliações, responda apenas "Restaurante não avaliado".
Seguem as avaliações:
${reviewTexts}
    `;
    logger.debug('Prompt para Gemini preparado.'); // Log detalhado

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.critical('Chave da API do Gemini não configurada no .env. Impossível gerar recomendação.'); // Log crítico
      throw new Error(
        'Chave da API do Gemini não configurada no .env.'
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
    });
    const result = await model.generateContent(prompt);
    const analysis = await result.response.text();
    logger.info(`Análise de recomendação gerada com sucesso para restaurante ID ${restaurantId}.`); // Log de sucesso

    // 4. Gerar PDF ou JSON
    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="recomendacao_${restaurantId}.pdf"`
        );
        logger.info(`PDF de recomendação gerado e enviado para restaurante ID ${restaurantId}.`); // Log de sucesso
        res.send(pdfData);
      });

      doc.fontSize(16).text('Recomendação Personalizada', {
        align: 'center',
      });
      doc.moveDown();
      doc.fontSize(12).text(`Restaurante ID: ${restaurantId}`);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`);
      doc.moveDown();
      doc.text(analysis, { lineGap: 4 });
      doc.end();
      return;
    }

    logger.info(`Recomendação em JSON enviada para restaurante ID ${restaurantId}.`); // Log de sucesso
    res.status(200).json({ analysis });
  } catch (error) {
    logger.error(`Erro ao gerar recomendação para restaurante ID ${restaurantId}: ${error.message}`, { stack: error.stack, errorName: error.name }); // Log de erro detalhado
    res
      .status(500)
      .json({ error: error.message || 'Erro interno ao gerar recomendação.' });
  }
};