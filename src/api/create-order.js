// /api/create-order.js

import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const {
    customer_email,
    amount_due,
    vendor_id,
    customer_phone,
    ticket_quantity,
    order_amount,
    raffle_cycle_id,
    purchase_platform = 'web',
    payment_method_used = 'card'
  } = req.body;

  const auth = Buffer.from(`${process.env.APP_USER_NAME}:${process.env.APP_USER_PASSWORD}`).toString('base64');

  try {
    const response = await axios.post(
      `${process.env.API_BASE_URL}/nocash-bank/v1/action`,
      {
        action_type: 'create_order',
        customer_email,
        amount_due,
        vendor_id,
        customer_phone,
        ticket_quantity,
        order_amount,
        raffle_cycle_id,
        purchase_platform,
        payment_method_used
      },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(err.response?.status || 500).json({
      error: 'Failed to create order',
      message: err.message,
      details: err.response?.data || null
    });
  }
}
