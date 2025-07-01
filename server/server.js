require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const PDFDocument = require('pdfkit');

const { initTables } = require('./models/db');

const restaurantRoutes = require('./routes/restaurantRoutes');
const clientRoutes     = require('./routes/clientRoutes');
const authRoutes       = require('./routes/authRoutes');
const favoriteRoutes   = require('./routes/favoriteRoutes');
const reviewRoutes     = require('./routes/reviewRoutes');

const app = express();
const port = 3000;

// Inicializa conexão e cria tabelas
initTables();

// Middleware
app.use(cors({ origin: ['https://sua-app.render.com', 'http://localhost:3000'], credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname)));


// Rotas agrupadas
app.use('/api', restaurantRoutes);
app.use('/api', clientRoutes);
app.use('/api', authRoutes);
app.use('/api', favoriteRoutes);
app.use('/api', reviewRoutes);


// Gerar análise de negócio com Gemini API (para o restaurante)
app.post('/api/business-analysis', async (req, res) => {
  const { restaurantId, format } = req.body;

  if (!restaurantId) {
    return res.status(400).json({ error: 'ID do restaurante é obrigatório.' });
  }

  try {
    const reviews = await new Promise((resolve, reject) => {
      db.all(
        'SELECT reviewer_name, rating, review_text, created_at FROM reviews WHERE restaurant_id = ? ORDER BY created_at DESC LIMIT 50',
        [restaurantId],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });

    const prompt = `
      Analise as seguintes avaliações de um restaurante, incluindo o texto e a nota em estrelas (de 1 a 5). Forneça um relatório detalhado que inclua:
      1. Análise de sentimento de forma geral (não precisa ser avaliação por avaliação).
      2. Resumo das tendências gerais (por exemplo, pontos fortes e fracos mencionados).
      3. Sugestões de melhorias com base nas avaliações.
      4. Média geral das notas e uma visão geral do desempenho do restaurante.
      5. Não avalie individualmente, faça um resumo geral bem estruturado.
      6. Deixe tudo em forma profissional.
      Segue as avaliações:
      ${reviews.map((r, i) => `Avaliação ${i + 1}: "${r.review_text || 'Sem comentário'}" (${r.rating} estrelas)`).join('\n')}
    `;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Chave da API do Gemini não configurada no arquivo .env.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    // Salvar o relatório no banco de dados
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO reports (restaurant_id, analysis, created_at) VALUES (?, ?, ?)',
        [restaurantId, analysis, new Date().toISOString()],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });

    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 50 });
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="relatorio_analise_${restaurantId}.pdf"`);
        res.send(pdfData);
      });

      doc.fontSize(16).text('Relatório de Análise de Negócio', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Restaurante ID: ${restaurantId}`);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`);
      doc.moveDown();
      doc.text(analysis, { align: 'left', lineGap: 2 });
      doc.end();
    } else {
      res.status(200).json({ analysis });
    }
  } catch (error) {
    res.status(500).json({ error: error.message || 'Erro interno ao gerar análise.' });
  }
});

// Gerar recomendação personalizada para o cliente com Gemini API
app.post('/api/client-recommendation', async (req, res) => {
  const { restaurantId, format } = req.body;

  if (!restaurantId) {
    return res.status(400).json({ error: 'ID do restaurante é obrigatório.' });
  }

  try {
    const clientId = req.cookies.clientId;
    if (!clientId) {
      return res.status(401).json({ error: 'Não autenticado.' });
    }

    // Obter avaliações dos últimos 100 clientes
    const reviews = await new Promise((resolve, reject) => {
      db.all(
        'SELECT reviewer_name, rating, review_text FROM reviews WHERE restaurant_id = ? ORDER BY created_at DESC LIMIT 100',
        [restaurantId],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });

    // Obter tags do restaurante
    const restaurant = await new Promise((resolve, reject) => {
      db.get('SELECT tags FROM restaurants WHERE id = ?', [restaurantId], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
    const restaurantTags = restaurant ? restaurant.tags.split(',').map(tag => tag.trim()) : [];

    // Obter tags do cliente
    const client = await new Promise((resolve, reject) => {
      db.get('SELECT tags FROM clients WHERE id = ?', [clientId], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
    const clientTags = client ? client.tags.split(',').map(tag => tag.trim()) : [];

    const reviewTexts = reviews.map(r => `${r.reviewer_name} (${r.rating} estrelas): "${r.review_text || 'Sem comentário'}"`).join('\n');
    const prompt = `
      Analise as seguintes avaliações de um restaurante, incluindo texto e nota em estrelas (1 a 5), junto com as tags do restaurante (${restaurantTags.join(', ')}) e do cliente (${clientTags.join(', ')}). Forneça um relatório que:
      1. Avalie se o restaurante é recomendável para o cliente com base nas avaliações e nas tags fornecidas.
      2. Resuma as tendências gerais (pontos fortes e fracos).
      3. Forneça uma recomendação clara (sim/não) e justifique.
      4. Faça isso tudo em no máximo 5 linhas
      5. Caso tenha nenhuma avaliaão apenas responda "Restaurante não avalidado", não precisa falar mais nada.
      Segue as avaliações:
      ${reviewTexts}
    `;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Chave da API do Gemini não configurada no arquivo .env.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 50 });
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="recomendacao_${restaurantId}.pdf"`);
        res.send(pdfData);
      });

      doc.fontSize(16).text('Relatório de Recomendação', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Restaurante ID: ${restaurantId}`);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`);
      doc.moveDown();
      doc.text(analysis, { align: 'left', lineGap: 2 });
      doc.end();
    } else {
      res.status(200).json({ analysis });
    }
  } catch (error) {
    res.status(500).json({ error: error.message || 'Erro interno ao gerar recomendação.' });
  }
});

