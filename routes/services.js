const express = require('express');
const router = express.Router();
const { supabase } = require('../database/db');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from('services').select('*').eq('is_active', 1).order('sort_order', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get('/all', auth, async (req, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from('services').select('*').order('sort_order', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/', auth, async (req, res) => {
  const { name_en, name_bn, description_en, description_bn, price, icon, category, sort_order, is_active } = req.body;
  if (!name_en || !name_bn || !price) return res.status(400).json({ error: 'Name and price are required' });

  const { data, error } = await supabase.from('services').insert([{
    name_en, name_bn, description_en: description_en || '', description_bn: description_bn || '', 
    price, icon: icon || 'fas fa-file-alt', category: category || 'General', 
    sort_order: parseInt(sort_order) || 0, is_active: is_active ?? 1
  }]).select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ id: data.id, message: 'Service created' });
});

router.put('/:id', auth, async (req, res) => {
  const updates = req.body;
  updates.sort_order = parseInt(updates.sort_order) || 0;
  
  const { error } = await supabase.from('services').update(updates).eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Service updated' });
});

router.delete('/:id', auth, async (req, res) => {
  const { error } = await supabase.from('services').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Service deleted' });
});

module.exports = router;
