const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Simple in-memory token store (for demo only)
const activeTokens = new Set();

// Load seeded users
const usersPath = path.join(__dirname, 'users.json');
let USERS = [];
try {
    const data = fs.readFileSync(usersPath, 'utf-8');
    USERS = JSON.parse(data);
} catch (e) {
    USERS = [];
}

app.get('/', (req, res) => {
    res.send('API is running');
});

// Login: validate against seeded users
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = USERS.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = `token-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    activeTokens.add(token);
    return res.status(200).json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

// Simple auth check route (optional)
app.get('/api/me', (req, res) => {
    const auth = req.headers.authorization || '';
    const token = auth.replace('Bearer ', '');
    if (!activeTokens.has(token)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.json({ ok: true });
});

const port = 8000;
module.exports = app;
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

