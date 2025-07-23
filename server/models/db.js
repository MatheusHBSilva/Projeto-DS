const sqlite3 = require('sqlite3').verbose();
const path   = require('path');

const db = new sqlite3.Database(path.resolve(__dirname, '../../database.db'), err => {
  if (err) console.error('Erro ao conectar no SQLite:', err.message);
  else     console.log('Conectado ao SQLite com sucesso');
});

function addColumnIfNotExists(tableName, columnName, columnType) {
  db.get(
    `PRAGMA table_info(${tableName})`,
    (err, row) => {
      if (err) {
        console.error(`Erro ao verificar colunas da tabela ${tableName}:`, err.message);
      } else {
        db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
          const columnExists = columns.some(col => col.name === columnName);
          if (!columnExists) {
            db.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`);
            console.log(`Coluna ${columnName} adicionada à tabela ${tableName}`);
          }
        });
      }
    }
  );
}

// Função para criar tabelas (executar apenas uma vez ou a cada start)
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
}

module.exports = { db, initTables };
