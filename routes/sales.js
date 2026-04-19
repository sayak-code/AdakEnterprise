const express = require('express');
const router = express.Router();
const { supabase } = require('../database/db');
const auth = require('../middleware/auth');
const XLSX = require('xlsx');

router.get('/', auth, async (req, res) => {
  const { status, date_from, date_to, phone, service } = req.query;
  let query = supabase.from('sales').select('*').order('entry_date', { ascending: false });

  if (status) query = query.eq('status', status);
  if (date_from) query = query.gte('entry_date', date_from);
  if (date_to) query = query.lte('entry_date', date_to + ' 23:59:59');
  if (phone) query = query.ilike('client_phone', `%${phone}%`);
  if (service) query = query.ilike('services_taken', `%${service}%`);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get('/stats', auth, async (req, res) => {
  const { data: sales, error } = await supabase.from('sales').select('*');
  if (error || !sales) return res.status(500).json({ error: error?.message });

  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(s => s.entry_date.startsWith(today));
  const pendingSales = sales.filter(s => s.status === 'pending' && s.amount_due > 0);
  
  sales.sort((a,b) => new Date(b.entry_date) - new Date(a.entry_date));

  res.json({
    total_sales: sales.length,
    total_revenue: sales.reduce((acc, s) => acc + s.total_amount, 0),
    pending_count: pendingSales.length,
    total_due: pendingSales.reduce((acc, s) => acc + s.amount_due, 0),
    today_sales: todaySales.length,
    today_revenue: todaySales.reduce((acc, s) => acc + s.total_amount, 0),
    recent_sales: sales.slice(0, 5)
  });
});

router.get('/export', auth, async (req, res) => {
  const { data, error } = await supabase.from('sales').select('*').order('entry_date', { ascending: false });
  if (error) return res.status(500).send('Database Error');

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sales');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Disposition', 'attachment; filename=sales_export.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buf);
});

router.get('/:id', auth, async (req, res) => {
  const { data, error } = await supabase.from('sales').select('*').eq('id', req.params.id).single();
  if (error || !data) return res.status(404).json({ error: 'Sale not found' });
  res.json(data);
});

router.post('/', auth, async (req, res) => {
  const { client_name, client_phone, client_address, services_taken, total_amount, amount_paid, status, notes } = req.body;
  if (!client_name || !client_phone || !services_taken || total_amount === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const total = parseFloat(total_amount) || 0;
  const paid = parseFloat(amount_paid || 0);

  const { data, error } = await supabase.from('sales').insert([{
    client_name, client_phone, client_address: client_address || '',
    services_taken: Array.isArray(services_taken) ? services_taken.join(', ') : services_taken,
    total_amount: total, amount_paid: paid, amount_due: total - paid,
    status: status || 'pending', notes: notes || ''
  }]).select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ id: data.id, message: 'Sale created' });
});

router.put('/:id', auth, async (req, res) => {
  const { client_name, client_phone, client_address, services_taken, total_amount, amount_paid, status, notes } = req.body;
  const total = parseFloat(total_amount) || 0;
  const paid = parseFloat(amount_paid || 0);

  const { error } = await supabase.from('sales').update({
    client_name, client_phone, client_address: client_address || '',
    services_taken: Array.isArray(services_taken) ? services_taken.join(', ') : services_taken,
    total_amount: total, amount_paid: paid, amount_due: total - paid,
    status: status || 'pending', notes: notes || '', updated_at: new Date().toISOString()
  }).eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Sale updated' });
});

router.delete('/:id', auth, async (req, res) => {
  const { error } = await supabase.from('sales').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Sale deleted' });
});

router.get('/client/:phone', auth, async (req, res) => {
  const { data, error } = await supabase.from('sales').select('*').ilike('client_phone', `%${req.params.phone}%`).order('entry_date', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
