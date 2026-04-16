// ============================================================
// INVOICE GENERATOR
// Edit BUSINESS section to update GST, address etc
// ============================================================

export const BUSINESS = {
  name: "Youtupia Merchandise LLP",
  address1: "Jaipur, Rajasthan - 302050",
  address2: "India",
  email: "youtupiastore@gmail.com",
  gst: "08CLBPJ3540A1ZP",
  cin: "",
  logo: "/favicon.ico"
};

export const generateInvoice = (order: any) => {

  const subtotal = order.items.reduce(
    (s: number, i: any) => s + i.product.price * i.quantity,
    0
  );

  const rows = order.items.map((item: any, i: number) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${item.product.name}</strong></td>
      <td>${item.size}</td>
      <td>${item.quantity}</td>
      <td>₹${item.product.price.toLocaleString("en-IN")}</td>
      <td style="text-align:right;font-weight:700;">
        ₹${(item.product.price * item.quantity).toLocaleString("en-IN")}
      </td>
    </tr>
  `).join("");

  const html = `
  <html>
  <head>
  <title>Invoice ${order.id}</title>
  <style>
  body{font-family:Arial;padding:40px;}
  table{width:100%;border-collapse:collapse;margin-top:20px;}
  th{background:#ff0000;color:white;padding:10px;}
  td{padding:10px;border-bottom:1px solid #eee;}
  </style>
  </head>

  <body>

  <h1>INVOICE</h1>
  <h3>${BUSINESS.name}</h3>
  <p>
  ${BUSINESS.address1}<br/>
  ${BUSINESS.address2}<br/>
  Email: ${BUSINESS.email}<br/>
  GST: ${BUSINESS.gst}
  </p>

  <hr/>

  <h3>Customer</h3>

  <p>
  ${order.customerName}<br/>
  ${order.address}<br/>
  ${order.customerPhone}<br/>
  ${order.customerEmail}
  </p>

  <table>
  <thead>
  <tr>
  <th>#</th>
  <th>Product</th>
  <th>Size</th>
  <th>Qty</th>
  <th>Price</th>
  <th>Amount</th>
  </tr>
  </thead>

  <tbody>
  ${rows}
  </tbody>
  </table>

  <h2 style="text-align:right">
  Total: ₹${order.total.toLocaleString("en-IN")}
  </h2>

  <p style="margin-top:40px;font-size:12px;">
  Computer generated invoice. No signature required.
  </p>

  <script>
  window.print();
  </script>

  </body>
  </html>
  `;

  const win = window.open("", "_blank");

  if (!win) return;

  win.document.write(html);
  win.document.close();
};
