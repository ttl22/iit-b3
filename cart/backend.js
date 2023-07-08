const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

// Create an Express app
const app = express();
app.use(bodyParser.json());

// Create a new SQLite database
const db = new sqlite3.Database(':memory:');

// Create the 'cart' table
db.run(`
  CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item TEXT
  )
`);

// Add an item to the cart
app.post('/cart/add', (req, res) => {
    const { item } = req.body;

    if (!item) {
        return res.status(400).json({ error: 'Missing item parameter' });
    }

    db.run('INSERT INTO cart (item) VALUES (?)', [item], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to add item to cart' });
        }

        res.json({ message: 'Item added to cart successfully' });
    });
});

// Remove an item from the cart
app.delete('/cart/remove/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM cart WHERE id = ?', [id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to remove item from cart' });
        }

        res.json({ message: 'Item removed from cart successfully' });
    });
});

// Show the items in the cart
app.get('/cart/show', (req, res) => {
    db.all('SELECT * FROM cart', (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to fetch cart items' });
        }

        res.json(rows);
    });
});

// Serve the cart.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'cart.html'));
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
