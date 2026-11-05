const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "books.db");
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.log("Database connection failed:", err.message);
    } else {
        console.log("SQLite Database Connected!");
    }
});

db.run(`
    CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price REAL NOT NULL
    )
`, (err) => {
    if (err) {
        console.log("Table creation error:", err.message);
    } else {
        console.log("Books table ready!");
    }
});

module.exports = db;
