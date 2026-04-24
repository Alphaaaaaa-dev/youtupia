// ============================================================
// INVOICE GENERATOR — shared between Admin and Orders pages
// ============================================================

export const generateInvoice = (order: any) => {
  const subtotal = order.items.reduce((s: number, i: any) => s + i.product.price * i.quantity, 0);
  const discountAmt = order.discountAmount || 0;
  const codCharge = order.codCharge || 0;
  // GST is 5% (2.5% CGST + 2.5% SGST) calculated on taxable amount
  const taxableAmount = subtotal - discountAmt + codCharge;
  const cgst = Math.round(taxableAmount * 0.025);
  const sgst = Math.round(taxableAmount * 0.025);
  const totalGst = cgst + sgst;
  const grandTotal = taxableAmount + totalGst;

  const rows = order.items.map((item: any, i: number) =>
    '<tr><td style="color:#999;font-size:12px;">' + (i+1) + '</td><td><strong>' + item.product.name + '</strong></td><td style="color:#666;">' + item.size + '</td><td style="color:#666;">' + item.quantity + '</td><td>&#8377;' + item.product.price.toLocaleString('en-IN') + '</td><td style="font-weight:700;text-align:right;">&#8377;' + (item.product.price * item.quantity).toLocaleString('en-IN') + '</td></tr>'
  ).join('');

  const discountRow = discountAmt
    ? '<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#16a34a;"><span>Discount (' + order.discountCode + ')</span><span>&#8722;&#8377;' + discountAmt.toLocaleString('en-IN') + '</span></div>'
    : '';

  const codRow = codCharge
    ? '<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;"><span>COD Handling</span><span>&#8377;' + codCharge.toLocaleString('en-IN') + '</span></div>'
    : '';

  const txnRow = order.paymentId
    ? '<div style="font-size:10px;color:#999;margin-top:6px;font-family:monospace;">Txn: ' + order.paymentId + '</div>'
    : '';

  const payBg    = order.paymentMethod === 'cod' ? '#dcfce7' : '#dbeafe';
  const payColor = order.paymentMethod === 'cod' ? '#16a34a' : '#2563eb';
  const payLabel = order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online';
  const dateStr  = new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const html =
    '<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Invoice ' + order.id + '</title>'
    + '<style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,sans-serif;color:#1a1a1a;background:#fff;padding:40px;}.hdr{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:24px;border-bottom:3px solid #ff0000;margin-bottom:28px;}.parties{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px;}.pbox{background:#f9f9f9;border-radius:10px;padding:16px;border:1px solid #eee;}.plabel{font-size:9px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:#999;margin-bottom:8px;}table{width:100%;border-collapse:collapse;margin-bottom:24px;}th{background:#ff0000;color:white;padding:10px 14px;text-align:left;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;}th:last-child,td:last-child{text-align:right;}td{padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;}.ftr{margin-top:40px;padding-top:20px;border-top:2px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center;}@media print{body{padding:20px;}}</style>'
    + '</head><body>'
    + '<div class="hdr"><div style="display:flex;align-items:center;gap:14px;">'
    + '<img src="/favicon.ico" alt="Youtupia" style="width:52px;height:52px;border-radius:12px;object-fit:contain;border:2px solid #ffcccc;" onerror="this.style.display=\'none\'">'
    + '<div><div style="font-size:26px;font-weight:900;color:#ff0000;">YouTupia Store</div><div style="font-size:11px;color:#666;">Creator Merchandise Platform</div></div>'
    + '</div><div style="text-align:right;">'
    + '<div style="font-size:28px;font-weight:900;">INVOICE</div>'
    + '<div style="font-family:monospace;font-size:14px;color:#ff0000;font-weight:700;margin-top:4px;">' + order.id + '</div>'
    + '<div style="font-size:12px;color:#666;margin-top:4px;">' + dateStr + '</div>'
    + '<div style="display:inline-block;background:#fff3f3;border:1px solid #ffcccc;border-radius:6px;padding:3px 10px;font-size:11px;color:#cc0000;font-weight:700;margin-top:6px;">GSTIN: 08CLBPJ3540A1ZP</div>'
    + '</div></div>'
    + '<div class="parties">'
    + '<div class="pbox"><div class="plabel">Sold By</div><div style="font-size:15px;font-weight:700;margin-bottom:4px;">YouTupia Store</div><div style="font-size:12px;color:#555;line-height:1.6;">64/158, Pratap Nagar<br/>Jaipur, Rajasthan - 302033<br/>India<br/>youtupiastore@gmail.com</div></div>'
    + '<div class="pbox"><div class="plabel">Bill To / Ship To</div><div style="font-size:15px;font-weight:700;margin-bottom:4px;">' + order.customerName + '</div><div style="font-size:12px;color:#555;line-height:1.6;">' + order.address + '<br/>Phone: ' + order.customerPhone + '<br/>Email: ' + order.customerEmail + '</div></div>'
    + '</div>'
    + '<table><thead><tr><th>#</th><th>Product</th><th>Size</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr></thead><tbody>' + rows + '</tbody></table>'
    + '<div style="margin-left:auto;width:320px;">'
    + '<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#444;"><span>Subtotal (excl. GST)</span><span>&#8377;' + subtotal.toLocaleString('en-IN') + '</span></div>'
    + discountRow
    + codRow
    + '<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;"><span>Shipping</span><span style="color:#16a34a;">FREE</span></div>'
    + '<hr style="border:none;border-top:1px solid #eee;margin:8px 0;"/>'
    + '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;color:#555;"><span>CGST @ 2.5%</span><span>&#8377;' + cgst.toLocaleString('en-IN') + '</span></div>'
    + '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;color:#555;"><span>SGST @ 2.5%</span><span>&#8377;' + sgst.toLocaleString('en-IN') + '</span></div>'
    + '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;font-weight:600;color:#333;border-top:1px solid #eee;margin-top:4px;padding-top:8px;"><span>Total GST (5%)</span><span>&#8377;' + totalGst.toLocaleString('en-IN') + '</span></div>'
    + '<hr style="border:none;border-top:2px solid #ff0000;margin:8px 0;"/>'
    + '<div style="display:flex;justify-content:space-between;padding:10px 0;font-size:18px;font-weight:900;color:#ff0000;"><span>Grand Total</span><span>&#8377;' + grandTotal.toLocaleString('en-IN') + '</span></div>'
    + '<div style="margin-top:6px;display:flex;gap:8px;"><span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:' + payBg + ';color:' + payColor + ';">' + payLabel + '</span>'
    + '<span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:#fff3f3;color:#cc0000;text-transform:capitalize;">' + order.status.replace('_', ' ') + '</span></div>'
    + txnRow
    + '</div>'
    + '<div class="ftr"><div style="font-size:11px;color:#999;line-height:1.7;"><strong>Terms:</strong> All sales are final. Exchange within 7 days with original invoice.<br/>GSTIN: 08CLBPJ3540A1ZP &middot; HSN Code: 6109 (Apparel / T-Shirts)<br/>Computer-generated invoice. No signature required.</div>'
    + '<div style="text-align:right;"><div style="font-size:16px;font-weight:900;color:#ff0000;">YouTupia Store</div><div style="font-size:10px;color:#bbb;margin-top:2px;">Creator Merch, Made Real.</div></div></div>'
    + '</body></html>';

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 500);
};
