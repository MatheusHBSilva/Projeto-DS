const bcrypt = require('bcrypt');
const { db } = require('../models/db');

exports.registerClient = async (req, res) => {
  const { nome, sobrenome, cpf, telefone, email, senha, tags } = req.body;

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
      return res
        .status(400)
        .json({ error: 'Este email ou CPF já está registrado.' });
    }

    // Verifica se o cliente digitou o número mínimo de tags
    const tagsArray = tags
      ? tags.split(',').map(tag => tag.trim())
      : [];

    if (tagsArray.length < 2) {
      return res
        .status(400)
        .json({ error: 'É necessário informar no mínimo 2 tags.'});
    }

    // Hash da senha e inserção no BD
    const hashedPassword = await bcrypt.hash(senha, 10);
    await new Promise((resolve, reject) => {
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
        err => (err ? reject(err) : resolve())
      );
    });

    res.status(201).json({ message: 'Cadastro salvo com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

exports.getCurrentClient = (req, res) => {
  const clientId = req.cookies.clientId;
  
  db.get(
    'SELECT id, nome, sobrenome, email, tags FROM clients WHERE id = ?',
    [clientId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Erro interno no servidor.' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Cliente não encontrado.' });
      }

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

