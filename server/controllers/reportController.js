// server/controllers/reportController.js
const { db } = require('../models/db');
const PDFDocument = require('pdfkit');
const logger = require('../utils/logger'); // Importa o logger

exports.getReportHistory = (req, res) => {
  const { restaurantId } = req.query;

  if (!restaurantId) {
      logger.warn('Tentativa de obter histórico de relatórios sem restaurantId.'); // Log de aviso
      return res.status(400).json({ error: 'ID do restaurante é obrigatório.' });
  }

  logger.info(`Buscando histórico de relatórios para restaurante ID: ${restaurantId}`); // Log de início

  const sql = `
    SELECT
      id,
      created_at AS date
    FROM reports
    WHERE restaurant_id = ?
    ORDER BY created_at DESC
    LIMIT 10
  `;

  db.all(sql, [restaurantId], (err, rows) => {
    if (err) {
      logger.error(`Erro ao buscar histórico de relatórios para o restaurante ${restaurantId}: ${err.message}`, { stack: err.stack }); // Log de erro
      return res
        .status(500)
        .json({ error: 'Erro interno no servidor.' });
    }
    logger.info(`Retornados ${rows.length} relatórios para o restaurante ${restaurantId}.`); // Log de sucesso
    res.json({ reports: rows });
  });
};

exports.downloadReport = async (req, res) => {
  const { reportId } = req.body;

  logger.info(`Tentativa de download de relatório para reportId: ${reportId}`); // Log de início

  if (!reportId) {
      logger.warn('Download de relatório falhou: ID do relatório ausente.'); // Log de aviso
      return res.status(400).json({ error: 'ID do relatório é obrigatório.' });
  }

  try {
    // Busca o relatório no banco
    const report = await new Promise((resolve, reject) => {
      db.get(
        `SELECT restaurant_id, analysis, created_at
         FROM reports
         WHERE id = ?`,
        [reportId],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });

    if (!report) {
      logger.warn(`Download de relatório falhou: Relatório não encontrado para ID ${reportId}`); // Log de aviso
      return res
        .status(404)
        .json({ error: 'Relatório não encontrado.' });
    }

    // Gera PDF e retorna como anexo
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      const timestamp = report.created_at
        .replace(/:/g, '-')
        .replace(/ /g, '_');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="relatorio_${timestamp}.pdf"`
      );
      logger.info(`Relatório ${reportId} gerado e enviado com sucesso para restaurante ID ${report.restaurant_id}.`); // Log de sucesso
      res.send(pdfData);
    });

    doc.fontSize(16).text('Relatório de Análise de Negócio', {
      align: 'center',
    });
    doc.moveDown();
    doc.fontSize(12).text(`Restaurante ID: ${report.restaurant_id}`);
    doc.text(
      `Gerado em: ${new Date(report.created_at).toLocaleString(
        'pt-BR'
      )}`
    );
    doc.moveDown();
    doc.text(report.analysis, { lineGap: 4 });
    doc.end();
  } catch (error) {
    logger.error(`Erro ao baixar relatório ${reportId}: ${error.message}`, { stack: error.stack }); // Log de erro
    res
      .status(500)
      .json({ error: 'Erro interno ao baixar relatório.' });
  }
};