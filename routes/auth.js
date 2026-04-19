const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { supabase } = require('../database/db');
const authMiddleware = require('../middleware/auth');

router.post('/login', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase is not configured. Edit .env file.' });
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const { data: user, error } = await supabase.from('users').select('*').eq('username', username).single();
  if (error || !user) return res.status(401).json({ error: 'Invalid credentials' });

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });
  res.json({ token, username: user.username });
});

router.post('/change-password', authMiddleware, async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase is not configured.' });
  const { currentPassword, newPassword } = req.body;
  
  const { data: user, error } = await supabase.from('users').select('*').eq('id', req.user.id).single();
  if (error || !user || !bcrypt.compareSync(currentPassword, user.password)) {
    return res.status(401).json({ error: 'Incorrect current password' });
  }

  const hash = bcrypt.hashSync(newPassword, 10);
  await supabase.from('users').update({ password: hash }).eq('id', user.id);

  res.json({ message: 'Password updated successfully' });
});

module.exports = router;
