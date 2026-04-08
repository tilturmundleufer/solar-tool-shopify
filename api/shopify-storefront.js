/**
 * Vercel Serverless: GraphQL-Proxy zur Shopify Storefront API.
 * POST { query: string, variables?: object }
 *
 * Authentifizierung (siehe docs/STOREFRONT_SETUP.md):
 * - Empfohlen: SHOPIFY_STOREFRONT_PRIVATE_TOKEN (Headless „private access token“)
 *   → Header Shopify-Storefront-Private-Token + Shopify-Storefront-Buyer-IP
 * - Legacy: SHOPIFY_STOREFRONT_ACCESS_TOKEN (öffentlicher Storefront-Token)
 *   → Header X-Shopify-Storefront-Access-Token
 *
 * CORS: SOLAR_ALLOWED_ORIGIN kann mehrere Origins enthalten, kommagetrennt
 * (z. B. http://localhost:3000,https://dein-shop.myshopify.com).
 */
function parseAllowedOrigins() {
  const raw = process.env.SOLAR_ALLOWED_ORIGIN || '';
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

function applyCors(req, res) {
  const allowed = parseAllowedOrigins();
  const origin = req.headers.origin;
  if (!allowed.length || !origin) return;
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
}

module.exports = async function handler(req, res) {
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const shop = process.env.SHOPIFY_STORE_DOMAIN;
  const privateToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;
  const publicToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION || '2024-10';

  if (!shop || (!privateToken && !publicToken)) {
    return res.status(500).json({
      error: 'Server misconfigured',
      hint:
        'Set SHOPIFY_STORE_DOMAIN and either SHOPIFY_STOREFRONT_PRIVATE_TOKEN (recommended, Headless) or SHOPIFY_STOREFRONT_ACCESS_TOKEN (legacy public token). See docs/STOREFRONT_SETUP.md',
    });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  const { query, variables } = body || {};
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Missing query' });
  }

  const buyerIp = resolveBuyerIp(req);

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (privateToken) {
    headers['Shopify-Storefront-Private-Token'] = privateToken;
    headers['Shopify-Storefront-Buyer-IP'] = buyerIp;
  } else {
    headers['X-Shopify-Storefront-Access-Token'] = publicToken;
  }

  try {
    const url = `https://${shop}/api/${apiVersion}/graphql.json`;
    const r = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables: variables || {} }),
    });

    const json = await r.json();
    return res.status(r.ok ? 200 : 502).json(json);
  } catch (err) {
    console.error('[shopify-storefront]', err);
    return res.status(502).json({ error: 'Upstream request failed', message: String(err && err.message ? err.message : err) });
  }
};

/** Erste IP aus X-Forwarded-For (Vercel) bzw. X-Real-IP für Shopify-Storefront-Buyer-IP */
function resolveBuyerIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.trim()) {
    return xff.split(',')[0].trim();
  }
  const real = req.headers['x-real-ip'];
  if (typeof real === 'string' && real.trim()) {
    return real.trim();
  }
  return '0.0.0.0';
}
