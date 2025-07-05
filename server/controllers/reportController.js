const { db } = require('../models/db');
const PDFDocument = require('pdfkit');

exports.getReportHistory = (req, res) => {
  const { restaurantId } = req.query;

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
      return res
        .status(500)
        .json({ error: 'Erro interno no servidor.' });
    }
    res.json({ reports: rows });
  });
};

exports.downloadReport = async (req, res) => {
  const { reportId } = req.body;

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
    console.error(error);
    res
      .status(500)
      .json({ error: 'Erro interno ao baixar relatório.' });
  }
};
