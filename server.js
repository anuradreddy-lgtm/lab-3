const express = require("express");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Helper functions for SQLite
function dbAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function dbGet(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function dbRun(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({
                id: this.lastID,
                changes: this.changes
            });
        });
    });
}

// 1. GET all books with search, sorting and filters
app.get("/books", async (req, res) => {
    try {
        const {
            search_q = "",
            order_by = "id",
            order = "ASC",
            limit = "10",
            offset = "0",
            min_price,
            max_price
        } = req.query;

        // Validate query parameters
        const allowedColumns = ["id", "title", "author", "price"];

        if (!allowedColumns.includes(order_by)) {
            return res.status(400).json({
                message: "Invalid order_by column"
            });
        }

        if (!["ASC", "DESC"].includes(order.toUpperCase())) {
            return res.status(400).json({
                message: "Order must be ASC or DESC"
            });
        }

        const pageLimit = Number(limit);
        const pageOffset = Number(offset);

        if (!Number.isInteger(pageLimit) || pageLimit < 1 ||
            !Number.isInteger(pageOffset) || pageOffset < 0) {
            return res.status(400).json({
                message: "Limit must be positive and offset must be non-negative"
            });
        }

        const conditions = [];
        const params = [];

        // Search by partial book title
        if (search_q) {
            conditions.push("title LIKE ?");
            params.push(`%${search_q}%`);
        }

        // Minimum price
        if (min_price !== undefined) {
            if (min_price.trim() === "" || !Number.isFinite(Number(min_price))) {
                return res.status(400).json({
                    message: "min_price must be a valid number"
                });
            }

            conditions.push("price >= ?");
            params.push(Number(min_price));
        }

        // Maximum price
        if (max_price !== undefined) {
            if (max_price.trim() === "" || !Number.isFinite(Number(max_price))) {
                return res.status(400).json({
                    message: "max_price must be a valid number"
                });
            }

            conditions.push("price <= ?");
            params.push(Number(max_price));
        }

        if (min_price !== undefined && max_price !== undefined &&
            Number(min_price) > Number(max_price)) {
            return res.status(400).json({
                message: "min_price cannot exceed max_price"
            });
        }

        let sql = "SELECT * FROM books";

        if (conditions.length > 0) {
            sql += " WHERE " + conditions.join(" AND ");
        }

        // order_by is whitelisted and order is restricted to ASC/DESC
        sql += ` ORDER BY ${order_by} ${order.toUpperCase()}`;
        sql += " LIMIT ? OFFSET ?";

        params.push(pageLimit, pageOffset);

        const books = await dbAll(sql, params);

        res.status(200).json({
            message: "Books fetched successfully",
            count: books.length,
            data: books
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch books",
            error: error.message
        });
    }
});

// 2. GET a single book by ID
app.get("/books/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                message: "Invalid book ID"
            });
        }

        const book = await dbGet(
            "SELECT * FROM books WHERE id = ?",
            [id]
        );

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.status(200).json({
            message: "Book found",
            data: book
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch book"
        });
    }
});

// 3. POST - Add a new book
app.post("/books", async (req, res) => {
    try {
        const { title, author, price } = req.body;

        if (typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                message: "Title is required"
            });
        }

        if (typeof author !== "string" || !author.trim()) {
            return res.status(400).json({
                message: "Author is required"
            });
        }

        if (price === undefined || price === null ||
            typeof price !== "number" || !Number.isFinite(price) ||
            price < 0) {
            return res.status(400).json({
                message: "Price must be a valid non-negative number"
            });
        }

        const result = await dbRun(
            "INSERT INTO books (title, author, price) VALUES (?, ?, ?)",
            [title.trim(), author.trim(), price]
        );

        res.status(201).json({
            message: "Book created successfully",
            id: result.id
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create book"
        });
    }
});

// 4. PUT - Update a book
app.put("/books/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { title, author, price } = req.body;

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                message: "Invalid book ID"
            });
        }

        if (typeof title !== "string" || !title.trim() ||
            typeof author !== "string" || !author.trim() ||
            typeof price !== "number" || !Number.isFinite(price) ||
            price < 0) {
            return res.status(400).json({
                message: "Valid title, author and non-negative numeric price are required"
            });
        }

        const result = await dbRun(
            "UPDATE books SET title = ?, author = ?, price = ? WHERE id = ?",
            [title.trim(), author.trim(), price, id]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.status(200).json({
            message: "Book updated successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update book"
        });
    }
});

// 5. DELETE - Delete a book
app.delete("/books/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({
                message: "Invalid book ID"
            });
        }

        const result = await dbRun(
            "DELETE FROM books WHERE id = ?",
            [id]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.status(200).json({
            message: "Book deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete book"
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
