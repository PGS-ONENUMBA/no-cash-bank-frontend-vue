/**
 * Handles the submission of an order by forwarding the request to a WordPress API endpoint.
 *
 * @async
 * @function handler
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The body of the request containing order data.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} Sends a JSON response with the status and data from the WordPress API or an error message.
 *
 * @throws {Error} If there is an issue with the fetch request or server error.
 *
 * Environment Variables:
 * @property {string} WP_API_USER - The WordPress API username for Basic Authentication.
 * @property {string} WP_API_PASS - The WordPress API password for Basic Authentication.
 * @property {string} WP_API_BASE_URL - The base URL of the WordPress API.
 */
// /api/submit-order.js

export default async function handler(req, res) {
  const { APP_USER_NAME, APP_USER_PASSWORD, API_BASE_URL } = process.env;

  const auth = Buffer.from(`${APP_USER_NAME}:${APP_USER_PASSWORD}`).toString('base64');

  try {
    const wpRes = await fetch(`${API_BASE_URL}/wp-json/nocash-bank/v1/action`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await wpRes.json();
    res.status(wpRes.status).json(data);

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
}
