const express = require('express');
const router = express.Router();
const { supabase } = require('../database/db');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Banners
router.get('/banners', async (req, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from('banners').select('*').eq('is_active', 1).order('sort_order', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get('/banners/all', auth, async (req, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from('banners').select('*').order('sort_order', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/banners', auth, upload.single('image'), async (req, res) => {
  const { title, sort_order } = req.body;
  let finalUrl = req.body.image_url || '';
  
  if (req.file) {
    const base64Str = req.file.buffer.toString('base64');
    finalUrl = `data:${req.file.mimetype};base64,${base64Str}`;
  }

  if (!finalUrl) return res.status(400).json({ error: 'Image file or URL required' });

  const { data, error } = await supabase.from('banners').insert([{
    title: title || '', image_url: finalUrl, sort_order: parseInt(sort_order) || 0, is_active: 1
  }]).select().single();
  
  if (error) return res.status(500).json({ error: error.message });
  res.json({ id: data.id, image_url: finalUrl });
});

router.put('/banners/:id', auth, async (req, res) => {
  const { title, is_active, sort_order } = req.body;
  const updates = {};
  if (title !== undefined) updates.title = title;
  if (is_active !== undefined) updates.is_active = is_active ? 1 : 0;
  if (sort_order !== undefined) updates.sort_order = parseInt(sort_order);

  const { error } = await supabase.from('banners').update(updates).eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Banner updated' });
});

router.delete('/banners/:id', auth, async (req, res) => {
  const { error } = await supabase.from('banners').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Banner deleted' });
});

// Content logic
router.get('/', async (req, res) => {
  if (!supabase) return res.json({});
  const { data, error } = await supabase.from('content').select('*');
  if (error) return res.status(500).json({ error: error.message });
  
  const content = {};
  if (data) {
    data.forEach(c => { content[c.key] = { en: c.value_en, bn: c.value_bn }; });
  }
  res.json(content);
});

router.put('/', auth, async (req, res) => {
  const updates = req.body;
  const updatesArray = Object.keys(updates).map(k => {
    return { key: k, value_en: updates[k].en || '', value_bn: updates[k].bn || '' };
  });

  const { error } = await supabase.from('content').upsert(updatesArray);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Content updated' });
});

router.put('/:key', auth, async (req, res) => {
  const { value_en, value_bn } = req.body;
  const { error } = await supabase.from('content').upsert([{ 
    key: req.params.key, value_en: value_en || '', value_bn: value_bn || '' 
  }]);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Updated' });
});

router.post('/logo', auth, upload.single('logo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No logo file provided' });
  
  const base64Str = req.file.buffer.toString('base64');
  const finalUrl = `data:${req.file.mimetype};base64,${base64Str}`;
  
  const { error } = await supabase.from('content').upsert([{ key: 'site_logo', value_en: finalUrl, value_bn: '' }]);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Logo updated', url: finalUrl });
});

module.exports = router;
