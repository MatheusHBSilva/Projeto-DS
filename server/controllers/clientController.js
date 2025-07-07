// server/controllers/clientController.js
const bcrypt = require('bcrypt');
const { db } = require('../models/db');
const logger = require('../utils/logger'); // Importa o logger

exports.registerClient = async (req, res) => {
  const { nome, sobrenome, cpf, telefone, email, senha, tags } = req.body;

  logger.info(`Tentativa de registro de cliente para o email: ${email}`); // Log de início

  // Validação básica
  if (!nome || !sobrenome || !cpf || !telefone || !email || !senha) {
      logger.warn(`Registro de cliente falhou: Dados obrigatórios ausentes para ${email}`); // Log de validação
      return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
  }

  try {
    // Verifica email ou CPF já cadastrado
    const existingClient = await new Promise((resolve, reject) => {
      db.get(
        'SELECT email FROM clients WHERE email = ? OR cpf = ?',
        [email, cpf],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });

    if (existingClient) {
      logger.warn(`Registro de cliente falhou: Email ou CPF já registrado para ${email} / ${cpf}`); // Log de validação
      return res
        .status(400)
        .json({ error: 'Este email ou CPF já está registrado.' });
    }

    // Hash da senha e inserção no BD
    const hashedPassword = await bcrypt.hash(senha, 10);
    const result = await new Promise((resolve, reject) => { // Captura o resultado da inserção
      db.run(
        `
        INSERT INTO clients
          (nome, sobrenome, cpf, telefone, email, senha, tags, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          nome,
          sobrenome,
          cpf,
          telefone,
          email,
          hashedPassword,
          tags || '',
          new Date().toISOString()
        ],
        function(err) { // Usar 'function' para ter acesso a 'this.lastID'
            if (err) reject(err);
            else resolve(this.lastID); // Retorna o ID do novo cliente
        }
      );
    });

    logger.info(`Cliente registrado com sucesso: ${email} (ID: ${result})`); // Log de sucesso com ID
    res.status(201).json({ message: 'Cadastro salvo com sucesso!' });
  } catch (error) {
    logger.error(`Erro ao registrar cliente para ${email}: ${error.message}`, { stack: error.stack }); // Log de erro detalhado
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

exports.getCurrentClient = (req, res) => {
  const clientId = req.cookies.clientId;

  if (!clientId) {
      logger.warn('Tentativa de obter cliente atual sem clientId no cookie.'); // Log de aviso
      return res.status(401).json({ error: 'Não autenticado ou ID do cliente ausente.' });
  }

  db.get(
    'SELECT id, nome, sobrenome, email, tags FROM clients WHERE id = ?',
    [clientId],
    (err, row) => {
      if (err) {
        logger.error(`Erro ao buscar cliente atual para ID ${clientId}: ${err.message}`, { stack: err.stack }); // Log de erro
        return res.status(500).json({ error: 'Erro interno no servidor.' });
      }
      if (!row) {
        logger.warn(`Cliente não encontrado para ID ${clientId}`); // Log de aviso
        return res.status(404).json({ error: 'Cliente não encontrado.' });
      }

      logger.info(`Cliente atual obtido: ${row.nome} ${row.sobrenome} (ID: ${row.id})`); // Log de sucesso
      res.json({
        clientId:   row.id,
        nome:       row.nome,
        sobrenome:  row.sobrenome,
        email:      row.email,
        tags:       row.tags
                       ? row.tags.split(',').map(tag => tag.trim())
                       : []
      });
    }
  );
};