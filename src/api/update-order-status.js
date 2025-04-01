// /api/update-order-status.js

import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { order_id, transaction_type, amount } = req.body;
  const auth = Buffer.from(`${process.env.APP_USER_NAME}:${process.env.APP_USER_PASSWORD}`).toString('base64');

  try {
    const response = await axios.post(
      `${process.env.API_BASE_URL}/nocash-bank/v1/action`,
      {
        action_type: 'complete_order',
        order_id,
        amount,
        payment_method_used: transaction_type
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
      error: 'Failed to update order status',
      message: err.message,
      details: err.response?.data || null
    });
  }
}
