const express = require('express');
const router = express.Router();
const { supabase } = require('../database/db');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  if (!supabase) return res.json({});
  const { data, error } = await supabase.from('shop_info').select('*');
  if (error) return res.status(500).json({ error: error.message });
  
  const info = {};
  if (data) {
    data.forEach(item => { info[item.key] = item.value; });
  }
  res.json(info);
});

router.put('/', auth, async (req, res) => {
  const updates = req.body;
  const updatesArray = Object.keys(updates).map(k => {
    return { key: k, value: String(updates[k] || '') };
  });

  const { error } = await supabase.from('shop_info').upsert(updatesArray);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Shop info updated successfully' });
});

module.exports = router;
