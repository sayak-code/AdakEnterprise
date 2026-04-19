const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const { db, save, genId } = require('../database/db');
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

router.get('/', auth, (req, res) => {
  res.json([...db.notifications].sort((a,b) => new Date(b.sent_at || 0) - new Date(a.sent_at || 0)));
});

router.post('/done/:saleId', auth, async (req, res) => {
  const sale = db.sales.find(s => s.id === parseInt(req.params.saleId));
  if (!sale) return res.status(404).json({ error: 'Sale not found' });

  sale.status = 'done';
  sale.amount_due = sale.total_amount - sale.amount_paid;

  const shopInfo = {};
  db.shop_info.forEach(i => { shopInfo[i.key] = i.value; });
  const shopName = shopInfo.shop_name || 'Our Shop';

  let message = `Hello ${sale.client_name},\nYour service (${sale.services_taken}) is complete! `;
  if (sale.amount_due > 0) message += `Pending due: Rs.${sale.amount_due}. `;
  message += `\nThank you, ${shopName}`;

  try {
    await sendSMS(sale.client_phone, message);
    db.notifications.push({
      id: genId(), sale_id: sale.id, client_name: sale.client_name,
      client_phone: sale.client_phone, message, channel: 'sms', status: 'sent', sent_at: new Date().toISOString()
    });
    save();
    res.json({ message: 'Marked done and SMS sent', notification: 'success' });
  } catch (error) {
    db.notifications.push({
      id: genId(), sale_id: sale.id, client_name: sale.client_name,
      client_phone: sale.client_phone, message, channel: 'sms', status: 'failed', sent_at: new Date().toISOString()
    });
    save();
    res.status(500).json({ error: 'Failed to send SMS', details: error.message });
  }
});

router.post('/custom', auth, async (req, res) => {
  const { phone, message, client_name } = req.body;
  if (!phone || !message) return res.status(400).json({ error: 'Phone and message required' });
  try {
    await sendSMS(phone, message);
    db.notifications.push({
      id: genId(), client_name: client_name || 'Unknown',
      client_phone: phone, message, channel: 'sms', status: 'sent', sent_at: new Date().toISOString()
    });
    save();
    res.json({ message: 'SMS sent successfully' });
  } catch (error) {
    db.notifications.push({
      id: genId(), client_name: client_name || 'Unknown',
      client_phone: phone, message, channel: 'sms', status: 'failed', sent_at: new Date().toISOString()
    });
    save();
    res.status(500).json({ error: 'SMS failed', details: error.message });
  }
});

module.exports = router;
