**Live Demo:** https://express-js-lab-3.onrender.com/

# Lab 03: Books REST API with Express and SQLite

**Name:** ANURAD.P  
**Registration Number:** 252U1R1016  
**Section:** CSE CORE  

A RESTful API built using Node.js, Express, and SQLite (`sqlite3`) supporting complete CRUD operations, pagination, filtering by price, sorting, and search on a books collection.

## Project Structure

```text
lab-3/
├── database.js
├── server.js
├── package.json
├── package-lock.json
├── books.db
├── .gitignore
├── README.md
└── Lab3-REST-API/
    ├── database.js
    ├── server.js
    ├── package.json
    ├── package-lock.json
    ├── books.db
    ├── .gitignore
    └── README.md
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- npm

## Installation & Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/anuradreddy-lgtm/lab-3.git
   cd lab-3
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   - For standard start:
     ```bash
     npm start
     ```
   - For development mode (with nodemon):
     ```bash
     npm run dev
     ```

Server runs at `http://localhost:3000` by default (or the port defined by `process.env.PORT`).

## API Endpoints

### 1. Get All Books
- **GET** `/books`
- **Query Parameters:**
  - `search_q`: Search book title (case-insensitive substring match)
  - `order_by`: Column to sort by (`id`, `title`, `author`, `price` - default: `id`)
  - `order`: Sort order (`ASC` or `DESC` - default: `ASC`)
  - `limit`: Number of records to return (default: `10`)
  - `offset`: Number of records to skip (default: `0`)
  - `min_price`: Minimum price filter
  - `max_price`: Maximum price filter

### 2. Get Book by ID
- **GET** `/books/:id`

### 3. Add a New Book
- **POST** `/books`
- **Request Body (JSON):**
  ```json
  {
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "price": 29.99
  }
  ```

### 4. Update an Existing Book
- **PUT** `/books/:id`
- **Request Body (JSON):**
  ```json
  {
    "title": "Clean Code (Updated)",
    "author": "Robert C. Martin",
    "price": 34.99
  }
  ```

### 5. Delete a Book
- **DELETE** `/books/:id`
