const express = require('express');
const path = require('path');
const { pool } = require('./db');
const { generateCode, isValidUrl } = require('./lib');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Create a short link
app.post('/api/links', async (req, res) => {
  const { url } = req.body || {};
  if (!isValidUrl(url)) {
    return res.status(400).json({ error: 'Provide a valid http(s) URL' });
  }
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    try {
      await pool.query('INSERT INTO links (code, url) VALUES ($1, $2)', [code, url]);
      return res.status(201).json({
        code,
        shortUrl: `${req.protocol}://${req.get('host')}/${code}`,
      });
    } catch (err) {
      // 23505 = unique violation (code collision), so retry with a new code
      if (err.code !== '23505') {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
      }
    }
  }
  res.status(500).json({ error: 'Could not generate a unique code' });
});

// Recent links with click counts
app.get('/api/links', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT code, url, clicks, created_at FROM links ORDER BY created_at DESC LIMIT 20'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Redirect and count the click
app.get('/:code([A-Za-z0-9]{6})', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE links SET clicks = clicks + 1 WHERE code = $1 RETURNING url',
      [req.params.code]
    );
    if (rows.length === 0) return res.status(404).send('Link not found');
    res.redirect(302, rows[0].url);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = app;
