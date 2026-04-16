import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * GET /api/get-orders?userId=xxx   → orders for that user
 * GET /api/get-orders              → ALL orders (admin use)
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

  const userId = req.query.userId as string | undefined;

  // Build filter: if userId provided, filter by user; otherwise fetch all
  const filter = userId
    ? `?user_id=eq.${userId}&order=created_at.desc`
    : `?order=created_at.desc`;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/orders${filter}`,
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

    const rows = await response.json();

    // Map DB snake_case → camelCase for frontend Order interface
    const orders = (rows || []).map((o: any) => ({
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
      cancelReason:   o.cancel_reason,
      codCharge:      o.cod_charge,
      createdAt:      o.created_at,
    }));

    return res.status(200).json({ orders });

  } catch (err) {
    console.error('Get orders error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
