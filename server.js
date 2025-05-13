require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const PDFDocument = require('pdfkit'); // Novo import para PDF

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname)));

// Banco de dados
const db = new sqlite3.Database('database.db', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

// Criação de tabelas
db.run(`
  CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    location TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER NOT NULL,
    reviewer_name TEXT NOT NULL,
    rating INTEGER NOT NULL,
    review_text TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
  )
`);

// Registro
app.post('/api/register', async (req, res) => {
  const { restaurantName, ownerName, location, email, password } = req.body;

  if (!restaurantName || !ownerName || !location || !email || !password) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT email FROM restaurants WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Este email já está registrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO restaurants (restaurant_name, owner_name, location, email, password, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [restaurantName, ownerName, location, email, hashedPassword, new Date().toISOString()],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });

    res.status(201).json({ message: 'Registro salvo com sucesso!' });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM restaurants WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    if (!user) {
      return res.status(401).json({ error: 'Email ou senha incorretos.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Email ou senha incorretos.' });
    }

    res.cookie('restaurantId', user.id, {
      httpOnly: true,
      sameSite: 'Lax'
    });

    res.status(200).json({ message: 'Login realizado com sucesso!' });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// Dados do restaurante logado
app.get('/api/me', (req, res) => {
  const restaurantId = req.cookies.restaurantId;
  if (!restaurantId) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  db.get('SELECT id, restaurant_name, location FROM restaurants WHERE id = ?', [restaurantId], (err, row) => {
    if (err) {
      console.error('Erro ao buscar restaurante:', err);
      return res.status(500).json({ error: 'Erro interno no servidor.' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Restaurante não encontrado.' });
    }

    res.json({ restaurantId: row.id, restaurantName: row.restaurant_name, location: row.location });
  });
});

// Obter restaurantes por localização ou ID com média de avaliações e contagem
app.get('/api/restaurants', (req, res) => {
  const { location, id } = req.query;
  console.log('Requisição /api/restaurants com location:', location, 'e id:', id);

  if (!location && !id) {
    return res.status(400).json({ error: 'Localização ou ID é obrigatório.' });
  }

  let query = `
    SELECT r.id, r.restaurant_name, r.location, 
           COALESCE(AVG(rev.rating), 0) as average_rating,
           COUNT(rev.rating) as review_count
    FROM restaurants r
    LEFT JOIN reviews rev ON r.id = rev.restaurant_id
  `;
  const params = [];

  if (id) {
    query += ' WHERE r.id = ?';
    params.push(id);
  } else if (location && location.trim() !== '') {
    query += ' WHERE r.location = ?';
    params.push(location);
  } else {
    return res.status(400).json({ error: 'Localização inválida.' });
  }

  query += ' GROUP BY r.id, r.restaurant_name, r.location';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Erro ao buscar restaurantes:', err);
      return res.status(500).json({ error: 'Erro interno no servidor.' });
    }

    console.log('Restaurantes encontrados:', rows);
    res.json({ restaurants: rows.map(row => ({
      id: row.id,
      restaurant_name: row.restaurant_name,
      location: row.location,
      average_rating: parseFloat(row.average_rating.toFixed(1)),
      review_count: row.review_count
    })) });
  });
});

// Obter avaliações de um restaurante
app.get('/api/reviews', (req, res) => {
  const { restaurantId, limit } = req.query;

  if (!restaurantId) {
    return res.status(400).json({ error: 'ID do restaurante é obrigatório.' });
  }

  const queryLimit = limit ? parseInt(limit) : 50;
  db.all(
    'SELECT reviewer_name, rating, review_text, created_at FROM reviews WHERE restaurant_id = ? ORDER BY created_at DESC LIMIT ?',
    [restaurantId, queryLimit],
    (err, rows) => {
      if (err) {
        console.error('Erro ao buscar avaliações:', err);
        return res.status(500).json({ error: 'Erro interno no servidor.' });
      }

      res.json({ reviews: rows });
    }
  );
});

// Gerar análise de negócio com Gemini API
app.post('/api/business-analysis', async (req, res) => {
  const { restaurantId, format } = req.body;

  if (!restaurantId) {
    return res.status(400).json({ error: 'ID do restaurante é obrigatório.' });
  }

  try {
    // Buscar até 50 avaliações
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

    // Formatar as avaliações para o prompt do Gemini
    const prompt = `
      Analise as seguintes avaliações de um restaurante, incluindo o texto e a nota em estrelas (de 1 a 5). Forneça um relatório detalhado que inclua:
      1. Análise de sentimento (positivo, negativo, neutro, piadas, ironias) de forma geral (não precisa ser avaliação por avaliação, pois temos muitas no futuro).
      2. Resumo das tendências gerais (por exemplo, pontos fortes e fracos mencionados).
      3. Sugestões de melhorias com base nas avaliações.
      4. Média geral das notas e uma visão geral do desempenho do restaurante.
      5. Não avalie individualmente, faça um resumo gereal bem estruturado.
      6. Deixe tudo em forma profissional, pois quem lerá isso não é quem dá um input, mas o cliente.
      Aqui estão as avaliações:
      ${reviews.map((r, i) => `Avaliação ${i + 1}: "${r.review_text || 'Sem comentário'}" (${r.rating} estrelas)`).join('\n')}
    `;

    // Inicializar o cliente do Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Chave da API do Gemini não configurada no arquivo .env.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Gerar conteúdo
    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    if (format === 'pdf') {
      // Gerar PDF
      const doc = new PDFDocument({ margin: 50 });
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="relatorio_analise_${restaurantId}.pdf"`);
        res.send(pdfData);
      });

      // Adicionar conteúdo ao PDF
      doc.fontSize(16).text('Relatório de Análise de Negócio', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Restaurante ID: ${restaurantId}`);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`);
      doc.moveDown();
      doc.text(analysis, { align: 'left', lineGap: 2 });
      doc.end();
    } else {
      // Retornar como JSON (texto)
      res.status(200).json({ analysis });
    }
  } catch (error) {
    console.error('Erro ao gerar análise de negócio:', error.message);
    res.status(500).json({ error: error.message || 'Erro interno ao gerar análise.' });
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
    console.error('Erro ao salvar avaliação:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});