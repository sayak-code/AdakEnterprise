const express = require('express');
const router = express.Router();
const { db, save, genId } = require('../database/db');
const auth = require('../middleware/auth');
const XLSX = require('xlsx');

router.get('/', auth, (req, res) => {
  const { status, date_from, date_to, phone, service } = req.query;
  let results = [...db.sales].sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date));

  if (status) results = results.filter(s => s.status === status);
  if (date_from) {
    const from = new Date(date_from);
    results = results.filter(s => new Date(s.entry_date) >= from);
  }
  if (date_to) {
    const to = new Date(date_to);
    to.setHours(23, 59, 59, 999);
    results = results.filter(s => new Date(s.entry_date) <= to);
  }
  if (phone) results = results.filter(s => s.client_phone.includes(phone));
  if (service) results = results.filter(s => s.services_taken.toLowerCase().includes(service.toLowerCase()));

  res.json(results);
});

router.get('/stats', auth, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const todaySales = db.sales.filter(s => s.entry_date.startsWith(today));
  const pendingSales = db.sales.filter(s => s.status === 'pending' && s.amount_due > 0);

  res.json({
    total_sales: db.sales.length,
    total_revenue: db.sales.reduce((acc, s) => acc + s.total_amount, 0),
    pending_count: pendingSales.length,
    total_due: pendingSales.reduce((acc, s) => acc + s.amount_due, 0),
    today_sales: todaySales.length,
    today_revenue: todaySales.reduce((acc, s) => acc + s.total_amount, 0),
    recent_sales: [...db.sales].sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date)).slice(0, 5)
  });
});

router.get('/export', auth, (req, res) => {
  const results = [...db.sales].sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date));
  const ws = XLSX.utils.json_to_sheet(results);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sales');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Disposition', 'attachment; filename=sales_export.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buf);
});

router.get('/:id', auth, (req, res) => {
  const sale = db.sales.find(s => s.id === parseInt(req.params.id));
  if (!sale) return res.status(404).json({ error: 'Sale not found' });
  res.json(sale);
});

router.post('/', auth, (req, res) => {
  const { client_name, client_phone, client_address, services_taken, total_amount, amount_paid, status, notes } = req.body;
  if (!client_name || !client_phone || !services_taken || total_amount === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const total = parseFloat(total_amount) || 0;
  const paid = parseFloat(amount_paid || 0);
  
  const sale = {
    id: genId(), client_name, client_phone, client_address: client_address || '',
    services_taken: Array.isArray(services_taken) ? services_taken.join(', ') : services_taken,
    total_amount: total, amount_paid: paid, amount_due: total - paid,
    status: status || 'pending', notes: notes || '', entry_date: new Date().toISOString()
  };
  db.sales.push(sale);
  save();
  res.json({ id: sale.id, message: 'Sale created' });
});

router.put('/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  const sale = db.sales.find(s => s.id === id);
  if (!sale) return res.status(404).json({ error: 'Sale not found' });

  const { client_name, client_phone, client_address, services_taken, total_amount, amount_paid, status, notes } = req.body;
  const total = parseFloat(total_amount) || 0;
  const paid = parseFloat(amount_paid || 0);

  sale.client_name = client_name; sale.client_phone = client_phone;
  sale.client_address = client_address || '';
  sale.services_taken = Array.isArray(services_taken) ? services_taken.join(', ') : services_taken;
  sale.total_amount = total; sale.amount_paid = paid; sale.amount_due = total - paid;
  sale.status = status || 'pending'; sale.notes = notes || '';
  
  save();
  res.json({ message: 'Sale updated' });
});

router.delete('/:id', auth, (req, res) => {
  const initialLength = db.sales.length;
  db.sales = db.sales.filter(s => s.id !== parseInt(req.params.id));
  if (db.sales.length === initialLength) return res.status(404).json({ error: 'Sale not found' });
  save();
  res.json({ message: 'Sale deleted' });
});

router.get('/client/:phone', auth, (req, res) => {
  const history = db.sales.filter(s => s.client_phone.includes(req.params.phone))
    .sort((a,b) => new Date(b.entry_date) - new Date(a.entry_date));
  res.json(history);
});

module.exports = router;
