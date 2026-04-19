const express = require('express');
const router = express.Router();
const { db, save, genId } = require('../database/db');
const auth = require('../middleware/auth');

// GET /api/services – public access, only active services
router.get('/', (req, res) => {
  const activeServices = db.services.filter(s => s.is_active).sort((a,b) => a.sort_order - b.sort_order);
  res.json(activeServices);
});

// GET /api/services/all – admin access, all services
router.get('/all', auth, (req, res) => {
  res.json(db.services.sort((a,b) => a.sort_order - b.sort_order));
});

router.post('/', auth, (req, res) => {
  const { name_en, name_bn, description_en, description_bn, price, icon, category, sort_order, is_active } = req.body;
  if (!name_en || !name_bn || !price) return res.status(400).json({ error: 'Name and price are required' });

  const newSvc = {
    id: genId(), name_en, name_bn, description_en: description_en || '', description_bn: description_bn || '',
    price, icon: icon || 'fas fa-file-alt', category: category || 'General',
    sort_order: parseInt(sort_order) || 0, is_active: is_active ?? 1
  };
  db.services.push(newSvc);
  save();
  res.json({ id: newSvc.id, message: 'Service created' });
});

router.put('/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  const svcIndex = db.services.findIndex(s => s.id === id);
  if (svcIndex === -1) return res.status(404).json({ error: 'Service not found' });

  const { name_en, name_bn, description_en, description_bn, price, icon, category, sort_order, is_active } = req.body;
  const svc = db.services[svcIndex];
  
  if (name_en !== undefined) svc.name_en = name_en;
  if (name_bn !== undefined) svc.name_bn = name_bn;
  if (description_en !== undefined) svc.description_en = description_en;
  if (description_bn !== undefined) svc.description_bn = description_bn;
  if (price !== undefined) svc.price = price;
  if (icon !== undefined) svc.icon = icon;
  if (category !== undefined) svc.category = category;
  if (sort_order !== undefined) svc.sort_order = parseInt(sort_order) || 0;
  if (is_active !== undefined) svc.is_active = is_active;
  
  save();
  res.json({ message: 'Service updated' });
});

router.delete('/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  const initialLength = db.services.length;
  db.services = db.services.filter(s => s.id !== id);
  if (db.services.length === initialLength) return res.status(404).json({ error: 'Service not found' });
  save();
  res.json({ message: 'Service deleted' });
});

module.exports = router;
