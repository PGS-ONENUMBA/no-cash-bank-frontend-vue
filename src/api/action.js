
/**
 * Handles requests to proxy actions to a WordPress REST API endpoint.
 * This function acts as a serverless function that forwards incoming requests
 * to a specified WordPress API endpoint with basic authentication.
 *
 * @param {import('next').NextApiRequest} req - The HTTP request object.
 *   - `req.method` {string} - The HTTP method (e.g., GET, POST, etc.).
 *   - `req.query` {Object} - The query parameters for GET requests.
 *   - `req.body` {Object} - The request body for non-GET requests.
 * @param {import('next').NextApiResponse} res - The HTTP response object.
 *   - `res.status` {Function} - Sets the HTTP status code.
 *   - `res.json` {Function} - Sends a JSON response.
 *
 * @returns {Promise<void>} Sends a JSON response with the proxied data or an error message.
 *
 * @throws {Error} If there is an issue with the proxy request or missing credentials.
 *
 * @example
 * // Example usage with a POST request:
 * fetch('/api/action', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ key: 'value' }),
 * });
 *
 * @env {string} APP_USER_NAME - The WordPress API username (required).
 * @env {string} WP_API_PASS - The WordPress API password (required).
 * @env {string} [WP_API_BASE_URL='https://your-wordpress-site.com/wp-json'] - The base URL of the WordPress API.
 */


export default async function handler(req, res) {
  const {
    APP_USER_NAME,
    APP_USER_PASSWORD,
    API_BASE_URL,
  } = process.env;

  if (!APP_USER_NAME || !APP_USER_PASSWORD) {
    return res.status(500).json({ success: false, message: 'Missing API credentials' });
  }

  const auth = Buffer.from(`${APP_USER_NAME}:${APP_USER_PASSWORD}`).toString('base64');

  const endpoint = `${API_BASE_URL}/nocash-bank/v1/action`;

  try {
    const wpRes = await fetch(endpoint, {
      method: req.method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      ...(req.method === 'GET'
        ? { params: req.query }
        : { body: JSON.stringify(req.body) }),
    });

    const data = await wpRes.json();
    res.status(wpRes.status).json(data);
  } catch (err) {
    console.error("❌ Proxy error:", err);
    res.status(500).json({ success: false, message: 'Proxy error', error: err.message });
  }
}
