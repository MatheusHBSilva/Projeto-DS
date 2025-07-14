const { db } = require('./db');

function selectClient( email ) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM clients WHERE email = ?',
        [email],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });
};

function selectEmailClient( email, cpf ) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT email FROM clients WHERE email = ? OR cpf = ?',
        [email, cpf],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });
};

function insertClients( nome, sobrenome, cpf, telefone, email, hashedPassword, tags ) {
    return new Promise((resolve, reject) => {
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
};

function getCurrentClientModel( clientId ) {
  return new Promise((resolve, reject) => {
    db.get(
    'SELECT id, nome, sobrenome, email, tags FROM clients WHERE id = ?',
    [clientId],
    (err, row) => (err ? reject(err) : resolve(row))
  );
  }); 
};

function selectClientTags( clientId ) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT tags FROM clients WHERE id = ?',
        [clientId],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });
};

module.exports = { selectClient, selectEmailClient, insertClients, getCurrentClientModel, selectClientTags};
