const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db, save } = require('../database/db');
const authMiddleware = require('../middleware/auth');

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const user = db.users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });
  res.json({ token, username: user.username });
});

router.post('/change-password', authMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = db.users.find(u => u.id === req.user.id);
  
  if (!user || !bcrypt.compareSync(currentPassword, user.password)) {
    return res.status(401).json({ error: 'Incorrect current password' });
  }

  user.password = bcrypt.hashSync(newPassword, 10);
  save();

  res.json({ message: 'Password updated successfully' });
});

module.exports = router;
