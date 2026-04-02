// api/delhivery.ts — Vercel Serverless Function for Delhivery shipping API
// Keeps your Delhivery API token on the server, never exposed to the browser.

export default async function handler(req: any, res: any) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const DELHIVERY_TOKEN = process.env.DELHIVERY_TOKEN;
  if (!DELHIVERY_TOKEN) {
    return res.status(500).json({ error: 'DELHIVERY_TOKEN not configured in environment variables.' });
  }

  const { action, awb, order } = req.body;

  try {
    // ── TRACK SHIPMENT ────────────────────────────────
    if (action === 'track') {
      if (!awb) return res.status(400).json({ error: 'AWB number required' });

      const trackRes = await fetch(
        `https://track.delhivery.com/api/v1/packages/json/?waybill=${awb}&token=${DELHIVERY_TOKEN}`,
        { headers: { 'Content-Type': 'application/json' } }
      );
      const data = await trackRes.json();
      return res.status(200).json(data);
    }

    // ── CREATE SHIPMENT ───────────────────────────────
    // Use this when you want to auto-create shipments
    if (action === 'create') {
      if (!order) return res.status(400).json({ error: 'Order data required' });

      const warehouseName = process.env.DELHIVERY_WAREHOUSE_NAME || 'Youtupia';

      const payload = new URLSearchParams();
      payload.append('format', 'json');
      payload.append('data', JSON.stringify({
        shipments: [{
          add: order.address,
          name: order.customerName,
          pin: order.pincode,
          city: order.city,
          state: order.state,
          country: 'India',
          phone: order.customerPhone,
          order: order.id,
          payment_mode: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
          cod_amount: order.paymentMethod === 'cod' ? order.total : 0,
          products_desc: order.items.map((i: any) => `${i.product.name} x${i.quantity}`).join(', '),
          weight: 0.3 * order.items.reduce((s: number, i: any) => s + i.quantity, 0),
          seller_add: 'Your warehouse address here',
          seller_name: 'Youtupia',
          seller_gst_tin: '',
          shipping_mode: 'Surface',
          address_type: 'home',
        }],
        pickup_location: { name: warehouseName },
      }));

      const createRes = await fetch(
        'https://track.delhivery.com/api/cmu/create.json',
        {
          method: 'POST',
          headers: {
            'Authorization': `Token ${DELHIVERY_TOKEN}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: payload.toString(),
        }
      );
      const data = await createRes.json();
      return res.status(200).json(data);
    }

    // ── CHECK SERVICEABILITY ──────────────────────────
    if (action === 'serviceability') {
      const { pincode } = req.body;
      const svcRes = await fetch(
        `https://track.delhivery.com/c/api/pin-codes/json/?token=${DELHIVERY_TOKEN}&filter_codes=${pincode}`,
        { headers: { 'Content-Type': 'application/json' } }
      );
      const data = await svcRes.json();
      const pinData = data.delivery_codes?.[0]?.postal_code;
      return res.status(200).json({
        serviceable: !!pinData,
        prepaid: pinData?.pre_paid === 'Y',
        cod: pinData?.cash_on_delivery === 'Y',
        pickup: pinData?.pickup === 'Y',
      });
    }

    return res.status(400).json({ error: 'Unknown action. Use: track | create | serviceability' });

  } catch (err: any) {
    console.error('Delhivery API error:', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
