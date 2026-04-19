const express = require('express');
const router = express.Router();
const { db, save } = require('../database/db');
const auth = require('../middleware/auth');

router.get('/', (req, res) => {
  const info = {};
  db.shop_info.forEach(item => { info[item.key] = item.value; });
  res.json(info);
});

router.put('/', auth, (req, res) => {
  const updates = req.body;
  Object.entries(updates).forEach(([key, value]) => {
    const item = db.shop_info.find(i => i.key === key);
    if (item) item.value = String(value || '');
    else db.shop_info.push({ key, value: String(value || '') });
  });
  save();
  res.json({ message: 'Shop info updated successfully' });
});

module.exports = router;
