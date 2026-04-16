import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { order, userId } = req.body

    if (!order) {
      return res.status(400).json({ error: 'Order data missing' })
    }

    const orderData = {
      id: order.id,
      user_id: userId || null,
      items: order.items,
      total: order.total,
      status: order.status || 'pending',
      customer_name: order.customerName,
      customer_email: order.customerEmail,
      customer_phone: order.customerPhone,
      address: order.address,
      payment_method: order.paymentMethod,
      payment_id: order.paymentId || null,
      discount_code: order.discountCode || null,
      discount_amount: order.discountAmount || 0,
      cod_charge: order.codCharge || 0,
      tracking_id: order.trackingId || null,
      tracking_url: order.trackingUrl || null,
      notes: order.notes || null,
      cancel_reason: order.cancelReason || null,
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)

    if (error) {
      console.error('Supabase insert error:', error)
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({
      success: true,
      order: data
    })
  } catch (err: any) {
    console.error('Save order error:', err)

    return res.status(500).json({
      error: 'Internal server error'
    })
  }
}
