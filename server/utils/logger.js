const fs = require('fs');
const path = require('path');

const logDirectory = path.join(__dirname, '../../logs'); 
const logFile = path.join(logDirectory, 'app.log'); 
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

function log(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const formattedLevel = level.toUpperCase();
  let entry;

  if (Object.keys(meta).length > 0) {
    entry = `[${timestamp}] [${formattedLevel}] ${message} ${JSON.stringify(meta)}\n`;
  } else {
    entry = `[${timestamp}] [${formattedLevel}] ${message}\n`;
  }

  fs.appendFileSync(logFile, entry, 'utf8');
  console.log(entry.trim());
}


module.exports = {
  debug: (message, meta) => log('DEBUG', message, meta),
  info: (message, meta) => log('INFO', message, meta),
  warn: (message, meta) => log('WARN', message, meta),
  error: (message, meta) => log('ERROR', message, meta),
  critical: (message, meta) => log('CRITICAL', message, meta),
};
