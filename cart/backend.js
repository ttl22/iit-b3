const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());

const db = new sqlite3.Database(':memory:');

db.run(`
  CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT,
    item_quantity INTEGER
  )
`);

app.post('/cart/add', (req, res) => {
    const { item_name, item_quantity } = req.body;

    if (!item_name || !item_quantity) {
        return res.status(400).json({ error: 'Missing item_name or item_quantity parameter' });
    }

    db.get('SELECT * FROM cart WHERE item_name = ?', [item_name], (err, existingItem) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to add item to cart' });
        }

        if (existingItem) {
            const updatedQuantity = existingItem.item_quantity + item_quantity;
            db.run('UPDATE cart SET item_quantity = ? WHERE id = ?', [updatedQuantity, existingItem.id], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Failed to update item quantity in cart' });
                }

                res.json({ message: 'Item quantity updated in cart' });
            });
        } else {
            db.run('INSERT INTO cart (item_name, item_quantity) VALUES (?, ?)', [item_name, item_quantity], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Failed to add item to cart' });
                }

                res.json({ message: 'Item added to cart successfully' });
            });
        }
    });
});

app.delete('/cart/remove/:id', (req, res) => {
    const itemId = req.params.id;

    db.get('SELECT * FROM cart WHERE id = ?', [itemId], (err, existingItem) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to remove item from cart' });
        }

        if (!existingItem) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }

        db.run('DELETE FROM cart WHERE id = ?', [itemId], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to remove item from cart' });
            }

            res.json({ message: 'Item removed from cart successfully' });
        });
    });
});

app.get('/cart/show', (req, res) => {
    db.all('SELECT * FROM cart', (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to fetch cart items' });
        }

        res.json(rows);
    });
});

app.get('/showcart', (req, res) => {
    res.sendFile(path.join(__dirname, 'cart.html'));
});

const port = 3001;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
