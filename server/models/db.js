const sqlite3 = require('sqlite3').verbose();
const path   = require('path');

const db = new sqlite3.Database(path.resolve(__dirname, '../../database.db'), err => {
  if (err) console.error('Erro ao conectar no SQLite:', err.message);
  else     console.log('Conectado ao SQLite com sucesso');
});

function addColumnIfNotExists(tableName, columnName, columnType) {
  db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
    if (err) {
      console.error(`Erro ao verificar colunas da tabela ${tableName}:`, err.message);
    } else {
      const columnExists = columns.some(col => col.name === columnName);
      if (!columnExists) {
        db.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`, err => {
          if (err) {
            console.error(`Erro ao adicionar coluna ${columnName}:`, err.message);
          } else {
            console.log(`Coluna ${columnName} adicionada à tabela ${tableName}`);
          }
        });
      }
    }
  });
}

function initTables() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        restaurant_name TEXT NOT NULL,
        cnpj TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        tags TEXT,
        created_at TEXT NOT NULL
      )
    `);

    addColumnIfNotExists('restaurants', 'endereco', 'TEXT');
    addColumnIfNotExists('restaurants', 'telefone', 'TEXT');

    db.run(`
      CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        sobrenome TEXT NOT NULL,
        cpf TEXT NOT NULL UNIQUE,
        telefone TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL,
        tags TEXT,
        created_at TEXT NOT NULL
      )
    `);
    // Certifique-se de que a coluna 'tags' está sendo criada.
    // Se a tabela 'clients' já existe sem 'tags', você pode adicionar um addColumnIfNotExists para 'clients'
    // addColumnIfNotExists('clients', 'tags', 'TEXT'); // Descomente e execute uma vez se a coluna não existir

    db.run(`
      CREATE TABLE IF NOT EXISTS favoritos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        restaurant_id INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (client_id) REFERENCES clients(id),
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
        UNIQUE(client_id, restaurant_id)
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

    db.run(`
      CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        restaurant_id INTEGER NOT NULL,
        analysis TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
      )
    `);
  });

  db.all('PRAGMA table_info(restaurants)', (err, rows) => {
    if (err) {
      console.error('Erro ao verificar colunas:', err.message);
    } else {
      console.log('Colunas atuais da tabela restaurants:');
      rows.forEach(col => console.log(`- ${col.name} (${col.type})`));
    }
  });

  // Adicionado para verificar a tabela clients também
  db.all('PRAGMA table_info(clients)', (err, rows) => {
    if (err) {
        console.error('Erro ao verificar colunas da tabela clients:', err.message);
    } else {
        console.log('Colunas atuais da tabela clients:');
        rows.forEach(col => console.log(`- ${col.name} (${col.type})`));
    }
  });
}

module.exports = { db, initTables };