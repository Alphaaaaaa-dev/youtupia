import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * GET /api/razorpay-key
 * Returns the Razorpay publishable key ID from server env.
 * Safe to expose — it's a publishable key, not the secret.
 * This avoids putting VITE_RAZORPAY_KEY_ID in the frontend bundle.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.RAZORPAY_KEY_ID;
  if (!key) {
    return res.status(500).json({ error: 'RAZORPAY_KEY_ID not configured on server.' });
  }

  // Cache for 1 hour — key rarely changes
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  return res.status(200).json({ key });
}