// Submeter avaliação
app.post('/api/reviews', async (req, res) => {
  const { restaurantId, reviewerName, rating, reviewText } = req.body;

  if (!restaurantId || !reviewerName || !rating) {
    return res.status(400).json({ error: 'Restaurante, nome e nota são obrigatórios.' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'A nota deve ser entre 1 e 5.' });
  }

  try {
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO reviews (restaurant_id, reviewer_name, rating, review_text, created_at) VALUES (?, ?, ?, ?, ?)',
        [restaurantId, reviewerName, rating, reviewText || '', new Date().toISOString()],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });

    res.status(201).json({ message: 'Avaliação salva com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// Obter histórico de relatórios
app.get('/api/report-history', (req, res) => {
  const { restaurantId } = req.query;

  if (!restaurantId) {
    return res.status(400).json({ error: 'ID do restaurante é obrigatório.' });
  }

  db.all(
    'SELECT id, created_at AS date FROM reports WHERE restaurant_id = ? ORDER BY created_at DESC LIMIT 10',
    [restaurantId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Erro interno no servidor.' });
      }

      res.json({ reports: rows });
    }
  );
});

// Baixar relatório como PDF
app.post('/api/download-report', async (req, res) => {
  const { reportId } = req.body;

  if (!reportId) {
    return res.status(400).json({ error: 'ID do relatório é obrigatório.' });
  }

  try {
    const report = await new Promise((resolve, reject) => {
      db.get(
        'SELECT restaurant_id, analysis, created_at FROM reports WHERE id = ?',
        [reportId],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });

    if (!report) {
      return res.status(404).json({ error: 'Relatório não encontrado.' });
    }

    const doc = new PDFDocument({ margin: 50 });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="relatorio_${report.created_at.replace(/:/g, '-').replace(/ /g, '_')}.pdf"`);
      res.send(pdfData);
    });

    doc.fontSize(16).text('Relatório de Análise de Negócio', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Restaurante ID: ${report.restaurant_id}`);
    doc.text(`Gerado em: ${new Date(report.created_at).toLocaleString('pt-BR')}`);
    doc.moveDown();
    doc.text(report.analysis, { align: 'left', lineGap: 2 });
    doc.end();
  } catch (error) {
    res.status(500).json({ error: 'Erro interno ao baixar relatório.' });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});