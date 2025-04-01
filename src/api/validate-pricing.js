// /api/validate-pricing.js

import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { raffle_cycle_id } = req.query;
  const auth = Buffer.from(`${process.env.APP_USER_NAME}:${process.env.APP_USER_PASSWORD}`).toString('base64');

  try {
    const response = await axios.get(
      `${process.env.API_BASE_URL}/nocash-bank/v1/action`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        params: {
          action_type: 'get_raffle_cycle_by_id',
          raffle_cycle_id
        }
      }
    );

    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(err.response?.status || 500).json({
      error: 'Failed to fetch raffle cycle',
      message: err.message,
      details: err.response?.data || null
    });
  }
}
