const express = require('express');
const router = express.Router();
const { db, save, genId } = require('../database/db');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `banner_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Banners
router.get('/banners', (req, res) => {
  res.json(db.banners.filter(b => b.is_active).sort((a,b) => a.sort_order - b.sort_order));
});

router.get('/banners/all', auth, (req, res) => {
  res.json([...db.banners].sort((a,b) => a.sort_order - b.sort_order));
});

router.post('/banners', auth, upload.single('image'), (req, res) => {
  const { title, image_url, sort_order } = req.body;
  const finalUrl = req.file ? `/uploads/${req.file.filename}` : (image_url || '');
  if (!finalUrl) return res.status(400).json({ error: 'Image file or URL required' });

  const newBanner = {
    id: genId(), title: title || '', image_url: finalUrl,
    sort_order: parseInt(sort_order) || 0, is_active: 1
  };
  db.banners.push(newBanner);
  save();
  res.json({ id: newBanner.id, image_url: finalUrl });
});

router.put('/banners/:id', auth, (req, res) => {
  const banner = db.banners.find(b => b.id === parseInt(req.params.id));
  if (!banner) return res.status(404).json({ error: 'Banner not found' });

  const { title, is_active, sort_order } = req.body;
  banner.title = title;
  banner.is_active = is_active ? 1 : 0;
  banner.sort_order = typeof sort_order !== 'undefined' ? parseInt(sort_order) : banner.sort_order;
  save();
  res.json({ message: 'Banner updated' });
});

router.delete('/banners/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  const banner = db.banners.find(b => b.id === id);
  if (!banner) return res.status(404).json({ error: 'Banner not found' });

  if (banner.image_url && banner.image_url.startsWith('/uploads/')) {
    const filePath = path.join(__dirname, '..', banner.image_url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  db.banners = db.banners.filter(b => b.id !== id);
  save();
  res.json({ message: 'Banner deleted' });
});

// Content logic
router.get('/', (req, res) => {
  const content = {};
  db.content.forEach(c => { content[c.key] = { en: c.value_en, bn: c.value_bn }; });
  res.json(content);
});

router.put('/', auth, (req, res) => {
  const updates = req.body;
  Object.entries(updates).forEach(([k, v]) => {
    const item = db.content.find(c => c.key === k);
    if (item) {
      item.value_en = v.en || '';
      item.value_bn = v.bn || '';
    } else {
      db.content.push({ key: k, value_en: v.en || '', value_bn: v.bn || '' });
    }
  });
  save();
  res.json({ message: 'Content updated' });
});

router.put('/:key', auth, (req, res) => {
  const { value_en, value_bn } = req.body;
  const item = db.content.find(c => c.key === req.params.key);
  if (item) {
    item.value_en = value_en || ''; item.value_bn = value_bn || '';
  } else {
    db.content.push({ key: req.params.key, value_en: value_en || '', value_bn: value_bn || '' });
  }
  save();
  res.json({ message: 'Updated' });
});

router.post('/logo', auth, upload.single('logo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No logo file provided' });
  const finalUrl = `/uploads/${req.file.filename}`;
  const item = db.content.find(c => c.key === 'site_logo');
  if (item) {
    // Optionally delete old logo file here
    if (item.value_en && item.value_en.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '..', item.value_en);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    item.value_en = finalUrl;
  } else {
    db.content.push({ key: 'site_logo', value_en: finalUrl, value_bn: '' });
  }
  save();
  res.json({ message: 'Logo updated', url: finalUrl });
});

module.exports = router;
