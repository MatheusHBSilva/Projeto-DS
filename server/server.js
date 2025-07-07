// server/server.js
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
const loggerMiddleware = require('./middlewares/loggerMiddleware'); 

const restaurantRoutes = require('./routes/restaurantRoutes');
const clientRoutes     = require('./routes/clientRoutes');
const authRoutes       = require('./routes/authRoutes');
const favoriteRoutes   = require('./routes/favoriteRoutes');
const reviewRoutes     = require('./routes/reviewRoutes');
const analysisRoutes   = require('./routes/analysisRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const reportRoutes       = require('./routes/reportRoutes');

const app = express();
const port = 3000;

// Inicializa conexão e cria tabelas
initTables();

// Middleware
app.use(cors({ origin: ['https://sua-app.render.com', 'http://localhost:3000'], credentials: true }));
app.use(express.json()); // Middleware para parsear JSON no corpo da requisição
app.use(cookieParser()); // Middleware para parsear cookies
// <-- AQUI: Seu middleware de logging para capturar todas as requisições
app.use(loggerMiddleware); 
app.use(express.static(path.join(__dirname, '../client'))); // Serve arquivos estáticos do diretório client


// Rotas agrupadas
app.use('/api', restaurantRoutes);
app.use('/api', clientRoutes);
app.use('/api', authRoutes);
app.use('/api', favoriteRoutes);
app.use('/api', reviewRoutes);
app.use('/api', analysisRoutes);
app.use('/api', recommendationRoutes);
app.use('/api', reportRoutes);


// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
