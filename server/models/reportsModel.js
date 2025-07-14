const { db } = require('./db');

function getReportModel( restaurantId, sql ) { 
  return new Promise((resolve, reject) => {
    db.all(sql, [restaurantId], (err, rows) => (err ? reject(err) : resolve(rows)));
  });
};

function downloadReportModel( reportId ) {
  return new Promise((resolve, reject) => {
      db.get(
        `SELECT restaurant_id, analysis, created_at
         FROM reports
         WHERE id = ?`,
        [reportId],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });
};

function insertReport(restaurantId, analysis) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO reports (restaurant_id, analysis, created_at)
         VALUES (?, ?, ?)`,
        [restaurantId, analysis, new Date().toISOString()],
        err => (err ? reject(err) : resolve())
      );
    });
};

module.exports = { getReportModel, downloadReportModel, insertReport };