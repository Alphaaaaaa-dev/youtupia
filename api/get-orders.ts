import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * GET /api/get-orders?userId=xxx
 * Returns all orders for a given user from Supabase.
 * Called on page load in OrdersPage to hydrate from DB instead of only localStorage.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const SUPABASE_URL        = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY)
    return res.status(500).json({ error: 'Server configuration error' });

  const userId = req.query.userId as string;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?user_id=eq.${userId}&order=created_at.desc`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const err = await response.json();
      console.error('Supabase error:', err);
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }

    const orders = await response.json();

    // Map DB snake_case back to camelCase for the frontend Order interface
    const mapped = orders.map((o: any) => ({
      id:             o.id,
      items:          o.items,
      total:          o.total,
      status:         o.status,
      customerName:   o.customer_name,
      customerEmail:  o.customer_email,
      customerPhone:  o.customer_phone,
      address:        o.address,
      paymentMethod:  o.payment_method,
      paymentId:      o.payment_id,
      discountCode:   o.discount_code,
      discountAmount: o.discount_amount,
      trackingId:     o.tracking_id,
      trackingUrl:    o.tracking_url,
      notes:          o.notes,
      createdAt:      o.created_at,
    }));

    return res.status(200).json({ orders: mapped });

  } catch (err) {
    console.error('Get orders error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
