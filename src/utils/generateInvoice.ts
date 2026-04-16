// ============================================================
// INVOICE GENERATOR — Edit the BUSINESS DETAILS section below
// to update your address, GST, contact info, etc.
// ============================================================

// ── EDIT THESE DETAILS ────────────────────────────────────────────────────
const BUSINESS = {
  name:     'Youtupia Merchandise LLP',
  address1: 'Jodhpur, Rajasthan - 342001',  // ← Change this
  address2: 'India',
  email:    'youtupiastore@gmail.com',       // ← Change this
  gst:      'YOUR_GST_NUMBER_HERE',          // ← Add your GST number
  cin:      '',                              // ← Add CIN if applicable
  logo:     '/favicon.ico',                  // favicon path
};
// ─────────────────────────────────────────────────────────────────────────

export const generateInvoice = (order: any) => {
  const subtotal = order.items.reduce(
    (s: number, i: any) => s + i.product.price * i.quantity, 0
  );

  const rows = order.items.map((item: any, i: number) => `
    <tr>
      <td style="color:#999;font-size:12px;padding:10px 14px;border-bottom:1px solid #f0f0f0;">${i + 1}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;"><strong>${item.product.name}</strong></td>
      <td style="color:#666;padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;">${item.size}</td>
      <td style="color:#666;padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;">${item.quantity}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;">&#8377;${item.product.price.toLocaleString('en-IN')}</td>
      <td style="font-weight:700;padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;text-align:right;">&#8377;${(item.product.price * item.quantity).toLocaleString('en-IN')}</td>
    </tr>`
  ).join('');

  const discountRow = order.discountAmount
    ? `<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#16a34a;">
        <span>Discount (${order.discountCode})</span>
        <span>&#8722;&#8377;${Number(order.discountAmount).toLocaleString('en-IN')}</span>
       </div>` : '';

  const codRow = order.codCharge
    ? `<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;">
        <span>COD Handling</span><span>&#8377;${order.codCharge}</span>
       </div>` : '';

  const txnRow = order.paymentId
    ? `<div style="font-size:10px;color:#999;margin-top:6px;font-family:monospace;">Txn: ${order.paymentId}</div>`
    : '';

  const payBg    = order.paymentMethod === 'cod' ? '#dcfce7' : '#dbeafe';
  const payColor = order.paymentMethod === 'cod' ? '#16a34a' : '#2563eb';
  const payLabel = order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online';
  const dateStr  = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  // Favicon as an <img> tag — uses the site's own favicon
  const logoHtml = `<img src="${window.location.origin}${BUSINESS.logo}"
    width="48" height="48"
    style="border-radius:10px;object-fit:contain;display:block;"
    onerror="this.style.display='none'"
    alt="Youtupia" />`;

  const gstLine  = BUSINESS.gst  ? `<p style="font-size:11px;color:#666;">GST: ${BUSINESS.gst}</p>`  : '';
  const cinLine  = BUSINESS.cin  ? `<p style="font-size:11px;color:#666;">CIN: ${BUSINESS.cin}</p>`  : '';
  const gstBadge = BUSINESS.gst
    ? `<div style="display:inline-block;background:#fff3f3;border:1px solid #ffcccc;border-radius:6px;padding:3px 10px;font-size:11px;color:#cc0000;font-weight:700;margin-top:6px;">GST: ${BUSINESS.gst}</div>`
    : '';

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Invoice ${order.id}</title>
  <style>
    * { margin:0;padding:0;box-sizing:border-box; }
    body { font-family:Arial,sans-serif;color:#1a1a1a;background:#fff;padding:40px; }
    .hdr { display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:24px;border-bottom:3px solid #ff0000;margin-bottom:28px; }
    .logo-area { display:flex;align-items:center;gap:14px; }
    .brand-name { font-size:26px;font-weight:900;color:#ff0000; }
    .brand-sub { font-size:11px;color:#666; }
    .parties { display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px; }
    .pbox { background:#f9f9f9;border-radius:10px;padding:16px;border:1px solid #eee; }
    .plabel { font-size:9px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:#999;margin-bottom:8px; }
    table { width:100%;border-collapse:collapse;margin-bottom:24px; }
    th { background:#ff0000;color:white;padding:10px 14px;text-align:left;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase; }
    th:last-child, td:last-child { text-align:right; }
    .totals { margin-left:auto;width:280px; }
    .ftr { margin-top:40px;padding-top:20px;border-top:2px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center; }
    @media print { body { padding:20px; } }
  </style>
</head>
<body>

<div class="hdr">
  <!-- LOGO + Brand -->
  <div class="logo-area">
    ${logoHtml}
    <div>
      <div class="brand-name">YOUTUPIA</div>
      <div class="brand-sub">Creator Merchandise Platform</div>
    </div>
  </div>

  <!-- Invoice meta -->
  <div style="text-align:right;">
    <div style="font-size:28px;font-weight:900;">INVOICE</div>
    <div style="font-family:monospace;font-size:14px;color:#ff0000;font-weight:700;margin-top:4px;">${order.id}</div>
    <div style="font-size:12px;color:#666;margin-top:4px;">${dateStr}</div>
    ${gstBadge}
  </div>
</div>

<!-- Parties -->
<div class="parties">
  <div class="pbox">
    <div class="plabel">Sold By</div>
    <div style="font-size:15px;font-weight:700;margin-bottom:4px;">${BUSINESS.name}</div>
    <div style="font-size:12px;color:#555;line-height:1.6;">
      ${BUSINESS.address1}<br/>
      ${BUSINESS.address2}<br/>
      ${BUSINESS.email}
    </div>
    ${gstLine}${cinLine}
  </div>
  <div class="pbox">
    <div class="plabel">Bill To / Ship To</div>
    <div style="font-size:15px;font-weight:700;margin-bottom:4px;">${order.customerName}</div>
    <div style="font-size:12px;color:#555;line-height:1.6;">
      ${order.address}<br/>
      Phone: ${order.customerPhone}<br/>
      Email: ${order.customerEmail}
    </div>
  </div>
</div>

<!-- Items table -->
<table>
  <thead>
    <tr>
      <th style="width:40px;">#</th>
      <th>Product</th>
      <th style="width:80px;">Size</th>
      <th style="width:60px;">Qty</th>
      <th style="width:120px;">Unit Price</th>
      <th style="width:120px;text-align:right;">Amount</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>

<!-- Totals -->
<div class="totals">
  <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#444;">
    <span>Subtotal</span><span>&#8377;${subtotal.toLocaleString('en-IN')}</span>
  </div>
  ${discountRow}
  <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;">
    <span>Shipping</span><span style="color:#16a34a;">FREE</span>
  </div>
  ${codRow}
  <hr style="border:none;border-top:1px solid #eee;margin:8px 0;"/>
  <div style="display:flex;justify-content:space-between;padding:10px 0;font-size:18px;font-weight:900;color:#ff0000;">
    <span>Total</span><span>&#8377;${order.total.toLocaleString('en-IN')}</span>
  </div>
  <div style="margin-top:6px;display:flex;gap:8px;">
    <span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:${payBg};color:${payColor};">${payLabel}</span>
    <span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:#fff3f3;color:#cc0000;text-transform:capitalize;">${(order.status || '').replace('_', ' ')}</span>
  </div>
  ${txnRow}
</div>

<!-- Footer -->
<div class="ftr">
  <div style="font-size:11px;color:#999;line-height:1.7;">
    <strong>Terms:</strong> All sales are final. Exchange within 7 days with original invoice.<br/>
    ${BUSINESS.gst ? `GSTIN: ${BUSINESS.gst} · ` : ''}Computer-generated invoice. No signature required.
  </div>
  <div style="text-align:right;">
    <div style="font-size:16px;font-weight:900;color:#ff0000;">YOUTUPIA</div>
    <div style="font-size:10px;color:#bbb;margin-top:2px;">Creator Merch, Made Real.</div>
  </div>
</div>

<script>window.print();</script>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
};
