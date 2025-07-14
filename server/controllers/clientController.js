const bcrypt = require('bcrypt');
const { selectEmailClient, insertClients, getCurrentClientModel } = require('../models/clientModels');

exports.registerClient = async (req, res) => {
  const { nome, sobrenome, cpf, telefone, email, senha, tags } = req.body;

  try {
    // Verifica email ou CPF já cadastrado
    const existingClient = await selectEmailClient(email, cpf);

    if (existingClient) {
      return res
        .status(400)
        .json({ error: 'Este email ou CPF já está registrado.' });
    }

    // Hash da senha e inserção no BD
    const hashedPassword = await bcrypt.hash(senha, 10);
    await insertClients(nome, sobrenome, cpf, telefone, email, hashedPassword, tags);

    res.status(201).json({ message: 'Cadastro salvo com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

exports.getCurrentClient = async (req, res) => {
  const clientId = req.cookies.clientId;
  
  try {
    const row = await getCurrentClientModel(clientId);

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

  } catch(error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

