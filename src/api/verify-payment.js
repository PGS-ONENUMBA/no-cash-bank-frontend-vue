// /api/verify-payment.js

import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { trans_ref } = req.query;

  if (!trans_ref) {
    return res.status(400).json({ error: 'Missing transaction reference' });
  }

  try {
    const response = await axios.get(
      process.env.TRANSACTION_VERIFY_URL+`/${trans_ref}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SQUAD_SANDBOX_SK}`
        }
      }
    );

    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(err.response?.status || 500).json({
      error: 'Failed to verify payment',
      message: err.message,
      details: err.response?.data || null
    });
  }
}
