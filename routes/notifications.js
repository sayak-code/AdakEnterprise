const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const { supabase } = require('../database/db');
const auth = require('../middleware/auth');

const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER)
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

async function sendSMS(to, body) {
  if (!twilioClient) {
    console.log(`[STUB SMS] To: ${to} | Msg: ${body}`);
    return { sid: 'stub_' + Date.now(), status: 'stub_sent' };
  }
  return twilioClient.messages.create({
    body: body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: to.startsWith('+') ? to : `+91${to}`
  });
}

router.get('/', auth, async (req, res) => {
  if (!supabase) return res.json([]);
  const { data, error } = await supabase.from('notifications').select('*').order('sent_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/done/:saleId', auth, async (req, res) => {
  const { data: sale, error: saleErr } = await supabase.from('sales').select('*').eq('id', req.params.saleId).single();
  if (saleErr || !sale) return res.status(404).json({ error: 'Sale not found' });

  const amount_due = sale.total_amount - sale.amount_paid;
  await supabase.from('sales').update({ status: 'done', amount_due }).eq('id', sale.id);

  const { data: shopInfoData } = await supabase.from('shop_info').select('*');
  let shopName = 'Our Shop';
  if (shopInfoData) {
    const snItem = shopInfoData.find(i => i.key === 'shop_name');
    if (snItem) shopName = snItem.value;
  }

  let message = `Hello ${sale.client_name},\nYour service (${sale.services_taken}) is complete! `;
  if (amount_due > 0) message += `Pending due: Rs.${amount_due}. `;
  message += `\nThank you, ${shopName}`;

  try {
    await sendSMS(sale.client_phone, message);
    await supabase.from('notifications').insert([{
      sale_id: sale.id, client_name: sale.client_name, client_phone: sale.client_phone, 
      message, channel: 'sms', status: 'sent'
    }]);
    res.json({ message: 'Marked done and SMS sent', notification: 'success' });
  } catch (error) {
    await supabase.from('notifications').insert([{
      sale_id: sale.id, client_name: sale.client_name, client_phone: sale.client_phone, 
      message, channel: 'sms', status: 'failed'
    }]);
    res.status(500).json({ error: 'Failed to send SMS', details: error.message });
  }
});

router.post('/custom', auth, async (req, res) => {
  const { phone, message, client_name } = req.body;
  if (!phone || !message) return res.status(400).json({ error: 'Phone and message required' });
  try {
    await sendSMS(phone, message);
    await supabase.from('notifications').insert([{
      client_name: client_name || 'Unknown', client_phone: phone, 
      message, channel: 'sms', status: 'sent'
    }]);
    res.json({ message: 'SMS sent successfully' });
  } catch (error) {
    await supabase.from('notifications').insert([{
      client_name: client_name || 'Unknown', client_phone: phone, 
      message, channel: 'sms', status: 'failed'
    }]);
    res.status(500).json({ error: 'SMS failed', details: error.message });
  }
});

module.exports = router;
